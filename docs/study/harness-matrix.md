# Harness capability matrix

These results cover v1.1.1, with v1.1.0 as the baseline. The token onboarding in v1.2.0 does not change the harness surface. The v1.0.0 harness baseline and v1.0.1 test patch remain the basis for the surface matrix.

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

## v1.1.0 math checks

| Check | Result | Evidence |
| --- | --- | --- |
| LaTeX delimiter scanner | yes | `test/math.test.mjs` |
| Math metadata validation | yes | `test/validate.test.mjs` |
| `math-check` CLI | yes | `test/cli.test.mjs` |
| Math templates | yes | `math-check` on both templates |
| Formula rendering in PDF, DOCX, and PPTX | not rerun | Harness renderer; visual smoke required |
| Graph rendering in PDF, DOCX, and PPTX | not rerun | Harness renderer; visual smoke required |
| LaTeX fallback decision path | yes | Automated scanner test |
| LaTeX fallback visual output | not rerun | Requires a harness without LaTeX |

The automated checks prove scanning, metadata, and fallback selection. They do not prove that a harness renders a formula or graph cleanly. Run the math smoke in `harness-compatibility.md` before relying on visual output.

## Per-skill coverage

`pending` means the skill was not individually exercised. Do not infer `yes` from the global renderer checks.

| Skill | PDF | DOCX | PPTX | Questions | Notes |
| --- | --- | --- | --- | --- | --- |
| study-canvas | yes | yes | yes | yes | Real Canvas run and inspected outputs |
| study-notes | yes | yes | yes | yes | Lecture and organizer modes accepted |
| study-recall | yes | yes | n/a | yes | Flashcards and active recall modes accepted |
| study-explain-back | yes | yes | yes | yes | Accepted for v1 coverage |
| study-exams | yes | yes | n/a | yes | Practice exam and debrief modes accepted |
| study-planner | yes | yes | n/a | yes | Schedule and mastery modes accepted |
| study-files | yes | yes | yes | yes | Accepted for v1 coverage |
| study-revisit | yes | yes | yes | yes | Accepted for v1 coverage |
| study-language | yes | yes | yes | yes | Accepted for v1 coverage |
| study-math-practice | yes | yes | yes | yes | Accepted for v1 coverage |
| study-code-kata | yes | yes | yes | yes | Accepted for v1 coverage |
| paper-reader | yes | yes | n/a | yes | Accepted for v1 coverage |
| thesis-organizer | yes | yes | n/a | yes | Accepted for v1 coverage |

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
- Bounded Canvas section and page-detail concurrency.
- File and image download with size caps.
- Canvas material selection and fetch filtering.
- Durable manual-materials link extraction and partial Canvas reporting.
- Partial Canvas 403 handling and all-sections-forbidden behavior.
- HTML to text, including pre, tables, images, and nested lists.
- Materials and manifest generation against a mock Canvas.
- Plan-driven validation, semantic checks, partial failure, extra files, and token leakage.
- Quality, research, and math metadata validation.
- LaTeX delimiter, graph, image, forbidden-command, and absolute-path scanning.
- Cross-origin redirect protection.
- Work and output directory behavior.
- CLI commands end to end against the mock server.
- 125 automated tests.

## Final v1.1 gate

- Per-skill coverage was accepted by the project owner for v1 and inherited by v1.1.0.
- Harness surfaces remain complete for the v1.1.0 baseline.
- Math visual smoke remains a per-harness verification step.
- No unexplained `pending` cells remain.
- Accepted limitations are recorded in `security-audit.md` and the v1.2.0 release notes.
