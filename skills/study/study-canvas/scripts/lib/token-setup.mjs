import path from "node:path";
import fs from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { cleanToken } from "./token.mjs";
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
