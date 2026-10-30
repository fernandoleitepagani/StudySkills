# Harness capability matrix

Record the result of the v0.2.0 smoke test here.

## Environment used for this run

- OpenCode `v2.0.25` is installed.
- Claude Code CLI is not installed in this environment.
- Codex CLI is not installed in this environment.
- GUI surfaces were not available from the terminal.

The script layer is covered by the automated test suite. Native question rendering and document generation are manual checks.

## Matrix

| Harness | Surface | PDF | DOCX | PPTX | Questions | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code | CLI | pending | pending | pending | pending | CLI not installed |
| Claude Code | GUI | pending | pending | pending | pending | GUI not available |
| OpenCode | CLI | pending | pending | pending | yes | Script layer and native question card verified; document generation still pending |
| OpenCode | GUI | pending | pending | pending | pending | GUI not available |
| Codex | CLI | pending | pending | pending | pending | CLI not installed |
| Codex | GUI | pending | pending | pending | pending | GUI not available |
| lecture-notes | CLI + GUI | pending | pending | pending | pending | v0.2.0 |
| flashcard-forge | CLI + GUI | n/a | n/a | n/a | pending | v0.2.0; CSV/MD only |
| explain-back | CLI + GUI | pending | pending | pending | pending | v0.2.0 |

## How to record

For each cell:

- `yes`: generated a valid file.
- `no`: could not generate the format.
- `n/a`: surface does not expose that capability.
- `pending`: not exercised yet.

If a format is `no`, the skill must still produce the other requested formats and report the failure. See `skills/study/study-core/references/output-conventions.md`.

## Script layer verified

The following are covered by `node --test` and pass:

- Token detection, unreadable token paths, and guide.
- Canvas read-only guards and error-code classification.
- Pagination, truncation, and rate-limit retry.
- File and image download with size caps.
- HTML to text, including pre, tables, images, and nested lists.
- Materials and manifest generation against a mock Canvas.
- Plan-driven validation, semantic checks, partial failure, extra files, and token leakage.
- Cross-origin redirect protection.
- Work and output directory behavior.
- CLI commands end to end against the mock server.

## Manual checks still required

1. Run `/canvas-study` in each harness CLI and confirm the native question cards appear.
2. Generate a summary as PDF, DOCX, and PPTX and confirm the files open.
3. Repeat in each GUI surface.
4. Record the result in the matrix above.
