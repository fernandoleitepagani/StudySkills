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
  "canvas-study",
  "lecture-notes",
  "flashcard-forge",
  "explain-back",
  "exam-sim",
  "study-planner",
  "note-organizer",
  "file-study",
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
    assert.equal(await exists(`skills/study/${name}/scripts/lib/html-to-text.mjs`), name === "canvas-study");
  }
  assert.equal(await exists("skills/study/flashcard-forge/scripts/cards.mjs"), true);
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
  for (const name of USER_SKILLS.filter((item) => item !== "canvas-study")) {
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

test("skills: file-study constraints", async () => {
  const text = await read("skills/study/file-study/SKILL.md");
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

  const canvas = await read("skills/study/canvas-study/SKILL.md");
  assert.match(canvas, /exceed the model context/);

  for (const style of ["core/references/style.md", "skills/study/canvas-study/references/core/style.md"]) {
    const text = await read(style);
    assert.match(text, /## Accessibility/);
    assert.match(text, /Use real heading levels/);
    assert.match(text, /Set the document language metadata/);
  }

  const conventions = await read("core/references/output-conventions.md");
  assert.match(conventions, /Cite source filenames, not absolute paths/);

  await assert.rejects(fs.access(path.join(REPO_ROOT, "docs/study/file-study.md")));
});

test("skills: token, fallback, and cleanup contracts", async () => {
  const canvas = await read("skills/study/canvas-study/SKILL.md");
  assert.match(canvas, /token-status --base-url/);
  assert.match(canvas, /full-account-access warning/);
  assert.match(canvas, /cleanup-failed/);
  assert.match(canvas, /Markdown fallback/);

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
  const text = await read("skills/study/canvas-study/references/security.md");
  assert.match(text, /canvas\/<host>\/token\.txt/);
  assert.match(text, /migration fallback/);
  assert.match(text, /Remove the work directory on success or failure/);
  assert.equal(/Keep the work directory on failure/.test(text), false);
});

test("skills: source selection, quality, web, and catalog contracts are generated", async () => {
  for (const name of USER_SKILLS) {
    for (const ref of ["source-selection.md", "quality.md", "web-research.md"]) {
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
