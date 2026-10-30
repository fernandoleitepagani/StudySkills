# StudySkills

Agent skills for studying, learning, and creating.

StudySkills is a small collection of user-invoked skills for coding agents. The first skill, `canvas-study`, turns a Canvas course into finished study documents: a study plan, a summary, flashcards, a practice exam, a concept map, or a custom output.

The skill fetches Canvas materials read-only, asks you what you want through the harness's native question UI, and lets your agent generate the requested documents in the formats you ask for.

## What is included

| Skill | Status | What it does |
| --- | --- | --- |
| `canvas-study` | v0.1.1 | Fetch a Canvas course read-only and generate study documents. |
| `lecture-notes` | v0.2.0 | Turn lecture slides, transcripts, or notes into structured notes. |
| `flashcard-forge` | v0.2.0 | Create Anki-ready CSV and Markdown flashcards. |
| `explain-back` | v0.2.0 | Explain concepts in layers with the Feynman technique. |
| `study-core` | internal | Shared engine for the study skills. Not invoked directly. |
| `exam-sim` | v0.2.1 | Generate timed practice exams. |
| `study-planner` | v0.2.1 | Plan multiple courses and deadlines. |
| `note-organizer` | v0.2.1 | Organize Markdown and Obsidian notes read-only. |
| `file-study` | v0.3.0 | Turn local folders, files, or attachments into study documents. |

## Install

Pick one route per harness. Do not install both the plugin and the copied skill for the same harness.

### Claude Code

```bash
claude plugin marketplace add fernandoleitepagani/StudySkills
claude plugin install study-skills@studyskills
```

### Codex

```bash
codex plugin marketplace add fernandoleitepagani/StudySkills
codex plugin add study-skills@studyskills
```

### OpenCode

```bash
npx skills@latest add fernandoleitepagani/StudySkills -a opencode
```

Update later with:

```bash
npx skills@latest update
```

The commands above assume the repository is hosted at `fernandoleitepagani/StudySkills`. For local development before pushing, see [Development](#development).

Install the **whole collection** for the 2026 study skills. The new skills call the shared internal `study-core` skill. Installing a single v0.2 skill on its own is not supported because it would miss the core.

## Quick start

1. Create a Canvas personal access token.
2. Save it in one of these files:
   - `~/.studyskills/canvas-token.txt`, containing only the token.
   - `~/.studyskills/canvas-token.env`, containing `CANVAS_TOKEN=...`.
3. Run `/canvas-study` in Claude Code, OpenCode, or Codex.
4. Answer the questions. The skill shows a plan before fetching anything.
5. Approve the plan.
6. Find the requested files in `~/Documents/StudySkills/<course>/<run>/`.

If no token is found, the skill warns you and offers two choices: exit, or guide you through creating the file. The guide creates `~/.studyskills/` and an empty `canvas-token.txt`, then exits so you can paste the token and run the skill again.

The token is never requested in chat. It is never printed, stored in the plan, or written to the output files.

## Using the v0.2 skills

- `/lecture-notes`: lecture slides, transcript, or notes to structured notes.
- `/flashcard-forge`: study material to Anki-ready CSV and Markdown.
- `/explain-back`: a concept explained in layers, with a self-test.
- `/exam-sim`: a timed practice exam with answer key and topic map.
- `/study-planner`: a multi-course plan with deadlines and weekly hours.
- `/note-organizer`: a read-only index, tag list, map, or study guide for Markdown notes.
- `/file-study`: local folders or files to summaries, plans, flashcards, exams, maps, or custom outputs. Sources stay read-only.

Each skill asks through the native question UI, shows a plan before generating, and writes only the requested files to `~/Documents/StudySkills/<topic>/<run>/`.

See [docs/study/README.md](./docs/study/README.md) for the collection documentation.

## Supported harnesses

StudySkills supports exactly these harnesses, each in CLI and GUI:

| Harness | CLI | GUI | Native question tool |
| --- | --- | --- | --- |
| Claude Code | Yes | Yes | `AskUserQuestion` |
| OpenCode | Yes | Yes | `question` |
| Codex | Yes | Yes | `request_user_input` |

There is no plan to add other harnesses.

The harness owns document rendering. If it cannot produce one of the requested formats, it produces the formats it can and reports the ones it could not. It never silently substitutes Markdown or another format.

## How it works

1. **Connect.** Validate the Canvas URL and token read-only.
2. **Choose.** Pick the course, outputs, formats, language, and settings through the native question UI.
3. **Plan.** The skill writes a plan, shows it, and waits for approval.
4. **Fetch.** Read modules, pages, assignments, discussions, announcements, syllabus, and files. Convert HTML to text. Enforce size caps.
5. **Generate.** The agent creates the requested study documents using its native document skill.
6. **Validate.** Check file signatures, required sections, and that no token leaked. Report any requested format that failed.
7. **Deliver.** Save only the requested files in `~/Documents/StudySkills/`.

Working data lives in `~/.studyskills/work/<run-id>/` and is deleted after a successful run. The final folder contains only the requested outputs.

## Output formats

Formats are adaptive:

- If you name a format, that format is used.
- If you name several formats, all of them are generated.
- If you do not name a format, the agent chooses the best format for the output.

Typical choices:

| Output | Typical format |
| --- | --- |
| Summary | PDF |
| Study plan | DOCX for editing, PDF for printing |
| Practice exam | PDF |
| Concept map | PPTX for editing, PDF for viewing |
| Flashcards | CSV and Markdown for Anki and text tools |

No extra files are generated. No prompt pack. No zip.

## Canvas is read-only

The skill only performs `GET` requests. It will not:

- submit assignments
- post discussions
- edit pages, modules, assignments, or files
- upload anything
- change profile, notification, calendar, or account settings
- create, rotate, or revoke tokens
- commit or push changes

If you ask it to change something in Canvas, it refuses and explains that it is read-only.

## Zero runtime dependencies

StudySkills has no runtime dependencies and no dev dependencies. It uses Node.js 20+ built-ins. There is no build step and no `npm install` for users.

The agent's harness provides DOCX, PDF, and PPTX generation. The skill provides content structure, the didactic style guide, and validation.

## Requirements

- Node.js 20 or newer in the harness environment.
- A Canvas personal access token with read access to your courses.
- A harness that can create the document formats you request.
- Network access to your Canvas instance.

## Security and privacy

- The token is read only from `~/.studyskills/canvas-token.txt` or `~/.studyskills/canvas-token.env`.
- The token is never sent to a third party by the skill. It is only sent to your Canvas instance in the `Authorization` header of read-only requests.
- Course content stays on your machine, except for what your agent sends to its model provider when reading the materials. That is a choice you make by using that harness.
- No telemetry, analytics, or remote logging.
- Course materials are treated as untrusted data. Instructions inside them are never executed.
- The skill will not modify your Canvas account or course content.
- Revoke the token in Canvas when you are done with it.

## Known limitations

- Semantic document checks are agent-side. The validator checks file signatures, requested-versus-produced coverage, extra files, and token leakage. It cannot independently read the contents of a PDF, DOCX, or PPTX.
- External tools, LTI links, cloud drives, and quizzes are listed in the manifest but not downloaded.
- Inline images are downloaded only from the Canvas host. External images are listed as links.
- Document generation depends on the harness document skill. If the harness cannot render a requested format, the skill reports it and produces the rest.
- A Canvas course with more than 500 pages reports the pages that were not fetched.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| No token found | Run the guide, save the token, run `/canvas-study` again. |
| `401` from Canvas | The token is invalid or expired. Create a new one and replace the file. |
| `403` rate limit | The skill retries with backoff. Wait and try again if it persists. |
| Files tab missing | Some courses hide files from students. Text materials are still fetched. |
| Requested format failed | The skill reports which format failed and produces the rest. |
| No native question UI | The harness falls back to numbered text questions. |

## Roadmap

See [roadmap.md](./roadmap.md) for the StudySkills roadmap and [roadmap2.md](./roadmap2.md) for the File Study history and future work.

## Development

```bash
git clone <repository>
cd StudySkills
node --test
npm run check:version
```

There are no dependencies to install. To link the skill into local harness directories:

```bash
./scripts/link-skills.sh
```

To test before pushing with the skills installer:

```bash
npx skills@latest add /absolute/path/to/StudySkills -a opencode
```

If the installer does not support local paths, use the link script.

## License

MIT. See [LICENSE](./LICENSE).
