# Output conventions

## Requested versus produced

- Explicit formats always win.
- Several explicit formats produce several files.
- No explicit format means the active skill chooses one best format.
- Only requested files go to Documents.
- If a requested format fails, produce a Markdown fallback only when explicitly allowed by the skill.
- Add the fallback mapping to `plan.json` and report the replacement.
- Never create prompts, zips, source copies, or duplicate formats.

## Citations and privacy

- Cite source filenames, not absolute paths.
- Include page, slide, or heading when available.
- Do not include home-directory paths, usernames, or full folder trees in outputs.
- Do not copy source files into Documents.
- Keep local-source citations and web citations in separate groups.
- Do not put private source content, filenames, paths, Canvas details, or personal data in a web search.

## Quality and presentation

- Follow `quality.md` and `style.md`.
- Write one canonical draft per logical output in `workDir/drafts/` and render every requested format from it.
- Review content once per output, then inspect each produced file for format quality.
- Read outputs back and record quality evidence in `checks.json`.
- Use a one-page visual overview for summaries when the format allows.
- Use tables, diagrams, callouts, captions, and alt text when they improve comprehension.
- Keep accessibility, heading hierarchy, and language metadata.
- Record web research status in `research` and report it at the end.

## Math

- Keep formulas, graphs, and image references in the canonical draft.
- Render math from the reviewed draft, not from a separate retelling.
- Keep Markdown outputs as LaTeX source.
- Use plain notation in CSV outputs.
- Render formulas and graphs for PDF, DOCX, and PPTX.
- Do not leave raw LaTeX in rendered outputs.
- Report `math.rendering` as `latex`, `image`, or `plain`.
- Report a plain-text fallback when the renderer is unavailable.
- Follow `math.md` for syntax, accessibility, and LaTeX safety.

## Web sources

- Use web research only when the user checks **Use public web research**.
- If the box is unchecked, record `research.web` as `not-used`.
- Cite title, URL, and access date.
- Mark weak or single-source claims.
- Local course sources win for course-specific facts.
- Never send anything on the `web-research.md` do-not-send list to a web tool.

## Result summary

Start the final report with one of:

```text
Result: success
Result: partial success
Result: failed
```

Explain what happened, what still works, why, and the next step. Put technical details after the human explanation.

## Partial format report

At the end, state:

- Requested files.
- Produced files.
- Not produced files and the reason.
- Inventory truncation or skipped inputs.

Example:

> Requested: summary PDF and DOCX.
> Produced: summary.pdf.
> Not produced: summary.docx because the harness could not render DOCX.

## Validation

Before reporting success:

- Every requested output exists or is reported missing.
- Every file is non-empty.
- PDF starts with `%PDF`.
- DOCX and PPTX are valid ZIP containers.
- Every produced file has a `checks.json` entry.
- Required sections and counts are present.
- The quality block is present when required and scores meet the rubric.
- Research metadata is valid when web research was used.
- No extra files are in the output directory.
- No source file was modified.

## Destination

```text
~/Documents/StudySkills/<topic>/<run>/
```

Working data:

```text
~/.studyskills/work/<run>/
```

Only the requested outputs stay in Documents. Delete the work directory on success.
