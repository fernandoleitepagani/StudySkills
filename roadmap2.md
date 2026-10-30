# roadmap2.md - File Study

## Goal

Add a second study skill to the StudySkills repository.

`file-study` uses local files that the user supplies manually:

- Attach files to the conversation.
- Give file names or paths.
- Give a folder path to inventory.

The skill reads the sources, runs the same interview and plan flow as `canvas-study`, and produces requested study documents in `~/Documents/StudySkills/<topic>/<run>/`.

There is no Canvas connection, no token, and no network access.

## Scope

- Harnesses: Claude Code, OpenCode, Codex, CLI and GUI.
- Same didactic style guide, output format rules, and partial-format reporting.
- Same zero-dependency policy. The harness owns document rendering.
- Same rule: only requested output files are written to Documents.
- Source files are read-only. The skill never modifies, moves, renames, or deletes them.

## Shipped in v0.3.0 - Core File Study

- Accept attachments and explicit file paths.
- Inventory files: name, type, size, and last modified date.
- Confirm the source set with the user.
- Ask for outputs, formats, settings, and language.
- Show a plan and require approval.
- Generate requested outputs with the harness document skill.
- Report any requested format that could not be produced.
- Save only requested outputs in Documents.
- No network access, uploads, or external services.

## Shipped in v0.3.0 - Folder Ingestion

- Accept a folder path and recurse.
- Ignore hidden files, build artifacts, and unsupported binaries.
- Detect duplicate and near-duplicate sources.
- Let the user include or exclude files before planning.
- Cite source filenames and page numbers in outputs.

## Shipped in v0.3.0 - Large Sources

- Chunk large PDFs and long documents.
- Summarize sections progressively and then synthesize.
- Support multiple files on the same topic.
- Keep citations tied to source files.

## v0.4 - Visual and Multimodal

- Use the harness image and vision capability for scanned pages and diagrams.
- Generate concept maps from multiple sources.
- No OCR library. Rely on the harness.

## v1.0 - Stable

- Stable input and output contract.
- Documentation, examples, and fixture-based tests.
- Shared conventions with `canvas-study`.

## Non-goals

- No cloud drives.
- No LMS integrations.
- No MCP server.
- No NotebookLM export.
- No web UI.
- No external services.
- No new harnesses.

## Shared conventions with canvas-study

- Same native question adapter and grilling protocol.
- Same didactic style guide.
- Same output format rules and partial-format report.
- Same Documents destination.
- Same zero-dependency policy.
- Same "only requested files" rule.
