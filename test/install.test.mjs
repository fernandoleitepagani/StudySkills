import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { REPO_ROOT, makeTempDir, cleanupDir } from "../test-support/temp.mjs";

const execFileAsync = promisify(execFile);
const SCRIPT = path.join(REPO_ROOT, "scripts/check-install.mjs");

async function run(args) {
  try {
    const result = await execFileAsync(process.execPath, [SCRIPT, ...args], { cwd: REPO_ROOT });
    return { code: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return { code: error.code ?? 1, stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
  }
}

test("install: repository skill tree passes the install check", async () => {
  const result = await run(["--json"]);
  assert.equal(result.code, 0);
  const data = JSON.parse(result.stdout);
  assert.equal(data.ok, true);
  assert.equal(data.total, 13);
  assert.equal(data.skills.some((skill) => skill.name === "study-core"), false);
});

test("install: reports missing files in an incomplete install", async () => {
  const home = await makeTempDir("studyskills-install-");
  try {
    await fs.mkdir(path.join(home, "skills", "study-canvas"), { recursive: true });
    const result = await run(["--root", path.join(home, "skills"), "--json"]);
    assert.notEqual(result.code, 0);
    const data = JSON.parse(result.stdout);
    assert.equal(data.ok, false);
    assert.equal(data.skills.some((skill) => skill.name === "study-canvas" && !skill.ok), true);
  } finally {
    await cleanupDir(home);
  }
});

const VERSION_SCRIPT = path.join(REPO_ROOT, "scripts/check-version.mjs");

async function runVersion(root) {
  try {
    const result = await execFileAsync(process.execPath, [VERSION_SCRIPT, "--root", root], { cwd: REPO_ROOT });
    return { code: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    return { code: error.code ?? 1, stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
  }
}

test("install: version check catches a Codex manifest mismatch", async () => {
  const root = await makeTempDir("studyskills-version-");
  try {
    await fs.mkdir(path.join(root, ".claude-plugin"), { recursive: true });
    await fs.mkdir(path.join(root, ".codex-plugin"), { recursive: true });
    await fs.writeFile(path.join(root, "package.json"), JSON.stringify({ version: "1.1.0" }));
    await fs.writeFile(path.join(root, ".claude-plugin/plugin.json"), JSON.stringify({ version: "1.1.0" }));
    await fs.writeFile(path.join(root, ".codex-plugin/plugin.json"), JSON.stringify({ version: "1.0.1" }));

    let result = await runVersion(root);
    assert.notEqual(result.code, 0);
    assert.match(result.stderr, /codex=1\.0\.1/);

    await fs.writeFile(path.join(root, ".codex-plugin/plugin.json"), JSON.stringify({ version: "1.1.0" }));
    result = await runVersion(root);
    assert.equal(result.code, 0);
    assert.match(result.stdout, /Version sync OK: 1\.1\.0/);
  } finally {
    await cleanupDir(root);
  }
});
