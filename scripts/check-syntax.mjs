#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ROOTS = ["skills", "scripts", "test", "test-support"];
const files = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile() && entry.name.endsWith(".mjs")) files.push(full);
  }
}

for (const root of ROOTS) await walk(path.join(REPO, root));

let failed = 0;
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    failed += 1;
    process.stderr.write(`${path.relative(REPO, file)}\n${result.stderr}`);
  }
}
if (failed) {
  process.stderr.write(`${failed} syntax error(s).\n`);
  process.exit(1);
}
console.log(`Syntax OK: ${files.length} files.`);
