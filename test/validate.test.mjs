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
  const planPath = path.join(root, "plan.json");
  const checksPath = path.join(root, "checks.json");
  return { root, runDir, planPath, checksPath };
}

async function writePlan(planPath, files) {
  await fs.writeFile(
    planPath,
    JSON.stringify({
      course: { id: "1", name: "Statistics 101" },
      requested: [{ output: "summary", files }],
    }),
    "utf8",
  );
}

async function writeChecks(checksPath, files) {
  const entries = {};
  for (const name of files) {
    entries[name] = { sections: ["cover", "recap"], counts: { pages: 2 } };
  }
  await fs.writeFile(checksPath, JSON.stringify({ files: entries }), "utf8");
}

test("validate: accepts valid requested PDF and DOCX with checks", async () => {
  const { root, runDir, planPath, checksPath } = await setup();
  try {
    await fs.writeFile(path.join(runDir, "summary.pdf"), "%PDF-1.4\n%%EOF\n");
    await fs.writeFile(path.join(runDir, "summary.docx"), Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]));
    await writePlan(planPath, [
      { name: "summary.pdf", format: "pdf" },
      { name: "summary.docx", format: "docx" },
    ]);
    await writeChecks(checksPath, ["summary.pdf", "summary.docx"]);
    const result = await validateRun({ runDir, planPath, checksPath });
    assert.equal(result.ok, true);
    assert.equal(result.produced.length, 2);
    assert.equal(result.missing.length, 0);
    assert.equal(result.invalid.length, 0);
    assert.equal(result.extra.length, 0);
    assert.equal(result.semantic.ok, true);
  } finally {
    await cleanupDir(root);
  }
});

test("validate: reports missing and invalid requested files", async () => {
  const { root, runDir, planPath, checksPath } = await setup();
  try {
    await fs.writeFile(path.join(runDir, "summary.pdf"), "not a pdf");
    await writePlan(planPath, [
      { name: "summary.pdf", format: "pdf" },
      { name: "summary.docx", format: "docx" },
    ]);
    await writeChecks(checksPath, ["summary.pdf", "summary.docx"]);
    const result = await validateRun({ runDir, planPath, checksPath });
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
  const { root, runDir, planPath, checksPath } = await setup();
  try {
    await fs.writeFile(path.join(runDir, "summary.pdf"), "%PDF-1.4\n");
    await fs.writeFile(path.join(runDir, "extra.txt"), "extra");
    await fs.mkdir(path.join(runDir, "nested"));
    await writePlan(planPath, [{ name: "summary.pdf", format: "pdf" }]);
    await writeChecks(checksPath, ["summary.pdf"]);
    const result = await validateRun({ runDir, planPath, checksPath });
    assert.equal(result.ok, false);
    assert.deepEqual(result.extra.sort(), ["extra.txt", "nested"]);
  } finally {
    await cleanupDir(root);
  }
});

test("validate: detects token leakage", async () => {
  const { root, runDir, planPath, checksPath } = await setup();
  await writeTokenFile(HOME, "secret-token");
  try {
    await fs.writeFile(path.join(runDir, "notes.txt"), "the token is secret-token");
    await writePlan(planPath, [{ name: "notes.txt", format: "txt" }]);
    await writeChecks(checksPath, ["notes.txt"]);
    const result = await validateRun({ runDir, planPath, checksPath });
    assert.equal(result.ok, false);
    assert.deepEqual(result.tokenLeak, ["notes.txt"]);
  } finally {
    await cleanupDir(root);
  }
});

test("validate: fails when semantic checks are missing", async () => {
  const { root, runDir, planPath, checksPath } = await setup();
  try {
    await fs.writeFile(path.join(runDir, "summary.pdf"), "%PDF-1.4\n");
    await writePlan(planPath, [{ name: "summary.pdf", format: "pdf" }]);
    await fs.writeFile(checksPath, JSON.stringify({ files: {} }), "utf8");
    const result = await validateRun({ runDir, planPath, checksPath });
    assert.equal(result.ok, false);
    assert.equal(result.semantic.ok, false);
    assert.deepEqual(result.semantic.missing, ["summary.pdf"]);
  } finally {
    await cleanupDir(root);
  }
});

test("validate: rejects requested names with path separators", async () => {
  const { root, runDir, planPath, checksPath } = await setup();
  try {
    await fs.writeFile(path.join(runDir, "summary.pdf"), "%PDF-1.4\n");
    await writePlan(planPath, [{ name: "../summary.pdf", format: "pdf" }]);
    await writeChecks(checksPath, ["../summary.pdf"]);
    await assert.rejects(validateRun({ runDir, planPath, checksPath }), /plain name/);
  } finally {
    await cleanupDir(root);
  }
});
