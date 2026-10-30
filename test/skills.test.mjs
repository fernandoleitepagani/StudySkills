import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { REPO_ROOT } from "../test-support/temp.mjs";

const SKILLS_ROOT = path.join(REPO_ROOT, "skills/study");
const USER_SKILLS = [
  "canvas-study",
  "lecture-notes",
  "flashcard-forge",
  "explain-back",
  "exam-sim",
  "study-planner",
  "note-organizer",
];
const MODEL_SKILLS = ["study-core"];

async function read(relative) {
  return fs.readFile(path.join(REPO_ROOT, relative), "utf8");
}

async function exists(relative) {
  try {
    await fs.access(path.join(REPO_ROOT, relative));
    return true;
  } catch {
    return false;
  }
}

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  assert.ok(match, "SKILL.md needs frontmatter");
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([a-z-]+):\s*(.*)$/);
    if (item) data[item[1]] = item[2].replace(/^"|"$/g, "");
  }
  return data;
}

test("skills: frontmatter and invocation metadata", async () => {
  for (const name of [...USER_SKILLS, ...MODEL_SKILLS]) {
    const file = path.join(SKILLS_ROOT, name, "SKILL.md");
    const text = await fs.readFile(file, "utf8");
    const meta = frontmatter(text);
    assert.equal(meta.name, name);
    assert.ok(meta.description);
    if (USER_SKILLS.includes(name)) {
      assert.equal(meta["disable-model-invocation"], "true", `${name} must be user-invoked`);
    }
    const yaml = await fs.readFile(path.join(SKILLS_ROOT, name, "agents/openai.yaml"), "utf8");
    if (USER_SKILLS.includes(name)) {
      assert.match(yaml, /allow_implicit_invocation:\s*false/, `${name} policy`);
    } else {
      assert.equal(/allow_implicit_invocation/.test(yaml), false, `${name} is model-invoked`);
    }
  }
});

test("skills: plugin, collection README, and docs list every skill", async () => {
  const plugin = JSON.parse(await read(".claude-plugin/plugin.json"));
  assert.ok(Array.isArray(plugin.skills));
  for (const name of [...USER_SKILLS, ...MODEL_SKILLS]) {
    assert.equal(
      plugin.skills.some((entry) => entry.endsWith(`/${name}`)),
      true,
      `plugin missing ${name}`,
    );
    const skillsReadme = await read("skills/study/README.md");
    assert.match(skillsReadme, new RegExp(name));
    const docs = await read("docs/study/README.md");
    assert.match(docs, new RegExp(name));
  }
});

test("skills: required files exist", async () => {
  assert.equal(await exists("skills/study/study-core/references/plan-contract.md"), true);
  assert.equal(await exists("skills/study/study-core/references/output-conventions.md"), true);
  assert.equal(await exists("skills/study/study-core/scripts/core.mjs"), true);
  assert.equal(await exists("skills/study/flashcard-forge/scripts/cards.mjs"), true);
});

test("skills: new skills do not import Canvas or token code", async () => {
  for (const name of ["lecture-notes", "flashcard-forge", "explain-back", "exam-sim", "study-planner", "note-organizer", "study-core"]) {
    const dir = path.join(SKILLS_ROOT, name);
    const files = [];
    async function walk(current) {
      const entries = await fs.readdir(current, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) await walk(full);
        else if (entry.isFile() && (entry.name.endsWith(".mjs") || entry.name.endsWith(".md"))) files.push(full);
      }
    }
    await walk(dir);
    for (const file of files) {
      const text = await fs.readFile(file, "utf8");
      assert.equal(/canvas-token|CANVAS_TOKEN|canvas-client|scripts\/lib\/token\.mjs/.test(text), false, file);
    }
  }
});

test("skills: no runtime dependencies", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.equal(pkg.dependencies ?? undefined, undefined);
  assert.equal(pkg.devDependencies ?? undefined, undefined);
});

test("skills: v0.2.1 skill constraints", async () => {
  const notes = await read("skills/study/note-organizer/SKILL.md");
  assert.match(notes, /Read-only source/);
  assert.match(notes, /Never move, rename, rewrite, or delete/);
  assert.match(notes, /core\.mjs inventory/);

  const planner = await read("skills/study/study-planner/SKILL.md");
  assert.match(planner, /Do not invent courses, deadlines, or hours/);
  assert.match(planner, /No Canvas access/);

  const exam = await read("skills/study/exam-sim/SKILL.md");
  assert.match(exam, /No live timer application/);
  assert.match(exam, /Match the requested question count exactly/);
});
