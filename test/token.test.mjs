import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { makeTempDir, cleanupDir, writeTokenFile } from "../test-support/temp.mjs";

const BASE = "https://school.instructure.com";

async function loadTokenModule(home) {
  const previous = process.env.HOME;
  process.env.HOME = home;
  try {
    return await import(
      `../skills/study/canvas-study/scripts/lib/token.mjs?home=${encodeURIComponent(home)}`
    );
  } finally {
    process.env.HOME = previous;
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
    assert.match(status.paths[0], /canvas\/school\.instructure\.com\/token\.txt$/);
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
  return import("../skills/study/canvas-study/scripts/lib/token.mjs").then((mod) => {
    const secret = "abc.def.ghi";
    const text = `Authorization: Bearer ${secret} access_token=${secret}&verifier=${secret}`;
    const redacted = mod.redactSecrets(text, secret);
    assert.equal(redacted.includes(secret), false);
    assert.match(redacted, /\[REDACTED\]/);
    assert.match(redacted, /access_token=\[REDACTED\]/);
    assert.match(redacted, /verifier=\[REDACTED\]/);
  });
});
