#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags[key] = next;
      i += 1;
    } else {
      flags[key] = true;
    }
  }
  return flags;
}

const flags = parseArgs(process.argv.slice(2));
const json = Boolean(flags.json);

function fail(message) {
  const payload = { ok: false, error: message };
  if (json) process.stderr.write(JSON.stringify(payload, null, 2) + "\n");
  else process.stderr.write(message + "\n");
  process.exit(1);
}

function required(name) {
  const value = flags[name];
  if (!value || value === true) fail(`Missing --${name}.`);
  return String(value);
}

function tagsOf(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value ?? "").split(/[,\s]+/).map((item) => item.trim()).filter(Boolean);
}

function normalizeCards(input) {
  const raw = Array.isArray(input) ? input : input?.cards;
  if (!Array.isArray(raw)) throw new Error("Input must be an array or an object with a cards array.");
  const cards = [];
  const seen = new Set();
  let duplicates = 0;
  for (const item of raw) {
    const front = String(item?.front ?? "").trim();
    const back = String(item?.back ?? "").trim();
    if (!front || !back) throw new Error("Every card needs a non-empty front and back.");
    const key = front.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) {
      duplicates += 1;
      continue;
    }
    seen.add(key);
    cards.push({ front, back, tags: tagsOf(item.tags) });
  }
  return { cards, duplicates };
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(cards) {
  const lines = ["front,back,tags"];
  for (const card of cards) {
    lines.push([csvCell(card.front), csvCell(card.back), csvCell(card.tags.join(" "))].join(","));
  }
  return lines.join("\n") + "\n";
}

function toMarkdown(cards) {
  const groups = new Map();
  for (const card of cards) {
    const key = card.tags[0] || "General";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(card);
  }
  const parts = ["# Flashcards", ""];
  for (const [topic, items] of groups) {
    parts.push(`## ${topic}`, "");
    for (const card of items) {
      parts.push(`Q: ${card.front}`, "", `A: ${card.back}`, "");
    }
  }
  return parts.join("\n").trim() + "\n";
}

async function main() {
  const input = required("input");
  const out = required("out");
  const formats = String(flags.formats ?? "csv,md")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (!formats.length) fail("No formats requested.");
  for (const format of formats) {
    if (!["csv", "md"].includes(format)) fail(`Unsupported format: ${format}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(await fs.readFile(input, "utf8"));
  } catch (error) {
    fail(`Cannot read cards JSON: ${error.message}`);
  }

  let normalized;
  try {
    normalized = normalizeCards(parsed);
  } catch (error) {
    fail(error.message);
  }

  if (normalized.cards.length === 0) fail("No cards to write.");
  await fs.mkdir(out, { recursive: true });

  const files = [];
  if (formats.includes("csv")) {
    const file = path.join(out, "flashcards.csv");
    await fs.writeFile(file, toCsv(normalized.cards), "utf8");
    files.push(file);
  }
  if (formats.includes("md")) {
    const file = path.join(out, "flashcards.md");
    await fs.writeFile(file, toMarkdown(normalized.cards), "utf8");
    files.push(file);
  }

  const result = {
    ok: true,
    count: normalized.cards.length,
    duplicatesRemoved: normalized.duplicates,
    files,
  };
  if (json) process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  else process.stdout.write(`Wrote ${files.length} file(s), ${result.count} cards.\n`);
}

main().catch((error) => fail(error.message));
