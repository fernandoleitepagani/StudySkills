# Generation performance

StudySkills generation is agent-driven. The speed work reduces model round trips, duplicate rendering, and optional work. It does not replace the harness document renderer.

## Current changes

- References load just in time: interview contracts before the interview, output contracts after plan approval.
- Canvas keeps its format preflight before the remote fetch.
- Local-source skills skip the separate preflight and render the real outputs.
- One canonical draft per logical output is written under `workDir/drafts/`.
- Every requested format renders from the same reviewed draft.
- Content review runs once per output. Format review runs once per produced file.
- Web research is off unless the user checks **Use public web research**.
- Canvas section lists and page details fetch with bounded concurrency.

## Timings

When timing is needed, write `workDir/timings.json` with stage timestamps. Delete it with the work directory.

Stages:

1. Inspect.
2. Source inventory.
3. Interview.
4. Plan approval.
5. Preflight, when used.
6. Draft.
7. Content review.
8. Render.
9. Format inspection.
10. Validation.
11. Report and cleanup.

## Benchmark flows

1. Canvas summary, PDF only.
2. Local files summary, PDF and DOCX.
3. Math problem set plus solutions, PDF.

Record:

- Harness and version.
- Operating system.
- Input size.
- Requested formats.
- Wall time.
- Tool-call count.
- LaTeX availability, when applicable.

## Targets

- Single-format local run: 15 to 20 percent faster.
- Multi-format run: 30 to 35 percent faster.
- Canvas-heavy run: 20 to 30 percent faster.
- No increase in validation failures.
- Test suite runtime grows by less than 10 percent.

## Current limits

- File and image downloads remain sequential so the total-size cap and manifest order stay exact.
- Drafts and timings are temporary work data. They never enter Documents.
- Performance results depend on the harness model, document renderer, and source size.
