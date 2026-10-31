---
name: paper-reader
description: "Read a research paper or academic PDF and produce a structured brief with question, method, results, limitations, evidence, related context, and follow-up questions."
disable-model-invocation: true
---

# Paper Reader

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants.

## Invariants

- **Sources are read-only.** Never modify, move, rename, or delete the paper.
- **Do not invent metadata.** If the title, authors, year, venue, or DOI is not in the file, say it is unknown.
- **Do not invent citations.** Related work must come from a local source or a cited web source.
- **No paywall bypass.** Do not retrieve or reconstruct inaccessible full text.
- **Distinguish paper claims from outside context.**
- **Only requested files** go to `~/Documents/StudySkills/<topic>/<run>/`.
- **Web research follows `references/core/web-research.md`.** Never send paper text, filenames, paths, authors, institution, or unpublished data to a web tool.
- **Quality is evidence.** Follow `references/core/quality.md`.

## Input

Use one of:

- `paths`: one or more local papers, usually PDFs, DOCX, or Markdown.
- `pack`: a StudySkills pack that contains papers.

If the paper is scanned or unreadable, say so. Do not pretend to have read it.

## Interview

Ask only what is not already known:

- Paper or papers.
- Research question or reading goal.
- Depth: quick brief, standard, or deep critique.
- Include related context from the web?
- Include an evidence map?
- Include a list of follow-up questions?
- Output format.
- Output language.

## Procedure

### 1. Identify the paper

Extract only what is present:

- title
- authors
- year
- venue
- DOI or URL
- paper type: empirical, review, theoretical, case study, methods, or other

Mark unknown fields as `unknown`.

### 2. Extract the argument

Record:

- research question
- motivation
- hypothesis or claim
- method
- data or sample
- analysis
- main results
- stated limitations
- authors' conclusion

Use page or section citations.

### 3. Separate evidence levels

Classify each important claim:

- supported by the paper's data
- supported by another cited source
- plausible but unverified
- contradicted by another source
- outside the paper's scope

### 4. Critical appraisal

Assess:

- alignment between question and method
- sample or data quality
- analysis quality
- threats to validity
- overgeneralization
- missing comparisons
- reproducibility
- ethical concerns, if relevant

Do not present a critique as fact. Explain the evidence.

### 5. Related context

Use web research only for public context. Cite title, URL, and access date. Keep related context separate from the paper's own claims.

### 6. Follow-up questions

Write questions that would improve understanding or test the paper:

- what would falsify the claim?
- what sample or method would strengthen it?
- what does it not answer?
- how does it connect to the user's course or thesis?

## Outputs

Generate only the requested files:

```text
paper-brief.<format>
evidence-map.csv
reading-notes.md
related-context.md
follow-up-questions.md
```

Typical defaults:

- Paper brief: PDF.
- Evidence map: CSV only if requested.
- Reading notes: Markdown only if requested.
- Related context: Markdown only if requested.
- Follow-up questions: included in the brief unless a separate file is requested.

## Required sections in the paper brief

1. Cover: paper title or "Untitled paper", date, "StudySkills".
2. Citation status and known metadata.
3. One-paragraph summary.
4. Research question and motivation.
5. Method and data.
6. Main results.
7. Authors' stated limitations.
8. Critical appraisal.
9. Evidence map.
10. Related context, kept separate.
11. Follow-up questions.
12. Sources and page references.

## Evidence map CSV

Use:

```text
claim,evidence,page_or_section,strength,status
```

`status` must be one of:

- supported
- partially-supported
- unverified
- contradicted
- outside-scope

## Rules

- Do not claim to have read beyond the supplied paper.
- Do not fabricate page numbers, quotes, authors, or citations.
- Keep quotations short and cite the page.
- Do not copy the paper into Documents.
- Do not send paper content to the web.
- Do not turn the brief into a general summary unrelated to the paper.
- Set `quality.required` to `true` in `plan.json`.
