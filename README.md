# StudySkills

Agent skills for studying, learning, and creating.

Current release: `v0.4.4`.

[![License: MIT](https://img.shields.io/badge/license-MIT-1f3a5f.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-1f3a5f.svg)](https://nodejs.org)

StudySkills is a collection of user-invoked skills for coding agents. Each skill asks the questions it needs through the harness native question UI, shows a plan before doing the work, and writes only the files you request.

The collection covers Canvas courses, lecture notes, flashcards, practice exams, explanations, study planning, note organization, and local files.

## Install

Pick one route per harness. Do not install both the plugin and the copied skills for the same harness.

Every skill is self-contained. Install the whole collection or a single skill.

### Claude Code

```bash
claude plugin marketplace add fernandoleitepagani/StudySkills
claude plugin install study-skills@studyskills
```

The marketplace refreshes from `main`.

### Codex

```bash
codex plugin marketplace add fernandoleitepagani/StudySkills
codex plugin add study-skills@studyskills
```

The Codex marketplace refreshes from `main`.

### OpenCode

```bash
DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 npx skills@latest add \
  fernandoleitepagani/StudySkills \
  --skill '*' -a opencode -g -y
```

Update later with:

```bash
npx skills@latest update
```

## What is included

| Skill | What it does |
| --- | --- |
| `canvas-study` | Fetches a Canvas course read-only and generates study documents. |
| `lecture-notes` | Turns lecture slides, transcripts, or notes into structured notes. |
| `flashcard-forge` | Creates Anki-ready CSV and Markdown flashcards. |
| `explain-back` | Explains concepts in layers with the Feynman technique. |
| `exam-sim` | Generates timed practice exams and optional review schedules. |
| `study-planner` | Plans multiple courses around deadlines and weekly hours. |
| `note-organizer` | Organizes Markdown and Obsidian notes read-only. |
| `file-study` | Turns local folders, files, or attachments into study documents. |

## Why these skills exist

Agents can write study material, but they usually start too early and write too much. StudySkills fixes that by making the agent ask first, plan second, and produce only the requested files.

It also keeps the work local. Sources are read-only, outputs are written to Documents, and the collection has no runtime dependencies.

## Usage

Run a skill by name in Claude Code, OpenCode, or Codex:

```text
/canvas-study
/lecture-notes
/flashcard-forge
/explain-back
/exam-sim
/study-planner
/note-organizer
/file-study
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

The harness owns PDF, DOCX, and PPTX rendering. If it cannot produce a requested format, the skill writes a Markdown fallback and reports the replacement.

## Canvas is read-only

`canvas-study` only performs `GET` requests. It does not submit assignments, post discussions, edit pages, upload files, change account settings, or commit anything to Canvas.

If you ask it to change something in Canvas, it refuses and explains that it is read-only.

## Security and privacy

- Canvas tokens are stored per host under `~/.studyskills/canvas/<host>/`.
- A Canvas PAT can access the whole account. Use a dedicated token and revoke it after use.
- The skill never asks for the token in chat and never prints it.
- Source files are read in place and never copied into Documents.
- Citations use filenames, not absolute paths.
- Course and local-file content is sent only to the harness model that reads it. That is the user's harness choice.
- No telemetry, analytics, or remote logging from the skills.
- The skills do not upload files to external services.

## Requirements

- Node.js 20 or newer in the harness environment.
- A harness that can create the document formats you request.
- For `canvas-study`, a Canvas personal access token with read access.
- Network access only for `canvas-study`.

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
