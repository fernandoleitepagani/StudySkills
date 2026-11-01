import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { REPO_ROOT } from "../test-support/temp.mjs";

const execFileAsync = promisify(execFile);
const SKILLS_ROOT = path.join(REPO_ROOT, "skills/study");
const USER_SKILLS = [
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
  for (const name of USER_SKILLS) {
    const file = path.join(SKILLS_ROOT, name, "SKILL.md");
    const text = await fs.readFile(file, "utf8");
    const meta = frontmatter(text);
    assert.equal(meta.name, name);
    assert.ok(meta.description);
    assert.equal(meta["disable-model-invocation"], "true", `${name} must be user-invoked`);
    const yaml = await fs.readFile(path.join(SKILLS_ROOT, name, "agents/openai.yaml"), "utf8");
    assert.match(yaml, /allow_implicit_invocation:\s*false/, `${name} policy`);
  }
});

test("skills: plugin, collection README, and docs list every skill", async () => {
  const plugin = JSON.parse(await read(".claude-plugin/plugin.json"));
  assert.equal(await exists("skills/study/study-core"), false);
  for (const name of USER_SKILLS) {
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
  assert.equal(plugin.skills.some((entry) => entry.endsWith("/study-core")), false);
});

test("skills: every skill is self-contained", async () => {
  for (const name of USER_SKILLS) {
    assert.equal(await exists(`skills/study/${name}/references/core/workflow.md`), true, name);
    assert.equal(await exists(`skills/study/${name}/scripts/core.mjs`), true, name);
    assert.equal(await exists(`skills/study/${name}/scripts/lib/files.mjs`), true, name);
    assert.equal(await exists(`skills/study/${name}/scripts/lib/validate.mjs`), true, name);
    assert.equal(await exists(`skills/study/${name}/scripts/lib/inventory.mjs`), true, name);
    assert.equal(await exists(`skills/study/${name}/assets/theme.json`), true, name);
    assert.equal(await exists(`skills/study/${name}/scripts/lib/html-to-text.mjs`), name === "study-canvas");
  }
  assert.equal(await exists("skills/study/study-recall/scripts/cards.mjs"), true);
});

test("skills: generated core is in sync", async () => {
  const result = await execFileAsync(
    process.execPath,
    ["scripts/sync-skills.mjs", "--check"],
    { cwd: REPO_ROOT },
  );
  assert.match(result.stdout, /in sync/);
});

test("skills: non-Canvas skills do not import Canvas or token code", async () => {
  for (const name of USER_SKILLS.filter((item) => item !== "study-canvas")) {
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
  const notes = await read("skills/study/study-notes/SKILL.md");
  assert.match(notes, /Read-only source/);
  assert.match(notes, /Never move, rename, rewrite, or delete/);
  assert.match(notes, /core\.mjs inventory/);

  const planner = await read("skills/study/study-planner/SKILL.md");
  assert.match(planner, /Do not invent courses, deadlines, or hours/);
  assert.match(planner, /No Canvas access/);
  assert.match(planner, /Mastery/);
  assert.match(planner, /learning-path/);

  const exam = await read("skills/study/study-exams/SKILL.md");
  assert.match(exam, /No live timer application/);
  assert.match(exam, /Match the requested question count exactly/);
});

test("skills: study-files constraints", async () => {
  const text = await read("skills/study/study-files/SKILL.md");
  assert.match(text, /references\/core\/workflow\.md/);
  assert.match(text, /No Canvas/);
  assert.match(text, /No network/);
  assert.match(text, /Read-only sources/);
  assert.match(text, /inventory --path/);
  assert.match(text, /attachments/);
  assert.match(text, /Exact duplicates/);
  assert.match(text, /Near duplicates/);
  assert.match(text, /Every output cites sources/);
  assert.match(text, /Large sources/);
  assert.match(text, /source hashes/);
  assert.match(text, /Only the requested files/);
});

test("skills: language, accessibility, and privacy contracts", async () => {
  for (const name of USER_SKILLS) {
    const text = await read(`skills/study/${name}/SKILL.md`);
    assert.match(text, /language/i, `${name} must ask for output language`);
  }

  const plan = await read("core/references/plan-contract.md");
  assert.match(plan, /"language"/);

  const workflow = await read("core/references/workflow.md");
  assert.match(workflow, /No telemetry/);
  assert.match(workflow, /over 100 pages/);
  assert.match(workflow, /Cite filenames, not absolute paths/);

  const canvas = await read("skills/study/study-canvas/SKILL.md");
  assert.match(canvas, /exceed the model context/);

  for (const style of ["core/references/style.md", "skills/study/study-canvas/references/core/style.md"]) {
    const text = await read(style);
    assert.match(text, /## Accessibility/);
    assert.match(text, /Use real heading levels/);
    assert.match(text, /Set the document language metadata/);
  }

  const conventions = await read("core/references/output-conventions.md");
  assert.match(conventions, /Cite source filenames, not absolute paths/);

  await assert.rejects(fs.access(path.join(REPO_ROOT, "docs/study/study-files.md")));
});

test("skills: token, fallback, and cleanup contracts", async () => {
  const canvas = await read("skills/study/study-canvas/SKILL.md");
  assert.match(canvas, /token-status --base-url/);
  assert.match(canvas, /full-account-access warning/);
  assert.match(canvas, /cleanup-failed/);
  assert.match(canvas, /Markdown fallback/);
  assert.match(canvas, /Replace token/);
  assert.match(canvas, /Everything within safe limits/);
  assert.match(canvas, /"quality":\s*\{\s*"required": true/);

  const workflow = await read("core/references/workflow.md");
  assert.match(workflow, /fallbacks/);
  assert.match(workflow, /cleanup-failed/);
  assert.match(workflow, /Materials and temporary chunk notes are never kept/);
});

test("repo: AGENTS.md is real and mirrors CLAUDE.md", async () => {
  const stat = await fs.lstat(path.join(REPO_ROOT, "AGENTS.md"));
  assert.equal(stat.isSymbolicLink(), false);
  assert.equal(await read("AGENTS.md"), await read("CLAUDE.md"));
});

test("repo: README uses main installs and no release tags", async () => {
  const text = await read("README.md");
  assert.match(text, /claude plugin marketplace add fernandoleitepagani\/StudySkills/);
  assert.match(text, /codex plugin marketplace add fernandoleitepagani\/StudySkills/);
  assert.match(text, /npx skills@latest add \\\n  fernandoleitepagani\/StudySkills/);
  assert.equal(/#v0\.|StudySkills@v|--ref v/.test(text), false);
});

test("repo: README names only the current release", async () => {
  const pkg = JSON.parse(await read("package.json"));
  const text = await read("README.md");
  assert.match(text, new RegExp("Current release: `v" + pkg.version + "`"));
  assert.equal(/v0\.4\.[0-3]/.test(text), false);
});

test("repo: Canvas security reference uses host-specific tokens and current cleanup", async () => {
  const text = await read("skills/study/study-canvas/references/security.md");
  assert.match(text, /canvas\/<host>\/token\.txt/);
  assert.match(text, /migration fallback/);
  assert.match(text, /Remove the work directory on success or failure/);
  assert.equal(/Keep the work directory on failure/.test(text), false);
});

test("skills: source selection, quality, web, and catalog contracts are generated", async () => {
  for (const name of USER_SKILLS) {
    for (const ref of ["source-selection.md", "quality.md", "web-research.md", "error-messages.md"]) {
      assert.equal(await exists(`skills/study/${name}/references/core/${ref}`), true, `${name} missing ${ref}`);
    }
    assert.equal(await exists(`skills/study/${name}/scripts/lib/catalog.mjs`), true, `${name} missing catalog.mjs`);
  }

  const sourceSelection = await read("core/references/source-selection.md");
  assert.match(sourceSelection, /Everything within safe limits/);
  assert.match(sourceSelection, /Choose specific materials/);
  assert.match(sourceSelection, /Do not truncate silently/);

  const web = await read("core/references/web-research.md");
  assert.match(web, /do-not-send list is a hard rule/);
  assert.match(web, /local filenames, paths, folder names, hashes, or directory listings/);
  assert.match(web, /Canvas URL, Canvas host, course name, institution, or token/);
  assert.match(web, /Never send any of these to a web tool/);

  const quality = await read("core/references/quality.md");
  assert.match(quality, /Two-pass review/);
  assert.match(quality, /visualClarity/);
});

test("repo: every skill has a README and every index links to it", async () => {
  const readmeHeadings = [
    "## What it does",
    "## When to use it",
    "## What you need",
    "## How to use it",
    "## What it produces",
    "## Example",
    "## Safety and limits",
    "## Troubleshooting",
  ];
  const root = await read("README.md");
  const collection = await read("skills/study/README.md");
  const docs = await read("docs/study/README.md");
  for (const name of USER_SKILLS) {
    const text = await read(`skills/study/${name}/README.md`);
    for (const heading of readmeHeadings) {
      assert.match(text, new RegExp(`^${heading}$`, "m"), `${name} missing ${heading}`);
    }
    assert.match(text, new RegExp(`/${name}`));
    assert.match(root, new RegExp(`\\./skills/study/${name}/README\\.md`));
    assert.match(collection, new RegExp(`\\./${name}/README\\.md`));
    assert.match(docs, new RegExp(`\\.\\./\\.\\./skills/study/${name}/README\\.md`));
  }
});

test("skills: run 3 contracts", async () => {
  const revisit = await read("skills/study/study-revisit/SKILL.md");
  assert.match(revisit, /Never edit, move, rename, or delete/);
  assert.match(revisit, /audit and revise/i);
  assert.match(revisit, /unverified/i);
  assert.match(revisit, /Never modify the original run/);

  const language = await read("skills/study/study-language/SKILL.md");
  assert.match(language, /No audio generation/);
  assert.match(language, /pronunciation scoring/);
  assert.match(language, /front,back,tags/);
  assert.match(language, /CEFR/);

  const recall = await read("skills/study/study-recall/SKILL.md");
  assert.match(recall, /Retrieval practice, not an exam/);
  assert.match(recall, /No timer/);
  assert.match(recall, /Every question has an answer and source/);
  assert.match(recall, /catalog --json/);
});

test("skills: run 4 contracts", async () => {
  const math = await read("skills/study/study-math-practice/SKILL.md");
  assert.match(math, /Original problems/);
  assert.match(math, /Every problem has a worked solution/);
  assert.match(math, /No code execution/);

  const debrief = await read("skills/study/study-exams/SKILL.md");
  assert.match(debrief, /Do not fake grading/);
  assert.match(debrief, /No key means no score/);
  assert.match(debrief, /Do not reuse original exam questions/);

  const kata = await read("skills/study/study-code-kata/SKILL.md");
  assert.match(kata, /No dependency installation/);
  assert.match(kata, /No execution required/);
  assert.match(kata, /Each kata has requirements, tests, and a solution/);
});

test("skills: run 5 contracts", async () => {
  const paper = await read("skills/study/paper-reader/SKILL.md");
  assert.match(paper, /Do not invent metadata/);
  assert.match(paper, /Do not invent citations/);
  assert.match(paper, /No paywall bypass/);
  assert.match(paper, /Paper claims and web context|paper claims from outside context|outside context/i);

  const thesis = await read("skills/study/thesis-organizer/SKILL.md");
  assert.match(thesis, /Do not write the final thesis unless explicitly requested/);
  assert.match(thesis, /Separate evidence from interpretation/);
  assert.match(thesis, /Do not fabricate sources/);
  assert.match(thesis, /evidence-matrix\.csv/);
});

test("repo: harness matrix lists every skill", async () => {
  const matrix = await read("docs/study/harness-matrix.md");
  for (const name of USER_SKILLS) {
    assert.ok(matrix.includes(`| ${name} |`), `harness matrix missing ${name}`);
  }
  assert.match(matrix, /Codex \| CLI \| yes/);
  assert.match(matrix, /Codex \| GUI \| yes/);
  assert.match(matrix, /Global capability checks/);
  assert.match(matrix, /Per-skill coverage/);
});

test("skills: manual materials and beginner result contracts", async () => {
  const outputs = await read("skills/study/study-canvas/references/outputs.md");
  assert.match(outputs, /manual-materials\.md/);
  assert.match(outputs, /downloads them through the browser/);
  assert.match(outputs, /\/study-files/);
  assert.match(outputs, /videos, provide a transcript or subtitles/);

  const errors = await read("core/references/error-messages.md");
  assert.match(errors, /Result: success/);
  assert.match(errors, /ALL_SECTIONS_FORBIDDEN/);
  assert.match(errors, /What happened/);
  assert.match(errors, /Next step/);

  const canvas = await read("skills/study/study-canvas/SKILL.md");
  assert.match(canvas, /manual-materials\.md/);
  assert.match(canvas, /downloads them through the browser/);
  assert.match(canvas, /error-messages\.md/);
});

test("repo: harness compatibility and install verification are documented", async () => {
  const compatibility = await read("docs/study/harness-compatibility.md");
  assert.match(compatibility, /OpenCode/);
  assert.match(compatibility, /check-install\.mjs/);
  assert.match(compatibility, /smoke test/i);

  const questions = await read("core/references/harness-questions.md");
  assert.match(questions, /Compatibility rules/);
  assert.match(questions, /actual session/);

  const pkg = JSON.parse(await read("package.json"));
  assert.equal(pkg.scripts["check:install"], "node scripts/check-install.mjs --root skills/study --json");
});

test("skills: merged modes preserve source functionality", async () => {
  const notes = await read("skills/study/study-notes/SKILL.md");
  assert.match(notes, /Lecture notes/);
  assert.match(notes, /Organize notes/);
  assert.match(notes, /notes-index\.md/);
  assert.match(notes, /lecture-notes\.<format>/);

  const recall = await read("skills/study/study-recall/SKILL.md");
  assert.match(recall, /Flashcards/);
  assert.match(recall, /Active recall/);
  assert.match(recall, /cards\.mjs/);
  assert.match(recall, /recall-questions/);

  const exams = await read("skills/study/study-exams/SKILL.md");
  assert.match(exams, /Create a practice exam/);
  assert.match(exams, /Debrief a completed exam/);
  assert.match(exams, /practice-exam\.<format>/);
  assert.match(exams, /exam-debrief\.<format>/);
});

test("skills: four-question limit stays in place", async () => {
  const questions = await read("core/references/harness-questions.md");
  assert.match(questions, /Maximum 4 questions/);
  assert.equal(/6 to 8 questions|6-8 questions/i.test(questions), false);
});
