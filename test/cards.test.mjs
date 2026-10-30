import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { runCards, makeTempDir, cleanupDir } from "../test-support/temp.mjs";

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

test("cards: writes CSV and Markdown, escapes, and removes duplicates", async () => {
  const dir = await makeTempDir("studyskills-cards-");
  try {
    const input = path.join(dir, "cards.json");
    const out = path.join(dir, "out");
    await fs.writeFile(
      input,
      JSON.stringify([
        { front: "What is a mean?", back: "A measure of center.", tags: ["statistics"] },
        { front: "What is a mean?", back: "Duplicate.", tags: ["statistics"] },
        { front: "Explain \"variance\"", back: "Spread, with, commas.", tags: ["statistics", "spread"] },
      ]),
    );
    const result = await runCards(
      ["--input", input, "--out", out, "--formats", "csv,md", "--json"],
    );
    assert.equal(result.code, 0);
    const data = await json(result);
    assert.equal(data.count, 2);
    assert.equal(data.duplicatesRemoved, 1);

    const csv = await fs.readFile(path.join(out, "flashcards.csv"), "utf8");
    assert.match(csv, /^front,back,tags/m);
    assert.match(csv, /"Explain ""variance"""/);
    assert.match(csv, /"Spread, with, commas\."/);
    assert.equal((csv.match(/What is a mean\?/g) || []).length, 1);

    const md = await fs.readFile(path.join(out, "flashcards.md"), "utf8");
    assert.match(md, /## statistics/);
    assert.match(md, /Q: What is a mean\?/);
    assert.match(md, /A: A measure of center\./);
  } finally {
    await cleanupDir(dir);
  }
});

test("cards: writes only the requested format", async () => {
  const dir = await makeTempDir("studyskills-cards-");
  try {
    const input = path.join(dir, "cards.json");
    const out = path.join(dir, "out");
    await fs.writeFile(input, JSON.stringify([{ front: "Q", back: "A" }]));
    const result = await runCards(
      ["--input", input, "--out", out, "--formats", "csv", "--json"],
    );
    assert.equal(result.code, 0);
    await fs.access(path.join(out, "flashcards.csv"));
    await assert.rejects(fs.access(path.join(out, "flashcards.md")));
  } finally {
    await cleanupDir(dir);
  }
});

test("cards: rejects incomplete cards", async () => {
  const dir = await makeTempDir("studyskills-cards-");
  try {
    const input = path.join(dir, "cards.json");
    const out = path.join(dir, "out");
    await fs.writeFile(input, JSON.stringify([{ front: "Q" }]));
    const result = await runCards(
      ["--input", input, "--out", out, "--formats", "csv", "--json"],
    );
    assert.notEqual(result.code, 0);
    const data = await json(result);
    assert.match(data.error, /front and back/);
  } finally {
    await cleanupDir(dir);
  }
});
