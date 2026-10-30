import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { makeTempDir, cleanupDir, writeTokenFile } from "../test-support/temp.mjs";

const HOME = await makeTempDir("studyskills-validate-home-");
process.env.HOME = HOME;
const { validateRun } = await import("../skills/study/canvas-study/scripts/lib/validate.mjs");

test.after(async () => {
  await cleanupDir(HOME);
});

async function setup() {
  const root = await makeTempDir("studyskills-validate-");
  const runDir = path.join(root, "run");
  await fs.mkdir(runDir, { recursive: true });
  const expectedPath = path.join(root, "expected.json");
  return { root, runDir, expectedPath };
}

async function writeExpected(expectedPath, files) {
  await fs.writeFile(expectedPath, JSON.stringify({ files }), "utf8");
}

test("validate: accepts valid PDF and DOCX", async () => {
  const { root, runDir, expectedPath } = await setup();
  try {
    await fs.writeFile(path.join(runDir, "summary.pdf"), "%PDF-1.4\n%%EOF\n");
    await fs.writeFile(path.join(runDir, "summary.docx"), Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]));
    await writeExpected(expectedPath, [
      { name: "summary.pdf", format: "pdf" },
      { name: "summary.docx", format: "docx" },
    ]);
    const result = await validateRun({ runDir, expectedPath });
    assert.equal(result.ok, true);
    assert.equal(result.produced.length, 2);
    assert.equal(result.missing.length, 0);
    assert.equal(result.invalid.length, 0);
    assert.equal(result.extra.length, 0);
  } finally {
    await cleanupDir(root);
  }
});

test("validate: reports missing and invalid files", async () => {
  const { root, runDir, expectedPath } = await setup();
  try {
    await fs.writeFile(path.join(runDir, "summary.pdf"), "not a pdf");
    await writeExpected(expectedPath, [
      { name: "summary.pdf", format: "pdf" },
      { name: "summary.docx", format: "docx" },
    ]);
    const result = await validateRun({ runDir, expectedPath });
    assert.equal(result.ok, false);
    assert.equal(result.missing.length, 1);
    assert.equal(result.missing[0].name, "summary.docx");
    assert.equal(result.invalid.length, 1);
    assert.equal(result.invalid[0].name, "summary.pdf");
  } finally {
    await cleanupDir(root);
  }
});

test("validate: reports extra files and directories", async () => {
  const { root, runDir, expectedPath } = await setup();
  try {
    await fs.writeFile(path.join(runDir, "summary.pdf"), "%PDF-1.4\n");
    await fs.writeFile(path.join(runDir, "extra.txt"), "extra");
    await fs.mkdir(path.join(runDir, "nested"));
    await writeExpected(expectedPath, [{ name: "summary.pdf", format: "pdf" }]);
    const result = await validateRun({ runDir, expectedPath });
    assert.equal(result.ok, false);
    assert.deepEqual(result.extra.sort(), ["extra.txt", "nested"]);
  } finally {
    await cleanupDir(root);
  }
});

test("validate: detects token leakage", async () => {
  const { root, runDir, expectedPath } = await setup();
  await writeTokenFile(HOME, "secret-token");
  try {
    await fs.writeFile(path.join(runDir, "notes.txt"), "the token is secret-token");
    await writeExpected(expectedPath, [{ name: "notes.txt", format: "txt" }]);
    const result = await validateRun({ runDir, expectedPath });
    assert.equal(result.ok, false);
    assert.deepEqual(result.tokenLeak, ["notes.txt"]);
  } finally {
    await cleanupDir(root);
  }
});

test("validate: rejects expected names with path separators", async () => {
  const { root, runDir, expectedPath } = await setup();
  try {
    await fs.writeFile(path.join(runDir, "summary.pdf"), "%PDF-1.4\n");
    await writeExpected(expectedPath, [{ name: "../summary.pdf", format: "pdf" }]);
    await assert.rejects(validateRun({ runDir, expectedPath }), /plain name/);
  } finally {
    await cleanupDir(root);
  }
});
