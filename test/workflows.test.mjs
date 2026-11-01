import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { REPO_ROOT } from "../test-support/temp.mjs";

async function read(file) {
  return fs.readFile(path.join(REPO_ROOT, file), "utf8");
}

test("workflows: test matrix runs on main and dev", async () => {
  const workflow = await read(".github/workflows/test.yml");
  assert.match(workflow, /branches:\s*\n\s*- main\s*\n\s*- dev/);
  assert.match(workflow, /ubuntu-latest/);
  assert.match(workflow, /macos-latest/);
  assert.match(workflow, /windows-latest/);
  assert.match(workflow, /node-version: \[20, 22\]/);
});

test("workflows: release runs the full check suite", async () => {
  const workflow = await read(".github/workflows/release.yml");
  for (const command of [
    "check:version",
    "check:skills",
    "check:syntax",
    "check:marketplaces",
    "check:install",
    "node --test",
  ]) {
    assert.match(workflow, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
