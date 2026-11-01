import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
const defaultRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const root = rootIndex >= 0 ? path.resolve(args[rootIndex + 1]) : defaultRoot;

const files = {
  package: path.join(root, "package.json"),
  claude: path.join(root, ".claude-plugin/plugin.json"),
  codex: path.join(root, ".codex-plugin/plugin.json"),
};

const versions = {};
for (const [name, file] of Object.entries(files)) {
  const parsed = JSON.parse(await fs.readFile(file, "utf8"));
  versions[name] = parsed.version;
}

const expected = versions.package;
const mismatches = Object.entries(versions).filter(([, version]) => version !== expected);
if (mismatches.length) {
  for (const [name, version] of mismatches) {
    console.error(`Version mismatch: package.json=${expected} ${name}=${version}`);
  }
  process.exit(1);
}

console.log(`Version sync OK: ${expected}`);
