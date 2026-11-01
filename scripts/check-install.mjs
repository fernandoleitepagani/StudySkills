#!/usr/bin/env node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEFAULT_ROOT = path.join(REPO, "skills/study");
const REFS = [
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
];
const LIBS = ["files.mjs", "validate.mjs", "inventory.mjs", "catalog.mjs"];
const EXPECTED_SKILLS = [
  "canvas-study",
  "lecture-notes",
  "flashcard-forge",
  "explain-back",
  "exam-sim",
  "study-planner",
  "note-organizer",
  "file-study",
  "revisit-and-improve",
  "language-coach",
  "active-recall-coach",
  "math-practice",
  "exam-debrief",
  "code-kata-coach",
  "paper-reader",
  "thesis-organizer",
];
const args = process.argv.slice(2);
const json = args.includes("--json");
const rootIndex = args.indexOf("--root");
const rawRoot = rootIndex >= 0 ? args[rootIndex + 1] : null;
const expand = (value) => {
  if (!value) return value;
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
  return value.replace(/^\$HOME/, os.homedir());
};
const root = path.resolve(expand(rawRoot) || DEFAULT_ROOT);

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

const required = (name) => {
  const files = [
    "SKILL.md",
    "README.md",
    "agents/openai.yaml",
    "assets/theme.json",
    "scripts/core.mjs",
    ...REFS.map((ref) => path.join("references/core", ref)),
    ...LIBS.map((lib) => path.join("scripts/lib", lib)),
  ];
  if (name === "canvas-study") files.push("scripts/lib/html-to-text.mjs");
  return files;
};

const result = { ok: true, root, total: 0, skills: [] };
try {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const present = new Set(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name));
  result.total = EXPECTED_SKILLS.length;
  for (const name of EXPECTED_SKILLS) {
    const missing = [];
    for (const file of required(name)) {
      if (!(await exists(path.join(root, name, file)))) missing.push(file);
    }
    if (missing.length) result.ok = false;
    result.skills.push({ name, ok: missing.length === 0, missing });
  }
  if (present.has("study-core")) {
    result.ok = false;
    result.skills.push({ name: "study-core", ok: false, missing: ["study-core must not exist"] });
  }
} catch (error) {
  result.ok = false;
  result.error = error.message;
}

if (json) {
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
} else if (result.error) {
  process.stderr.write(`Cannot inspect ${root}: ${result.error}\n`);
} else {
  process.stdout.write(`Install check: ${result.ok ? "ok" : "failed"}\n`);
  process.stdout.write(`Root: ${root}\n`);
  process.stdout.write(`Skills: ${result.total}\n`);
  for (const skill of result.skills) {
    if (!skill.ok) process.stdout.write(`  ${skill.name}: missing ${skill.missing.join(", ")}\n`);
  }
}
if (!result.ok) process.exitCode = 1;
