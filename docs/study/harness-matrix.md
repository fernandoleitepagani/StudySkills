# Harness capability matrix

Record the result of the v0.1.0 smoke test here.

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
| OpenCode | CLI | pending | pending | pending | pending | Script layer verified; native UI and documents not exercised |
| OpenCode | GUI | pending | pending | pending | pending | GUI not available |
| Codex | CLI | pending | pending | pending | pending | CLI not installed |
| Codex | GUI | pending | pending | pending | pending | GUI not available |

## How to record

For each cell:

- `yes`: generated a valid file.
- `no`: could not generate the format.
- `n/a`: surface does not expose that capability.
- `pending`: not exercised yet.

If a format is `no`, the skill must still produce the other requested formats and report the failure. See `references/outputs.md` in the skill.

## Script layer verified

The following are covered by `node --test` and pass:

- Token detection and guide.
- Canvas read-only guards.
- Pagination and rate-limit retry.
- File download and size cap.
- HTML to text.
- Materials and manifest generation against a mock Canvas.
- Output validation, partial failure, extra files, and token leakage.
- Work and output directory behavior.
- CLI commands end to end against the mock server.

## Manual checks still required

1. Run `/canvas-study` in each harness CLI and confirm the native question cards appear.
2. Generate a summary as PDF, DOCX, and PPTX and confirm the files open.
3. Repeat in each GUI surface.
4. Record the result in the matrix above.
