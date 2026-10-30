# StudySkills Roadmap

## Scope

StudySkills supports exactly three harnesses, each in CLI and GUI:

- Claude Code
- OpenCode
- Codex

There is no plan to add other harnesses.

## v0.1.0 - Canvas Study

- Native questions with custom typed answers.
- Token detection from `~/.studyskills/canvas-token.txt`, then `~/.studyskills/canvas-token.env`.
- Missing token: exit or guide. The guide exits and asks for a re-run.
- Canvas is read-only: GET only, no writes, no submissions, no commits.
- Fetch courses, modules, pages, assignments, discussions, announcements, syllabus, and files.
- HTML to text conversion. Media and quizzes skipped by default.
- Size caps and skipped-file reporting.
- Generate every explicitly requested format. If one fails, produce the rest and report it.
- Adaptive formats when the user does not specify.
- Didactic style guide for PDF, DOCX, and PPTX.
- Outputs in `~/Documents/StudySkills/<course>/<run>/`.
- Zero runtime dependencies. The harness owns document rendering.
- Mock Canvas tests and three-harness smoke tests.

## v0.1.1 - Fixes and Format Coverage

- Plan-driven delivery contract: `plan.json` is the source of truth.
- Validator compares requested files against produced files. Missing formats fail validation.
- Semantic checks are recorded in `checks.json` and verified for coverage.
- Truncated collections and skipped pages are reported.
- Inline Canvas images are downloaded; external images and materials are listed.
- HTML preserves preformatted blocks, tables, images, and nested lists.
- Page URLs are encoded.
- 401, 403 permission, and 403 rate limits have separate error codes.
- API redirects never send the token cross-origin.
- Unreadable token files enter the Exit or Guide flow.
- Output directories are created only after a successful fetch.
- Document preflight runs before the fetch.
- Bug fixes and format refinements.
- No new features unless required to fix a broken requested format.

## v0.2.0 - Study Skill Foundation

- Shared model-invoked `study-core` engine.
- `lecture-notes`: turn lecture material into structured notes.
- `flashcard-forge`: Anki-ready CSV and Markdown decks.
- `explain-back`: Feynman technique explanations.
- Shared question, plan, validation, style, and output conventions.
- Install the collection; individual v0.2 skill installs are not supported.

## v0.2.1 - Remaining Study Skills

- `exam-sim`: timed practice exams and optional review schedule.
- `study-planner`: standalone multi-course planning.
- `note-organizer`: read-only Markdown and Obsidian organization.

## v0.3.0 - File Study

- New skill for manually supplied local files.
- Attachments or file names and paths.
- No Canvas, no token, no network.
- Detailed plan in `roadmap2.md`.

## v0.4.0 - Polish and Scale

- PT-BR and EN output language coverage.
- Large-course chunking and caching.
- Documentation site, CI, and release automation.
- Accessibility and privacy review.
- Optional local file exports only. No MCP, NotebookLM, web auth, cloud-drive integrations, or external services.

## v1.0.0 - Stable

- Stable skill contract, migration guide, and security audit.
- Community study skills directory.
