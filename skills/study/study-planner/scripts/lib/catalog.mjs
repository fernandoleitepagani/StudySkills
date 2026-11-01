import path from "node:path";
import fs from "node:fs/promises";
import { expandHome, resolveDocumentsDir } from "./files.mjs";

function studyRoot(documentsDir) {
  return path.resolve(path.join(documentsDir, "StudySkills"));
}

function inside(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function readDir(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function scanFiles(runDir) {
  const entries = await readDir(runDir);
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const file = path.join(runDir, entry.name);
    let stat;
    try {
      stat = await fs.lstat(file);
    } catch {
      continue;
    }
    if (!stat.isFile()) continue;
    files.push({
      name: entry.name,
      extension: path.extname(entry.name).slice(1).toLowerCase(),
      sizeBytes: stat.size,
      modifiedAt: stat.mtime.toISOString(),
    });
  }
  files.sort((a, b) => a.name.localeCompare(b.name));
  return files;
}

async function scanRun(topicName, runName, runDir) {
  const files = await scanFiles(runDir);
  return {
    id: `${topicName}/${runName}`,
    name: runName,
    files,
    fileCount: files.length,
    totalBytes: files.reduce((sum, file) => sum + file.sizeBytes, 0),
  };
}

async function scanTopic(topicName, topicDir) {
  const entries = await readDir(topicDir);
  const runs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    runs.push(await scanRun(topicName, entry.name, path.join(topicDir, entry.name)));
  }
  runs.sort((a, b) => a.name.localeCompare(b.name));
  return {
    name: topicName,
    id: topicName,
    runs,
    runCount: runs.length,
    fileCount: runs.reduce((sum, run) => sum + run.fileCount, 0),
    totalBytes: runs.reduce((sum, run) => sum + run.totalBytes, 0),
  };
}

export async function catalogStudy({ root = null } = {}) {
  const documentsDir = await resolveDocumentsDir();
  const base = studyRoot(documentsDir);
  const requested = path.resolve(expandHome(String(root ?? base)));
  const realBase = await fs.realpath(base).catch(() => base);
  const realRequested = await fs.realpath(requested).catch(() => requested);
  if (!inside(base, requested) || !inside(realBase, realRequested)) {
    const error = new Error(
      `Catalog root must be inside ${base}. Use the StudySkills output directory.`,
    );
    error.code = "OUTSIDE_OUTPUT_ROOT";
    throw error;
  }

  const relative = path.relative(base, requested);
  const topics = [];
  if (relative === "") {
    const entries = await readDir(base);
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      topics.push(await scanTopic(entry.name, path.join(base, entry.name)));
    }
  } else if (!relative.includes(path.sep)) {
    topics.push(await scanTopic(relative, requested));
  } else {
    const error = new Error(
      `Catalog root must be the StudySkills root or a topic directory: ${requested}`,
    );
    error.code = "INVALID_CATALOG_ROOT";
    throw error;
  }

  topics.sort((a, b) => a.name.localeCompare(b.name));
  return {
    ok: true,
    root: requested,
    topics,
    totals: {
      topics: topics.length,
      runs: topics.reduce((sum, topic) => sum + topic.runCount, 0),
      files: topics.reduce((sum, topic) => sum + topic.fileCount, 0),
      sizeBytes: topics.reduce((sum, topic) => sum + topic.totalBytes, 0),
    },
  };
}
