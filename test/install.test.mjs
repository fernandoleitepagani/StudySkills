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
  assert.equal(data.total, 16);
  assert.equal(data.skills.some((skill) => skill.name === "study-core"), false);
});

test("install: reports missing files in an incomplete install", async () => {
  const home = await makeTempDir("studyskills-install-");
  try {
    await fs.mkdir(path.join(home, "skills", "canvas-study"), { recursive: true });
    const result = await run(["--root", path.join(home, "skills"), "--json"]);
    assert.notEqual(result.code, 0);
    const data = JSON.parse(result.stdout);
    assert.equal(data.ok, false);
    assert.equal(data.skills.some((skill) => skill.name === "canvas-study" && !skill.ok), true);
  } finally {
    await cleanupDir(home);
  }
});
