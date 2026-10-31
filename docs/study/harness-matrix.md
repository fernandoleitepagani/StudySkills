# Harness capability matrix

Record the result of the v0.5.0 smoke test here.

## Environment used for this run

- OpenCode `v2.0.25` is installed.
- Claude Code CLI and GUI were reported working by the user.
- Codex CLI is not installed in this environment.
- OpenCode GUI was not available from the terminal.

The script layer is covered by the automated test suite. Native question rendering and document generation are manual checks.

## Matrix

| Harness | Surface | PDF | DOCX | PPTX | Questions | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code | CLI | yes | yes | yes | yes | User-reported end-to-end test |
| Claude Code | GUI | yes | yes | yes | yes | User-reported end-to-end test |
| OpenCode | CLI | pending | pending | pending | yes | Script layer and native question card verified; document generation still pending |
| OpenCode | GUI | pending | pending | pending | pending | GUI not available |
| Codex | CLI | pending | pending | pending | pending | CLI not installed |
| Codex | GUI | pending | pending | pending | pending | GUI not available |
| lecture-notes | CLI + GUI | pending | pending | pending | pending | v0.2.0 |
| flashcard-forge | CLI + GUI | n/a | n/a | n/a | pending | v0.2.0; CSV/MD only |
| explain-back | CLI + GUI | pending | pending | pending | pending | v0.2.0 |
| exam-sim | CLI + GUI | pending | pending | n/a | pending | v0.2.1; PDF/DOCX |
| study-planner | CLI + GUI | pending | pending | n/a | pending | v0.2.1; PDF/DOCX |
| note-organizer | CLI + GUI | pending | pending | pending | pending | v0.2.1; read-only source |
| file-study | CLI + GUI | pending | pending | pending | pending | v0.3.0; local files, read-only |

## How to record

For each cell:

- `yes`: generated a valid file.
- `no`: could not generate the format.
- `n/a`: surface does not expose that capability.
- `pending`: not exercised yet.

If a format is `no`, the skill must still produce the other requested formats and report the failure. See `skills/study/<skill>/references/core/output-conventions.md`.

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

1. Run the remaining Codex CLI and GUI checks.
2. Run the remaining document checks for OpenCode and Codex.
3. Record the exact Claude Code version and tested formats if available.
4. Keep any unverified cell marked `pending`.
