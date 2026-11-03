import path from "node:path";
import fs from "node:fs/promises";
import http from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { cleanToken, redactSecrets } from "./token.mjs";
import { CanvasClient, normalizeBaseUrl, validateToken } from "./canvas-client.mjs";

function codedError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function sanitizeToken(raw) {
  const text = cleanToken(cleanToken(raw).replace(/^Bearer\s+/i, ""));

  if (!text) throw codedError("TOKEN_EMPTY", "No token was provided.");
  if (text.length > 4096) throw codedError("TOKEN_TOO_LONG", "The token is too long.");
  if (/[\r\n]/.test(text)) throw codedError("TOKEN_MULTILINE", "The token spans more than one line.");
  if (/\s/.test(text)) throw codedError("TOKEN_WHITESPACE", "The token contains whitespace.");
  if (/^https?:\/\//i.test(text)) throw codedError("TOKEN_LOOKS_LIKE_URL", "The value looks like a URL, not a token.");
  if (!/^[\x21-\x7E]+$/.test(text)) throw codedError("TOKEN_INVALID_CHARS", "The token contains unsupported characters.");
  if (text.length < 8) throw codedError("TOKEN_TOO_SHORT", "The token is too short.");

  return text;
}

function clipboardProviders() {
  const linux = [
    { command: "wl-paste", args: ["-n"] },
    { command: "xclip", args: ["-selection", "clipboard", "-o"] },
    { command: "xsel", args: ["--clipboard", "--output"] },
  ];

  if (process.platform === "win32") {
    return [{ command: "powershell.exe", args: ["-NoProfile", "-Command", "Get-Clipboard"] }];
  }
  if (process.platform === "darwin") {
    return [{ command: "pbpaste", args: [] }];
  }
  const powershell = { command: "powershell.exe", args: ["-NoProfile", "-Command", "Get-Clipboard"] };
  if (process.env.WSL_DISTRO_NAME) return [powershell, ...linux];
  return linux;
}

export async function readClipboard() {
  let sawEmpty = false;

  for (const provider of clipboardProviders()) {
    const result = spawnSync(provider.command, provider.args, {
      encoding: "utf8",
      timeout: 3000,
      maxBuffer: 8192,
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    });

    if (result.error?.code === "ENOENT") continue;
    if (result.error?.code === "ENOBUFS") {
      throw codedError("CLIPBOARD_TOO_LARGE", "The clipboard contains too much text.");
    }
    if (result.error || result.status !== 0) continue;

    const text = String(result.stdout ?? "");
    if (!text.trim()) {
      sawEmpty = true;
      continue;
    }
    if (text.length > 4096) throw codedError("CLIPBOARD_TOO_LARGE", "The clipboard contains too much text.");
    return { token: text, provider: provider.command };
  }

  if (sawEmpty) throw codedError("CLIPBOARD_EMPTY", "The clipboard is empty.");
  throw codedError("CLIPBOARD_UNAVAILABLE", "No clipboard reader is available.");
}

function openerAttempts(url) {
  if (process.platform === "darwin") return [{ command: "open", args: [url] }];
  if (process.platform === "win32") return [{ command: "cmd", args: ["/c", "start", "", url] }];

  const attempts = [];
  if (process.env.WSL_DISTRO_NAME) {
    attempts.push({ command: "wslview", args: [url] });
    attempts.push({ command: "cmd.exe", args: ["/c", "start", "", url] });
  }
  attempts.push({ command: "xdg-open", args: [url] });
  return attempts;
}

function tryOpen(command, args) {
  return new Promise((resolve) => {
    let settled = false;
    let child;
    const finish = (opened) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (opened && child) child.unref();
      resolve(opened);
    };
    const timer = setTimeout(() => finish(false), 1000);

    try {
      child = spawn(command, args, {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      });
    } catch {
      finish(false);
      return;
    }

    child.once("spawn", () => finish(true));
    child.once("error", () => finish(false));
  });
}

export async function openExternal(url) {
  for (const attempt of openerAttempts(url)) {
    if (await tryOpen(attempt.command, attempt.args)) {
      return { opened: true, command: attempt.command };
    }
  }
  return { opened: false, command: null };
}

export function canvasSettingsUrl(baseUrl) {
  const url = new URL(normalizeBaseUrl(baseUrl));
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/profile/settings`;
  url.search = "";
  url.hash = "";
  return url.toString();
}

export async function saveToken({ baseUrl, token, tokenFile }) {
  if (!tokenFile) throw codedError("TOKEN_PATH_REQUIRED", "A token file path is required.");

  const clean = sanitizeToken(token);
  const normalized = normalizeBaseUrl(baseUrl);
  const client = new CanvasClient({ baseUrl: normalized, token: clean });
  const user = await validateToken(client);

  const directory = path.dirname(tokenFile);
  try {
    const stat = await fs.stat(tokenFile);
    if (stat.isDirectory()) {
      throw codedError("TOKEN_PATH_NOT_FILE", `${tokenFile} is a directory, not a token file.`);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  try {
    await fs.mkdir(directory, { recursive: true });
  } catch (error) {
    throw codedError("TOKEN_DIRECTORY_ERROR", `Cannot create ${directory}: ${error.message}`);
  }

  const temporary = `${tokenFile}.tmp-${process.pid}-${Date.now()}`;
  try {
    await fs.writeFile(temporary, `${clean}\n`, { encoding: "utf8", mode: 0o600 });
    await fs.rename(temporary, tokenFile);
  } catch (error) {
    await fs.rm(temporary, { force: true }).catch(() => {});
    throw codedError("TOKEN_WRITE_ERROR", `Cannot write ${tokenFile}: ${error.message}`);
  }

  try {
    await fs.chmod(tokenFile, 0o600);
  } catch {
    // Windows does not use POSIX modes.
  }

  return {
    host: new URL(normalized).host,
    path: tokenFile,
    user: { id: String(user.id), name: user.name ?? null },
  };
}

const SECURITY_HEADERS = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

const PAGE_STYLE = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; background: #f3f5f8; color: #1c2430; font: 16px/1.5 system-ui, sans-serif; }
main { width: min(100%, 30rem); padding: 2rem; background: #fff; border-radius: 0.75rem; box-shadow: 0 0.5rem 2rem rgb(0 0 0 / 12%); }
h1 { margin: 0 0 1rem; font-size: 1.4rem; }
p { margin: 0 0 1rem; }
label { display: block; margin: 1.25rem 0 0.4rem; font-weight: 600; }
input { width: 100%; padding: 0.65rem; font: inherit; border: 1px solid #8d99a8; border-radius: 0.4rem; }
button { margin-top: 0.75rem; padding: 0.65rem 1rem; font: inherit; font-weight: 600; color: #fff; background: #1f3a5f; border: 0; border-radius: 0.4rem; cursor: pointer; }
.note { color: #566171; font-size: 0.9rem; }
.error { padding: 0.65rem 0.75rem; background: #fde8e8; color: #8a1f1f; border-radius: 0.4rem; }
`;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function page(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>${PAGE_STYLE}</style>
</head>
<body>
<main>${body}</main>
</body>
</html>`;
}

function capturePage(nonce, error = null) {
  const errorBlock = error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : "";
  return page("StudySkills Canvas token", `
<h1>Connect Canvas</h1>
<p>Create the token in Canvas: Account &gt; Settings &gt; New Access Token. Canvas shows it once.</p>
${errorBlock}
<form method="post" action="/capture/${escapeHtml(nonce)}">
<label for="token">Canvas token</label>
<input id="token" name="token" type="password" autocomplete="new-password" spellcheck="false" autofocus required>
<button type="submit">Save token</button>
</form>
<p class="note">StudySkills checks the token with Canvas before saving it.</p>
`);
}

function successPage(name) {
  return page("Canvas connected", `
<h1>Connected</h1>
<p>Connected as <strong>${escapeHtml(name)}</strong>.</p>
<p>You can close this tab and return to the chat.</p>
`);
}

function errorPage(message) {
  return page("Canvas token error", `
<h1>Token not saved</h1>
<p class="error" role="alert">${escapeHtml(message)}</p>
<p>Close this tab and return to the chat.</p>
`);
}

function sendHtml(res, status, html, extraHeaders = {}) {
  const body = Buffer.from(html, "utf8");
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    ...extraHeaders,
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": body.length,
  });
  res.end(body);
}

export async function startCaptureServer({
  baseUrl,
  tokenFile,
  timeoutMs = 120000,
  port = 0,
}) {
  const nonce = randomBytes(24).toString("base64url");
  const expectedPath = `/capture/${nonce}`;
  let expectedOrigin = null;
  let attempts = 0;
  let settled = false;
  let closed = false;
  let timer = null;

  let resolveResult;
  let rejectResult;
  const result = new Promise((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });

  function settle(fn, value) {
    if (settled) return;
    settled = true;
    if (timer) clearTimeout(timer);
    fn(value);
  }

  async function handle(req, res) {
    const requestUrl = new URL(req.url, expectedOrigin ?? "http://127.0.0.1");
    if (requestUrl.pathname !== expectedPath) {
      sendHtml(res, 404, errorPage("This page does not exist."));
      return;
    }

    if (req.method === "GET") {
      sendHtml(res, 200, capturePage(nonce));
      return;
    }
    if (req.method !== "POST") {
      sendHtml(res, 405, errorPage("Only GET and POST are allowed."), { Allow: "GET, POST" });
      return;
    }

    const origin = req.headers.origin;
    if (origin && origin !== expectedOrigin) {
      sendHtml(res, 403, errorPage("This request came from another origin."));
      return;
    }
    const site = req.headers["sec-fetch-site"];
    if (site && site !== "same-origin" && site !== "none") {
      sendHtml(res, 403, errorPage("This request came from another site."));
      return;
    }

    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 8192) {
        res.on("finish", () => req.destroy());
        sendHtml(res, 413, errorPage("The request is too large."));
        return;
      }
      chunks.push(chunk);
    }

    const token = new URLSearchParams(Buffer.concat(chunks).toString("utf8")).get("token") ?? "";
    try {
      const saved = await saveToken({ baseUrl, token, tokenFile });
      const body = successPage(saved.user.name ?? "your Canvas user");
      const payload = Buffer.from(body, "utf8");
      res.writeHead(200, {
        ...SECURITY_HEADERS,
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": payload.length,
        Connection: "close",
      });
      finishResponse(res, () => settle(resolveResult, saved));
      res.end(payload);
    } catch (error) {
      attempts += 1;
      const message = redactSecrets(error.message ?? "The token was rejected.", token);
      if (attempts >= 3) {
        finishResponse(res, () => settle(rejectResult, codedError("CAPTURE_TOO_MANY_ATTEMPTS", "Too many token attempts.")));
        sendHtml(res, 429, errorPage(`${message} Too many attempts.`), { Connection: "close" });
        return;
      }
      sendHtml(res, 400, capturePage(nonce, message));
    }
  }

  function finishResponse(res, after) {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      server.close(() => {
        closed = true;
        after();
      });
    };
    res.on("finish", finish);
    res.on("close", finish);
  }

  const server = http.createServer((req, res) => {
    handle(req, res).catch(() => {
      if (!res.headersSent) sendHtml(res, 500, errorPage("The capture page failed."));
      else res.destroy();
    });
  });

  async function close() {
    if (closed) return;
    closed = true;
    if (timer) clearTimeout(timer);
    if (typeof server.closeAllConnections === "function") server.closeAllConnections();
    await new Promise((resolve) => server.close(() => resolve()));
    settle(rejectResult, codedError("CAPTURE_CLOSED", "The capture page closed before a token arrived."));
  }

  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(port, "127.0.0.1", resolve);
    });
  } catch (error) {
    throw codedError("CAPTURE_START_FAILED", `Cannot start the capture page: ${error.message}`);
  }

  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;
  expectedOrigin = `http://127.0.0.1:${actualPort}`;

  timer = setTimeout(() => {
    settle(rejectResult, codedError("CAPTURE_TIMEOUT", "The capture page timed out."));
    void close();
  }, timeoutMs);

  return {
    url: `${expectedOrigin}${expectedPath}`,
    port: actualPort,
    result,
    close,
  };
}
