# StudySkills

Study skills for Claude Code, OpenCode, and Codex.

Current release: `v1.1.0`.

[![License: MIT](https://img.shields.io/badge/license-MIT-1f3a5f.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-1f3a5f.svg)](https://nodejs.org)

You run a StudySkills skill, and the agent asks what it needs before it starts. It shows a plan, waits for approval, then writes only the files you request.

The collection handles Canvas courses, lecture notes, flashcards, practice exams, explanations, study planning, note organization, local files, revision, language learning, active recall, math practice, exam debriefs, programming katas, paper reading, and thesis organization.

## Install

Choose one request per harness. Install the whole collection or one skill.

The [installation and update guide](./docs/study/installation.md) covers GUI steps, WSL, verification, and troubleshooting.

### Claude Code

```bash
claude plugin marketplace add fernandoleitepagani/StudySkills
claude plugin install study-skills@studyskills
```

Restart Claude Code after installation. The marketplace follows `main`.

### Codex

```bash
codex plugin marketplace add fernandoleitepagani/StudySkills
```

Open `/plugins` in Codex, pick the StudySkills marketplace, and install `study-skills`. Restart the GUI or open a new session.

On Windows, run the command in the same Windows or WSL environment as the GUI.

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

Claude Code and Codex use their plugin update action. Reinstall if the GUI keeps an old copy. OpenCode uses `npx skills@latest update`. Restart the harness after any update.

## What is included

| Skill | What it does |
| --- | --- |
| [`study-canvas`](./skills/study/study-canvas/README.md) | Reads a Canvas course and writes study documents. |
| [`study-notes`](./skills/study/study-notes/README.md) | Writes lecture notes or organizes a Markdown/Obsidian vault. |
| [`study-recall`](./skills/study/study-recall/README.md) | Builds flashcards or active-recall sessions. |
| [`study-explain-back`](./skills/study/study-explain-back/README.md) | Explains a concept from ELI5 to expert level. |
| [`study-exams`](./skills/study/study-exams/README.md) | Creates exams or reviews a finished attempt. |
| [`study-planner`](./skills/study/study-planner/README.md) | Builds a course schedule or a mastery path. |
| [`study-files`](./skills/study/study-files/README.md) | Turns local files and folders into study documents. |
| [`study-revisit`](./skills/study/study-revisit/README.md) | Audits and revises earlier StudySkills documents. |
| [`study-language`](./skills/study/study-language/README.md) | Builds a language-learning plan with practice and review. |
| [`study-math-practice`](./skills/study/study-math-practice/README.md) | Writes math problems with hints and worked solutions. |
| [`study-code-kata`](./skills/study/study-code-kata/README.md) | Writes programming katas with tests and review questions. |
| [`paper-reader`](./skills/study/paper-reader/README.md) | Turns a research paper into a structured brief and critique. |
| [`thesis-organizer`](./skills/study/thesis-organizer/README.md) | Shapes a thesis question, evidence, outline, and writing plan. |

## Why these skills exist

Most agents start writing before they know what you need. StudySkills makes the agent ask, plan, and then write. You approve the plan before the agent creates a file.

Sources stay local. The skills read them in place, and the collection has no runtime dependencies.

## Usage

Run a skill by name:

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

Each run follows one path:

1. The agent asks for the source and preferences.
2. It shows a plan.
3. You approve, edit, or cancel.
4. It writes the requested formats.
5. It reads the files back and validates them.
6. It reports skips, truncation, fallbacks, and missing files.

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

The collection targets these three harnesses. The harness renders PDF, DOCX, and PPTX. If it cannot render a requested format, the skill writes a Markdown fallback and reports the change. Quality checks cover grounding, coverage, accessibility, visual clarity, and format integrity.

## Canvas is read-only

`study-canvas` sends only GET requests. It cannot submit assignments, post discussions, edit pages, upload files, change account settings, or write to Canvas.

Ask it to change something in Canvas, and it refuses. Ask it to read a course, and it fetches the course material, asks for a plan, and writes study files to your Documents folder.

## Security and privacy

- Canvas tokens live per host under `~/.studyskills/canvas/<host>/`.
- Use a dedicated Canvas token, then revoke it when you finish.
- The skill never asks for the token in chat and never prints it.
- Source files stay in place and never enter Documents.
- Citations use filenames, not absolute paths.
- The harness model reads course and local-file content. Your harness choice controls that boundary.
- The skills send no telemetry, analytics, or remote logs.
- Web research is opt-in and stays on public concepts. The do-not-send list blocks source content, filenames, paths, Canvas data, and personal data.
- The skills upload nothing to external services.

## Supported systems

- Linux
- macOS
- Windows native
- WSL, treated as Linux

Use PowerShell on native Windows and POSIX commands in WSL, Linux, and macOS. Set `STUDYSKILLS_DOCUMENTS_DIR` when Documents lives on OneDrive or another drive.

## Requirements

- Node.js 20 or newer in the harness environment.
- A harness that can render the formats you request.
- A Canvas personal access token with read access for `study-canvas`.
- Network access only for `study-canvas`.
- No LaTeX installation is required. LaTeX is optional, with image and plain-text fallbacks.

## Development

StudySkills uses `dev` for work and `main` for stable installs.

```bash
git checkout dev
node --test
npm run check:version
npm run check:skills
npm run check:syntax
npm run check:install
npm run check:marketplaces
```

The repo has no dependencies to install.

Generation timings and targets live in [docs/study/performance.md](./docs/study/performance.md).

`core/` holds the canonical workflow. The sync script copies it into every skill:

```bash
node scripts/sync-skills.mjs
```

Commit the generated copies. CI runs the same sync check.

To link every skill into local harness directories:

```bash
node scripts/link-skills.mjs
```

## Math and graphs

Math-bearing outputs use LaTeX for formulas and PGFPlots or TikZ for graphs. PDF can render LaTeX directly. DOCX and PPTX use native equations or rendered images. Markdown keeps the LaTeX source, and CSV stays plain.

The skills never install LaTeX. If a renderer is unavailable, the output falls back to an image or plain notation and the final report says which mode it used.

See [Math, graphs, and images](./docs/study/math.md).

## Output formats

Formats follow the request.

- Explicit formats win.
- Several formats produce several files.
- No requested format means the skill picks the best one.

| Output | Usual format |
| --- | --- |
| Summary | PDF |
| Study plan | DOCX or PDF |
| Practice exam | PDF |
| Concept map | PPTX or PDF |
| Flashcards | CSV and Markdown |

The skills never add a prompt pack, zip file, source copy, or extra format.

## Roadmap

The current plan lives in [roadmap.md](./roadmap.md). File Study and the media-import plan live in [roadmap2.md](./roadmap2.md).

## License

MIT. See [LICENSE](./LICENSE).
