#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CORE = path.join(REPO, "core");
const SKILLS_ROOT = path.join(REPO, "skills/study");

const SKILLS = [
  "study-canvas",
  "study-notes",
  "study-recall",
  "study-explain-back",
  "study-exams",
  "study-planner",
  "study-files",
  "study-revisit",
  "study-language",
  "study-math-practice",
  "study-code-kata",
  "paper-reader",
  "thesis-organizer",
];

const REFERENCES = [
  "workflow.md",
  "grilling.md",
  "harness-questions.md",
  "style.md",
  "plan-contract.md",
  "output-conventions.md",
  "source-selection.md",
  "quality.md",
  "web-research.md",
  "error-messages.md",
  "math.md",
];

const LIBS = ["files.mjs", "validate.mjs", "inventory.mjs", "catalog.mjs", "math.mjs"];

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function same(a, b) {
  try {
    const [left, right] = await Promise.all([fs.readFile(a), fs.readFile(b)]);
    return left.equals(right);
  } catch {
    return false;
  }
}

function plan() {
  const copies = [];
  for (const skill of SKILLS) {
    const root = path.join(SKILLS_ROOT, skill);
    for (const ref of REFERENCES) {
      copies.push([path.join(CORE, "references", ref), path.join(root, "references/core", ref)]);
    }
    copies.push([path.join(CORE, "assets/theme.json"), path.join(root, "assets/theme.json")]);
    copies.push([path.join(CORE, "scripts/core.mjs"), path.join(root, "scripts/core.mjs")]);
    for (const lib of LIBS) {
      copies.push([path.join(CORE, "scripts/lib", lib), path.join(root, "scripts/lib", lib)]);
    }
    if (skill === "study-canvas") {
      copies.push([
        path.join(CORE, "scripts/lib/html-to-text.mjs"),
        path.join(root, "scripts/lib/html-to-text.mjs"),
      ]);
    }
  }
  return copies;
}

const check = process.argv.includes("--check");
const copies = plan();
let failures = 0;

for (const [source, target] of copies) {
  if (check) {
    if (!(await exists(target)) || !(await same(source, target))) {
      console.error(`out of sync: ${path.relative(REPO, target)}`);
      failures += 1;
    }
    continue;
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
  console.log(`synced ${path.relative(REPO, target)}`);
}

if (check) {
  if (failures) {
    console.error(`${failures} generated file(s) out of sync. Run: node scripts/sync-skills.mjs`);
    process.exit(1);
  }
  console.log(`Skill core is in sync (${copies.length} files).`);
}
