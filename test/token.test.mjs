import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { makeTempDir, cleanupDir, writeTokenFile } from "../test-support/temp.mjs";

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

test("token: reports missing files", async () => {
  const home = await makeTempDir();
  try {
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus();
    assert.equal(status.found, false);
    assert.equal(status.token, null);
    assert.equal(status.paths.length, 2);
    await assert.rejects(mod.requireToken(), (error) => error.code === "NO_TOKEN");
  } finally {
    await cleanupDir(home);
  }
});

test("token: reads canvas-token.txt", async () => {
  const home = await makeTempDir();
  try {
    await writeTokenFile(home, "txt-token");
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus();
    assert.equal(status.found, true);
    assert.equal(status.source, "canvas-token.txt");
    assert.equal(status.token, "txt-token");
  } finally {
    await cleanupDir(home);
  }
});

test("token: reads canvas-token.env when txt is empty", async () => {
  const home = await makeTempDir();
  try {
    await writeTokenFile(home, "", "canvas-token.txt", "");
    await writeTokenFile(home, "", "canvas-token.env", "CANVAS_TOKEN=env-token\n");
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus();
    assert.equal(status.found, true);
    assert.equal(status.source, "canvas-token.env");
    assert.equal(status.token, "env-token");
  } finally {
    await cleanupDir(home);
  }
});

test("token: txt takes precedence over env", async () => {
  const home = await makeTempDir();
  try {
    await writeTokenFile(home, "txt-token");
    await writeTokenFile(home, "", "canvas-token.env", "CANVAS_TOKEN=env-token\n");
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus();
    assert.equal(status.source, "canvas-token.txt");
    assert.equal(status.token, "txt-token");
  } finally {
    await cleanupDir(home);
  }
});

test("token: strips BOM, whitespace, and quotes", async () => {
  const home = await makeTempDir();
  try {
    await writeTokenFile(home, "", "canvas-token.txt", '\uFEFF  "quoted-token"  \n');
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus();
    assert.equal(status.token, "quoted-token");
  } finally {
    await cleanupDir(home);
  }
});

test("token: guide creates an empty 0600 token file", async () => {
  const home = await makeTempDir();
  try {
    const mod = await loadTokenModule(home);
    const result = await mod.createTokenGuide();
    assert.equal(result.created, true);
    const stat = await fs.stat(result.tokenFile);
    assert.equal(stat.size, 0);
    if (process.platform !== "win32") {
      assert.equal(stat.mode & 0o777, 0o600);
    }
    assert.match(result.guide, /canvas-token\.txt/);
    assert.match(result.guide, /CANVAS_TOKEN/);
    const status = await mod.getTokenStatus();
    assert.equal(status.found, false);
  } finally {
    await cleanupDir(home);
  }
});

test("token: reports an unreadable token path", async () => {
  const home = await makeTempDir();
  try {
    const dir = path.join(home, ".studyskills", "canvas-token.txt");
    await fs.mkdir(dir, { recursive: true });
    const mod = await loadTokenModule(home);
    const status = await mod.getTokenStatus();
    assert.equal(status.found, false);
    assert.equal(status.error.code, "UNREADABLE_TOKEN_FILE");
    await assert.rejects(mod.createTokenGuide(), /directory/);
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
