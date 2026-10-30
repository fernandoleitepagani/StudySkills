import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import {
  CanvasClient,
  CanvasError,
  assertReadOnlyMethod,
  assertReadOnlyPath,
  normalizeBaseUrl,
  parseNextLink,
} from "../skills/study/canvas-study/scripts/lib/canvas-client.mjs";
import { startMockCanvas } from "../test-support/mock-canvas.mjs";
import { makeTempDir, cleanupDir } from "../test-support/temp.mjs";

test("canvas: normalizes base URLs", () => {
  assert.equal(normalizeBaseUrl("school.instructure.com"), "https://school.instructure.com");
  assert.equal(normalizeBaseUrl("https://school.instructure.com/"), "https://school.instructure.com");
  assert.equal(normalizeBaseUrl("http://localhost:3000"), "http://localhost:3000");
  assert.throws(() => normalizeBaseUrl("ftp://example.com"), /HTTPS|Invalid/);
});

test("canvas: rejects write methods and non-API paths", () => {
  assert.equal(assertReadOnlyMethod("GET"), "GET");
  assert.equal(assertReadOnlyMethod("get"), "GET");
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]) {
    assert.throws(() => assertReadOnlyMethod(method), /read-only/);
  }
  assert.equal(assertReadOnlyPath("/api/v1/courses"), "/api/v1/courses");
  assert.throws(() => assertReadOnlyPath("/admin/users"), /non-Canvas/);
  assert.throws(() => assertReadOnlyPath("/login"), /non-Canvas/);
});

test("canvas: parses Link headers", () => {
  const next = parseNextLink('<https://canvas.example/api/v1/courses?page=2>; rel="next", <https://canvas.example/api/v1/courses?page=1>; rel="first"');
  assert.equal(next, "https://canvas.example/api/v1/courses?page=2");
  assert.equal(parseNextLink(null), null);
  assert.equal(parseNextLink('<https://x.test/a>; rel="prev"'), null);
});

test("canvas: follows pagination and filters nothing at client level", async () => {
  const mock = await startMockCanvas();
  try {
    const client = new CanvasClient({ baseUrl: mock.origin, token: "test-token" });
    const courses = await client.getAll("/api/v1/courses", { per_page: 100 });
    assert.equal(courses.length, 2);
    assert.equal(courses[0].id, 1);
    assert.equal(courses[1].id, 2);
    assert.ok(mock.state.requests.filter((r) => r.path === "/api/v1/courses").length >= 2);
  } finally {
    await mock.close();
  }
});

test("canvas: retries rate-limited requests", async () => {
  const mock = await startMockCanvas();
  try {
    mock.state.rateLimitOnce = true;
    const client = new CanvasClient({ baseUrl: mock.origin, token: "test-token" });
    const user = await client.getJson("/api/v1/users/self");
    assert.equal(user.name, "Test Student");
    assert.equal(mock.state.rateLimitHits, 1);
  } finally {
    await mock.close();
  }
});

test("canvas: rejects invalid token", async () => {
  const mock = await startMockCanvas();
  try {
    const client = new CanvasClient({ baseUrl: mock.origin, token: "wrong-token" });
    await assert.rejects(
      client.getJson("/api/v1/users/self"),
      (error) => error instanceof CanvasError && error.status === 401,
    );
  } finally {
    await mock.close();
  }
});

test("canvas: downloads a file with auth", async () => {
  const mock = await startMockCanvas();
  const dir = await makeTempDir();
  try {
    const client = new CanvasClient({ baseUrl: mock.origin, token: "test-token" });
    const destination = path.join(dir, "lecture.pdf");
    const bytes = await client.download({ id: 10, url: "/api/v1/files/10/download" }, destination);
    assert.equal(bytes > 0, true);
    const content = await fs.readFile(destination, "utf8");
    assert.match(content, /^%PDF/);
  } finally {
    await mock.close();
    await cleanupDir(dir);
  }
});

test("canvas: removes partial file when size cap is exceeded", async () => {
  const mock = await startMockCanvas();
  const dir = await makeTempDir();
  try {
    const client = new CanvasClient({ baseUrl: mock.origin, token: "test-token" });
    const destination = path.join(dir, "lecture.pdf");
    await assert.rejects(
      client.download({ id: 10, url: "/api/v1/files/10/download" }, destination, { maxBytes: 4 }),
      /size limit/,
    );
    await assert.rejects(fs.access(destination));
  } finally {
    await mock.close();
    await cleanupDir(dir);
  }
});
