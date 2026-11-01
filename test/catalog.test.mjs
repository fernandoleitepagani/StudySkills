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

test("catalog: lists topics, runs, files, and sizes without reading content", async () => {
  const home = await makeTempDir("studyskills-catalog-home-");
  const docs = path.join(home, "Docs");
  const base = path.join(docs, "StudySkills");
  const topic = path.join(base, "statistics");
  const run = path.join(topic, "2026-10-31-1200");
  try {
    await fs.mkdir(path.join(run, "nested"), { recursive: true });
    await fs.writeFile(path.join(run, "summary.md"), "# Summary\n", "utf8");
    await fs.writeFile(path.join(run, "summary.pdf"), "%PDF-1.4\n", "utf8");
    await fs.writeFile(path.join(run, "nested", "hidden.md"), "PRIVATE-CONTENT", "utf8");

    const result = await runCore(["catalog", "--json"], { home, env: { XDG_DOCUMENTS_DIR: docs } });
    assert.equal(result.code, 0);
    const data = await json(result);
    assert.equal(data.ok, true);
    assert.equal(data.root, base);
    assert.equal(data.totals.topics, 1);
    assert.equal(data.totals.runs, 1);
    assert.equal(data.totals.files, 2);
    assert.equal(data.topics[0].name, "statistics");
    assert.equal(data.topics[0].runs[0].name, "2026-10-31-1200");
    assert.deepEqual(data.topics[0].runs[0].files.map((file) => file.name), ["summary.md", "summary.pdf"]);
    assert.equal(result.stdout.includes("PRIVATE-CONTENT"), false);
  } finally {
    await cleanupDir(home);
  }
});

test("catalog: accepts a topic root and rejects paths outside the output root", async () => {
  const home = await makeTempDir("studyskills-catalog-home-");
  const docs = path.join(home, "Docs");
  const base = path.join(docs, "StudySkills");
  const topic = path.join(base, "statistics");
  const run = path.join(topic, "run-1");
  try {
    await fs.mkdir(run, { recursive: true });
    await fs.writeFile(path.join(run, "summary.md"), "# Summary\n", "utf8");

    let result = await runCore(
      ["catalog", "--root", topic, "--json"],
      { home, env: { XDG_DOCUMENTS_DIR: docs } },
    );
    assert.equal(result.code, 0);
    let data = await json(result);
    assert.equal(data.topics.length, 1);
    assert.equal(data.topics[0].name, "statistics");

    result = await runCore(
      ["catalog", "--root", home, "--json"],
      { home, env: { XDG_DOCUMENTS_DIR: docs } },
    );
    assert.notEqual(result.code, 0);
    data = await json(result);
    assert.equal(data.code, "OUTSIDE_OUTPUT_ROOT");
  } finally {
    await cleanupDir(home);
  }
});

test("catalog: missing output root is empty and symlinks are ignored", async () => {
  const home = await makeTempDir("studyskills-catalog-home-");
  const docs = path.join(home, "Docs");
  const base = path.join(docs, "StudySkills");
  try {
    let result = await runCore(["catalog", "--json"], { home, env: { XDG_DOCUMENTS_DIR: docs } });
    assert.equal(result.code, 0);
    let data = await json(result);
    assert.deepEqual(data.topics, []);
    assert.equal(data.totals.files, 0);

    const run = path.join(base, "topic", "run");
    await fs.mkdir(run, { recursive: true });
    await fs.writeFile(path.join(run, "real.md"), "# Real\n", "utf8");
    try {
      await fs.symlink(path.join(run, "real.md"), path.join(run, "linked.md"));
    } catch {
      // Symlinks may be unavailable on some platforms.
      return;
    }
    result = await runCore(["catalog", "--json"], { home, env: { XDG_DOCUMENTS_DIR: docs } });
    assert.equal(result.code, 0);
    data = await json(result);
    assert.deepEqual(data.topics[0].runs[0].files.map((file) => file.name), ["real.md"]);
  } finally {
    await cleanupDir(home);
  }
});

test("catalog: rejects a root symlink that escapes the StudySkills directory", async () => {
  const home = await makeTempDir("studyskills-catalog-home-");
  const docs = path.join(home, "Docs");
  const base = path.join(docs, "StudySkills");
  const outside = path.join(home, "outside");
  try {
    await fs.mkdir(base, { recursive: true });
    await fs.mkdir(outside, { recursive: true });
    try {
      await fs.symlink(outside, path.join(base, "escape"));
    } catch {
      return;
    }
    const result = await runCore(
      ["catalog", "--root", path.join(base, "escape"), "--json"],
      { home, env: { XDG_DOCUMENTS_DIR: docs } },
    );
    assert.notEqual(result.code, 0);
    const data = await json(result);
    assert.equal(data.code, "OUTSIDE_OUTPUT_ROOT");
  } finally {
    await cleanupDir(home);
  }
});
