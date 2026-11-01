import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

export function expandHome(value) {
  if (!value) return value;
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
  return value.replace(/^\$HOME/, os.homedir());
}

export async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function writeJson(file, value) {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export async function resolveDocumentsDir() {
  const override = process.env.STUDYSKILLS_DOCUMENTS_DIR;
  if (override) {
    const value = expandHome(override);
    if (path.isAbsolute(value)) return value;
  }

  const xdg = process.env.XDG_DOCUMENTS_DIR;
  if (xdg && path.isAbsolute(expandHome(xdg))) return expandHome(xdg);

  if (process.platform === "win32") {
    for (const key of ["OneDrive", "OneDriveCommercial", "OneDriveConsumer"]) {
      const root = process.env[key];
      if (!root) continue;
      const candidate = path.join(root, "Documents");
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        // Try the next known location.
      }
    }
  }

  const userDirsFile = path.join(os.homedir(), ".config", "user-dirs.dirs");
  try {
    const text = await fs.readFile(userDirsFile, "utf8");
    const match = text.match(/^XDG_DOCUMENTS_DIR="(.+)"$/m);
    if (match) {
      const value = expandHome(match[1]);
      if (path.isAbsolute(value)) return value;
    }
  } catch {
    // Fall through.
  }

  return path.join(os.homedir(), "Documents");
}

export function slugify(value, fallback = "topic") {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return normalized || fallback;
}

function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join("-") + "-" + [pad(now.getHours()), pad(now.getMinutes())].join("");
}

async function uniqueDir(parent, name) {
  let candidate = path.join(parent, name);
  let index = 2;
  while (true) {
    try {
      await fs.access(candidate);
      candidate = path.join(parent, `${name}-${index}`);
      index += 1;
    } catch {
      return candidate;
    }
  }
}

export async function makeDocumentsRunDir(topic) {
  const documents = await resolveDocumentsDir();
  const base = path.join(documents, "StudySkills");
  const topicSlug = slugify(topic, "topic");
  const topicDir = path.join(base, topicSlug);
  await ensureDir(topicDir);
  const runDir = await uniqueDir(topicDir, timestamp());
  await ensureDir(runDir);
  return { documentsDir: documents, base, topicDir, runDir };
}

export async function makeWorkDir(topic) {
  const root = path.join(os.homedir(), ".studyskills", "work");
  await ensureDir(root);
  const name = `${timestamp()}-${slugify(topic, "topic")}`;
  const workDir = await uniqueDir(root, name);
  await ensureDir(workDir);
  return { workRoot: root, workDir };
}

export async function cleanupWorkDir(workDir) {
  const root = path.join(os.homedir(), ".studyskills", "work");
  const resolvedRoot = path.resolve(root);
  const resolvedWork = path.resolve(workDir);
  const relative = path.relative(resolvedRoot, resolvedWork);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Refusing to remove a directory outside the StudySkills work root.");
  }
  await fs.rm(resolvedWork, { recursive: true, force: true });
  return resolvedWork;
}

export async function cleanupEmptyOutputDir(dir) {
  const base = path.join(await resolveDocumentsDir(), "StudySkills");
  const resolvedBase = path.resolve(base);
  const resolvedDir = path.resolve(dir);
  const relative = path.relative(resolvedBase, resolvedDir);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Refusing to remove a directory outside the StudySkills output root.");
  }
  const entries = await fs.readdir(resolvedDir);
  if (entries.length > 0) return false;
  await fs.rmdir(resolvedDir);
  return true;
}

export async function listTopLevelFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.map((entry) => ({
    name: entry.name,
    isFile: entry.isFile(),
    isDirectory: entry.isDirectory(),
  }));
}
const RESERVED_WINDOWS_NAMES = new Set([
  "con", "prn", "aux", "nul",
  "com1", "com2", "com3", "com4", "com5", "com6", "com7", "com8", "com9",
  "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9",
]);

export function sanitizeFilename(value, fallback = "file") {
  const base = path.basename(String(value ?? "").replace(/\\/g, "/"));
  let cleaned = base
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^\.+/, "")
    .trim()
    .replace(/[. ]+$/g, "");

  if (!cleaned) cleaned = fallback;

  const ext = path.extname(cleaned);
  const stem = cleaned.slice(0, cleaned.length - ext.length);
  if (RESERVED_WINDOWS_NAMES.has(stem.toLowerCase())) cleaned = `${stem}-file${ext}`;

  if (cleaned.length > 140) {
    const longExt = path.extname(cleaned).slice(0, 12);
    cleaned = cleaned.slice(0, 140 - longExt.length) + longExt;
  }

  return cleaned || fallback;
}

export async function uniquePath(dir, filename) {
  const safe = sanitizeFilename(filename);
  const ext = path.extname(safe);
  const stem = safe.slice(0, safe.length - ext.length);
  let candidate = path.join(dir, safe);
  let index = 2;
  while (true) {
    try {
      await fs.access(candidate);
      candidate = path.join(dir, `${stem} (${index})${ext}`);
      index += 1;
    } catch {
      return candidate;
    }
  }
}
export async function removeOutputFiles(dir, names) {
  const base = path.join(await resolveDocumentsDir(), "StudySkills");
  const resolvedBase = path.resolve(base);
  const resolvedDir = path.resolve(dir);
  const relative = path.relative(resolvedBase, resolvedDir);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Refusing to remove files outside the StudySkills output root.");
  }
  const removed = [];
  const missing = [];
  for (const name of names) {
    if (path.basename(name) !== name) throw new Error(`Refusing non-plain file name: ${name}`);
    const file = path.join(resolvedDir, name);
    try {
      const stat = await fs.stat(file);
      if (!stat.isFile()) throw new Error("not a file");
      await fs.rm(file);
      removed.push(name);
    } catch {
      missing.push(name);
    }
  }
  return { removed, missing };
}
