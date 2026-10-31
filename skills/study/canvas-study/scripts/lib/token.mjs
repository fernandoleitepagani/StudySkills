import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

export const STUDY_DIR = path.join(os.homedir(), ".studyskills");
export const LEGACY_TOKEN_TXT = path.join(STUDY_DIR, "canvas-token.txt");
export const LEGACY_TOKEN_ENV = path.join(STUDY_DIR, "canvas-token.env");

async function readTokenFile(file) {
  try {
    return { text: await fs.readFile(file, "utf8"), missing: false, error: null };
  } catch (error) {
    if (error?.code === "ENOENT") return { text: null, missing: true, error: null };
    return { text: null, missing: false, error };
  }
}

function cleanToken(value) {
  const trimmed = String(value ?? "").replace(/^\uFEFF/, "").trim();
  if (!trimmed) return "";
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function parseEnvToken(text) {
  if (!text) return "";
  for (const line of String(text).replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^(?:export\s+)?CANVAS_TOKEN\s*=\s*(.*)$/);
    if (match) return cleanToken(match[1]);
  }
  return "";
}

export function canvasHost(baseUrl) {
  let raw = String(baseUrl ?? "").trim();
  if (!raw) {
    const error = new Error("A Canvas URL is required to locate the token.");
    error.code = "INVALID_URL";
    throw error;
  }
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  let url;
  try {
    url = new URL(raw);
  } catch {
    const error = new Error(`Invalid Canvas URL: ${baseUrl}`);
    error.code = "INVALID_URL";
    throw error;
  }
  const host = url.host.toLowerCase();
  return {
    host,
    key: host.replace(/[^a-z0-9.-]/g, "_"),
  };
}

export function tokenPaths(baseUrl) {
  const { host, key } = canvasHost(baseUrl);
  const directory = path.join(STUDY_DIR, "canvas", key);
  return {
    host,
    key,
    directory,
    txt: path.join(directory, "token.txt"),
    env: path.join(directory, "token.env"),
  };
}

function unreadable(pathValue, error) {
  return {
    found: false,
    source: null,
    path: pathValue,
    token: null,
    error: {
      code: "UNREADABLE_TOKEN_FILE",
      path: pathValue,
      message: `Cannot read ${pathValue}: ${error?.message ?? "unknown error"}`,
    },
  };
}


async function withAge(status) {
  if (!status.found || !status.path) return { ...status, ageDays: null, stale: false, warning: null };
  let ageDays = null;
  try {
    const stat = await fs.stat(status.path);
    ageDays = Math.max(0, Math.floor((Date.now() - stat.mtimeMs) / 86400000));
  } catch {
    // The token was readable, so age is only a hint.
  }
  const stale = ageDays !== null && ageDays >= 30;
  return {
    ...status,
    ageDays,
    stale,
    warning: stale
      ? `This token file is ${ageDays} days old. Canvas tokens commonly expire after 30 days. If Canvas rejects it, create a new token.`
      : null,
  };
}

async function readPair(paths) {
  const txt = await readTokenFile(paths.txt);
  if (txt.error) return { error: unreadable(paths.txt, txt.error) };
  if (txt.text !== null) {
    const token = cleanToken(txt.text);
    if (token) return { found: true, source: "token.txt", path: paths.txt, token };
  }

  const env = await readTokenFile(paths.env);
  if (env.error) return { error: unreadable(paths.env, env.error) };
  if (env.text !== null) {
    const token = parseEnvToken(env.text);
    if (token) return { found: true, source: "token.env", path: paths.env, token };
  }
  return { found: false };
}

export async function getTokenStatus(baseUrl) {
  const paths = tokenPaths(baseUrl);
  const host = await readPair(paths);
  if (host.error) return host.error;
  if (host.found) return withAge({ ...host, paths: [paths.txt, paths.env], legacy: false, host: paths.host });

  const legacyTxt = await readTokenFile(LEGACY_TOKEN_TXT);
  if (legacyTxt.error) return unreadable(LEGACY_TOKEN_TXT, legacyTxt.error);
  if (legacyTxt.text !== null) {
    const token = cleanToken(legacyTxt.text);
    if (token) {
      return withAge({
        found: true,
        source: "legacy canvas-token.txt",
        path: LEGACY_TOKEN_TXT,
        token,
        paths: [paths.txt, paths.env],
        legacy: true,
        host: paths.host,
      });
    }
  }

  const legacyEnv = await readTokenFile(LEGACY_TOKEN_ENV);
  if (legacyEnv.error) return unreadable(LEGACY_TOKEN_ENV, legacyEnv.error);
  if (legacyEnv.text !== null) {
    const token = parseEnvToken(legacyEnv.text);
    if (token) {
      return withAge({
        found: true,
        source: "legacy canvas-token.env",
        path: LEGACY_TOKEN_ENV,
        token,
        paths: [paths.txt, paths.env],
        legacy: true,
        host: paths.host,
      });
    }
  }

  return withAge({
    found: false,
    source: null,
    path: null,
    token: null,
    paths: [paths.txt, paths.env],
    legacy: false,
    host: paths.host,
  });
}

export async function requireToken(baseUrl) {
  const status = await getTokenStatus(baseUrl);
  if (!status.found) {
    const error = new Error(
      status.error
        ? status.error.message
        : `No Canvas token found at ${status.paths[0]} or ${status.paths[1]}.`,
    );
    error.code = status.error?.code ?? "NO_TOKEN";
    error.paths = status.error ? [status.error.path] : status.paths;
    throw error;
  }
  return status;
}

export function tokenGuideText(baseUrl) {
  const paths = tokenPaths(baseUrl);
  return [
    `Canvas token setup for ${paths.host}`,
    "",
    "Security warning:",
    "  A Canvas personal access token can access your whole account, not just one course.",
    "  Create a dedicated token, keep it outside the repository, and revoke it after use.",
    "  Never paste the token into chat.",
    "",
    "Save your token in one of these files:",
    `  ${paths.txt}`,
    `  ${paths.env}`,
    "",
    "Recommended path: Option A, a plain text file with only the token.",
    "",
    "Option A: plain text file",
    `  1. Open ${paths.txt}`,
    "  2. Paste only the token, with no label and no quotes.",
    "  3. Save the file.",
    "",
    "Option B: env file",
    `  1. Open ${paths.env}`,
    "  2. Add this line:",
    "     CANVAS_TOKEN=your-token-here",
    "  3. Save the file.",
    "",
    "How to create the token:",
    "  1. Open Canvas.",
    "  2. Go to Account, then Settings.",
    "  3. Create a new access token.",
    "  4. Copy it immediately. Canvas does not show it again.",
    "",
    "Permissions:",
    "  On Unix, run: chmod 600 " + paths.txt,
    "  Never commit the token to a repository.",
    "",
    "If your token stopped working:",
    "  Canvas tokens commonly expire after 30 days, but your institution controls expiry.",
    "  Create a new token, replace the old value in this file, save it, and run",
    "  /canvas-study again. If it still fails, check that the token belongs to this",
    "  Canvas host and that it was not revoked.",
    "",
    "After saving the token, run /canvas-study again from the beginning.",
  ].join("\n");
}

export async function createTokenGuide(baseUrl) {
  const paths = tokenPaths(baseUrl);
  try {
    await fs.mkdir(paths.directory, { recursive: true });
  } catch (error) {
    const wrapped = new Error(`Cannot create ${paths.directory}: ${error.message}`);
    wrapped.code = "TOKEN_DIRECTORY_ERROR";
    throw wrapped;
  }

  let created = false;
  let stat = null;
  try {
    stat = await fs.stat(paths.txt);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      const wrapped = new Error(`Cannot inspect ${paths.txt}: ${error.message}`);
      wrapped.code = "TOKEN_PATH_ERROR";
      throw wrapped;
    }
  }

  if (stat?.isDirectory()) {
    const error = new Error(`${paths.txt} is a directory, not a token file.`);
    error.code = "TOKEN_PATH_NOT_FILE";
    throw error;
  }

  if (!stat) {
    await fs.writeFile(paths.txt, "", { encoding: "utf8", mode: 0o600 });
    created = true;
  }

  try {
    await fs.chmod(paths.txt, 0o600);
  } catch {
    // Windows does not use POSIX modes.
  }

  return {
    created,
    host: paths.host,
    directory: paths.directory,
    tokenFile: paths.txt,
    envFile: paths.env,
    guide: tokenGuideText(baseUrl),
  };
}

export function redactSecrets(value, token = null) {
  let text = String(value ?? "");
  if (token) text = text.split(token).join("[REDACTED]");
  text = text.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]");
  text = text.replace(/([?&](?:access_token|verifier)=)[^&\s]+/gi, "$1[REDACTED]");
  return text;
}
