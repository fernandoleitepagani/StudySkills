import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { REPO_ROOT } from "../test-support/temp.mjs";

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

function stripCode(text) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "");
}

function markdownLinks(text) {
  const links = [];
  const pattern = /(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of text.matchAll(pattern)) links.push(match[1]);
  return links;
}

async function docsFiles() {
  const docsDir = path.join(REPO_ROOT, "docs/study");
  const entries = await fs.readdir(docsDir, { withFileTypes: true });
  const files = [
    "README.md",
    "AGENTS.md",
    "CLAUDE.md",
    ".agents/install-block.md",
    ".agents/invocation.md",
    ".agents/writing-docs.md",
    "skills/study/README.md",
    ...entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => `docs/study/${entry.name}`),
  ];
  for (const name of USER_SKILLS) files.push(`skills/study/${name}/README.md`);
  return files;
}

test("docs: relative Markdown links resolve", async () => {
  for (const relative of await docsFiles()) {
    const file = path.join(REPO_ROOT, relative);
    const text = stripCode(await fs.readFile(file, "utf8"));
    for (const target of markdownLinks(text)) {
      if (/^(https?:|mailto:|tel:|#)/.test(target)) continue;
      const clean = decodeURIComponent(target.split("#")[0]);
      if (!clean) continue;
      const resolved = path.resolve(path.dirname(file), clean);
      try {
        await fs.access(resolved);
      } catch {
        assert.fail(`${relative}: missing link target ${target}`);
      }
    }
  }
});

test("docs: stale release checklist is removed", async () => {
  await assert.rejects(
    fs.access(path.join(SKILLS_ROOT, "..", "..", "checklistv1.md")),
    /ENOENT/,
  );
});

test("docs: repository rules name the special docs", async () => {
  const agents = await fs.readFile(path.join(REPO_ROOT, "AGENTS.md"), "utf8");
  const claude = await fs.readFile(path.join(REPO_ROOT, "CLAUDE.md"), "utf8");
  assert.equal(agents, claude);
  assert.match(agents, /docs\/study\/math\.md/);
  assert.match(agents, /docs\/study\/performance\.md/);
  assert.match(agents, /release-notes-v\*\.md/);

  const writing = await fs.readFile(path.join(REPO_ROOT, ".agents/writing-docs.md"), "utf8");
  assert.match(writing, /docs\/study\/math\.md/);
  assert.match(writing, /docs\/study\/performance\.md/);
  assert.match(writing, /release-notes-v\*\.md/);
});
