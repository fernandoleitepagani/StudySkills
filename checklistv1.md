# StudySkills v1.0.1 Release Checklist

Baseline: `v1.0.1`, `main` and `dev` aligned, 96 tests passing.

Release gate: every box must be checked or explicitly removed from v1 scope. No `pending`, no known defects, no manual-verification caveat.

## 0. Scope and release gate

- [x] Confirm v1 includes exactly 13 skills: `study-canvas`, `study-notes`, `study-recall`, `study-explain-back`, `study-exams`, `study-planner`, `study-files`, `study-revisit`, `study-language`, `study-math-practice`, `study-code-kata`, `paper-reader`, `thesis-organizer`.
- [x] Confirm support for exactly Claude Code, OpenCode, and Codex, CLI and GUI.
- [x] Confirm supported languages: EN and PT-BR.
- [x] Confirm supported output formats: PDF, DOCX, PPTX, CSV, Markdown.
- [x] Move the "Community study skills directory" item after v1.0.1.
- [x] Confirm supported systems: Linux, macOS, Windows native, and WSL as Linux.
- [x] Freeze features after the cross-platform and documentation changes.
- [x] Confirm no open GitHub issues, PRs, or release blockers.
- [x] Record the final release gate in `docs/study/harness-matrix.md`.

## 1. Environment and access

- [x] Install Claude Code CLI.
- [x] Install Codex CLI.
- [x] Make Claude Code GUI available.
- [x] Make OpenCode GUI available.
- [x] Make Codex GUI available.

## 2. Automated quality gate

- [x] Run `node --test` on Node 20.
- [x] Run `node --test` on Node 22.
- [x] Run `npm run check:version`.
- [x] Run `npm run check:skills`.
- [x] Run `node --check` over every `.mjs` file.
- [x] Confirm zero runtime dependencies.
- [x] Confirm zero dev dependencies.
- [x] Confirm `study-core` does not exist and is not referenced.
- [x] Confirm every skill has local `references/core/`.
- [x] Confirm every skill has local `scripts/core.mjs`.
- [x] Confirm every skill has its local validator, files, inventory, and theme assets.
- [x] Confirm Canvas-only files exist only in `study-canvas`.
- [x] Add regression tests for every defect found during manual verification.
- [x] Confirm the full suite passes after all fixes.
- [x] Confirm CI passes on `main`.

- [x] Windows and macOS support documented and CI target configured.
- [x] Windows/macOS CI passes on the pushed commit.
- [x] Resolve or explicitly accept module-linked content limitations.
- [x] Resolve or explicitly accept remaining known defects.

## 3. Installation and distribution

### Claude Code

- [x] Install the plugin marketplace from `main` on a clean profile.
- [x] Install the plugin.
- [x] Confirm all 13 skills are listed.
- [x] Confirm no duplicate skills.
- [x] Confirm no `study-core`.
- [x] Run one skill from the CLI.
- [x] Update from `main` and confirm the update applies.
- [x] Remove the plugin and marketplace cleanly.
- [x] Repeat the install/update/remove flow in the GUI.
- [x] Confirm trust and permission prompts behave as documented.

### Codex

- [x] Install the plugin marketplace from `main` on a clean profile.
- [x] Install the plugin.
- [x] Confirm all 13 skills are listed.
- [x] Confirm no duplicate skills.
- [x] Confirm no `study-core`.
- [x] Run one skill from the CLI.
- [x] Update from `main` and confirm the update applies.
- [x] Remove the plugin and marketplace cleanly.
- [x] Repeat the install/update/remove flow in the GUI.
- [x] Confirm trust and permission prompts behave as documented.

### OpenCode

- [x] Install the whole collection from `main` on a clean profile.
- [x] Confirm all 13 skills are listed.
- [x] Install a single skill independently.
- [x] Confirm a single-skill install has all local core files.
- [x] Confirm no duplicate skills when both plugin and copied installs are present.
- [x] Confirm `npx skills@latest update` works.
- [x] Remove and reinstall.
- [x] Repeat in the GUI.
- [x] Confirm no release-tag pinning is needed.

### Distribution documentation

- [x] Confirm README commands match `.agents/install-block.md` verbatim.
- [x] Confirm every documented command works exactly as written.
- [x] Confirm no stale release tag, archive, or old branch appears in install docs.
- [x] Confirm plugin update behavior matches what the docs promise.
- [x] Confirm the latest release is installable from `main`.

## 4. Harness verification matrix

For each cell, verify native questions, custom typed answers, plan approval, generation, validation, reporting, and cleanup.

- [x] Claude Code CLI
- [x] Claude Code GUI
- [x] OpenCode CLI
- [x] OpenCode GUI
- [x] Codex CLI
- [x] Codex GUI

For each surface:

- [x] Native question cards appear.
- [x] Custom typed answers work.
- [x] The plan is shown before generation.
- [x] The user can change the plan.
- [x] Only requested files are produced.
- [x] Validation runs.
- [x] Failed formats produce a reported Markdown fallback.
- [x] Failed partial files are removed.
- [x] The work directory is removed.
- [x] The final report lists outputs, fallbacks, skips, and truncation.
- [x] No source files were modified.
- [x] No token or absolute source path appears in outputs.

## 5. Skill acceptance

Run every skill at least once in each CLI. Run at least one full skill in each GUI.

### study-canvas

- [x] Real Canvas course fetched successfully.
- [x] Partial section access is reported without a false total failure.
- [x] Manual materials link report works.
- [x] Token and read-only checks pass.
- [x] Real PDF, DOCX, and PPTX outputs open and look correct.

### study-notes

- [x] Lecture notes mode works with slides, transcript, and notes.
- [x] Organize notes mode works with Markdown and Obsidian.
- [x] Source notes and hashes are unchanged.
- [x] Both mode outputs and citations are present.

### study-recall

- [x] Flashcards mode produces valid CSV/Markdown and deduplicated cards.
- [x] Active recall mode produces questions, answers, and a schedule.
- [x] Active recall is not presented as a timed exam.

### study-explain-back

- [x] ELI5, exam-level, and expert-level layers are present.
- [x] Analogy, misconceptions, and self-test are present.
- [x] Source-optional behavior works.

### study-exams

- [x] Practice exam mode matches the question count and time limit.
- [x] Debrief mode does not score without an answer key.
- [x] Error analysis and retest behavior work.

### study-planner

- [x] Schedule mode respects courses, deadlines, and hours.
- [x] Mastery mode produces diagnostic, stages, and checkpoints.
- [x] No deadlines or prior knowledge are invented.

### study-files

- [x] Folder, file, and attachment inputs work.
- [x] Inventory, duplicates, and source hashes are correct.
- [x] Only requested outputs are written.

### study-revisit

- [x] Original documents remain unchanged.
- [x] Duplicates, ambiguity, and errors are reported with evidence.
- [x] Revised copies are written to a new run.

### study-language

- [x] Level, goal, vocabulary, grammar, and review plan work.
- [x] No audio or pronunciation scoring is claimed.
- [x] Vocabulary CSV uses the card contract.

### study-math-practice

- [x] Problem and solution counts match.
- [x] Worked solutions and assumptions are complete.
- [x] No execution or hidden calculator is claimed.

### study-code-kata

- [x] Each kata has requirements, tests, and a solution.
- [x] No packages are installed and unexecuted tests are marked.
- [x] Language docs and references are cited.

### paper-reader

- [x] Metadata is not invented.
- [x] Paper claims and web context are separated.
- [x] Evidence map and follow-up questions are present.

### thesis-organizer

- [x] Research question, argument map, outline, and evidence matrix are present.
- [x] Unsupported claims and source gaps are marked.
- [x] Writing plan is realistic.

## 6. Real document quality

For every generated document:

- [x] File opens in a real viewer.
- [x] Text is selectable and searchable.
- [x] Headings use real heading levels.
- [x] Document language metadata is set.
- [x] Tables render correctly.
- [x] Images render correctly.
- [x] Links work.
- [x] Page breaks are correct.
- [x] No text overflows or is clipped.
- [x] Page count matches `checks.json`.
- [x] Section count matches `checks.json`.
- [x] Citations use filenames, not absolute paths.
- [x] No token appears.
- [x] No source copy or extra format appears.

Format-specific checks:

- [x] PDF: `pdfinfo`, `pdftotext`, fonts, page count.
- [x] DOCX: `unzip -t`, document XML, styles, images, page count.
- [x] PPTX: `unzip -t`, slide count, text overflow, images.
- [x] CSV: parser check, headers, row count, quoting, encoding.
- [x] Markdown: render check, headings, links, code blocks.

Failure behavior:

- [x] Force one requested format to fail.
- [x] Confirm a Markdown fallback is created.
- [x] Confirm `plan.json` records the fallback.
- [x] Confirm `checks.json` includes the fallback.
- [x] Confirm validation reports the fallback.
- [x] Confirm the final report explains the replacement.
- [x] Confirm no empty placeholder is left.
- [x] Confirm the failed partial output is removed.

## 7. Canvas security and real-world behavior

- [x] Verify GET-only guard.
- [x] Verify all write paths are refused.
- [x] Verify same-origin redirects work.
- [x] Verify cross-origin API redirects are refused.
- [x] Verify Authorization is dropped on cross-origin downloads.
- [x] Verify 401, 403, 404, and rate-limit errors are classified correctly.
- [x] Verify retry and backoff behavior.
- [x] Verify token file permissions.
- [x] Verify token guide creates the correct host directory.
- [x] Verify token is never printed or logged.
- [x] Verify outputs are scanned for token leakage.
- [x] Verify prompt injection in course content is ignored.
- [x] Verify source materials are not copied into Documents.
- [x] Verify work directory cleanup on success.
- [x] Verify work directory cleanup on failure.
- [x] Verify failed output cleanup.
- [x] Revoke the test token after the run.

## 8. Security and privacy audit

- [x] Document the threat model.
- [x] Audit token storage, permissions, redaction, and revocation guidance.
- [x] Audit path traversal and filename sanitization.
- [x] Audit symlink handling.
- [x] Audit output path containment.
- [x] Audit network allowlists.
- [x] Audit prompt-injection handling.
- [x] Audit source immutability.
- [x] Audit cleanup and failed-output removal.
- [x] Audit no-telemetry behavior.
- [x] Audit no-git behavior during study runs.
- [x] Audit plugin auto-update trust in `main`.
- [x] Audit zero-dependency supply chain.
- [x] Record the audit in the repository.
- [x] Fix every finding or document an accepted residual risk.

## 9. Documentation and contracts

- [x] README is accurate for v1.0.1.
- [x] README names only the current release.
- [x] README install commands are current.
- [x] README limitations are accurate.
- [x] `docs/study/README.md` covers all 13 skills.
- [x] `docs/study/study-canvas.md` is current.
- [x] `docs/study/harness-matrix.md` has no unexplained `pending` cells.
- [x] Every skill `SKILL.md` has no placeholders or stale instructions.
- [x] Every skill `agents/openai.yaml` is correct.
- [x] `AGENTS.md` and `CLAUDE.md` remain aligned.
- [x] Plugin metadata matches the collection.
- [x] Roadmap is updated for v1.0.1.
- [x] Add the security audit document.
- [x] Add release notes with supported harnesses, formats, and known limits.
- [x] Confirm license and links.
- [x] Search the repository for stale `v0.4.x`, `pending`, `TODO`, and `FIXME`.
- [x] Confirm there are no dead links or missing docs pages.

## 10. Release candidate validation

- [x] Freeze `dev` after all fixes.
- [x] Run the full matrix from a clean environment.
- [x] Run all 13 skills in all 3 CLIs.
- [x] Run representative skills in all 3 GUIs.
- [x] Run all document formats in all 3 harnesses.
- [x] Run a real Canvas course end to end.
- [x] Run the fallback path.
- [x] Run the security checks.
- [x] Fix only reproduced defects.
- [x] Re-run the full matrix after fixes.
- [x] Record evidence in the harness matrix.
- [x] Obtain final sign-off that no release blocker remains.

## 11. Final release

- [x] Bump `package.json` and `.claude-plugin/plugin.json` to `1.0.0`.
- [x] Update README current release to `v1.0.1`.
- [x] Update docs and roadmap to v1.0.1.
- [x] Run `node --test`.
- [x] Run `npm run check:version`.
- [x] Run `npm run check:skills`.
- [x] Confirm working tree is clean.
- [x] Merge `dev` into `main`.
- [x] Confirm `main` and `dev` match.
- [x] Tag `v1.0.1`.
- [x] Push `main`, `dev`, and the tag.
- [x] Confirm the release workflow passes.
- [x] Confirm latest release is `v1.0.1`.
- [x] Confirm the tag archive matches `main`.
- [x] Install from `main` on a clean profile.
- [x] Install from the release tag archive as a sanity check.
- [x] Run post-release smoke tests in all harnesses.
- [x] Reinstall the local OpenCode copy.
- [x] Confirm no release asset is required by the install docs.
- [x] Publish release notes.
- [x] Archive the completed harness matrix.

## v1.0.1 definition of done

- [x] All 13 skills work in Claude Code, OpenCode, and Codex CLI.
- [x] Representative full flows work in all 3 GUIs.
- [x] Plugin install, update, and removal work for Claude Code and Codex.
- [x] OpenCode collection and single-skill installs work.
- [x] Native questions and custom answers work in all harnesses.
- [x] Real Canvas fetching works.
- [x] Real PDF, DOCX, PPTX, CSV, and Markdown files pass inspection.
- [x] Fallback and cleanup behavior pass.
- [x] Security audit has no unresolved release blocker.
- [x] Documentation is complete and current.
- [x] Harness matrix has no `pending` cells.
- [x] No known defects remain.
- [x] `v1.0.1` is tagged, released, and installable from `main`.
