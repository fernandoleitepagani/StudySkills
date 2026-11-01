import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs/promises";
import { REPO_ROOT } from "../test-support/temp.mjs";

async function readJson(relative) {
  return JSON.parse(await fs.readFile(path.join(REPO_ROOT, relative), "utf8"));
}

async function exists(relative) {
  try {
    await fs.access(path.join(REPO_ROOT, relative));
    return true;
  } catch {
    return false;
  }
}

test("marketplaces: Claude and Codex manifests are present and versioned", async () => {
  const pkg = await readJson("package.json");
  const claudePlugin = await readJson(".claude-plugin/plugin.json");
  const claudeMarket = await readJson(".claude-plugin/marketplace.json");
  const codexPlugin = await readJson(".codex-plugin/plugin.json");
  const codexMarket = await readJson(".agents/plugins/marketplace.json");

  assert.equal(claudePlugin.version, pkg.version);
  assert.equal(codexPlugin.version, pkg.version);
  assert.equal(claudeMarket.plugins.some((plugin) => plugin.name === "study-skills"), true);
  assert.equal(codexMarket.plugins.some((plugin) => plugin.name === "study-skills"), true);
  assert.equal(codexMarket.plugins[0].source.path, "./");
  assert.match(codexPlugin.skills, /^\.\/skills\/study\/$/);
  assert.equal(await exists(codexPlugin.skills.slice(2)), true);
  assert.equal(await exists(".codex-plugin/plugin.json"), true);
  assert.equal(await exists(".agents/plugins/marketplace.json"), true);
  assert.equal(await exists("skills/study/study-core"), false);

  assert.equal(claudePlugin.icon, "./assets/studyskills-icon.png");
  assert.equal(codexPlugin.interface.composerIcon, "./assets/studyskills-icon.png");
  assert.equal(codexPlugin.interface.logo, "./assets/studyskills-icon.png");
  assert.equal(await exists("assets/studyskills-icon.png"), true);
  assert.equal(await exists("assets/studyskills-banner-1280x640.png"), true);

  const readme = await fs.readFile(path.join(REPO_ROOT, "README.md"), "utf8");
  assert.match(readme, /assets\/studyskills-banner-1280x640\.png/);
});
