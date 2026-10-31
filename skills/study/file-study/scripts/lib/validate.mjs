import path from "node:path";
import fs from "node:fs/promises";
import { listTopLevelFiles } from "./files.mjs";

function formatFromName(name) {
  return path.extname(name).slice(1).toLowerCase();
}

function normalizeFormat(format, name) {
  const value = String(format ?? "").toLowerCase().trim();
  if (value) return value;
  return formatFromName(name);
}

async function readPlan(planPath) {
  const text = await fs.readFile(planPath, "utf8");
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.requested)) {
    throw new Error("Plan must contain a requested array.");
  }
  const files = [];
  for (const output of parsed.requested) {
    if (!output || typeof output !== "object") throw new Error("Every requested output must be an object.");
    const outputName = String(output.output ?? output.name ?? "").trim();
    const declared = Array.isArray(output.files) ? output.files : [];
    if (!declared.length) {
      const formats = Array.isArray(output.formats) ? output.formats : [];
      if (!formats.length) throw new Error(`Requested output ${outputName || "(unnamed)"} needs files or formats.`);
      for (const format of formats) {
        const normalized = String(format).toLowerCase();
        files.push({
          name: `${outputName}.${normalized}`,
          format: normalized,
          output: outputName,
        });
      }
      continue;
    }
    for (const file of declared) {
      const name = String(file?.name ?? file ?? "").trim();
      if (!name) throw new Error(`Requested output ${outputName} has a file without a name.`);
      if (path.basename(name) !== name) throw new Error(`Requested file must be a plain name: ${name}`);
      files.push({
        name,
        format: normalizeFormat(file?.format, name),
        output: outputName,
      });
    }
  }
  const fallbacks = {};
  const declaredFallbacks = parsed.fallbacks ?? {};
  if (declaredFallbacks && typeof declaredFallbacks === "object" && !Array.isArray(declaredFallbacks)) {
    for (const [requestedName, fallbackName] of Object.entries(declaredFallbacks)) {
      const from = String(requestedName ?? "").trim();
      const to = String(fallbackName ?? "").trim();
      if (!from || !to) throw new Error("Fallback entries need a requested and fallback file name.");
      if (path.basename(from) !== from || path.basename(to) !== to) {
        throw new Error("Fallback file names must be plain names.");
      }
      fallbacks[from] = to;
    }
  }
  return { plan: parsed, files, fallbacks };
}

async function readChecks(checksPath) {
  if (!checksPath) return null;
  const text = await fs.readFile(checksPath, "utf8");
  const parsed = JSON.parse(text);
  const files = parsed.files ?? parsed;
  if (!files || typeof files !== "object" || Array.isArray(files)) {
    throw new Error("Checks must contain a files object keyed by file name.");
  }
  return files;
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
    if (format === "png") {
      return head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }
    if (format === "jpg" || format === "jpeg") return head[0] === 0xff && head[1] === 0xd8;
    return true;
  } finally {
    await handle.close();
  }
}

function validateSemantic(checks, produced) {
  if (!checks) {
    return {
      provided: false,
      ok: false,
      missing: produced.map((item) => item.name),
      invalid: [],
    };
  }

  const missing = [];
  const invalid = [];
  for (const item of produced) {
    const entry = checks[item.name];
    if (!entry || typeof entry !== "object") {
      missing.push(item.name);
      continue;
    }
    if (!Array.isArray(entry.sections) || entry.sections.length === 0) {
      invalid.push({ name: item.name, reason: "Semantic checks need at least one section." });
      continue;
    }
    if (entry.counts !== undefined) {
      if (!entry.counts || typeof entry.counts !== "object" || Array.isArray(entry.counts)) {
        invalid.push({ name: item.name, reason: "counts must be an object." });
        continue;
      }
      const bad = Object.entries(entry.counts).find(([, value]) => !Number.isFinite(Number(value)) || Number(value) <= 0);
      if (bad) invalid.push({ name: item.name, reason: `Invalid count for ${bad[0]}.` });
    }
  }

  return {
    provided: true,
    ok: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
}

export async function validateRun({ runDir, planPath, checksPath = null, token = null }) {
  const { plan, files: requested, fallbacks: declaredFallbacks } = await readPlan(planPath);
  const checks = await readChecks(checksPath);
  const entries = await listTopLevelFiles(runDir);
  const actualFiles = entries.filter((entry) => entry.isFile).map((entry) => entry.name);
  const directories = entries.filter((entry) => entry.isDirectory).map((entry) => entry.name);
  const allowedNames = new Set(requested.map((item) => item.name));
  for (const fallbackName of Object.values(declaredFallbacks)) allowedNames.add(fallbackName);

  const produced = [];
  const missing = [];
  const invalid = [];
  const fallbackResults = [];

  for (const item of requested) {
    const file = path.join(runDir, item.name);
    let valid = false;
    let missingFile = false;
    try {
      const stat = await fs.stat(file);
      if (stat.isFile() && stat.size > 0 && await signatureMatches(file, item.format)) valid = true;
    } catch {
      missingFile = true;
    }

    if (valid) {
      produced.push(item);
      continue;
    }

    const fallbackName = declaredFallbacks[item.name];
    if (fallbackName) {
      const fallbackFile = path.join(runDir, fallbackName);
      const fallbackFormat = formatFromName(fallbackName);
      try {
        const stat = await fs.stat(fallbackFile);
        if (stat.isFile() && stat.size > 0 && await signatureMatches(fallbackFile, fallbackFormat)) {
          produced.push({
            name: fallbackName,
            format: fallbackFormat,
            output: item.output,
            fallbackFor: item.name,
          });
          fallbackResults.push({ requested: item.name, produced: fallbackName });
          continue;
        }
      } catch {
        // Fall through to the normal missing/invalid report.
      }
    }

    if (missingFile) missing.push(item);
    else invalid.push({ ...item, reason: `File is invalid for ${item.format}.` });
  }

  const extra = [
    ...actualFiles.filter((name) => !allowedNames.has(name)),
    ...directories,
  ];

  const tokenLeak = [];
  if (token) {
    const tokenBuffer = Buffer.from(token);
    for (const name of actualFiles) {
      const buffer = await fs.readFile(path.join(runDir, name));
      if (buffer.includes(tokenBuffer)) tokenLeak.push(name);
    }
  }

  const semantic = validateSemantic(checks, produced);

  return {
    ok: missing.length === 0 && invalid.length === 0 && extra.length === 0 && tokenLeak.length === 0 && semantic.ok,
    runDir,
    plan: {
      topic: plan.topic ?? null,
      requested: requested.map((item) => item.name),
      fallbacks: declaredFallbacks,
    },
    requested,
    produced,
    missing,
    invalid,
    extra,
    fallbacks: fallbackResults,
    tokenLeak,
    semantic,
  };
}
