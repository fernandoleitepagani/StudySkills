import fs from "node:fs/promises";

const pkg = JSON.parse(await fs.readFile(new URL("../package.json", import.meta.url), "utf8"));
const plugin = JSON.parse(await fs.readFile(new URL("../.claude-plugin/plugin.json", import.meta.url), "utf8"));

if (pkg.version !== plugin.version) {
  console.error(`Version mismatch: package.json=${pkg.version} plugin.json=${plugin.version}`);
  process.exit(1);
}

console.log(`Version sync OK: ${pkg.version}`);
