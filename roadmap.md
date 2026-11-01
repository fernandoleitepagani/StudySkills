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

## v0.4.5 - Release Alignment

- Docs-only patch so the release tag includes the post-v0.4.4 corrections.
- Aligns the README release marker, security reference, roadmap, and marketplace description with `main`.

## v0.5.0 - Quality, Guidance, and Material Selection

- Token age warnings and 30-day expiry guidance for rejected Canvas tokens.
- Canvas material selection: everything within limits or specific materials.
- Shared source selection, catalog, quality, visual style, and web research contracts.
- Per-skill READMEs and root collection links.
- Study Planner schedule and mastery modes.
- Claude Code CLI and GUI reported working.
- v1.0.0 remains gated on the remaining harness and document checks.

## v0.6.0 - Revisit, Language, and Recall

- `revisit-and-improve`: audit and revise existing StudySkills documents.
- `language-coach`: vocabulary, grammar, drills, sentence mining, and review.
- `active-recall-coach`: retrieval practice from StudySkills documents and added sources.
- Per-skill READMEs, root listing, plugin entries, and harness matrix entries.
- v1.0.0 remains gated on the remaining harness and document checks.

## v0.7.0 - Practice and Assessment

- `math-practice`: original problem sets with hints and worked solutions.
- `exam-debrief`: score analysis, error taxonomy, and remediation.
- `code-kata-coach`: programming katas with tests and reference solutions.
- Per-skill READMEs, root listing, plugin entries, and harness matrix entries.
- v1.0.0 remains gated on the remaining harness and document checks.

## v0.8.0 - Reading and Research

- `paper-reader`: structured paper briefs, critique, evidence maps, and follow-up questions.
- `thesis-organizer`: research question, argument map, outline, evidence matrix, gaps, and writing plan.
- Final 13-skill collection after the v0.9.5 merges.
- v1.0.0 remains gated on the remaining harness and document checks.

## v0.9.0 - Partial Canvas Access

- A section-level Canvas 403 is a partial failure, not a total stop.
- Continue with readable modules, assignments, discussions, announcements, syllabus, and front page.
- Stop only when every core section is forbidden or no readable material remains.
- Keep token-expiry guidance for 401 only.
- Added regression coverage for partial and all-forbidden Canvas access.
- v1.0.0 remains gated on Codex and final release checks.

## v0.9.1 - Manual Materials and Plain-Language Results

- Durable `manual-materials.md` link report.
- Optional `links.csv`.
- Durable links from modules, assignments, announcements, pages, syllabus, and front page.
- Exact browser-download and `/study-files` instructions.
- Beginner-friendly error and result messages.
- Updated `roadmap2.md` with the manual media plan.
- v1.0.0 remains gated on final compatibility and verification work.

## v0.9.2 - Marketplace and Cross-Platform Updates

- Added Codex plugin and marketplace manifests.
- Added Claude marketplace validation and GUI guidance.
- Added cross-platform `link-skills.mjs`.
- Added Windows PowerShell, WSL, Linux, and macOS install guidance.
- Updated the local skill and documented marketplace update paths.
- v1.0.0 remains gated on final compatibility and verification work.

## v0.9.3 - Compatibility and Install Verification

- Added harness compatibility documentation and smoke checklist.
- Hardened native-question fallback guidance.
- Added `scripts/check-install.mjs` and `npm run check:install`.
- Added installed-skill verification for OpenCode and Claude directories.
- Updated the local skill and recorded tested harness versions.
- v1.0.0 remains gated on final per-skill and Codex verification.

## v0.9.4 - Install Check Patch

- `check-install` now validates the 16 StudySkills skills and ignores unrelated skills in shared directories.
- Keeps installed-skill verification usable with OpenCode and Claude directories that contain other skills.
- No other behavior changes.

## v0.9.5 - Unified Study Names and Merged Modes

- Renamed the collection to the `study-*` prefix.
- Kept `paper-reader` and `thesis-organizer` unchanged.
- Merged `lecture-notes` and `note-organizer` into `study-notes`.
- Merged `flashcard-forge` and `active-recall-coach` into `study-recall`.
- Merged `exam-sim` and `exam-debrief` into `study-exams`.
- Preserved all source functionality through mode selectors.
- Kept the four-question interview limit.
- Added install verification and cross-platform guidance.
- Registered public store listing as future work.

## v0.9.6 - Cross-Platform Hardening

- Linux, macOS, and Windows support documented.
- Windows/macOS CI matrix added.
- Windows Documents/OneDrive override support.
- Output directory alias, retry-header, quality-threshold, invalid-fallback, 401-propagation, and catalog symlink hardening.
- Migration guide removed.
- v1.0.0 remains the release target.

## v1.0.1 - Windows CI Fix

- Made frontmatter and README tests CRLF-safe.
- Fixed Windows token test isolation using `USERPROFILE`.
- Made token path assertions cross-platform.
- No skill behavior changes.

## Future - Public Store Listing

- Claude directory metadata, icon, listing URLs, validation, submission, and review.
- Codex public ZIP, interface metadata, icons, validation, submission, and review.
- CI validation and plugin ZIP artifact generation.
- Manual submission remains required; do not claim automatic publication.
- New versions update the listing; users do not re-add the plugin.

## v1.0.0 - Stable

- Stable 13-skill contract.
- Security audit and accepted residual risks.
- Linux, macOS, and Windows support.
- Release notes and final harness matrix.
- Community study skills directory moved post-v1.
