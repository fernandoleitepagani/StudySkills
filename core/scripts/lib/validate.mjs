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
  if (!checksPath) return { files: null, quality: null, research: null };
  const text = await fs.readFile(checksPath, "utf8");
  const parsed = JSON.parse(text);
  const files = parsed.files ?? parsed;
  if (!files || typeof files !== "object" || Array.isArray(files)) {
    throw new Error("Checks must contain a files object keyed by file name.");
  }
  return {
    files,
    quality: parsed.quality ?? null,
    research: parsed.research ?? null,
  };
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

const QUALITY_CRITERIA = [
  "grounding",
  "coverage",
  "learningDesign",
  "accuracy",
  "clarity",
  "accessibility",
  "formatIntegrity",
];
const QUALITY_MINIMUMS = {
  grounding: 4,
  coverage: 4,
  learningDesign: 4,
  accuracy: 4,
  clarity: 4,
  visualClarity: 3,
  accessibility: 4,
  formatIntegrity: 5,
};

function validateQuality(plan, quality) {
  const required = plan.quality?.required === true;
  if (quality === null || quality === undefined) {
    return {
      provided: false,
      required,
      ok: !required,
      issues: required ? ["Quality block is required but missing."] : [],
    };
  }
  if (typeof quality !== "object" || Array.isArray(quality)) {
    return { provided: true, required, ok: false, issues: ["Quality block must be an object."] };
  }

  const issues = [];
  const rubric = quality.rubric;
  if (!rubric || typeof rubric !== "object" || Array.isArray(rubric)) {
    issues.push("Quality rubric must be an object.");
  } else {
    for (const criterion of QUALITY_CRITERIA) {
      const score = rubric[criterion];
      if (!Number.isFinite(Number(score)) || Number(score) < 1 || Number(score) > 5) {
        issues.push(`Quality score ${criterion} must be between 1 and 5.`);
      } else if (Number(score) < QUALITY_MINIMUMS[criterion]) {
        issues.push(`Quality score ${criterion} must be at least ${QUALITY_MINIMUMS[criterion]}.`);
      }
    }
    if (rubric.visualClarity !== undefined) {
      const score = rubric.visualClarity;
      if (!Number.isFinite(Number(score)) || Number(score) < 1 || Number(score) > 5) {
        issues.push("Quality score visualClarity must be between 1 and 5.");
      } else if (Number(score) < QUALITY_MINIMUMS.visualClarity) {
        issues.push(`Quality score visualClarity must be at least ${QUALITY_MINIMUMS.visualClarity}.`);
      }
    }
  }

  const coverage = quality.sourceCoverage;
  if (!coverage || typeof coverage !== "object" || Array.isArray(coverage)) {
    issues.push("Quality sourceCoverage must be an object.");
  } else {
    const selected = Number(coverage.selected);
    const used = Number(coverage.used);
    if (!Number.isInteger(selected) || selected < 0) issues.push("sourceCoverage.selected must be a non-negative integer.");
    if (!Number.isInteger(used) || used < 0) issues.push("sourceCoverage.used must be a non-negative integer.");
    if (Array.isArray(coverage.skipped) === false) issues.push("sourceCoverage.skipped must be an array.");
    if (Number.isInteger(selected) && Number.isInteger(used) && used > selected) {
      issues.push("sourceCoverage.used cannot exceed selected.");
    }
    if (Number.isInteger(selected) && Number.isInteger(used) && Array.isArray(coverage.skipped)) {
      if (used + coverage.skipped.length !== selected) {
        issues.push("sourceCoverage used plus skipped must equal selected.");
      }
    }
  }

  if (quality.review !== "pass") issues.push("Quality review must be pass.");

  return { provided: true, required, ok: issues.length === 0, issues };
}

function validateResearch(plan, research) {
  const expected = plan.research?.web;
  if (research === null || research === undefined) {
    return { provided: false, ok: expected !== "used", issues: expected === "used" ? ["Research metadata is required when web is used."] : [] };
  }
  if (typeof research !== "object" || Array.isArray(research)) {
    return { provided: true, ok: false, issues: ["Research metadata must be an object."] };
  }
  const issues = [];
  const web = research.web;
  if (!["used", "not-used", "unavailable"].includes(web)) {
    issues.push("research.web must be used, not-used, or unavailable.");
  }
  if (web === "used") {
    if (!Number.isInteger(Number(research.sourceCount)) || Number(research.sourceCount) <= 0) {
      issues.push("research.sourceCount must be a positive integer when web is used.");
    }
    if (!Array.isArray(research.domains) || research.domains.some((item) => typeof item !== "string" || !item.trim())) {
      issues.push("research.domains must be an array of non-empty strings.");
    }
  }
  return { provided: true, ok: issues.length === 0, issues };
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
    let originalInvalid = false;
    try {
      const stat = await fs.stat(file);
      if (stat.isFile() && stat.size > 0) {
        if (await signatureMatches(file, item.format)) valid = true;
        else originalInvalid = true;
      } else {
        originalInvalid = true;
      }
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
          if (originalInvalid) {
            invalid.push({ ...item, reason: "Original file is invalid; fallback used." });
          }
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

  const semantic = validateSemantic(checks.files, produced);
  const quality = validateQuality(plan, checks.quality);
  const research = validateResearch(plan, checks.research);

  return {
    ok: missing.length === 0
      && invalid.length === 0
      && extra.length === 0
      && tokenLeak.length === 0
      && semantic.ok
      && quality.ok
      && research.ok,
    runDir,
    plan: {
      topic: plan.topic ?? null,
      requested: requested.map((item) => item.name),
      fallbacks: declaredFallbacks,
      qualityRequired: plan.quality?.required === true,
      researchWeb: plan.research?.web ?? null,
    },
    requested,
    produced,
    missing,
    invalid,
    extra,
    fallbacks: fallbackResults,
    tokenLeak,
    semantic,
    quality,
    research,
  };
}
