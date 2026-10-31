#!/usr/bin/env node
import path from "node:path";
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
} from "./lib/token.mjs";
import {
  ensureDir,
  formatBytes,
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


const CHOICE_LIMIT = 100;

function choiceValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function matchesAny(item, keys, terms) {
  const values = keys.map((key) => choiceValue(typeof key === "function" ? key(item) : item?.[key])).filter(Boolean);
  return terms.some((term) => values.includes(term));
}

function buildChoices(data, allowed) {
  const cut = (items) => items.slice(0, CHOICE_LIMIT);
  const modules = cut(data.modules).map((mod) => ({
    id: String(mod.id),
    name: mod.name ?? `Module ${mod.id}`,
    itemCount: mod.items?.length ?? 0,
  }));
  const pages = cut(data.pagesList).map((page) => ({
    id: String(page.url),
    title: page.title ?? page.url,
    url: page.url,
  }));
  const assignments = cut(data.assignments).map((item) => ({
    id: String(item.id),
    name: item.name ?? `Assignment ${item.id}`,
  }));
  const discussions = cut(data.discussions).map((item) => ({
    id: String(item.id),
    title: item.title ?? `Discussion ${item.id}`,
  }));
  const announcements = cut(data.announcements).map((item) => ({
    id: String(item.id),
    title: item.title ?? `Announcement ${item.id}`,
  }));
  const files = cut(allowed).map((file) => ({
    id: String(file.id),
    name: String(file.filename ?? file.display_name ?? `file-${file.id}`),
    size: formatBytes(fileSize(file)),
  }));
  return {
    modules,
    pages,
    assignments,
    discussions,
    announcements,
    files,
    includeSyllabus: Boolean(data.course?.syllabus_body),
    includeFrontPage: Boolean(data.frontPage),
    truncated: {
      modules: data.modules.length > CHOICE_LIMIT,
      pages: data.pagesList.length > CHOICE_LIMIT,
      assignments: data.assignments.length > CHOICE_LIMIT,
      discussions: data.discussions.length > CHOICE_LIMIT,
      announcements: data.announcements.length > CHOICE_LIMIT,
      files: allowed.length > CHOICE_LIMIT,
    },
  };
}

function normalizeSelection(input) {
  if (!input) return null;
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new CanvasError("Selection must be an object.", { code: "INVALID_SELECTION" });
  }
  const mode = String(input.mode ?? "specific").toLowerCase();
  if (!["everything", "specific"].includes(mode)) {
    throw new CanvasError("Selection mode must be everything or specific.", { code: "INVALID_SELECTION" });
  }
  const categories = ["modules", "pages", "assignments", "discussions", "announcements", "files"];
  const result = { mode };
  for (const category of categories) {
    const value = input[category];
    if (value === undefined) result[category] = [];
    else if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
      throw new CanvasError(`Selection ${category} must be an array of names or IDs.`, { code: "INVALID_SELECTION" });
    } else {
      result[category] = value.map((item) => item.trim()).filter(Boolean);
    }
  }
  result.includeSyllabus = input.includeSyllabus === true;
  result.includeFrontPage = input.includeFrontPage === true;
  if (mode === "specific" && categories.every((category) => result[category].length === 0) && !result.includeSyllabus && !result.includeFrontPage) {
    throw new CanvasError("Specific selection is empty.", { code: "EMPTY_SELECTION" });
  }
  return result;
}

function filterByTerms(items, terms, keys, label, missing) {
  if (terms.length === 0) return [];
  const normalized = terms.map(choiceValue);
  const result = items.filter((item) => matchesAny(item, keys, normalized));
  const matched = new Set();
  for (const item of result) {
    for (const term of normalized) {
      if (matchesAny(item, keys, [term])) matched.add(term);
    }
  }
  for (const term of normalized) {
    if (!matched.has(term)) missing.push({ category: label, value: terms[normalized.indexOf(term)] });
  }
  return result;
}

function applySelection(data, selection) {
  if (!selection || selection.mode === "everything") {
    return { ...data, selection: selection ?? { mode: "everything" } };
  }
  const missing = [];
  const modules = filterByTerms(data.modules, selection.modules, ["name", "id"], "modules", missing);
  const pages = filterByTerms(data.pagesList, selection.pages, ["title", "url", "id"], "pages", missing);
  const assignments = filterByTerms(data.assignments, selection.assignments, ["name", "id"], "assignments", missing);
  const discussions = filterByTerms(data.discussions, selection.discussions, ["title", "id"], "discussions", missing);
  const announcements = filterByTerms(data.announcements, selection.announcements, ["title", "id"], "announcements", missing);
  const files = filterByTerms(data.files, selection.files, ["filename", "display_name", "id"], "files", missing);
  if (missing.length) {
    throw new CanvasError(`Selection did not match: ${missing.map((item) => `${item.category}/${item.value}`).join(", ")}`, {
      code: "SELECTION_NOT_FOUND",
      body: { missing },
    });
  }
  return {
    ...data,
    course: {
      ...data.course,
      syllabus_body: selection.includeSyllabus ? data.course.syllabus_body : null,
    },
    frontPage: selection.includeFrontPage ? data.frontPage : null,
    modules,
    pagesList: pages,
    assignments,
    discussions,
    announcements,
    files,
    selection,
  };
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
    choices: buildChoices(data, allowed),
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

async function fetchCourse(client, courseId, workDir, selection = null) {
  const errors = [];
  const truncations = {};
  let data = await loadCourseLists(client, courseId, { errors, truncations, progressLabel: "Fetching" });
  data = applySelection(data, selection);
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
    selection: data.selection ?? selection ?? { mode: "everything" },
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
    selection: data.selection ?? selection ?? { mode: "everything" },
    errors,
  };
}

async function main() {
  if (command === "help" || flags.help) {
    respond(
      {
        ok: true,
        commands: [
          "token-status --base-url URL",
          "token-guide --base-url URL",
          "courses --base-url URL",
          "inspect --base-url URL --course-id ID",
          "fetch --base-url URL --course-id ID --out WORKDIR [--selection FILE]",
          "validate --base-url URL --run-dir DIR --plan PLAN --checks CHECKS",
        ],
        core: "Use scripts/core.mjs for doctor, workdir, output-dir, validate, cleanup, and cleanup-output.",
      },
      [
        "StudySkills canvas script",
        "",
        "Commands:",
        "  token-status --base-url URL",
        "  token-guide --base-url URL",
        "  courses --base-url URL",
        "  inspect --base-url URL --course-id ID",
        "  fetch --base-url URL --course-id ID --out WORKDIR [--selection FILE]",
        "  validate --base-url URL --run-dir DIR --plan PLAN --checks CHECKS",
        "",
        "Core commands: use scripts/core.mjs for doctor, workdir, output-dir,",
        "validate, cleanup, and cleanup-output.",
        "",
        "Add --json for machine-readable output.",
      ].join("\n"),
    );
    return;
  }

  if (command === "token-status") {
    const baseUrl = requireFlag("base-url");
    const status = await getTokenStatus(baseUrl);
    const safe = {
      ok: true,
      found: status.found,
      source: status.source,
      path: status.path,
      paths: status.paths ?? [],
      legacy: status.legacy ?? false,
      ageDays: status.ageDays ?? null,
      stale: status.stale ?? false,
      warning: status.warning ?? null,
    };
    if (status.error) safe.error = status.error;
    respond(
      safe,
      status.found
        ? [
            `Canvas token found in ${status.path}.`,
            status.legacy ? "This is a legacy global token; move it to the host-specific path." : "",
            status.warning ?? "",
          ].filter(Boolean).join("\n")
        : status.error
          ? status.error.message
          : `No Canvas token found.\nLooked in:\n  ${(status.paths ?? []).join("\n  ")}`,
    );
    return;
  }

  if (command === "token-guide") {
    const baseUrl = requireFlag("base-url");
    const guide = await createTokenGuide(baseUrl);
    respond(guide, guide.guide);
    return;
  }

  if (command === "courses") {
    const baseUrl = requireFlag("base-url");
    const tokenStatus = await requireToken(baseUrl).catch((error) => {
      fail(error.code ?? "NO_TOKEN", error.message, { paths: error.paths ?? [] });
    });
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
    const tokenStatus = await requireToken(baseUrl).catch((error) => {
      fail(error.code ?? "NO_TOKEN", error.message, { paths: error.paths ?? [] });
    });
    const client = new CanvasClient({ baseUrl, token: tokenStatus.token });
    const result = await inspectCourse(client, courseId);
    respond(result);
    return;
  }

  if (command === "fetch") {
    const baseUrl = requireFlag("base-url");
    const courseId = requireFlag("course-id");
    const workDir = requireFlag("out");
    const selectionPath = flags.selection && flags.selection !== true ? String(flags.selection) : null;
    let selection = null;
    if (selectionPath) {
      try {
        selection = normalizeSelection(JSON.parse(await fs.readFile(selectionPath, "utf8")));
      } catch (error) {
        fail(error.code ?? "INVALID_SELECTION", error.message);
      }
    }
    await ensureDir(workDir);
    const tokenStatus = await requireToken(baseUrl).catch((error) => {
      fail(error.code ?? "NO_TOKEN", error.message, { paths: error.paths ?? [] });
    });
    const client = new CanvasClient({ baseUrl, token: tokenStatus.token });
    const result = await fetchCourse(client, courseId, workDir, selection);
    respond(result);
    return;
  }

  if (command === "validate") {
    const baseUrl = requireFlag("base-url");
    const runDir = requireFlag("run-dir");
    const planPath = requireFlag("plan");
    const checksPath = requireFlag("checks");
    const tokenStatus = await requireToken(baseUrl).catch((error) => {
      fail(error.code ?? "NO_TOKEN", error.message, { paths: error.paths ?? [] });
    });
    const result = await validateRun({ runDir, planPath, checksPath, token: tokenStatus.token });
    respond(result);
    if (!result.ok) process.exitCode = 1;
    return;
  }

  fail("UNKNOWN_COMMAND", `Unknown command: ${command}`);
}

main().catch((error) => {
  if (error instanceof CanvasError) {
    if (error.code === "UNAUTHORIZED") {
      const hint = "Canvas rejected the token. The most likely cause is expiry; Canvas tokens commonly expire after 30 days. Create a new token, replace the value in the host-specific token file, and try again. If it still fails, check that the token belongs to this Canvas host and was not revoked.";
      fail(error.code, `${error.message}\n\n${hint}`, {
        status: error.status,
        body: error.body,
        hint,
      });
    }
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
