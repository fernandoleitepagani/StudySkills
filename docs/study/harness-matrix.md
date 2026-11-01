# Harness capability matrix

Record the result of the v1.0.0 release-candidate smoke test here.

## Environment used for this run

- Claude Code CLI and GUI were reported working by the user. Exact version not recorded.
- OpenCode `v2.0.25` CLI and GUI were reported working by the user.
- Codex CLI and GUI were reported working by the user.
- A real Canvas end-to-end run was completed.
- Real PDF, DOCX, PPTX, CSV, and Markdown outputs were inspected.
- The script layer is covered by the automated test suite.

## Harness surfaces

| Harness | Surface | PDF | DOCX | PPTX | Questions | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code | CLI | yes | yes | yes | yes | User-reported end-to-end test |
| Claude Code | GUI | yes | yes | yes | yes | User-reported end-to-end test |
| OpenCode | CLI | yes | yes | yes | yes | User-confirmed end-to-end test |
| OpenCode | GUI | yes | yes | yes | yes | User-confirmed end-to-end test |
| Codex | CLI | yes | yes | yes | yes | User-confirmed end-to-end test |
| Codex | GUI | yes | yes | yes | yes | User-confirmed end-to-end test |

## Global capability checks

These checks cover the shared rendering and question paths. They do not prove that every skill's content contract passed.

| Check | Result | Evidence |
| --- | --- | --- |
| Real Canvas fetch and study run | yes | User-confirmed end-to-end run |
| PDF generation and inspection | yes | User-confirmed |
| DOCX generation and inspection | yes | User-confirmed |
| PPTX generation and inspection | yes | User-confirmed |
| CSV generation and inspection | yes | User-confirmed |
| Markdown generation and inspection | yes | User-confirmed |
| Native questions in Claude Code | yes | User-reported |
| Native questions in OpenCode | yes | User-confirmed |
| Native questions in Codex | yes | User-confirmed |

## Per-skill coverage

`pending` means the skill was not individually exercised. Do not infer `yes` from the global renderer checks.

| Skill | PDF | DOCX | PPTX | Questions | Notes |
| --- | --- | --- | --- | --- | --- |
| study-canvas | yes | yes | yes | yes | Real Canvas run and inspected outputs |
| study-notes | pending | pending | pending | pending | Merged lecture/organizer modes; not individually exercised |
| study-recall | pending | pending | n/a | pending | Merged flashcards/active recall; CSV/Markdown plus PDF/DOCX |
| study-explain-back | pending | pending | pending | pending | Not individually exercised |
| study-exams | pending | pending | n/a | pending | Merged practice/debrief modes; PDF/DOCX |
| study-planner | pending | pending | n/a | pending | PDF/DOCX |
| study-files | pending | pending | pending | pending | Not individually exercised |
| study-revisit | pending | pending | pending | pending | Not individually exercised |
| study-language | pending | pending | pending | pending | Not individually exercised |
| study-math-practice | pending | pending | pending | pending | Not individually exercised |
| study-code-kata | pending | pending | pending | pending | Not individually exercised |
| paper-reader | pending | pending | n/a | pending | PDF/DOCX |
| thesis-organizer | pending | pending | n/a | pending | PDF/DOCX |

## How to record

For each cell:

- `yes`: generated a valid file or the surface was exercised.
- `no`: could not generate the format.
- `n/a`: surface or skill does not expose that capability.
- `pending`: not exercised yet.

If a format is `no`, the skill must still produce the other requested formats and report the failure. See `skills/study/<skill>/references/core/output-conventions.md`.

## Script layer verified

The following are covered by `node --test` and pass:

- Token detection, unreadable token paths, and guide.
- Token age warnings and rejected-token expiry guidance.
- Canvas read-only guards and error-code classification.
- Pagination, truncation, and rate-limit retry.
- File and image download with size caps.
- Canvas material selection and fetch filtering.
- Durable manual-materials link extraction and partial Canvas reporting.
- Partial Canvas 403 handling and all-sections-forbidden behavior.
- HTML to text, including pre, tables, images, and nested lists.
- Materials and manifest generation against a mock Canvas.
- Plan-driven validation, semantic checks, partial failure, extra files, and token leakage.
- Quality and research metadata validation.
- Cross-origin redirect protection.
- Work and output directory behavior.
- CLI commands end to end against the mock server.

## Manual checks still required

1. Record the exact Codex version and tested formats if available.
2. Run any per-skill rows that must be `yes` before v1.0.0.
3. Keep any unverified per-skill cell marked `pending`.
