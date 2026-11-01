# Quality contract

The goal is not "perfect" study material. The goal is material that is grounded, complete, teachable, readable, accessible, and correctly formatted.

Quality is evidence, not a claim.

## Criteria

Score each criterion from 1 to 5.

| Criterion | What it means | Minimum |
| --- | --- | --- |
| `grounding` | Claims trace to selected sources or cited web sources. | 4 |
| `coverage` | Every selected source is used or marked skipped. | 4 |
| `learningDesign` | Objectives, prerequisites, examples, practice, and review are present. | 4 |
| `accuracy` | Contradictions, uncertainty, and assumptions are reported. | 4 |
| `clarity` | Plain language, defined terms, no filler, no walls of text. | 4 |
| `visualClarity` | Good hierarchy, useful tables or diagrams, readable layout. | 3 |
| `accessibility` | Real headings, language metadata, table headers, alt text, contrast. | 4 |
| `formatIntegrity` | The file opens, content fits, links work, counts agree. | 5 |

`visualClarity` may be omitted for CSV-only outputs. All other criteria apply.

A score below the minimum requires revision before validation. Do not lower the rubric to make a weak output pass.

## Two-pass review

1. Write one canonical draft per logical output in `workDir/drafts/`.
2. Read the draft back.
3. Check the source coverage ledger.
4. Score grounding, coverage, learning design, accuracy, and clarity once.
5. Revise weak sections.
6. Re-read the revised draft.
7. Render every requested format from the reviewed draft.
8. Inspect each produced file for visual clarity, accessibility, and format integrity.
9. Record the final scores and evidence.

Content review happens once per output. Format review happens once per produced file. The run-level rubric uses the lowest visual clarity, accessibility, and format integrity score from the produced files.

The second pass is not a summary of the first pass. It is a revision step.

## Source coverage

Keep a ledger in the work directory:

```text
source -> output sections -> used or skipped -> reason
```

Every selected source must be:

- used in at least one output, or
- explicitly skipped with a reason.

If a source is unreadable, unsupported, truncated, or over a cap, report it. Do not silently omit it.

## `checks.json`

Record quality evidence in `checks.json`:

```json
{
  "files": {
    "summary.pdf": {
      "sections": ["cover", "how-to-use", "big-picture", "topics", "recap"],
      "counts": { "pages": 10 }
    }
  },
  "quality": {
    "sourceCoverage": {
      "selected": 12,
      "used": 11,
      "skipped": ["old-notes.pdf"]
    },
    "rubric": {
      "grounding": 5,
      "coverage": 4,
      "learningDesign": 4,
      "accuracy": 4,
      "clarity": 5,
      "visualClarity": 4,
      "accessibility": 4,
      "formatIntegrity": 5
    },
    "review": "pass"
  }
}
```

`review` must be `pass` when validation runs. Use `revise` only while working.

`plan.json` can require quality:

```json
{
  "quality": {
    "required": true
  }
}
```

When required, validation fails if the quality block is missing or invalid.

## Format and style

Quality includes presentation:

- a one-page visual overview for summaries when the format allows
- tables for comparisons, schedules, formulas, and definitions
- diagrams or concept maps for relationships and processes
- numbered flows for procedures
- callouts for definitions, warnings, and key takeaways
- captions for every figure and table
- alt text for meaningful images
- real heading levels and language metadata
- no overflow, clipping, or unreadable tables
- no decorative art or color as the only signal

Visual elements must help comprehension. Do not add decoration to look busy.

## Math review

When a document contains math:

- Check formula notation, signs, units, and significant figures.
- Check that equation numbers and references agree.
- Check graph labels, units, scale, and legend.
- Check that every graph and image has a caption and alt text.
- Check that rendered PDF, DOCX, and PPTX files contain no raw TeX.
- Check that Markdown keeps the LaTeX source.
- Check that CSV uses plain notation.
- Record formula, graph, and image counts in `checks.json`.
- Report the math rendering mode and any fallback.

## Web sources

When web research is used:

- separate web citations from local source citations
- include title, URL, and access date
- mark weak or single-source claims
- prefer primary sources
- do not let a web source override a course-specific local source
- never send private source content to the web

## What validation cannot do

Validation can check structure, coverage declarations, counts, and the presence of quality evidence. It cannot prove that prose is correct, that a diagram is readable, or that a PDF looks good.

Real document inspection is still required.
