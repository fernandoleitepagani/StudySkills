# StudySkills

Agent skills for studying, learning, and creating.

Current release: `v1.0.1`.

[![License: MIT](https://img.shields.io/badge/license-MIT-1f3a5f.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-1f3a5f.svg)](https://nodejs.org)

StudySkills is a collection of user-invoked skills for coding agents. Each skill asks the questions it needs through the harness native question UI, shows a plan before doing the work, and writes only the files you request.

The collection covers Canvas courses, lecture notes, flashcards, practice exams, explanations, study planning, note organization, local files, document revision, language learning, active recall, math practice, exam debriefs, programming katas, paper reading, and thesis organization.

## Install

Pick one route per harness. Every skill is self-contained; install the collection or a single skill.

See the full [installation and update guide](./docs/study/installation.md) for GUI steps, WSL notes, verification, and troubleshooting.

### Claude Code

```bash
claude plugin marketplace add fernandoleitepagani/StudySkills
claude plugin install study-skills@studyskills
```

The marketplace refreshes from `main`. Restart Claude Code after installing.

### Codex

```bash
codex plugin marketplace add fernandoleitepagani/StudySkills
```

Then run `/plugins` in Codex, choose the StudySkills marketplace, and install `study-skills`. Restart the GUI or start a new session after installing.

On Windows, use the same Windows or WSL environment as the Codex GUI.

### OpenCode

macOS, Linux, and WSL:

```bash
DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 npx skills@latest add \
  fernandoleitepagani/StudySkills \
  --skill '*' -a opencode -g -y
```

Windows PowerShell:

```powershell
$env:DISABLE_TELEMETRY=1
$env:DO_NOT_TRACK=1
npx -y skills@latest add "fernandoleitepagani/StudySkills" --skill "*" -a opencode -g -y
```

Update with `npx skills@latest update`.

### Update

- Claude Code and Codex: use the plugin manager’s update action, or reinstall.
- OpenCode: `npx skills@latest update`.
- If a GUI still shows the old version, remove and reinstall, then restart it.

## What is included

| Skill | What it does |
| --- | --- |
| [`study-canvas`](./skills/study/study-canvas/README.md) | Fetches a Canvas course read-only and generates study documents. |
| [`study-notes`](./skills/study/study-notes/README.md) | Generates lecture notes or organizes Markdown/Obsidian notes read-only. |
| [`study-recall`](./skills/study/study-recall/README.md) | Builds flashcards or active-recall practice and review schedules. |
| [`study-explain-back`](./skills/study/study-explain-back/README.md) | Explains concepts in layers with the Feynman technique. |
| [`study-exams`](./skills/study/study-exams/README.md) | Creates practice exams or debriefs completed exams. |
| [`study-planner`](./skills/study/study-planner/README.md) | Builds a multi-course schedule or a progressive mastery path. |
| [`study-files`](./skills/study/study-files/README.md) | Turns local folders, files, or attachments into study documents. |
| [`study-revisit`](./skills/study/study-revisit/README.md) | Audits and improves existing study documents without changing originals. |
| [`study-language`](./skills/study/study-language/README.md) | Builds a language-learning path with vocabulary, grammar, drills, and review. |
| [`study-math-practice`](./skills/study/study-math-practice/README.md) | Generates graded math problems with hints and worked solutions. |
| [`study-code-kata`](./skills/study/study-code-kata/README.md) | Generates programming katas with tests and review questions. |
| [`paper-reader`](./skills/study/paper-reader/README.md) | Produces a structured brief and critique of a research paper. |
| [`thesis-organizer`](./skills/study/thesis-organizer/README.md) | Organizes a thesis question, evidence, outline, and writing plan. |

## Why these skills exist

Agents can write study material, but they usually start too early and write too much. StudySkills fixes that by making the agent ask first, plan second, and produce only the requested files.

It also keeps the work local. Sources are read-only, outputs are written to Documents, and the collection has no runtime dependencies.

## Usage

Run a skill by name in Claude Code, OpenCode, or Codex:

```text
/study-canvas
/study-notes
/study-recall
/study-explain-back
/study-exams
/study-planner
/study-files
/study-revisit
/study-language
/study-math-practice
/study-code-kata
/paper-reader
/thesis-organizer
```

Each skill:

1. Asks for the source and preferences.
2. Shows a plan.
3. Waits for approval.
4. Generates only the requested formats.
5. Validates the files.
6. Reports anything skipped, truncated, or replaced.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Supported harnesses

| Harness | CLI | GUI | Native question tool |
| --- | --- | --- | --- |
| Claude Code | Yes | Yes | `AskUserQuestion` |
| OpenCode | Yes | Yes | `question` |
| Codex | Yes | Yes | `request_user_input` |

There is no plan to add other harnesses.

The harness owns PDF, DOCX, and PPTX rendering. If it cannot produce a requested format, the skill writes a Markdown fallback and reports the replacement. Quality checks cover grounding, coverage, accessibility, visual clarity, and format integrity.

## Canvas is read-only

`study-canvas` only performs `GET` requests. It does not submit assignments, post discussions, edit pages, upload files, change account settings, or commit anything to Canvas.

If you ask it to change something in Canvas, it refuses and explains that it is read-only.

## Security and privacy

- Canvas tokens are stored per host under `~/.studyskills/canvas/<host>/`.
- A Canvas PAT can access the whole account. Use a dedicated token and revoke it after use.
- The skill never asks for the token in chat and never prints it.
- Source files are read in place and never copied into Documents.
- Citations use filenames, not absolute paths.
- Course and local-file content is sent only to the harness model that reads it. That is the user's harness choice.
- No telemetry, analytics, or remote logging from the skills.
- Web research is limited to public concepts. The hard do-not-send list forbids source content, filenames, paths, Canvas data, and personal data.
- The skills do not upload files to external services.

## Supported systems

- Linux
- macOS
- Windows native
- WSL, treated as Linux

Use PowerShell commands on native Windows. Use POSIX commands in WSL, Linux, and macOS.

Set `STUDYSKILLS_DOCUMENTS_DIR` if Documents is redirected, for example to OneDrive.

## Requirements

- Node.js 20 or newer in the harness environment.
- A harness that can create the document formats you request.
- For `study-canvas`, a Canvas personal access token with read access.
- Network access only for `study-canvas`.

## Development

StudySkills uses a `dev` branch for work and a stable `main` branch for installs.

```bash
git checkout dev
node --test
npm run check:version
npm run check:skills
```

There are no dependencies to install.

The shared workflow is canonical under `core/` and copied into each skill. After editing `core/`, run:

```bash
node scripts/sync-skills.mjs
```

Commit the generated copies. CI runs the same check.

To link all skills into local harness directories:

```bash
./scripts/link-skills.sh
```

## Output formats

Formats are adaptive:

- Explicit formats win.
- Several explicit formats produce several files.
- With no explicit format, the skill chooses the most useful one.

Typical choices:

| Output | Typical format |
| --- | --- |
| Summary | PDF |
| Study plan | DOCX or PDF |
| Practice exam | PDF |
| Concept map | PPTX or PDF |
| Flashcards | CSV and Markdown |

No prompt pack, no zip, and no extra formats.

## Roadmap

See [roadmap.md](./roadmap.md) for the current roadmap and [roadmap2.md](./roadmap2.md) for the File Study history.

## License

MIT. See [LICENSE](./LICENSE).
