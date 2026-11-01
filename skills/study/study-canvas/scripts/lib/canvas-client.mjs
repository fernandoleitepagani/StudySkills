import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { redactSecrets } from "./token.mjs";

const ALLOWED_PREFIXES = [
  "/api/v1/users/self",
  "/api/v1/courses",
  "/api/v1/files/",
  "/api/v1/announcements",
  "/api/v1/discussion_topics",
];

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class CanvasError extends Error {
  constructor(message, { status = null, path: requestPath = null, body = null, code = "CANVAS_ERROR" } = {}) {
    super(message);
    this.name = "CanvasError";
    this.status = status;
    this.path = requestPath;
    this.body = body;
    this.code = code;
  }
}

export function statusCode(status) {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 429) return "RATE_LIMITED";
  if (status >= 500) return "SERVER_ERROR";
  return "CANVAS_ERROR";
}

export function assertReadOnlyMethod(method) {
  const normalized = String(method ?? "GET").toUpperCase();
  if (WRITE_METHODS.has(normalized) || normalized !== "GET") {
    throw new CanvasError(
      `Refusing ${normalized}: Canvas Study is read-only. Only GET requests are allowed.`,
      { code: "READ_ONLY" },
    );
  }
  return "GET";
}

export function assertReadOnlyPath(pathname) {
  if (!pathname || !pathname.startsWith("/api/v1/")) {
    throw new CanvasError(
      `Refusing non-Canvas API path: ${pathname ?? "(empty)"}.`,
      { code: "READ_ONLY_PATH" },
    );
  }
  const normal = new URL(pathname, "https://canvas.invalid").pathname;
  if (!ALLOWED_PREFIXES.some((prefix) => normal === prefix || normal.startsWith(prefix))) {
    throw new CanvasError(
      `Refusing path outside the read allowlist: ${normal}.`,
      { code: "READ_ONLY_PATH" },
    );
  }
  return normal;
}

export function normalizeBaseUrl(input) {
  let raw = String(input ?? "").trim();
  if (!raw) throw new CanvasError("A Canvas URL is required.", { code: "INVALID_URL" });
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) && !/^https?:\/\//i.test(raw)) {
    throw new CanvasError("Canvas URL must use HTTP or HTTPS.", { code: "INVALID_URL" });
  }
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new CanvasError(`Invalid Canvas URL: ${input}`, { code: "INVALID_URL" });
  }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !local) {
    throw new CanvasError(
      "Canvas URL must use HTTPS. HTTP is allowed only for localhost tests.",
      { code: "INVALID_URL" },
    );
  }
  url.hash = "";
  url.search = "";
  url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString().replace(/\/$/, "");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseNextLink(header) {
  if (!header) return null;
  const match = header.match(/<([^>]+)>\s*;\s*rel="?next"?/i);
  return match ? match[1] : null;
}

function sanitizeErrorBody(text, token) {
  const redacted = redactSecrets(text, token);
  return redacted.length > 500 ? redacted.slice(0, 500) + "..." : redacted;
}

export class CanvasClient {
  constructor({ baseUrl, token }) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.base = new URL(this.baseUrl);
    this.token = token;
  }

  buildUrl(pathname, params = {}) {
    const cleanPath = assertReadOnlyPath(pathname);
    const url = new URL(cleanPath, this.base);
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const item of value) url.searchParams.append(key, String(item));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
    return url;
  }

  async fetchSameOrigin(url, timeoutMs) {
    let current;
    try {
      current = new URL(url);
    } catch {
      throw new CanvasError("Invalid Canvas request URL.", { code: "INVALID_URL" });
    }

    for (let redirects = 0; redirects < 6; redirects += 1) {
      if (current.protocol !== this.base.protocol || current.host !== this.base.host) {
        throw new CanvasError(
          `Refusing a cross-origin Canvas API redirect to ${current.origin}.`,
          { code: "INSECURE_REDIRECT" },
        );
      }
      const response = await fetch(current, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.token}`,
          "User-Agent": "StudySkills/0.1.1",
        },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          throw new CanvasError("Canvas API redirect without a location.", { code: "INSECURE_REDIRECT" });
        }
        current = new URL(location, current);
        continue;
      }
      return response;
    }

    throw new CanvasError("Canvas API redirect limit reached.", { code: "INSECURE_REDIRECT" });
  }

  async request(url, { timeoutMs = 30000, maxRetries = 5 } = {}) {
    let attempt = 0;
    while (true) {
      let response;
      let text;
      try {
        response = await this.fetchSameOrigin(url, timeoutMs);
        text = await response.text();
      } catch (error) {
        if (error instanceof CanvasError) throw error;
        if (attempt >= maxRetries) {
          throw new CanvasError(`Network error for ${new URL(url).pathname}: ${error.message}`, {
            code: "NETWORK_ERROR",
          });
        }
        attempt += 1;
        await sleep(Math.min(1000 * 2 ** attempt, 30000));
        continue;
      }

      const rateLimited = response.status === 429 || (response.status === 403 && /rate limit/i.test(text));
      if (rateLimited) {
        if (attempt >= maxRetries) {
          throw new CanvasError(
            `Canvas rate limit persisted for ${new URL(url).pathname}.`,
            {
              status: response.status,
              path: new URL(url).pathname,
              body: sanitizeErrorBody(text, this.token),
              code: "RATE_LIMITED",
            },
          );
        }
        const retryHeader = response.headers.get("retry-after");
        const retryAfter = retryHeader === null ? null : Number(retryHeader);
        const delay = retryAfter !== null && Number.isFinite(retryAfter) && retryAfter >= 0
          ? retryAfter * 1000
          : Math.min(1000 * 2 ** attempt, 30000);
        attempt += 1;
        await sleep(delay);
        continue;
      }

      if (response.status >= 500 && attempt < maxRetries) {
        attempt += 1;
        await sleep(Math.min(1000 * 2 ** attempt, 30000));
        continue;
      }

      if (!response.ok) {
        const requestPath = new URL(url).pathname;
        throw new CanvasError(
          `Canvas ${response.status} for ${requestPath}.`,
          {
            status: response.status,
            path: requestPath,
            body: sanitizeErrorBody(text, this.token),
            code: statusCode(response.status),
          },
        );
      }

      return { response, text };
    }
  }

  async getJson(pathname, params = {}) {
    const url = this.buildUrl(pathname, params);
    const { text } = await this.request(url);
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      throw new CanvasError(`Canvas returned invalid JSON for ${url.pathname}.`, {
        code: "INVALID_JSON",
      });
    }
  }

  async getAllWithMeta(pathname, params = {}, { maxPages = 100 } = {}) {
    let next = this.buildUrl(pathname, params);
    const items = [];
    let pagesFetched = 0;
    let truncated = false;

    while (next && pagesFetched < maxPages) {
      assertReadOnlyPath(next.pathname);
      if (next.host !== this.base.host || next.protocol !== this.base.protocol) {
        throw new CanvasError(`Refusing pagination to a different origin: ${next.origin}`, {
          code: "INSECURE_REDIRECT",
        });
      }
      const { response, text } = await this.request(next);
      let page;
      try {
        page = text ? JSON.parse(text) : [];
      } catch {
        throw new CanvasError(`Expected JSON from ${next.pathname}.`, { code: "INVALID_JSON" });
      }
      if (!Array.isArray(page)) {
        throw new CanvasError(`Expected an array from ${next.pathname}.`, { code: "INVALID_JSON" });
      }
      items.push(...page);
      pagesFetched += 1;
      const nextLink = parseNextLink(response.headers.get("link"));
      next = nextLink ? new URL(nextLink, this.base) : null;
      if (next) await sleep(100);
    }

    if (next) truncated = true;
    return { items, pagesFetched, truncated };
  }

  async getAll(pathname, params = {}, options = {}) {
    const result = await this.getAllWithMeta(pathname, params, options);
    return result.items;
  }

  async download(file, destination, { maxBytes = 50 * 1024 * 1024 } = {}) {
    let current = file?.url;
    if (!current && file?.id) {
      current = new URL(`/api/v1/files/${file.id}/download?download_frd=1`, this.base).toString();
    }
    if (!current) throw new CanvasError("File has no download URL or ID.", { code: "DOWNLOAD_FAILED" });

    let parsed;
    try {
      parsed = new URL(current, this.base);
    } catch {
      throw new CanvasError("File download URL is invalid.", { code: "DOWNLOAD_FAILED" });
    }

    let response = null;
    for (let redirects = 0; redirects < 6; redirects += 1) {
      const sameOrigin = parsed.host === this.base.host && parsed.protocol === this.base.protocol;
      response = await fetch(parsed, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(120000),
        headers: sameOrigin
          ? {
              Authorization: `Bearer ${this.token}`,
              "User-Agent": "StudySkills/0.1.1",
            }
          : { "User-Agent": "StudySkills/0.1.1" },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new CanvasError("Download redirect without a location.", { code: "DOWNLOAD_FAILED" });
        parsed = new URL(location, parsed);
        continue;
      }
      break;
    }

    if (!response || !response.ok) {
      throw new CanvasError(
        `File download failed with ${response?.status ?? "no response"}.`,
        { status: response?.status ?? null, code: statusCode(response?.status ?? 0) },
      );
    }

    await fsp.mkdir(path.dirname(destination), { recursive: true });
    let total = 0;
    const limiter = new Transform({
      transform(chunk, _encoding, callback) {
        total += chunk.length;
        if (total > maxBytes) {
          callback(new Error("FILE_TOO_LARGE"));
          return;
        }
        callback(null, chunk);
      },
    });

    try {
      await pipeline(
        Readable.fromWeb(response.body),
        limiter,
        fs.createWriteStream(destination),
      );
    } catch (error) {
      await fsp.rm(destination, { force: true });
      if (error.message === "FILE_TOO_LARGE" || /FILE_TOO_LARGE/.test(String(error.message))) {
        throw new CanvasError("File exceeds the size limit.", { code: "FILE_TOO_LARGE" });
      }
      throw error;
    }

    return total;
  }
}

export async function validateToken(client) {
  const user = await client.getJson("/api/v1/users/self");
  if (!user || !user.id) {
    throw new CanvasError("Canvas did not return a valid user.", { code: "UNAUTHORIZED" });
  }
  return user;
}
