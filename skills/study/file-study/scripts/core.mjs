#!/usr/bin/env node
import path from "node:path";
import os from "node:os";
import {
  cleanupEmptyOutputDir,
  cleanupWorkDir,
  makeDocumentsRunDir,
  makeWorkDir,
  resolveDocumentsDir,
} from "./lib/files.mjs";
import { validateRun } from "./lib/validate.mjs";
import { inventory } from "./lib/inventory.mjs";

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      const value = next !== undefined && !next.startsWith("--") ? next : true;
      if (key === "path") {
        if (!Array.isArray(flags.path)) flags.path = [];
        if (value !== true) flags.path.push(value);
      } else {
        flags[key] = value;
      }
      if (value !== true) i += 1;
    } else {
      positional.push(arg);
    }
  }
  return { command: positional[0] ?? "help", flags };
}

const { command, flags } = parseArgs(process.argv.slice(2));
const json = Boolean(flags.json);

function print(value) {
  if (json) {
    process.stdout.write(JSON.stringify(value, null, 2) + "\n");
  } else if (typeof value === "string") {
    process.stdout.write(value + "\n");
  } else {
    process.stdout.write(JSON.stringify(value, null, 2) + "\n");
  }
}

function fail(code, message) {
  const payload = { ok: false, code, message };
  if (json) process.stderr.write(JSON.stringify(payload, null, 2) + "\n");
  else process.stderr.write(message + "\n");
  process.exit(1);
}

function requireFlag(name) {
  const value = flags[name];
  if (!value || value === true) fail("MISSING_ARGUMENT", `Missing --${name}.`);
  return String(value);
}

const help = {
  ok: true,
  commands: [
    "doctor",
    "workdir --topic NAME",
    "output-dir --topic NAME",
    "validate --run-dir DIR --plan PLAN --checks CHECKS",
    "cleanup --work-dir DIR",
    "cleanup-output --dir DIR",
    "inventory --pack DIR",
    "inventory --path PATH [--path PATH ...]",
  ],
};

async function main() {
  if (command === "help" || flags.help) {
    print(json ? help : [
      "StudySkills core",
      "",
      "Commands:",
      ...help.commands.map((item) => `  ${item}`),
      "",
      "Add --json for machine-readable output.",
    ].join("\n"));
    return;
  }

  if (command === "doctor") {
    const documentsDir = await resolveDocumentsDir();
    print({
      ok: true,
      node: process.version,
      platform: process.platform,
      cwd: process.cwd(),
      documentsDir,
      workRoot: path.join(os.homedir(), ".studyskills", "work"),
      core: "vendored-core",
    });
    return;
  }

  if (command === "workdir") {
    const topic = requireFlag("topic");
    const result = await makeWorkDir(topic);
    print({ ok: true, ...result });
    return;
  }

  if (command === "output-dir") {
    const topic = requireFlag("topic");
    const result = await makeDocumentsRunDir(topic);
    print({ ok: true, ...result });
    return;
  }

  if (command === "validate") {
    const runDir = requireFlag("run-dir");
    const planPath = requireFlag("plan");
    const checksPath = requireFlag("checks");
    const tokenFile = flags["token-file"] && flags["token-file"] !== true ? String(flags["token-file"]) : null;
    const token = tokenFile ? (await import("node:fs/promises")).readFile(tokenFile, "utf8").then((value) => value.trim()) : null;
    const result = await validateRun({ runDir, planPath, checksPath, token: token ? await token : null });
    print(result);
    if (!result.ok) process.exitCode = 1;
    return;
  }

  if (command === "cleanup") {
    const workDir = requireFlag("work-dir");
    const removed = await cleanupWorkDir(workDir);
    print({ ok: true, removed });
    return;
  }

  if (command === "cleanup-output") {
    const dir = requireFlag("dir");
    const removed = await cleanupEmptyOutputDir(dir);
    print({ ok: true, removed });
    return;
  }

  if (command === "inventory") {
    const pack = flags.pack && flags.pack !== true ? String(flags.pack) : null;
    const paths = Array.isArray(flags.path) ? flags.path : [];
    if (!pack && paths.length === 0) {
      fail("MISSING_ARGUMENT", "Use --pack DIR or at least one --path PATH.");
    }
    const result = await inventory({ pack, paths });
    print(result);
    return;
  }

  fail("UNKNOWN_COMMAND", `Unknown command: ${command}`);
}

main().catch((error) => fail(error.code ?? "ERROR", error.message ?? String(error)));
