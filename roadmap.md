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

- Bug fixes and prompt or format refinements.
- Document any harness format limitations in `docs/study/harness-matrix.md`.
- No new features unless required to fix a broken requested format.

## v0.2.0 - Study Skill Collection

- `lecture-notes`: turn lecture material into structured notes.
- `exam-sim`: timed practice exams and spaced repetition.
- `flashcard-forge`: Anki-ready decks.
- `explain-back`: Feynman technique explanations.
- `study-planner`: standalone multi-course planning.
- `note-organizer`: Markdown and Obsidian organization.
- Shared style, question, and output conventions.

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
