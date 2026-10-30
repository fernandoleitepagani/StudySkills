import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

export const STUDY_DIR = path.join(os.homedir(), ".studyskills");
export const TOKEN_TXT = path.join(STUDY_DIR, "canvas-token.txt");
export const TOKEN_ENV = path.join(STUDY_DIR, "canvas-token.env");

async function readIfExists(file) {
  try {
    return await fs.readFile(file, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
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

export async function getTokenStatus() {
  const txt = await readIfExists(TOKEN_TXT);
  if (txt !== null) {
    const token = cleanToken(txt);
    if (token) {
      return { found: true, source: "canvas-token.txt", path: TOKEN_TXT, token };
    }
  }

  const env = await readIfExists(TOKEN_ENV);
  if (env !== null) {
    const token = parseEnvToken(env);
    if (token) {
      return { found: true, source: "canvas-token.env", path: TOKEN_ENV, token };
    }
  }

  return {
    found: false,
    source: null,
    path: null,
    token: null,
    paths: [TOKEN_TXT, TOKEN_ENV],
  };
}

export async function requireToken() {
  const status = await getTokenStatus();
  if (!status.found) {
    const error = new Error(
      `No Canvas token found at ${TOKEN_TXT} or ${TOKEN_ENV}.`,
    );
    error.code = "NO_TOKEN";
    error.paths = [TOKEN_TXT, TOKEN_ENV];
    throw error;
  }
  return status;
}

export function tokenGuideText() {
  return [
    "Canvas token setup",
    "",
    `Save your token in one of these files:`,
    `  ${TOKEN_TXT}`,
    `  ${TOKEN_ENV}`,
    "",
    "Option A: plain text file",
    `  1. Open ${TOKEN_TXT}`,
    "  2. Paste only the token, with no label and no quotes.",
    "  3. Save the file.",
    "",
    "Option B: env file",
    `  1. Open ${TOKEN_ENV}`,
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
    "  On Unix, run: chmod 600 " + TOKEN_TXT,
    "  Never commit the token to a repository.",
    "",
    "After saving the token, run /canvas-study again from the beginning.",
  ].join("\n");
}

export async function createTokenGuide() {
  await fs.mkdir(STUDY_DIR, { recursive: true });
  let created = false;
  try {
    await fs.access(TOKEN_TXT);
  } catch {
    await fs.writeFile(TOKEN_TXT, "", { encoding: "utf8", mode: 0o600 });
    created = true;
  }
  try {
    await fs.chmod(TOKEN_TXT, 0o600);
  } catch {
    // Windows does not use POSIX modes.
  }
  return {
    created,
    directory: STUDY_DIR,
    tokenFile: TOKEN_TXT,
    envFile: TOKEN_ENV,
    guide: tokenGuideText(),
  };
}

export function redactSecrets(value, token = null) {
  let text = String(value ?? "");
  if (token) text = text.split(token).join("[REDACTED]");
  text = text.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]");
  text = text.replace(/([?&](?:access_token|verifier)=)[^&\s]+/gi, "$1[REDACTED]");
  return text;
}
