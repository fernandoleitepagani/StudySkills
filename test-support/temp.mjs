import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

export const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));
export const CANVAS_SCRIPT = path.join(
  REPO_ROOT,
  "skills/study/canvas-study/scripts/canvas.mjs",
);
export const CORE_SCRIPT = path.join(
  REPO_ROOT,
  "core/scripts/core.mjs",
);
export const CARDS_SCRIPT = path.join(
  REPO_ROOT,
  "skills/study/flashcard-forge/scripts/cards.mjs",
);

export async function makeTempDir(prefix = "studyskills-test-") {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

export async function writeTokenFile(home, token, filename = "canvas-token.txt", contents = null) {
  const dir = path.join(home, ".studyskills");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), contents ?? token, "utf8");
}

export async function cleanupDir(dir) {
  await rm(dir, { recursive: true, force: true });
}

export function runScript(script, args, { home, env = {}, cwd = REPO_ROOT } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd,
      env: {
        ...process.env,
        ...(home ? { HOME: home, USERPROFILE: home } : {}),
        ...env,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

export function runCli(args, options = {}) {
  return runScript(CANVAS_SCRIPT, args, options);
}

export function runCore(args, options = {}) {
  return runScript(CORE_SCRIPT, args, options);
}

export function runCards(args, options = {}) {
  return runScript(CARDS_SCRIPT, args, options);
}
