import path from "node:path";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

const ALLOWED = new Set([
  ".md", ".markdown", ".txt", ".pdf", ".docx", ".pptx", ".csv",
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".html",
]);
const SKIP_DIRS = new Set([".git", "node_modules", ".obsidian", ".trash", ".gitlab"]);
const MAX_FILES = 500;

async function walk(root, out, skipped, state) {
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch (error) {
    skipped.push({ path: root, reason: error.message });
    return;
  }

  for (const entry of entries) {
    if (state.count >= MAX_FILES) {
      state.truncated = true;
      continue;
    }
    if (entry.name.startsWith(".")) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(full, out, skipped, state);
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!ALLOWED.has(ext)) {
      skipped.push({ path: full, reason: "Unsupported extension" });
      continue;
    }
    let stat;
    try {
      stat = await fs.stat(full);
    } catch (error) {
      skipped.push({ path: full, reason: error.message });
      continue;
    }
    out.push({ full, stat, ext });
    state.count += 1;
  }
}

async function hashFile(file) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(file);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function parseMarkdown(text) {
  const headings = [];
  const tags = new Set();
  const wikiLinks = new Set();
  for (const line of text.split(/\r?\n/)) {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) headings.push({ level: heading[1].length, text: heading[2].trim() });
    const tagLine = line.match(/^tags\s*:\s*(.+)$/i);
    if (tagLine) {
      const raw = tagLine[1].replace(/^\[|\]$/g, "");
      for (const value of raw.split(/[,\s]+/)) {
        const tag = value.replace(/^["']|["']$/g, "").trim();
        if (tag) tags.add(tag);
      }
    }
    for (const match of line.matchAll(/\[\[([^\]]+)\]\]/g)) {
      const link = match[1].split("|")[0].split("#")[0].trim();
      if (link) wikiLinks.add(link);
    }
  }
  return {
    title: headings.find((item) => item.level === 1)?.text ?? headings[0]?.text ?? null,
    headings,
    tags: [...tags],
    wikiLinks: [...wikiLinks],
  };
}

export async function inventory({ paths = [], pack = null, maxFiles = MAX_FILES }) {
  const inputs = [];
  const files = [];
  const skipped = [];
  const state = { count: 0, truncated: false };

  if (pack) {
    const sources = path.join(pack, "sources");
    try {
      await fs.access(path.join(sources, "materials.md"));
    } catch {
      throw new Error(`Pack is missing sources/materials.md: ${pack}`);
    }
    inputs.push(sources);
    await walk(sources, files, skipped, state);
  }

  for (const input of paths) {
    inputs.push(input);
    let stat;
    try {
      stat = await fs.stat(input);
    } catch (error) {
      skipped.push({ path: input, reason: error.message });
      continue;
    }
    if (stat.isDirectory()) {
      await walk(input, files, skipped, state);
    } else if (stat.isFile()) {
      const ext = path.extname(input).toLowerCase();
      if (!ALLOWED.has(ext)) {
        skipped.push({ path: input, reason: "Unsupported extension" });
        continue;
      }
      files.push({ full: input, stat, ext });
      state.count += 1;
    }
  }

  const seen = new Set();
  const results = [];
  for (const file of files) {
    const absolute = path.resolve(file.full);
    if (seen.has(absolute)) continue;
    seen.add(absolute);
    const relative = path.relative(process.cwd(), absolute) || file.stat.name;
    const item = {
      path: absolute,
      relative,
      name: path.basename(absolute),
      ext: file.ext,
      size: file.stat.size,
      modified: file.stat.mtime.toISOString(),
      sha256: await hashFile(absolute),
    };
    if (file.ext === ".md" || file.ext === ".markdown") {
      try {
        const text = await fs.readFile(absolute, "utf8");
        Object.assign(item, { markdown: parseMarkdown(text.slice(0, 1024 * 1024)) });
      } catch (error) {
        item.markdown = { error: error.message };
      }
    }
    results.push(item);
  }

  return {
    ok: true,
    inputs,
    files: results,
    skipped,
    truncated: state.truncated,
    totalFiles: results.length,
    totalBytes: results.reduce((sum, item) => sum + item.size, 0),
  };
}
