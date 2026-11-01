import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { startMockCanvas } from "../test-support/mock-canvas.mjs";
import {
  makeTempDir,
  cleanupDir,
  runCli,
  runCore,
  writeHostToken,
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
  mock.fixture.assignments[0].description += '<p><a href="https://drive.google.com/file/d/drive-slides/view">Drive slides</a></p>';
  try {
    let result = await runCli(["token-status", "--base-url", mock.origin, "--json"], { home, env });
    assert.equal(result.code, 0);
    let data = await json(result);
    assert.equal(data.found, false);

    result = await runCli(["courses", "--base-url", mock.origin, "--json"], { home, env });
    assert.notEqual(result.code, 0);
    data = await json(result);
    assert.equal(data.code, "NO_TOKEN");

    result = await runCli(["token-guide", "--base-url", mock.origin, "--json"], { home, env });
    assert.equal(result.code, 0);
    data = await json(result);
    assert.equal(data.created, true);
    await fs.access(path.join(home, ".studyskills", "canvas", new URL(mock.origin).host.replace(/[^a-z0-9.-]/g, "_"), "token.txt"));

    await writeHostToken(home, mock.origin, "test-token");
    result = await runCore(["doctor", "--json"], { home, env });
    assert.equal(result.code, 0);
    data = await json(result);
    assert.equal(data.documentsDir, docs);

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
    assert.equal(data.counts.pages, 2);
    assert.equal(data.counts.assignments, 1);
    assert.equal(data.counts.files, 4);
    assert.equal(data.counts.allowedFiles, 2);
    assert.equal(data.errors.length, 0);
    assert.equal(data.links.some((link) => link.url === "https://example.com/reading"), true);
    assert.equal(data.links.some((link) => link.url.includes("drive.google.com")), true);

    const workResult = await runCore(["workdir", "--topic", "Statistics 101", "--json"], { home, env });
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
      assert.match(materials, /mean = sum\(x\) \/ n/);
      assert.match(materials, /Week one content/);
      assert.match(materials, /\| Term \| Meaning \|/);
      assert.match(materials, /Distribution diagram/);
      assert.match(materials, /external\.example/);
      assert.equal(materials.includes("test-token"), false);
      assert.ok(mock.state.requests.every((request) => request.method === "GET"));
      assert.equal(data.downloadedImages, 1);
      const manifest = JSON.parse(
        await fs.readFile(path.join(work, "sources", "manifest.json"), "utf8"),
      );
      assert.equal(manifest.files.length, 2);
      assert.equal(manifest.skipped.files.length, 2);
      assert.equal(manifest.images.length, 1);
      assert.equal(manifest.externalImages.length, 1);
      assert.equal(manifest.externalMaterials.length, 1);
      assert.equal(data.links.some((link) => link.url.includes("drive.google.com")), true);
      const linksCsv = await fs.readFile(path.join(work, "sources", "links.csv"), "utf8");
      assert.match(linksCsv, /^module,item,title,type,url,status,reason,action/m);
      assert.match(linksCsv, /drive\.google\.com/);
      await fs.access(path.join(work, "sources", "files", "lecture.pdf"));
      await fs.access(path.join(work, "sources", "files", "slides.pptx"));
      await fs.access(path.join(work, "sources", "images", "diagram.png"));
      await assert.rejects(fs.access(path.join(work, "sources", "files", "huge.pdf")));
      await assert.rejects(fs.access(path.join(work, "sources", "files", "lecture.mp4")));

      result = await runCore(["output-dir", "--topic", "Statistics 101", "--json"], { home, env });
      assert.equal(result.code, 0);
      data = await json(result);
      let outputDir = data.runDir;
      assert.ok(outputDir.startsWith(path.join(docs, "StudySkills", "statistics-101")));

      result = await runCore(["cleanup-output", "--dir", outputDir, "--json"], { home, env });
      assert.equal(result.code, 0);
      data = await json(result);
      assert.equal(data.removed, true);
      await assert.rejects(fs.access(outputDir));

      result = await runCore(["output-dir", "--topic", "Statistics 101", "--json"], { home, env });
      assert.equal(result.code, 0);
      data = await json(result);
      outputDir = data.runDir;

      await fs.writeFile(path.join(outputDir, "summary.pdf"), "%PDF-1.4\n%%EOF\n");
      const planPath = path.join(work, "plan.json");
      const checksPath = path.join(work, "checks.json");
      await fs.writeFile(
        planPath,
        JSON.stringify({
          course: { id: "1", name: "Statistics 101" },
          requested: [
            { output: "summary", formats: ["pdf"], files: ["summary.pdf"] },
          ],
        }),
        "utf8",
      );
      await fs.writeFile(
        checksPath,
        JSON.stringify({
          files: {
            "summary.pdf": { sections: ["cover", "recap"], counts: { pages: 1 } },
          },
        }),
        "utf8",
      );
      result = await runCore(
        ["validate", "--run-dir", outputDir, "--plan", planPath, "--checks", checksPath, "--json"],
        { home, env },
      );
      assert.equal(result.code, 0);
      data = await json(result);
      assert.equal(data.ok, true);

      const partialPlan = path.join(work, "plan-partial.json");
      await fs.writeFile(
        partialPlan,
        JSON.stringify({
          course: { id: "1", name: "Statistics 101" },
          requested: [
            { output: "summary", formats: ["pdf", "docx"], files: ["summary.pdf", "summary.docx"] },
          ],
        }),
        "utf8",
      );
      result = await runCore(
        ["validate", "--run-dir", outputDir, "--plan", partialPlan, "--checks", checksPath, "--json"],
        { home, env },
      );
      assert.equal(result.code, 1);
      data = await json(result);
      assert.equal(data.ok, false);
      assert.equal(data.missing[0].name, "summary.docx");

      result = await runCore(["cleanup", "--work-dir", work, "--json"], { home, env });
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

test("cli: rejected token includes the expiry hint", async () => {
  const home = await makeTempDir("studyskills-cli-home-");
  const mock = await startMockCanvas({ token: "right-token" });
  try {
    await writeHostToken(home, mock.origin, "wrong-token");
    const result = await runCli(["courses", "--base-url", mock.origin, "--json"], { home });
    assert.notEqual(result.code, 0);
    const data = await json(result);
    assert.equal(data.code, "UNAUTHORIZED");
    assert.match(data.message, /30 days/);
    assert.match(data.hint, /expired|expiry/i);
  } finally {
    await mock.close();
    await cleanupDir(home);
  }
});

test("cli: inspect exposes choices and fetch honors a specific selection", async () => {
  const home = await makeTempDir("studyskills-cli-home-");
  const env = { XDG_DOCUMENTS_DIR: path.join(home, "Documents") };
  const mock = await startMockCanvas();
  try {
    await writeHostToken(home, mock.origin, "test-token");
    let result = await runCli(
      ["inspect", "--base-url", mock.origin, "--course-id", "1", "--json"],
      { home, env },
    );
    assert.equal(result.code, 0);
    let data = await json(result);
    assert.equal(data.choices.modules[0].name, "Week 1");
    assert.equal(data.choices.pages[0].title, "Introduction");
    assert.equal(data.choices.files[0].name, "lecture.pdf");

    result = await runCore(["workdir", "--topic", "Statistics 101", "--json"], { home, env });
    const work = (await json(result)).workDir;
    try {
      const selectionPath = path.join(work, "selection.json");
      await fs.writeFile(
        selectionPath,
        JSON.stringify({
          mode: "specific",
          pages: ["Introduction"],
          files: ["lecture.pdf"],
          includeSyllabus: false,
          includeFrontPage: false,
        }),
      );
      result = await runCli(
        [
          "fetch",
          "--base-url", mock.origin,
          "--course-id", "1",
          "--out", work,
          "--selection", selectionPath,
          "--json",
        ],
        { home, env },
      );
      assert.equal(result.code, 0);
      data = await json(result);
      assert.equal(data.downloadedFiles, 1);
      assert.equal(data.selection.mode, "specific");
      const materials = await fs.readFile(path.join(work, "sources", "materials.md"), "utf8");
      assert.match(materials, /Introduction/);
      assert.match(materials, /Statistics studies/);
      assert.equal(materials.includes("Problem Set 1"), false);
      assert.equal(materials.includes("Week one content"), false);
      assert.equal(materials.includes("Exam date"), false);
    } finally {
      await cleanupDir(work);
    }
  } finally {
    await mock.close();
    await cleanupDir(home);
  }
});

test("cli: forbidden Files and Pages are partial, not fatal", async () => {
  const home = await makeTempDir("studyskills-cli-home-");
  const env = { XDG_DOCUMENTS_DIR: path.join(home, "Documents") };
  const mock = await startMockCanvas();
  try {
    await writeHostToken(home, mock.origin, "test-token");
    mock.state.forbiddenSections.add("files");
    mock.state.forbiddenSections.add("pages");

    let result = await runCli(
      ["inspect", "--base-url", mock.origin, "--course-id", "1", "--json"],
      { home, env },
    );
    assert.equal(result.code, 0);
    let data = await json(result);
    assert.equal(data.ok, true);
    assert.equal(data.partial, true);
    assert.equal(data.allForbidden, false);
    assert.deepEqual(data.forbiddenSections, ["pages", "files"]);
    assert.equal(data.sections.pages.status, 403);
    assert.equal(data.sections.files.status, 403);
    assert.equal(data.availableSections.includes("assignments"), true);
    assert.ok(data.usableSources > 0);

    result = await runCore(["workdir", "--topic", "Statistics 101", "--json"], { home, env });
    const work = (await json(result)).workDir;
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
      assert.equal(data.partial, true);
      assert.equal(data.allForbidden, false);
      assert.deepEqual(data.forbiddenSections, ["pages", "files"]);
      assert.equal(data.downloadedFiles, 0);
      const materials = await fs.readFile(path.join(work, "sources", "materials.md"), "utf8");
      assert.match(materials, /Problem Set 1/);
      assert.match(materials, /Exam date/);
      assert.equal(materials.includes("Week one content"), false);
    } finally {
      await cleanupDir(work);
    }
  } finally {
    await mock.close();
    await cleanupDir(home);
  }
});

test("cli: all core sections forbidden stops the fetch", async () => {
  const home = await makeTempDir("studyskills-cli-home-");
  const env = { XDG_DOCUMENTS_DIR: path.join(home, "Documents") };
  const mock = await startMockCanvas();
  try {
    await writeHostToken(home, mock.origin, "test-token");
    for (const section of ["modules", "pages", "assignments", "discussions", "announcements", "files"]) {
      mock.state.forbiddenSections.add(section);
    }

    let result = await runCli(
      ["inspect", "--base-url", mock.origin, "--course-id", "1", "--json"],
      { home, env },
    );
    assert.equal(result.code, 0);
    let data = await json(result);
    assert.equal(data.ok, false);
    assert.equal(data.allForbidden, true);
    assert.equal(data.forbiddenSections.length, 6);

    result = await runCore(["workdir", "--topic", "Statistics 101", "--json"], { home, env });
    const work = (await json(result)).workDir;
    try {
      result = await runCli(
        [
          "fetch",
          "--base-url", mock.origin,
          "--course-id", "1",
          "--out", work,
          "--json",
          "--quiet",
        ],
        { home, env },
      );
      assert.notEqual(result.code, 0);
      data = await json(result);
      assert.equal(data.code, "ALL_SECTIONS_FORBIDDEN");
      assert.equal(JSON.stringify(data).includes("expire"), false);
    } finally {
      await cleanupDir(work);
    }
  } finally {
    await mock.close();
    await cleanupDir(home);
  }
});
