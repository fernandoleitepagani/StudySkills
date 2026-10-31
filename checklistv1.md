# StudySkills v1.0.0 Release Checklist

Baseline: `v0.4.5`, `main` and `dev` aligned, 69 tests passing.

Release gate: every box must be checked or explicitly removed from v1 scope. No `pending`, no known defects, no manual-verification caveat.

## 0. Scope and release gate

- [ ] Confirm v1 includes exactly 8 skills: `canvas-study`, `lecture-notes`, `flashcard-forge`, `explain-back`, `exam-sim`, `study-planner`, `note-organizer`, `file-study`.
- [ ] Confirm support for exactly Claude Code, OpenCode, and Codex, CLI and GUI.
- [ ] Confirm supported languages: EN and PT-BR.
- [ ] Confirm supported output formats: PDF, DOCX, PPTX, CSV, Markdown.
- [ ] Decide whether the roadmap item "Community study skills directory" is in v1.0.0 or moved after v1. Recommended: move it after v1.
- [ ] Decide the supported OS matrix. If Windows is claimed, test Windows. If not, document Linux/macOS support clearly.
- [ ] Freeze features. After this point, only defects found during verification may change behavior.
- [ ] Confirm no open GitHub issues, PRs, or release blockers.
- [ ] Record the release gate in `docs/study/harness-matrix.md`.

## 1. Environment and access

- [ ] Install Claude Code CLI.
- [ ] Install Codex CLI.
- [ ] Make Claude Code GUI available.
- [ ] Make OpenCode GUI available.
- [ ] Make Codex GUI available.
- [ ] Obtain a Canvas sandbox course.
- [ ] Obtain a read-only Canvas token for that course.
- [ ] Prepare representative local sources: PDF, DOCX, PPTX, Markdown, transcript, folder tree, attachments.
- [ ] Install document viewers and validators: PDF viewer, Word/LibreOffice, PowerPoint/LibreOffice, CSV parser, `pdfinfo`, `pdftotext`, `unzip`.
- [ ] Prepare a clean home directory and a clean harness profile for install tests.
- [ ] Prepare a second machine or clean VM if OS support requires it.

## 2. Automated quality gate

- [ ] Run `node --test` on Node 20.
- [ ] Run `node --test` on Node 22.
- [ ] Run `npm run check:version`.
- [ ] Run `npm run check:skills`.
- [ ] Run `node --check` over every `.mjs` file.
- [ ] Confirm zero runtime dependencies.
- [ ] Confirm zero dev dependencies.
- [ ] Confirm `study-core` does not exist and is not referenced.
- [ ] Confirm every skill has local `references/core/`.
- [ ] Confirm every skill has local `scripts/core.mjs`.
- [ ] Confirm every skill has its local validator, files, inventory, and theme assets.
- [ ] Confirm Canvas-only files exist only in `canvas-study`.
- [ ] Add regression tests for every defect found during manual verification.
- [ ] Confirm the full suite passes after all fixes.
- [ ] Confirm CI passes on `main`.
- [ ] If Windows or macOS is claimed, add and pass that CI target.

## 3. Installation and distribution

### Claude Code

- [ ] Install the plugin marketplace from `main` on a clean profile.
- [ ] Install the plugin.
- [ ] Confirm all 8 skills are listed.
- [ ] Confirm no duplicate skills.
- [ ] Confirm no `study-core`.
- [ ] Run one skill from the CLI.
- [ ] Update from `main` and confirm the update applies.
- [ ] Remove the plugin and marketplace cleanly.
- [ ] Repeat the install/update/remove flow in the GUI.
- [ ] Confirm trust and permission prompts behave as documented.

### Codex

- [ ] Install the plugin marketplace from `main` on a clean profile.
- [ ] Install the plugin.
- [ ] Confirm all 8 skills are listed.
- [ ] Confirm no duplicate skills.
- [ ] Confirm no `study-core`.
- [ ] Run one skill from the CLI.
- [ ] Update from `main` and confirm the update applies.
- [ ] Remove the plugin and marketplace cleanly.
- [ ] Repeat the install/update/remove flow in the GUI.
- [ ] Confirm trust and permission prompts behave as documented.

### OpenCode

- [ ] Install the whole collection from `main` on a clean profile.
- [ ] Confirm all 8 skills are listed.
- [ ] Install a single skill independently.
- [ ] Confirm a single-skill install has all local core files.
- [ ] Confirm no duplicate skills when both plugin and copied installs are present.
- [ ] Confirm `npx skills@latest update` works.
- [ ] Remove and reinstall.
- [ ] Repeat in the GUI.
- [ ] Confirm no release-tag pinning is needed.

### Distribution documentation

- [ ] Confirm README commands match `.agents/install-block.md` verbatim.
- [ ] Confirm every documented command works exactly as written.
- [ ] Confirm no stale release tag, archive, or old branch appears in install docs.
- [ ] Confirm plugin update behavior matches what the docs promise.
- [ ] Confirm the latest release is installable from `main`.

## 4. Harness verification matrix

For each cell, verify native questions, custom typed answers, plan approval, generation, validation, reporting, and cleanup.

- [ ] Claude Code CLI
- [ ] Claude Code GUI
- [ ] OpenCode CLI
- [ ] OpenCode GUI
- [ ] Codex CLI
- [ ] Codex GUI

For each surface:

- [ ] Native question cards appear.
- [ ] Custom typed answers work.
- [ ] The plan is shown before generation.
- [ ] The user can change the plan.
- [ ] Only requested files are produced.
- [ ] Validation runs.
- [ ] Failed formats produce a reported Markdown fallback.
- [ ] Failed partial files are removed.
- [ ] The work directory is removed.
- [ ] The final report lists outputs, fallbacks, skips, and truncation.
- [ ] No source files were modified.
- [ ] No token or absolute source path appears in outputs.

## 5. Skill acceptance

Run every skill at least once in each CLI. Run at least one full skill in each GUI.

### canvas-study

- [ ] Real Canvas course fetched successfully.
- [ ] Modules, pages, assignments, discussions, announcements, syllabus, and files work.
- [ ] Inline images and external links behave as documented.
- [ ] Quizzes and media are skipped or reported correctly.
- [ ] Pagination is correct.
- [ ] Truncation is reported.
- [ ] Large files and size caps are reported.
- [ ] Read-only requests are refused.
- [ ] Host-specific token is found.
- [ ] Legacy token fallback works.
- [ ] Missing, unreadable, and invalid token paths are handled.
- [ ] Token guide opens the correct host-specific path.
- [ ] Token does not leak into outputs or logs.
- [ ] Real PDF, DOCX, and PPTX outputs open and look correct.

### lecture-notes

- [ ] Slide deck input works.
- [ ] Transcript input works.
- [ ] Notes input works.
- [ ] Notes cite sources.
- [ ] Required sections are present.
- [ ] Requested formats are produced.
- [ ] Fallback behavior works.

### flashcard-forge

- [ ] CSV has exactly `front,back,tags`.
- [ ] Markdown output works.
- [ ] Card count matches the plan.
- [ ] No duplicate cards.
- [ ] CSV parses correctly with real quoting and multiline fields.
- [ ] Only requested formats are written.

### explain-back

- [ ] ELI5, exam-level, and expert-level layers are present.
- [ ] Analogy, misconceptions, and self-test are present.
- [ ] Source-optional behavior works.
- [ ] Citations appear when sources are used.
- [ ] Language selection works.

### exam-sim

- [ ] Question count matches exactly.
- [ ] Time limit is printed, not live.
- [ ] Answer key is present when requested.
- [ ] Topic map is present.
- [ ] Optional review schedule works.
- [ ] PDF and DOCX outputs open correctly.

### study-planner

- [ ] Multiple courses work.
- [ ] Deadlines are not invented.
- [ ] Past deadlines require confirmation.
- [ ] Weekly hours and fixed commitments are respected.
- [ ] Every course and deadline appears in the plan.
- [ ] No Canvas access is used.

### note-organizer

- [ ] Markdown folder input works.
- [ ] Obsidian vault input works.
- [ ] Source hashes are unchanged.
- [ ] Index covers the vault.
- [ ] Links and tags are preserved.
- [ ] Source notes are never moved, renamed, rewritten, or deleted.
- [ ] Only requested outputs are written.

### file-study

- [ ] Folder input works.
- [ ] Individual file input works.
- [ ] Attachment input works.
- [ ] Inventory is confirmed before planning.
- [ ] Exact duplicates are reported.
- [ ] Near duplicates are reported.
- [ ] Large-source chunking works.
- [ ] Every output cites source filenames.
- [ ] Source hashes are unchanged.
- [ ] No network access is used.
- [ ] Only requested outputs are written.

## 6. Real document quality

For every generated document:

- [ ] File opens in a real viewer.
- [ ] Text is selectable and searchable.
- [ ] Headings use real heading levels.
- [ ] Document language metadata is set.
- [ ] Tables render correctly.
- [ ] Images render correctly.
- [ ] Links work.
- [ ] Page breaks are correct.
- [ ] No text overflows or is clipped.
- [ ] Page count matches `checks.json`.
- [ ] Section count matches `checks.json`.
- [ ] Citations use filenames, not absolute paths.
- [ ] No token appears.
- [ ] No source copy or extra format appears.

Format-specific checks:

- [ ] PDF: `pdfinfo`, `pdftotext`, fonts, page count.
- [ ] DOCX: `unzip -t`, document XML, styles, images, page count.
- [ ] PPTX: `unzip -t`, slide count, text overflow, images.
- [ ] CSV: parser check, headers, row count, quoting, encoding.
- [ ] Markdown: render check, headings, links, code blocks.

Failure behavior:

- [ ] Force one requested format to fail.
- [ ] Confirm a Markdown fallback is created.
- [ ] Confirm `plan.json` records the fallback.
- [ ] Confirm `checks.json` includes the fallback.
- [ ] Confirm validation reports the fallback.
- [ ] Confirm the final report explains the replacement.
- [ ] Confirm no empty placeholder is left.
- [ ] Confirm the failed partial output is removed.

## 7. Canvas security and real-world behavior

- [ ] Verify GET-only guard.
- [ ] Verify all write paths are refused.
- [ ] Verify same-origin redirects work.
- [ ] Verify cross-origin API redirects are refused.
- [ ] Verify Authorization is dropped on cross-origin downloads.
- [ ] Verify 401, 403, 404, and rate-limit errors are classified correctly.
- [ ] Verify retry and backoff behavior.
- [ ] Verify token file permissions.
- [ ] Verify token guide creates the correct host directory.
- [ ] Verify token is never printed or logged.
- [ ] Verify outputs are scanned for token leakage.
- [ ] Verify prompt injection in course content is ignored.
- [ ] Verify source materials are not copied into Documents.
- [ ] Verify work directory cleanup on success.
- [ ] Verify work directory cleanup on failure.
- [ ] Verify failed output cleanup.
- [ ] Revoke the test token after the run.

## 8. Security and privacy audit

- [ ] Document the threat model.
- [ ] Audit token storage, permissions, redaction, and revocation guidance.
- [ ] Audit path traversal and filename sanitization.
- [ ] Audit symlink handling.
- [ ] Audit output path containment.
- [ ] Audit network allowlists.
- [ ] Audit prompt-injection handling.
- [ ] Audit source immutability.
- [ ] Audit cleanup and failed-output removal.
- [ ] Audit no-telemetry behavior.
- [ ] Audit no-git behavior during study runs.
- [ ] Audit plugin auto-update trust in `main`.
- [ ] Audit zero-dependency supply chain.
- [ ] Record the audit in the repository.
- [ ] Fix every finding or document an accepted residual risk.

## 9. Documentation and contracts

- [ ] README is accurate for v1.0.0.
- [ ] README names only the current release.
- [ ] README install commands are current.
- [ ] README limitations are accurate.
- [ ] `docs/study/README.md` covers all 8 skills.
- [ ] `docs/study/canvas-study.md` is current.
- [ ] `docs/study/harness-matrix.md` has no unexplained `pending` cells.
- [ ] Every skill `SKILL.md` has no placeholders or stale instructions.
- [ ] Every skill `agents/openai.yaml` is correct.
- [ ] `AGENTS.md` and `CLAUDE.md` remain aligned.
- [ ] Plugin metadata matches the collection.
- [ ] Roadmap is updated for v1.0.0.
- [ ] Add a migration guide from v0.4.5 to v1.0.0.
- [ ] Add the security audit document.
- [ ] Add release notes with supported harnesses, formats, and known limits.
- [ ] Confirm license and links.
- [ ] Search the repository for stale `v0.4.x`, `pending`, `TODO`, and `FIXME`.
- [ ] Confirm there are no dead links or missing docs pages.

## 10. Release candidate validation

- [ ] Freeze `dev` after all fixes.
- [ ] Run the full matrix from a clean environment.
- [ ] Run all 8 skills in all 3 CLIs.
- [ ] Run representative skills in all 3 GUIs.
- [ ] Run all document formats in all 3 harnesses.
- [ ] Run a real Canvas course end to end.
- [ ] Run the fallback path.
- [ ] Run the security checks.
- [ ] Fix only reproduced defects.
- [ ] Re-run the full matrix after fixes.
- [ ] Record evidence in the harness matrix.
- [ ] Obtain final sign-off that no release blocker remains.

## 11. Final release

- [ ] Bump `package.json` and `.claude-plugin/plugin.json` to `1.0.0`.
- [ ] Update README current release to `v1.0.0`.
- [ ] Update docs and roadmap to v1.0.0.
- [ ] Run `node --test`.
- [ ] Run `npm run check:version`.
- [ ] Run `npm run check:skills`.
- [ ] Confirm working tree is clean.
- [ ] Merge `dev` into `main`.
- [ ] Confirm `main` and `dev` match.
- [ ] Tag `v1.0.0`.
- [ ] Push `main`, `dev`, and the tag.
- [ ] Confirm the release workflow passes.
- [ ] Confirm latest release is `v1.0.0`.
- [ ] Confirm the tag archive matches `main`.
- [ ] Install from `main` on a clean profile.
- [ ] Install from the release tag archive as a sanity check.
- [ ] Run post-release smoke tests in all harnesses.
- [ ] Reinstall the local OpenCode copy.
- [ ] Confirm no release asset is required by the install docs.
- [ ] Publish release notes.
- [ ] Archive the completed harness matrix.

## v1.0.0 definition of done

- [ ] All 8 skills work in Claude Code, OpenCode, and Codex CLI.
- [ ] Representative full flows work in all 3 GUIs.
- [ ] Plugin install, update, and removal work for Claude Code and Codex.
- [ ] OpenCode collection and single-skill installs work.
- [ ] Native questions and custom answers work in all harnesses.
- [ ] Real Canvas fetching works.
- [ ] Real PDF, DOCX, PPTX, CSV, and Markdown files pass inspection.
- [ ] Fallback and cleanup behavior pass.
- [ ] Security audit has no unresolved release blocker.
- [ ] Documentation is complete and current.
- [ ] Harness matrix has no `pending` cells.
- [ ] No known defects remain.
- [ ] `v1.0.0` is tagged, released, and installable from `main`.
