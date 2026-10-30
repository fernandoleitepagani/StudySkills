import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { startMockCanvas } from "../test-support/mock-canvas.mjs";
import {
  makeTempDir,
  cleanupDir,
  runCli,
  writeTokenFile,
} from "../test-support/temp.mjs";

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

test("cli: token, courses, inspect, fetch, output, validate, cleanup", async () => {
  const home = await makeTempDir("studyskills-cli-home-");
  const docs = path.join(home, "Documents");
  const env = { XDG_DOCUMENTS_DIR: docs };
  const mock = await startMockCanvas();
  try {
    let result = await runCli(["token-status", "--json"], { home, env });
    assert.equal(result.code, 0);
    let data = await json(result);
    assert.equal(data.found, false);

    result = await runCli(["courses", "--base-url", mock.origin, "--json"], { home, env });
    assert.notEqual(result.code, 0);
    data = await json(result);
    assert.equal(data.code, "NO_TOKEN");

    result = await runCli(["token-guide", "--json"], { home, env });
    assert.equal(result.code, 0);
    data = await json(result);
    assert.equal(data.created, true);
    await fs.access(path.join(home, ".studyskills", "canvas-token.txt"));

    await writeTokenFile(home, "test-token");
    result = await runCli(["doctor", "--json"], { home, env });
    assert.equal(result.code, 0);
    data = await json(result);
    assert.equal(data.token.found, true);

    result = await runCli(["courses", "--base-url", mock.origin, "--json"], { home, env });
    assert.equal(result.code, 0);
    data = await json(result);
    assert.equal(data.courses.length, 1);
    assert.equal(data.courses[0].id, "1");
    assert.equal(data.courses[0].name, "Statistics 101");
    assert.equal(data.user.name, "Test Student");

    result = await runCli(
      ["inspect", "--base-url", mock.origin, "--course-id", "1", "--json"],
      { home, env },
    );
    assert.equal(result.code, 0);
    data = await json(result);
    assert.equal(data.counts.modules, 1);
    assert.equal(data.counts.pages, 1);
    assert.equal(data.counts.assignments, 1);
    assert.equal(data.counts.files, 4);
    assert.equal(data.counts.allowedFiles, 2);
    assert.equal(data.errors.length, 0);

    const workResult = await runCli(["workdir", "--course-name", "Statistics 101", "--json"], { home, env });
    assert.equal(workResult.code, 0);
    const workData = await json(workResult);
    const work = workData.workDir;
    assert.ok(work.startsWith(path.join(home, ".studyskills", "work")));
    try {
      result = await runCli(
        [
          "fetch",
          "--base-url", mock.origin,
          "--course-id", "1",
          "--out", work,
          "--json",
        ],
        { home, env },
      );
      assert.equal(result.code, 0);
      data = await json(result);
      assert.equal(data.downloadedFiles, 2);
      assert.equal(data.skipped.length, 2);
      const materials = await fs.readFile(path.join(work, "sources", "materials.md"), "utf8");
      assert.match(materials, /Statistics 101/);
      assert.match(materials, /Mean/);
      assert.match(materials, /Problem Set 1/);
      assert.match(materials, /Exam date/);
      assert.match(materials, /Optional reading/);
      assert.equal(materials.includes("test-token"), false);
      assert.ok(mock.state.requests.every((request) => request.method === "GET"));
      const manifest = JSON.parse(
        await fs.readFile(path.join(work, "sources", "manifest.json"), "utf8"),
      );
      assert.equal(manifest.files.length, 2);
      assert.equal(manifest.skipped.length, 2);
      await fs.access(path.join(work, "sources", "files", "lecture.pdf"));
      await fs.access(path.join(work, "sources", "files", "slides.pptx"));
      await assert.rejects(fs.access(path.join(work, "sources", "files", "huge.pdf")));
      await assert.rejects(fs.access(path.join(work, "sources", "files", "lecture.mp4")));

      result = await runCli(["output-dir", "--course-name", "Statistics 101", "--json"], { home, env });
      assert.equal(result.code, 0);
      data = await json(result);
      const outputDir = data.runDir;
      assert.ok(outputDir.startsWith(path.join(docs, "StudySkills", "statistics-101")));

      await fs.writeFile(path.join(outputDir, "summary.pdf"), "%PDF-1.4\n%%EOF\n");
      const expectedPath = path.join(work, "outputs.json");
      await fs.writeFile(
        expectedPath,
        JSON.stringify({ files: [{ name: "summary.pdf", format: "pdf" }] }),
        "utf8",
      );
      result = await runCli(
        ["validate", "--run-dir", outputDir, "--expected", expectedPath, "--json"],
        { home, env },
      );
      assert.equal(result.code, 0);
      data = await json(result);
      assert.equal(data.ok, true);

      const partialExpected = path.join(work, "outputs-partial.json");
      await fs.writeFile(
        partialExpected,
        JSON.stringify({
          files: [
            { name: "summary.pdf", format: "pdf" },
            { name: "summary.docx", format: "docx" },
          ],
        }),
        "utf8",
      );
      result = await runCli(
        ["validate", "--run-dir", outputDir, "--expected", partialExpected, "--json"],
        { home, env },
      );
      assert.equal(result.code, 1);
      data = await json(result);
      assert.equal(data.ok, false);
      assert.equal(data.missing[0].name, "summary.docx");

      result = await runCli(["cleanup", "--work-dir", work, "--json"], { home, env });
      assert.equal(result.code, 0);
      await assert.rejects(fs.access(work));
    } finally {
      await cleanupDir(work);
    }
  } finally {
    await mock.close();
    await cleanupDir(home);
  }
});
