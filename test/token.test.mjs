import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { makeTempDir, cleanupDir, writeTokenFile } from "../test-support/temp.mjs";
import { startMockCanvas } from "../test-support/mock-canvas.mjs";
import {
  canvasSettingsUrl,
  sanitizeToken,
  saveToken,
} from "../skills/study/study-canvas/scripts/lib/token-setup.mjs";

const BASE = "https://school.instructure.com";

async function loadTokenModule(home) {
  const previousHome = process.env.HOME;
  const previousProfile = process.env.USERPROFILE;
  process.env.HOME = home;
  process.env.USERPROFILE = home;
  try {
    return await import(
      `../skills/study/study-canvas/scripts/lib/token.mjs?home=${encodeURIComponent(home)}`
    );
  } finally {
    process.env.HOME = previousHome;
    if (previousProfile === undefined) delete process.env.USERPROFILE;
    else process.env.USERPROFILE = previousProfile;
  }
}

async function writeHostToken(home, baseUrl, contents) {
  const mod = await loadTokenModule(home);
  const paths = mod.tokenPaths(baseUrl);
  await fs.mkdir(paths.directory, { recursive: true });
  await fs.writeFile(paths.txt, contents, "utf8");
  return paths;
}

test("token: reports missing host-specific files", async () => {
  const home = await makeTempDir();
  try {
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus(BASE);
    assert.equal(status.found, false);
    assert.equal(status.token, null);
    assert.equal(status.host, "school.instructure.com");
    assert.equal(status.paths.length, 2);
    assert.match(status.paths[0].replace(/\\/g, "/"), /canvas\/school\.instructure\.com\/token\.txt$/);
    await assert.rejects(mod.requireToken(BASE), (error) => error.code === "NO_TOKEN");
  } finally {
    await cleanupDir(home);
  }
});

test("token: reads host-specific token.txt", async () => {
  const home = await makeTempDir();
  try {
    const paths = await writeHostToken(home, BASE, "host-token");
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus(BASE);
    assert.equal(status.found, true);
    assert.equal(status.source, "token.txt");
    assert.equal(status.token, "host-token");
    assert.equal(status.legacy, false);
    assert.equal(status.path, paths.txt);
  } finally {
    await cleanupDir(home);
  }
});

test("token: reads host-specific token.env", async () => {
  const home = await makeTempDir();
  try {
    const mod = await loadTokenModule(home);
    const paths = mod.tokenPaths(BASE);
    await fs.mkdir(paths.directory, { recursive: true });
    await fs.writeFile(paths.env, "CANVAS_TOKEN=env-token\n", "utf8");
    const status = await mod.getTokenStatus(BASE);
    assert.equal(status.found, true);
    assert.equal(status.source, "token.env");
    assert.equal(status.token, "env-token");
  } finally {
    await cleanupDir(home);
  }
});

test("token: host-specific token takes precedence over legacy", async () => {
  const home = await makeTempDir();
  try {
    await writeTokenFile(home, "legacy-token");
    await writeHostToken(home, BASE, "host-token");
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus(BASE);
    assert.equal(status.token, "host-token");
    assert.equal(status.legacy, false);
  } finally {
    await cleanupDir(home);
  }
});

test("token: legacy global token is a migration fallback", async () => {
  const home = await makeTempDir();
  try {
    await writeTokenFile(home, "legacy-token");
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus(BASE);
    assert.equal(status.found, true);
    assert.equal(status.token, "legacy-token");
    assert.equal(status.legacy, true);
    assert.match(status.source, /legacy/);
  } finally {
    await cleanupDir(home);
  }
});

test("token: strips BOM, whitespace, and quotes", async () => {
  const home = await makeTempDir();
  try {
    await writeHostToken(home, BASE, '\uFEFF  "quoted-token"  \n');
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus(BASE);
    assert.equal(status.token, "quoted-token");
  } finally {
    await cleanupDir(home);
  }
});

test("token: guide creates a host-specific empty 0600 token file", async () => {
  const home = await makeTempDir();
  try {
    const mod = await loadTokenModule(home);
    const result = await mod.createTokenGuide(BASE);
    assert.equal(result.created, true);
    assert.equal(result.host, "school.instructure.com");
    const stat = await fs.stat(result.tokenFile);
    assert.equal(stat.size, 0);
    if (process.platform !== "win32") assert.equal(stat.mode & 0o777, 0o600);
    assert.match(result.guide, /full account|whole account/i);
    assert.match(result.guide, /revoke/i);
    assert.match(result.guide, /school\.instructure\.com/);
    assert.match(result.guide, /stopped working/);
    assert.match(result.guide, /30 days/);
    const status = await mod.getTokenStatus(BASE);
    assert.equal(status.found, false);
  } finally {
    await cleanupDir(home);
  }
});

test("token: reports an unreadable host token path", async () => {
  const home = await makeTempDir();
  try {
    const dir = path.join(home, ".studyskills", "canvas", "school.instructure.com", "token.txt");
    await fs.mkdir(dir, { recursive: true });
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus(BASE);
    assert.equal(status.found, false);
    assert.equal(status.error.code, "UNREADABLE_TOKEN_FILE");
    await assert.rejects(mod.createTokenGuide(BASE), /directory/);
  } finally {
    await cleanupDir(home);
  }
});

test("token: redacts bearer tokens and query secrets", () => {
  return import("../skills/study/study-canvas/scripts/lib/token.mjs").then((mod) => {
    const secret = "abc.def.ghi";
    const text = `Authorization: Bearer ${secret} access_token=${secret}&verifier=${secret}`;
    const redacted = mod.redactSecrets(text, secret);
    assert.equal(redacted.includes(secret), false);
    assert.match(redacted, /\[REDACTED\]/);
    assert.match(redacted, /access_token=\[REDACTED\]/);
    assert.match(redacted, /verifier=\[REDACTED\]/);
  });
});

test("token: warns when the token file is 30 or more days old", async () => {
  const home = await makeTempDir();
  try {
    const paths = await writeHostToken(home, BASE, "old-token");
    const old = new Date(Date.now() - 31 * 86400000);
    await fs.utimes(paths.txt, old, old);
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus(BASE);
    assert.equal(status.found, true);
    assert.equal(status.stale, true);
    assert.ok(status.ageDays >= 30);
    assert.match(status.warning, /30 days/);
  } finally {
    await cleanupDir(home);
  }
});

test("token-setup: sanitizes quoted, bearer, and whitespace values", () => {
  assert.equal(sanitizeToken("  1234~abc_DEF-ghi+/=  "), "1234~abc_DEF-ghi+/=");
  assert.equal(sanitizeToken('\uFEFF "Bearer 1234~abcdef" '), "1234~abcdef");
  assert.equal(sanitizeToken('Bearer "1234~abcdef"'), "1234~abcdef");
});

test("token-setup: rejects values that are not a single token", () => {
  const cases = [
    ["", "TOKEN_EMPTY"],
    ["short", "TOKEN_TOO_SHORT"],
    ["1234~abc\ndef", "TOKEN_MULTILINE"],
    ["1234~abc def", "TOKEN_WHITESPACE"],
    ["https://school.instructure.com", "TOKEN_LOOKS_LIKE_URL"],
    ["x".repeat(4097), "TOKEN_TOO_LONG"],
    ["1234~abc\u00e9def", "TOKEN_INVALID_CHARS"],
  ];
  for (const [value, code] of cases) {
    assert.throws(() => sanitizeToken(value), (error) => error.code === code, code);
  }
});

test("token-setup: builds the Canvas settings URL", () => {
  assert.equal(
    canvasSettingsUrl("https://school.instructure.com"),
    "https://school.instructure.com/profile/settings",
  );
  assert.equal(
    canvasSettingsUrl("school.instructure.com/canvas?x=1#y"),
    "https://school.instructure.com/canvas/profile/settings",
  );
});

test("token-setup: validates and writes a token with 0600", async () => {
  const home = await makeTempDir();
  const mock = await startMockCanvas();
  const tokenFile = path.join(home, ".studyskills", "canvas", "mock", "token.txt");
  try {
    const result = await saveToken({ baseUrl: mock.origin, token: "test-token", tokenFile });
    assert.equal(result.user.name, "Test Student");
    assert.equal(result.path, tokenFile);
    assert.equal(JSON.stringify(result).includes("test-token"), false);
    assert.equal(await fs.readFile(tokenFile, "utf8"), "test-token\n");
    if (process.platform !== "win32") {
      assert.equal((await fs.stat(tokenFile)).mode & 0o777, 0o600);
    }
  } finally {
    await mock.close();
    await cleanupDir(home);
  }
});

test("token-setup: a rejected token leaves the existing file untouched", async () => {
  const home = await makeTempDir();
  const mock = await startMockCanvas({ token: "right-token" });
  const tokenFile = path.join(home, ".studyskills", "canvas", "mock", "token.txt");
  try {
    await fs.mkdir(path.dirname(tokenFile), { recursive: true });
    await fs.writeFile(tokenFile, "old-token\n", "utf8");
    await assert.rejects(
      saveToken({ baseUrl: mock.origin, token: "wrong-token", tokenFile }),
      (error) => error.code === "UNAUTHORIZED" && !String(error.message).includes("wrong-token"),
    );
    assert.equal(await fs.readFile(tokenFile, "utf8"), "old-token\n");
  } finally {
    await mock.close();
    await cleanupDir(home);
  }
});

test("token-setup: refuses a directory at the token path", async () => {
  const home = await makeTempDir();
  const mock = await startMockCanvas();
  const tokenFile = path.join(home, ".studyskills", "canvas", "mock", "token.txt");
  try {
    await fs.mkdir(tokenFile, { recursive: true });
    await assert.rejects(
      saveToken({ baseUrl: mock.origin, token: "test-token", tokenFile }),
      (error) => error.code === "TOKEN_PATH_NOT_FILE",
    );
  } finally {
    await mock.close();
    await cleanupDir(home);
  }
});
