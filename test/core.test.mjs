import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { runCore, makeTempDir, cleanupDir } from "../test-support/temp.mjs";

async function json(result) {
  for (const text of [result.stdout, result.stderr]) {
    try {
      return JSON.parse(text);
    } catch {
      // Try the next stream.
    }
  }
  throw new Error(`Expected JSON output. stdout=${result.stdout} stderr=${result.stderr}`);
}

test("core: doctor, workdir, output-dir, cleanup", async () => {
  const home = await makeTempDir("studyskills-core-home-");
  const docs = path.join(home, "Docs");
  const env = { XDG_DOCUMENTS_DIR: docs };
  try {
    let result = await runCore(["doctor", "--json"], { home, env });
    assert.equal(result.code, 0);
    let data = await json(result);
    assert.equal(data.ok, true);
    assert.equal(data.documentsDir, docs);

    result = await runCore(["workdir", "--topic", "Statistics 101", "--json"], { home, env });
    assert.equal(result.code, 0);
    data = await json(result);
    const workDir = data.workDir;
    assert.ok(workDir.startsWith(path.join(home, ".studyskills", "work")));

    result = await runCore(["output-dir", "--topic", "Statistics 101", "--json"], { home, env });
    assert.equal(result.code, 0);
    data = await json(result);
    assert.ok(data.runDir.startsWith(path.join(docs, "StudySkills", "statistics-101")));

    const emptyDir = data.runDir;
    result = await runCore(["cleanup-output", "--dir", emptyDir, "--json"], { home, env });
    assert.equal(result.code, 0);
    data = await json(result);
    assert.equal(data.removed, true);
    await assert.rejects(fs.access(emptyDir));

    result = await runCore(["cleanup", "--work-dir", workDir, "--json"], { home, env });
    assert.equal(result.code, 0);
    data = await json(result);
    assert.equal(data.removed, workDir);
    await assert.rejects(fs.access(workDir));
  } finally {
    await cleanupDir(home);
  }
});

test("core: validate uses plan and checks", async () => {
  const home = await makeTempDir("studyskills-core-home-");
  try {
    const root = await makeTempDir("studyskills-core-run-");
    const run = path.join(root, "run");
    await fs.mkdir(run, { recursive: true });
    try {
      await fs.writeFile(path.join(run, "summary.pdf"), "%PDF-1.4\n%%EOF\n");
      const plan = path.join(root, "plan.json");
      const checks = path.join(root, "checks.json");
      await fs.writeFile(
        plan,
        JSON.stringify({
          topic: "Statistics",
          requested: [{ output: "summary", files: ["summary.pdf"], formats: ["pdf"] }],
        }),
      );
      await fs.writeFile(checks, JSON.stringify({ files: { "summary.pdf": { sections: ["cover"], counts: { pages: 1 } } } }));
      let result = await runCore(
        ["validate", "--run-dir", run, "--plan", plan, "--checks", checks, "--json"],
        { home },
      );
      assert.equal(result.code, 0);
      let data = await json(result);
      assert.equal(data.ok, true);

      const partial = path.join(root, "plan-partial.json");
      await fs.writeFile(
        partial,
        JSON.stringify({
          topic: "Statistics",
          requested: [{ output: "summary", files: ["summary.pdf", "summary.docx"], formats: ["pdf", "docx"] }],
        }),
      );
      result = await runCore(
        ["validate", "--run-dir", run, "--plan", partial, "--checks", checks, "--json"],
        { home },
      );
      assert.equal(result.code, 1);
      data = await json(result);
      assert.equal(data.missing[0].name, "summary.docx");
    } finally {
      await cleanupDir(root);
    }
  } finally {
    await cleanupDir(home);
  }
});

test("core: inventory scans files, folders, Markdown metadata, and packs", async () => {
  const home = await makeTempDir("studyskills-core-home-");
  try {
    const root = path.join(home, "notes");
    await fs.mkdir(path.join(root, "nested"), { recursive: true });
    await fs.writeFile(
      path.join(root, "intro.md"),
      "---\ntags: [statistics, intro]\n---\n# Introduction\n\nSee [[Week 1]].\n",
    );
    await fs.writeFile(path.join(root, "nested", "notes.md"), "# Nested\n");
    await fs.writeFile(path.join(root, ".hidden.md"), "# Hidden\n");
    await fs.writeFile(path.join(root, "legacy.doc"), Buffer.from("legacy"));
    await fs.writeFile(path.join(root, "skip.bin"), Buffer.from([0, 1, 2]));

    let result = await runCore(["inventory", "--path", root, "--json"], { home });
    assert.equal(result.code, 0);
    let data = await json(result);
    assert.equal(data.totalFiles, 3);
    assert.equal(data.files.some((item) => item.name === "legacy.doc"), true);
    assert.equal(data.skipped.some((item) => item.path.endsWith("skip.bin")), true);
    const intro = data.files.find((item) => item.name === "intro.md");
    assert.equal(intro.markdown.title, "Introduction");
    assert.deepEqual(intro.markdown.tags, ["statistics", "intro"]);
    assert.deepEqual(intro.markdown.wikiLinks, ["Week 1"]);
    assert.equal(typeof intro.sha256, "string");

    const pack = path.join(home, "pack");
    await fs.mkdir(path.join(pack, "sources", "files"), { recursive: true });
    await fs.writeFile(path.join(pack, "sources", "materials.md"), "# Materials\n");
    await fs.writeFile(path.join(pack, "sources", "files", "lecture.pdf"), "%PDF-1.4\n");
    result = await runCore(["inventory", "--pack", pack, "--json"], { home });
    assert.equal(result.code, 0);
    data = await json(result);
    assert.equal(data.totalFiles, 2);
    assert.equal(data.files.some((item) => item.name === "materials.md"), true);
    assert.equal(data.files.some((item) => item.name === "lecture.pdf"), true);
  } finally {
    await cleanupDir(home);
  }
});
