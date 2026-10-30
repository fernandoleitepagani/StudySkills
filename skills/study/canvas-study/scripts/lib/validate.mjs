import path from "node:path";
import fs from "node:fs/promises";
import { getTokenStatus } from "./token.mjs";
import { listTopLevelFiles } from "./files.mjs";

function formatFromName(name) {
  return path.extname(name).slice(1).toLowerCase();
}

function normalizeFormat(format, name) {
  const value = String(format ?? "").toLowerCase().trim();
  if (value) return value;
  return formatFromName(name);
}

async function readExpected(expectedPath) {
  const text = await fs.readFile(expectedPath, "utf8");
  const parsed = JSON.parse(text);
  const files = Array.isArray(parsed) ? parsed : parsed.files;
  if (!Array.isArray(files)) throw new Error("Expected file must contain a files array.");
  return files.map((item) => {
    const name = String(item.name ?? "").trim();
    if (!name) throw new Error("Every expected file needs a name.");
    if (path.basename(name) !== name) throw new Error(`Expected file must be a plain name: ${name}`);
    return { name, format: normalizeFormat(item.format, name) };
  });
}

async function signatureMatches(file, format) {
  const handle = await fs.open(file, "r");
  try {
    const buffer = Buffer.alloc(8);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    const head = buffer.subarray(0, bytesRead);
    if (format === "pdf") return head.subarray(0, 4).toString("latin1") === "%PDF";
    if (["docx", "pptx", "xlsx", "odt", "odp", "ods", "zip", "epub"].includes(format)) {
      return head.length >= 4 && head[0] === 0x50 && head[1] === 0x4b;
    }
    if (format === "png") return head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    if (format === "jpg" || format === "jpeg") return head[0] === 0xff && head[1] === 0xd8;
    return true;
  } finally {
    await handle.close();
  }
}

export async function validateRun({ runDir, expectedPath }) {
  const expected = await readExpected(expectedPath);
  const entries = await listTopLevelFiles(runDir);
  const actualFiles = entries.filter((entry) => entry.isFile).map((entry) => entry.name);
  const directories = entries.filter((entry) => entry.isDirectory).map((entry) => entry.name);
  const expectedNames = new Set(expected.map((item) => item.name));

  const produced = [];
  const missing = [];
  const invalid = [];

  for (const item of expected) {
    const file = path.join(runDir, item.name);
    let stat;
    try {
      stat = await fs.stat(file);
    } catch {
      missing.push(item);
      continue;
    }
    if (!stat.isFile() || stat.size === 0) {
      invalid.push({ ...item, reason: "File is empty or not a regular file." });
      continue;
    }
    if (!(await signatureMatches(file, item.format))) {
      invalid.push({ ...item, reason: `File signature does not match ${item.format}.` });
      continue;
    }
    produced.push(item);
  }

  const extra = [
    ...actualFiles.filter((name) => !expectedNames.has(name)),
    ...directories,
  ];

  const tokenStatus = await getTokenStatus();
  const tokenLeak = [];
  if (tokenStatus.found) {
    const tokenBuffer = Buffer.from(tokenStatus.token);
    for (const name of actualFiles) {
      const buffer = await fs.readFile(path.join(runDir, name));
      if (buffer.includes(tokenBuffer)) tokenLeak.push(name);
    }
  }

  return {
    ok: missing.length === 0 && invalid.length === 0 && extra.length === 0 && tokenLeak.length === 0,
    runDir,
    expected,
    produced,
    missing,
    invalid,
    extra,
    tokenLeak,
  };
}
