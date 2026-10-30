#!/usr/bin/env node
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import {
  CanvasClient,
  CanvasError,
  validateToken,
} from "./lib/canvas-client.mjs";
import {
  createTokenGuide,
  getTokenStatus,
  redactSecrets,
  requireToken,
  TOKEN_ENV,
  TOKEN_TXT,
} from "./lib/token.mjs";
import {
  cleanupEmptyOutputDir,
  cleanupWorkDir,
  ensureDir,
  formatBytes,
  makeDocumentsRunDir,
  makeWorkDir,
  resolveDocumentsDir,
  sanitizeFilename,
  uniquePath,
  writeJson,
} from "./lib/files.mjs";
import { extractImageSources, htmlToText } from "./lib/html-to-text.mjs";
import { validateRun } from "./lib/validate.mjs";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 50 * 1024 * 1024;
const MAX_FILES = 300;
const MAX_PAGES = 500;
const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
  ".txt", ".md", ".csv", ".rtf", ".odt", ".odp", ".ods", ".epub", ".html",
]);
const ALLOWED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next;
        i += 1;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { command: positional[0] ?? "help", flags };
}

const { command, flags } = parseArgs(process.argv.slice(2));
const json = Boolean(flags.json);

function printJson(value) {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

function printHuman(value) {
  if (typeof value === "string") {
    process.stdout.write(value + "\n");
    return;
  }
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

function respond(value, human = null) {
  if (json) printJson(value);
  else printHuman(human ?? value);
}

function fail(code, message, extra = {}) {
  const payload = { ok: false, code, message, ...extra };
  if (json) {
    process.stderr.write(JSON.stringify(payload, null, 2) + "\n");
  } else {
    process.stderr.write(`${message}\n`);
    if (extra.paths) {
      for (const item of extra.paths) process.stderr.write(`  ${item}\n`);
    }
  }
  process.exit(1);
}

function requireFlag(name) {
  const value = flags[name];
  if (!value || value === true) fail("MISSING_ARGUMENT", `Missing --${name}.`);
  return String(value);
}

function progress(message) {
  if (!flags.quiet) process.stderr.write(`${message}\n`);
}

function safeError(error) {
  return {
    code: error?.code ?? "ERROR",
    status: error instanceof CanvasError ? error.status : null,
    message: redactSecrets(error?.message ?? String(error)),
    body: error instanceof CanvasError ? error.body : null,
  };
}

async function attempt(label, fn, errors) {
  try {
    return await fn();
  } catch (error) {
    errors.push({ label, ...safeError(error) });
    return null;
  }
}

function pickCourse(course) {
  return {
    id: String(course.id),
    name: course.name ?? course.course_code ?? `Course ${course.id}`,
    courseCode: course.course_code ?? null,
    term: course.term?.name ?? null,
    startAt: course.start_at ?? null,
    endAt: course.end_at ?? null,
    workflowState: course.workflow_state ?? null,
  };
}

function formatDate(value) {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
}

function section(title, body) {
  const content = String(body ?? "").trim();
  return `## ${title}\n\n${content || "_None found._"}\n`;
}

function moduleItemLine(item) {
  const parts = [
    `- [${item.type ?? "Item"}] ${item.title ?? "(untitled)"}`,
  ];
  if (item.html_url) parts.push(`  Link: ${item.html_url}`);
  if (item.url && item.url !== item.html_url) parts.push(`  API: ${item.url}`);
  if (item.content_id) parts.push(`  Content ID: ${item.content_id}`);
  if (item.page_url) parts.push(`  Page: ${item.page_url}`);
  return parts.join("\n");
}

async function loadCourseLists(client, courseId, { errors, truncations = {}, progressLabel = "Inspecting" }) {
  const course = await client.getJson(`/api/v1/courses/${courseId}`, { "include[]": ["syllabus", "term"] });
  progress(`${progressLabel} ${course.name ?? courseId}...`);

  async function getList(label, pathname, params, maxPages = 100) {
    const result = await attempt(
      label,
      () => client.getAllWithMeta(pathname, params, { maxPages }),
      errors,
    );
    if (!result) return [];
    truncations[label] = result.truncated;
    return result.items;
  }

  const modules = await getList("modules", `/api/v1/courses/${courseId}/modules`, { "include[]": "items", per_page: 100 });
  const pagesList = await getList("pages", `/api/v1/courses/${courseId}/pages`, { per_page: 100 });
  const assignments = await getList("assignments", `/api/v1/courses/${courseId}/assignments`, { per_page: 100 });
  const discussions = await getList("discussions", `/api/v1/courses/${courseId}/discussion_topics`, { per_page: 100 });
  const announcements = await getList("announcements", `/api/v1/courses/${courseId}/discussion_topics`, { only_announcements: true, per_page: 100 });
  const files = await getList("files", `/api/v1/courses/${courseId}/files`, { per_page: 100, sort: "position", order: "asc" });
  const frontPage = await attempt("front_page", () => client.getJson(`/api/v1/courses/${courseId}/front_page`), errors);

  return {
    course,
    modules,
    pagesList,
    assignments,
    discussions,
    announcements,
    files,
    frontPage,
    truncations,
  };
}

function allowedFile(file) {
  const ext = path.extname(String(file.filename ?? file.display_name ?? "")).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

function fileSize(file) {
  const size = Number(file.size);
  return Number.isFinite(size) && size > 0 ? size : 0;
}

async function inspectCourse(client, courseId) {
  const errors = [];
  const data = await loadCourseLists(client, courseId, { errors });
  const files = data.files;
  const allowed = files.filter((file) => allowedFile(file) && fileSize(file) <= MAX_FILE_BYTES);
  const estimatedBytes = allowed.reduce((sum, file) => sum + fileSize(file), 0);
  return {
    ok: true,
    course: pickCourse(data.course),
    counts: {
      modules: data.modules.length,
      moduleItems: data.modules.reduce((sum, mod) => sum + (mod.items?.length ?? 0), 0),
      pages: data.pagesList.length,
      assignments: data.assignments.length,
      discussions: data.discussions.length,
      announcements: data.announcements.length,
      files: files.length,
      allowedFiles: allowed.length,
    },
    estimatedBytes,
    estimatedSize: formatBytes(estimatedBytes),
    frontPage: Boolean(data.frontPage),
    errors,
    truncated: data.truncations,
  };
}

function rewriteImages(html, imageMap, baseUrl) {
  return String(html ?? "").replace(/<img\b[^>]*>/gi, (tag) => {
    const match = tag.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    if (!match) return tag;
    const raw = (match[1] ?? match[2] ?? match[3] ?? "").replace(/&amp;/g, "&");
    let absolute;
    try {
      absolute = new URL(raw, baseUrl).toString();
    } catch {
      return tag;
    }
    const local = imageMap.get(absolute);
    if (!local) return tag;
    return tag.replace(match[0], `src="${local}"`);
  });
}

async function fetchImages(client, sourcesDir, htmlSources, manifest) {
  const imagesDir = path.join(sourcesDir, "images");
  const imageMap = new Map();
  const seen = new Set();
  let totalBytes = 0;
  let downloaded = 0;

  for (const [label, html] of htmlSources) {
    for (const image of extractImageSources(html)) {
      if (image.src.startsWith("data:")) continue;
      let absolute;
      try {
        absolute = new URL(image.src, client.baseUrl);
      } catch {
        manifest.skipped.images.push({ src: image.src, reason: "Invalid image URL" });
        continue;
      }
      if (absolute.protocol !== client.base.protocol || absolute.host !== client.base.host) {
        manifest.externalImages.push({ src: absolute.toString(), alt: image.alt, source: label });
        continue;
      }
      const extension = path.extname(absolute.pathname).toLowerCase();
      if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
        manifest.skipped.images.push({ src: absolute.toString(), reason: "Unsupported image extension" });
        continue;
      }
      if (seen.has(absolute.toString())) continue;
      seen.add(absolute.toString());
      if (downloaded >= 200) {
        manifest.skipped.images.push({ src: absolute.toString(), reason: "Image count cap reached" });
        continue;
      }
      if (totalBytes >= MAX_TOTAL_IMAGE_BYTES) {
        manifest.skipped.images.push({ src: absolute.toString(), reason: "Image size cap reached" });
        continue;
      }

      const baseName = sanitizeFilename(path.basename(absolute.pathname) || `image${extension}`);
      const destination = await uniquePath(imagesDir, baseName);
      try {
        const bytes = await client.download({ url: absolute.toString() }, destination, { maxBytes: MAX_IMAGE_BYTES });
        if (totalBytes + bytes > MAX_TOTAL_IMAGE_BYTES) {
          await fs.rm(destination, { force: true });
          manifest.skipped.images.push({ src: absolute.toString(), reason: "Image size cap reached after download" });
          continue;
        }
        totalBytes += bytes;
        downloaded += 1;
        const relativePath = path.relative(sourcesDir, destination).split(path.sep).join("/");
        imageMap.set(absolute.toString(), relativePath);
        manifest.images.push({ src: absolute.toString(), path: relativePath, alt: image.alt, size: bytes });
      } catch (error) {
        manifest.skipped.images.push({ src: absolute.toString(), reason: safeError(error).message });
      }
    }
  }

  return { imageMap, totalBytes, downloaded };
}

async function fetchCourse(client, courseId, workDir) {
  const errors = [];
  const truncations = {};
  const data = await loadCourseLists(client, courseId, { errors, truncations, progressLabel: "Fetching" });
  const course = data.course;
  const sourcesDir = path.join(workDir, "sources");
  const filesDir = path.join(sourcesDir, "files");
  await ensureDir(filesDir);

  const pages = [];
  const pageLimit = Math.min(data.pagesList.length, MAX_PAGES);
  const pagesSkipped = Math.max(0, data.pagesList.length - pageLimit);
  for (let i = 0; i < pageLimit; i += 1) {
    const page = data.pagesList[i];
    progress(`Fetching page ${i + 1}/${pageLimit}: ${page.title ?? page.url}`);
    const detail = await attempt(
      `page:${page.url}`,
      () => client.getJson(`/api/v1/courses/${courseId}/pages/${encodeURIComponent(page.url)}`),
      errors,
    );
    if (detail) pages.push(detail);
  }

  const manifest = {
    course: {
      id: String(course.id),
      name: course.name ?? null,
      code: course.course_code ?? null,
      term: course.term?.name ?? null,
    },
    baseUrl: client.baseUrl,
    fetchedAt: new Date().toISOString(),
    stats: {
      modules: data.modules.length,
      pages: pages.length,
      assignments: data.assignments.length,
      discussions: data.discussions.length,
      announcements: data.announcements.length,
      files: data.files.length,
    },
    files: [],
    images: [],
    externalImages: [],
    externalMaterials: [],
    skipped: {
      pages: pagesSkipped,
      files: [],
      images: [],
    },
    truncated: {
      modules: Boolean(truncations.modules),
      pages: Boolean(truncations.pages) || pagesSkipped > 0,
      assignments: Boolean(truncations.assignments),
      discussions: Boolean(truncations.discussions),
      announcements: Boolean(truncations.announcements),
      files: Boolean(truncations.files),
    },
    excluded: ["quizzes", "media", "archives"],
    endpointErrors: errors,
    totalBytes: 0,
    totalImageBytes: 0,
  };

  let totalBytes = 0;
  let downloaded = 0;
  const fileIndex = [];

  for (const file of data.files) {
    const originalName = String(file.filename ?? file.display_name ?? `file-${file.id}`);
    const ext = path.extname(originalName).toLowerCase();
    const size = fileSize(file);

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      manifest.skipped.files.push({ name: originalName, reason: "Unsupported extension", size: formatBytes(size) });
      continue;
    }
    if (size > MAX_FILE_BYTES) {
      manifest.skipped.files.push({ name: originalName, reason: "File over 50 MB", size: formatBytes(size) });
      continue;
    }
    if (downloaded >= MAX_FILES) {
      manifest.skipped.files.push({ name: originalName, reason: "File count cap reached", size: formatBytes(size) });
      continue;
    }
    if (size > 0 && totalBytes + size > MAX_TOTAL_BYTES) {
      manifest.skipped.files.push({ name: originalName, reason: "Total size cap reached", size: formatBytes(size) });
      continue;
    }

    const safeName = sanitizeFilename(originalName);
    const destination = await uniquePath(filesDir, safeName);
    progress(`Downloading file ${downloaded + 1}: ${originalName}`);
    try {
      const bytes = await client.download(file, destination, { maxBytes: MAX_FILE_BYTES });
      if (totalBytes + bytes > MAX_TOTAL_BYTES) {
        await fs.rm(destination, { force: true });
        manifest.skipped.files.push({ name: originalName, reason: "Total size cap reached after download", size: formatBytes(bytes) });
        continue;
      }
      totalBytes += bytes;
      downloaded += 1;
      const relativePath = path.relative(sourcesDir, destination).split(path.sep).join("/");
      manifest.files.push({
        name: originalName,
        path: relativePath,
        size: bytes,
        contentType: file["content-type"] ?? file.content_type ?? null,
      });
      fileIndex.push({ name: originalName, path: relativePath, size: bytes });
    } catch (error) {
      const info = safeError(error);
      manifest.skipped.files.push({ name: originalName, reason: info.message, size: formatBytes(size) });
    }
    await new Promise((resolve) => setTimeout(resolve, 60));
  }

  manifest.totalBytes = totalBytes;
  manifest.stats.downloadedFiles = downloaded;
  manifest.stats.skippedFiles = manifest.skipped.files.length;

  const imageSources = [
    ["syllabus", course.syllabus_body],
    ["front_page", data.frontPage?.body],
    ...pages.map((page) => [`page:${page.title ?? page.url}`, page.body]),
    ...data.assignments.map((assignment) => [`assignment:${assignment.name ?? assignment.id}`, assignment.description]),
  ];
  const imageResult = await fetchImages(client, sourcesDir, imageSources, manifest);
  manifest.totalImageBytes = imageResult.totalBytes;
  manifest.stats.downloadedImages = imageResult.downloaded;
  manifest.stats.skippedImages = manifest.skipped.images.length;

  const rewrite = (html) => rewriteImages(html, imageResult.imageMap, client.baseUrl);

  const modulesText = data.modules.length
    ? data.modules.map((mod) => {
        const items = (mod.items ?? []).map(moduleItemLine).join("\n");
        return `### ${mod.name ?? `Module ${mod.id}`}\n\nPosition: ${mod.position ?? "unknown"}\nState: ${mod.state ?? "unknown"}\n\n${items || "_No items._"}`;
      }).join("\n\n")
    : "";

  const pagesText = pages.length
    ? pages.map((page) => `### ${page.title ?? page.url}\n\nURL: ${page.html_url ?? page.url}\n\n${htmlToText(rewrite(page.body))}`).join("\n\n")
    : "";

  const assignmentsText = data.assignments.length
    ? data.assignments.map((assignment) => {
        const parts = [
          `### ${assignment.name ?? "(untitled assignment)"}`,
          `Due: ${formatDate(assignment.due_at)}`,
          `Points: ${assignment.points_possible ?? "not specified"}`,
          assignment.html_url ? `Link: ${assignment.html_url}` : "",
          "",
          htmlToText(rewrite(assignment.description)),
        ];
        if (assignment.rubric) {
          parts.push("", "Rubric:", "```json", JSON.stringify(assignment.rubric, null, 2), "```");
        }
        return parts.filter(Boolean).join("\n");
      }).join("\n\n")
    : "";

  const discussionsText = data.discussions.filter((item) => !item.announcement).length
    ? data.discussions.filter((item) => !item.announcement).map((topic) => `### ${topic.title ?? "(untitled discussion)"}\n\nPosted: ${formatDate(topic.posted_at)}\n\n${htmlToText(topic.message)}`).join("\n\n")
    : "";

  const announcementsText = data.announcements.length
    ? data.announcements.map((topic) => `### ${topic.title ?? "(untitled announcement)"}\n\nPosted: ${formatDate(topic.posted_at)}\n\n${htmlToText(topic.message)}`).join("\n\n")
    : "";

  const externalLinks = [];
  for (const mod of data.modules) {
    for (const item of mod.items ?? []) {
      if (item.type === "ExternalUrl" || item.type === "ExternalTool") {
        const url = item.external_url ?? item.url ?? "";
        externalLinks.push(`- ${item.title ?? "(untitled)"} (${item.type}): ${url}`);
        manifest.externalMaterials.push({ title: item.title ?? null, type: item.type, url });
      }
    }
  }

  const filesText = fileIndex.length
    ? fileIndex.map((file) => `- ${file.name} (${formatBytes(file.size)}): ${file.path}`).join("\n")
    : "";

  const imagesText = manifest.images.length
    ? manifest.images.map((image) => `- ${image.alt || "image"} (${formatBytes(image.size)}): ${image.path}`).join("\n")
    : "";

  const externalImagesText = manifest.externalImages.length
    ? manifest.externalImages.map((image) => `- ${image.alt || "image"}: ${image.src}`).join("\n")
    : "";

  const skippedText = [
    ...(pagesSkipped ? [`- Pages skipped: ${pagesSkipped}`] : []),
    ...manifest.skipped.files.map((file) => `- ${file.name}: ${file.reason}`),
    ...manifest.skipped.images.map((image) => `- ${image.src}: ${image.reason}`),
  ].join("\n");

  const materials = [
    `# ${course.name ?? `Course ${courseId}`}`,
    "",
    `Course code: ${course.course_code ?? "not specified"}`,
    `Term: ${course.term?.name ?? "not specified"}`,
    `Fetched: ${manifest.fetchedAt}`,
    `Canvas URL: ${client.baseUrl}`,
    "",
    section("Syllabus", htmlToText(rewrite(course.syllabus_body))),
    section("Front page", htmlToText(rewrite(data.frontPage?.body))),
    section("Modules", modulesText),
    section("Pages", pagesText),
    section("Assignments", assignmentsText),
    section("Discussions", discussionsText),
    section("Announcements", announcementsText),
    section("Files", filesText),
    section("Images", imagesText),
    section("External images", externalImagesText),
    section("External materials", externalLinks.join("\n")),
    section("Skipped", skippedText),
  ].join("\n");

  const materialsPath = path.join(sourcesDir, "materials.md");
  await fs.writeFile(materialsPath, materials.trim() + "\n", "utf8");
  await writeJson(path.join(sourcesDir, "manifest.json"), manifest);

  return {
    ok: true,
    course: pickCourse(course),
    sourcesDir,
    materialsPath,
    filesDir,
    counts: manifest.stats,
    downloadedFiles: downloaded,
    downloadedImages: imageResult.downloaded,
    totalBytes,
    totalSize: formatBytes(totalBytes),
    totalImageBytes: imageResult.totalBytes,
    totalImageSize: formatBytes(imageResult.totalBytes),
    skipped: manifest.skipped.files,
    skippedImages: manifest.skipped.images,
    pagesSkipped,
    truncated: manifest.truncated,
    externalMaterials: manifest.externalMaterials,
    errors,
  };
}

async function main() {
  if (command === "help" || flags.help) {
    respond(
      {
        ok: true,
        commands: [
          "doctor",
          "token-status",
          "token-guide",
          "courses --base-url URL",
          "inspect --base-url URL --course-id ID",
          "workdir --course-name NAME",
          "output-dir --course-name NAME",
          "fetch --base-url URL --course-id ID --out WORKDIR",
          "validate --run-dir DIR --plan PLAN --checks CHECKS",
          "cleanup --work-dir DIR",
          "cleanup-output --dir DIR",
        ],
      },
      [
        "StudySkills canvas script",
        "",
        "Commands:",
        "  doctor",
        "  token-status",
        "  token-guide",
        "  courses --base-url URL",
        "  inspect --base-url URL --course-id ID",
        "  workdir --course-name NAME",
        "  output-dir --course-name NAME",
        "  fetch --base-url URL --course-id ID --out WORKDIR",
        "  validate --run-dir DIR --plan PLAN --checks CHECKS",
        "  cleanup --work-dir DIR",
        "  cleanup-output --dir DIR",
        "",
        "Add --json for machine-readable output.",
      ].join("\n"),
    );
    return;
  }

  if (command === "doctor") {
    const status = await getTokenStatus();
    const documentsDir = await resolveDocumentsDir();
    const token = status.found
      ? { found: true, source: status.source, path: status.path }
      : { found: false, paths: [TOKEN_TXT, TOKEN_ENV], error: status.error ?? null };
    respond(
      {
        ok: true,
        node: process.version,
        platform: process.platform,
        cwd: process.cwd(),
        token,
        documentsDir,
        workRoot: path.join(os.homedir(), ".studyskills", "work"),
      },
      [
        `Node: ${process.version}`,
        `Platform: ${process.platform}`,
        `Token: ${status.found ? `found in ${status.source}` : status.error ? status.error.message : "not found"}`,
        `Documents: ${documentsDir}`,
      ].join("\n"),
    );
    return;
  }

  if (command === "token-status") {
    const status = await getTokenStatus();
    const safe = {
      ok: true,
      found: status.found,
      source: status.source,
      path: status.path,
      paths: [TOKEN_TXT, TOKEN_ENV],
    };
    if (status.error) safe.error = status.error;
    respond(
      safe,
      status.found
        ? `Canvas token found in ${status.path}.`
        : status.error
          ? status.error.message
          : `No Canvas token found.\nLooked in:\n  ${TOKEN_TXT}\n  ${TOKEN_ENV}`,
    );
    return;
  }

  if (command === "token-guide") {
    const guide = await createTokenGuide();
    respond(guide, guide.guide);
    return;
  }

  if (command === "workdir") {
    const courseName = requireFlag("course-name");
    const result = await makeWorkDir(courseName);
    respond({ ok: true, ...result }, `Work directory: ${result.workDir}`);
    return;
  }

  if (command === "output-dir") {
    const courseName = requireFlag("course-name");
    const result = await makeDocumentsRunDir(courseName);
    respond({ ok: true, ...result }, `Output directory: ${result.runDir}`);
    return;
  }

  if (command === "cleanup") {
    const workDir = requireFlag("work-dir");
    const removed = await cleanupWorkDir(workDir);
    respond({ ok: true, removed }, `Removed ${removed}`);
    return;
  }

  if (command === "validate") {
    const runDir = requireFlag("run-dir");
    const planPath = requireFlag("plan");
    const checksPath = requireFlag("checks");
    const result = await validateRun({ runDir, planPath, checksPath });
    respond(result);
    if (!result.ok) process.exitCode = 1;
    return;
  }

  if (command === "cleanup-output") {
    const dir = requireFlag("dir");
    const removed = await cleanupEmptyOutputDir(dir);
    respond({ ok: true, removed }, removed ? `Removed ${dir}` : `${dir} is not empty; kept.`);
    return;
  }

  const tokenStatus = await requireToken().catch((error) => {
    fail(error.code ?? "NO_TOKEN", error.message, { paths: error.paths ?? [TOKEN_TXT, TOKEN_ENV] });
  });

  if (command === "courses") {
    const baseUrl = requireFlag("base-url");
    const client = new CanvasClient({ baseUrl, token: tokenStatus.token });
    const user = await validateToken(client);
    const coursePage = await client.getAllWithMeta("/api/v1/courses", {
      enrollment_state: "active",
      "include[]": "term",
      per_page: 100,
    });
    const courses = coursePage.items;
    const filtered = courses
      .filter((course) => course.workflow_state === "available" && course.access_restricted_by_date !== true)
      .map(pickCourse);
    respond(
      {
        ok: true,
        user: { id: String(user.id), name: user.name ?? null },
        courses: filtered,
        truncated: coursePage.truncated,
      },
      filtered.length
        ? filtered.map((course, index) => `${index + 1}. ${course.name} (${course.courseCode ?? course.id})${course.term ? ` - ${course.term}` : ""}`).join("\n")
        : "No available courses found.",
    );
    return;
  }

  if (command === "inspect") {
    const baseUrl = requireFlag("base-url");
    const courseId = requireFlag("course-id");
    const client = new CanvasClient({ baseUrl, token: tokenStatus.token });
    const result = await inspectCourse(client, courseId);
    respond(result);
    return;
  }

  if (command === "fetch") {
    const baseUrl = requireFlag("base-url");
    const courseId = requireFlag("course-id");
    const workDir = requireFlag("out");
    await ensureDir(workDir);
    const client = new CanvasClient({ baseUrl, token: tokenStatus.token });
    const result = await fetchCourse(client, courseId, workDir);
    respond(result);
    return;
  }

  fail("UNKNOWN_COMMAND", `Unknown command: ${command}`);
}

main().catch((error) => {
  if (error instanceof CanvasError) {
    fail(error.code ?? "CANVAS_ERROR", error.message, {
      status: error.status,
      body: error.body,
    });
  }
  const known = error?.code && error.code !== "ERROR" && error.code !== "CANVAS_ERROR";
  const message = known
    ? error.message
    : redactSecrets(error?.stack ?? error?.message ?? String(error));
  fail(error.code ?? "ERROR", message);
});
