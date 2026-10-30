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
  const xdg = process.env.XDG_DOCUMENTS_DIR;
  if (xdg && path.isAbsolute(expandHome(xdg))) {
    return expandHome(xdg);
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
    // Fall through to the conventional Documents directory.
  }

  return path.join(os.homedir(), "Documents");
}

export function slugify(value, fallback = "course") {
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

export async function makeDocumentsRunDir(courseName) {
  const documents = await resolveDocumentsDir();
  const base = path.join(documents, "StudySkills");
  const courseSlug = slugify(courseName, "course");
  const courseDir = path.join(base, courseSlug);
  await ensureDir(courseDir);
  const runDir = await uniqueDir(courseDir, timestamp());
  await ensureDir(runDir);
  return { documentsDir: documents, base, courseDir, runDir };
}

export async function makeWorkDir(courseName) {
  const root = path.join(os.homedir(), ".studyskills", "work");
  await ensureDir(root);
  const name = `${timestamp()}-${slugify(courseName, "course")}`;
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
  const reserved = RESERVED_WINDOWS_NAMES.has(stem.toLowerCase());
  if (reserved) cleaned = `${stem}-file${ext}`;

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

export async function listTopLevelFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.map((entry) => ({
    name: entry.name,
    isFile: entry.isFile(),
    isDirectory: entry.isDirectory(),
  }));
}

export function isTextFormat(format) {
  return ["md", "markdown", "csv", "txt"].includes(String(format).toLowerCase());
}
