import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import {
  cleanupEmptyOutputDir,
  cleanupWorkDir,
  formatBytes,
  makeDocumentsRunDir,
  makeWorkDir,
  resolveDocumentsDir,
  sanitizeFilename,
  uniquePath,
} from "../skills/study/canvas-study/scripts/lib/files.mjs";
import { makeTempDir, cleanupDir } from "../test-support/temp.mjs";

test("files: sanitizes traversal and reserved names", () => {
  const traversal = sanitizeFilename("../../evil?.pdf");
  assert.equal(traversal.includes("/"), false);
  assert.equal(traversal.includes("\\"), false);
  assert.equal(traversal.includes("?"), false);

  const reserved = sanitizeFilename("con.txt");
  assert.equal(reserved, "con-file.txt");

  const long = sanitizeFilename("a".repeat(300) + ".pdf");
  assert.ok(long.length <= 140);
  assert.ok(long.endsWith(".pdf"));
});

test("files: creates unique paths", async () => {
  const dir = await makeTempDir();
  try {
    await fs.writeFile(path.join(dir, "file.pdf"), "a");
    const second = await uniquePath(dir, "file.pdf");
    assert.equal(path.basename(second), "file (2).pdf");
  } finally {
    await cleanupDir(dir);
  }
});

test("files: resolves XDG Documents and creates reusable run directories", async () => {
  const home = await makeTempDir();
  const documents = path.join(home, "Docs");
  const oldHome = process.env.HOME;
  const oldXdg = process.env.XDG_DOCUMENTS_DIR;
  process.env.HOME = home;
  process.env.XDG_DOCUMENTS_DIR = documents;
  try {
    assert.equal(await resolveDocumentsDir(), documents);
    const first = await makeDocumentsRunDir("Statistics 101");
    const second = await makeDocumentsRunDir("Statistics 101");
    assert.equal(first.courseDir, second.courseDir);
    assert.equal(path.dirname(first.runDir), first.courseDir);
    assert.equal(path.basename(first.courseDir), "statistics-101");
    assert.notEqual(first.runDir, second.runDir);
  } finally {
    process.env.HOME = oldHome;
    process.env.XDG_DOCUMENTS_DIR = oldXdg;
    await cleanupDir(home);
  }
});

test("files: creates and cleans a work directory under home", async () => {
  const home = await makeTempDir();
  const oldHome = process.env.HOME;
  process.env.HOME = home;
  try {
    const { workDir, workRoot } = await makeWorkDir("Statistics 101");
    assert.ok(workDir.startsWith(workRoot));
    assert.equal(path.basename(workDir).includes("statistics-101"), true);
    await cleanupWorkDir(workDir);
    await assert.rejects(fs.access(workDir));
  } finally {
    process.env.HOME = oldHome;
    await cleanupDir(home);
  }
});

test("files: refuses to clean outside the work root", async () => {
  const home = await makeTempDir();
  const oldHome = process.env.HOME;
  process.env.HOME = home;
  try {
    await assert.rejects(cleanupWorkDir(path.join(home, "not-work")));
  } finally {
    process.env.HOME = oldHome;
    await cleanupDir(home);
  }
});

test("files: removes only an empty output directory", async () => {
  const home = await makeTempDir();
  const documents = path.join(home, "Docs");
  const oldHome = process.env.HOME;
  const oldXdg = process.env.XDG_DOCUMENTS_DIR;
  process.env.HOME = home;
  process.env.XDG_DOCUMENTS_DIR = documents;
  try {
    const { runDir } = await makeDocumentsRunDir("Statistics 101");
    assert.equal(await cleanupEmptyOutputDir(runDir), true);
    await assert.rejects(fs.access(runDir));

    const second = await makeDocumentsRunDir("Statistics 101");
    await fs.writeFile(path.join(second.runDir, "summary.pdf"), "%PDF-1.4\n");
    assert.equal(await cleanupEmptyOutputDir(second.runDir), false);
    await fs.access(second.runDir);

    await assert.rejects(cleanupEmptyOutputDir(path.join(home, "outside")));
  } finally {
    process.env.HOME = oldHome;
    process.env.XDG_DOCUMENTS_DIR = oldXdg;
    await cleanupDir(home);
  }
});

test("files: formats byte counts", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(1024), "1.0 KB");
  assert.equal(formatBytes(1024 * 1024), "1.0 MB");
});
