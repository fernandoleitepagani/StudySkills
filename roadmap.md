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

- User-invoked `file-study` skill on the shared `study-core` engine.
- Folder, file-path, and attachment-path inputs.
- Source inventory with size, type, hash, Markdown headings, tags, and links.
- Include/exclude confirmation before planning.
- Exact and near-duplicate reporting.
- Citations to filenames and pages or sections.
- Sectioned processing for large sources.
- No Canvas, no token, no network, no source copies.
- Detailed history in `roadmap2.md`.

## v0.4.0 - Polish, Verification, and Release

- PT-BR and EN output language contract.
- Large-source chunking as a shared workflow rule. No caching.
- CI on Node 20 and 22.
- Release automation with a tagged archive asset.
- Install from the latest release asset or a pinned release tag, never `main`.
- Accessibility and privacy review.
- Local file exports only. No MCP, NotebookLM, web auth, cloud-drive integrations, or external services.
- Manual harness verification tracked separately; v1.0.0 remains gated on it.

## v0.4.1 - Release Install Fix

- Pin every documented install to the published release tag.
- Use the `#v0.4.1` ref for OpenCode because the skills CLI does not support archive links.
- Keep the release asset for manual download.
- No skill behavior changes.

## v0.4.2 - Self-contained Skills

- One canonical core source under `core/`.
- Generated local core copies in every skill.
- Removed the internal `study-core` skill dependency.
- Individual skill installs work.
- Canvas uses local core commands for directories and validation.

## v0.4.3 - Canvas Safety and Fallbacks

- Per-host Canvas token storage.
- Explicit Markdown fallback reporting.
- Failed generation cleanup.
- Token warnings and telemetry-free install commands.

## v0.4.4 - Main-Branch Distribution

- Stable `main` install channel; `dev` branch before `main`.
- README rewritten in the Matt Pocock structure.
- Real `AGENTS.md` file.
- Plugin marketplace verification and release flow.
- No release-tag install commands.

## v1.0.0 - Stable

- Stable skill contract, migration guide, and security audit.
- Community study skills directory.
