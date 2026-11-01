#!/usr/bin/env node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SKILLS_ROOT = path.join(REPO, "skills/study");
const DESTINATIONS = [
  path.join(os.homedir(), ".claude", "skills"),
  path.join(os.homedir(), ".agents", "skills"),
];
const force = process.argv.includes("--force");

async function exists(file) {
  try {
    await fs.lstat(file);
    return true;
  } catch {
    return false;
  }
}

const entries = (await fs.readdir(SKILLS_ROOT, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const destination of DESTINATIONS) {
  await fs.mkdir(destination, { recursive: true });
  for (const name of entries) {
    const source = path.join(SKILLS_ROOT, name);
    const target = path.join(destination, name);
    if (await exists(target)) {
      const stat = await fs.lstat(target);
      if (stat.isSymbolicLink()) {
        await fs.unlink(target);
      } else if (force) {
        await fs.rm(target, { recursive: true, force: true });
      } else {
        console.error(`refusing to replace ${target}; use --force`);
        process.exitCode = 1;
        continue;
      }
    }
    const type = process.platform === "win32" ? "junction" : "dir";
    await fs.symlink(source, target, type);
    console.log(`linked ${name} -> ${target}`);
  }
}
