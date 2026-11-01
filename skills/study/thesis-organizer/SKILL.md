---
name: thesis-organizer
description: "Organize a thesis or research project into a research question, argument map, outline, evidence matrix, source gaps, and writing plan."
disable-model-invocation: true
---

# Thesis Organizer

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants.

## Invariants

- **Do not write the final thesis unless explicitly requested.** Default to planning and structure.
- **Separate evidence from interpretation.**
- **Do not invent sources, citations, data, or results.**
- **Sources are read-only.**
- **No paywall bypass.**
- **Only requested files** go to `~/Documents/StudySkills/<topic>/<run>/`.
- **Web research follows `references/core/web-research.md`.** Never send drafts, notes, filenames, paths, unpublished data, or personal information to a web tool.
- **Quality is evidence.** Follow `references/core/quality.md`.

## Input

Use one of:

- `library`: notes or drafts already under `~/Documents/StudySkills`.
- `paths`: local notes, sources, drafts, or reference files.
- `topic`: a research topic with no source files.

If using the library, run:

```bash
node <skill-dir>/scripts/core.mjs catalog --json
```

Select everything in a topic/run or specific documents, following `source-selection.md`.

## Interview

Ask only what is not already known:

- Research question or broad topic.
- Field and level: undergraduate, master's, doctoral, or other.
- Stage: idea, literature review, outline, draft, revision, or defense.
- Existing sources or notes.
- Target length, deadline, and available writing time.
- Include a literature landscape from the web?
- Output format.
- Output language.

## Procedure

### 1. Refine the research question

Check whether it is:

- answerable
- specific
- scoped
- connected to available evidence
- distinct from a practical project or a policy report

If the question is too broad, propose two or three narrower versions. Do not choose one without the user's confirmation.

### 2. Build the argument map

Record:

- central claim or thesis
- premises
- evidence for each premise
- counterarguments
- assumptions
- what would weaken the claim

### 3. Build the outline

Use a structure appropriate to the field:

- introduction
- question and context
- literature review
- method
- results or analysis
- discussion
- limitations
- conclusion
- references

Adapt the structure only when the field or the user requires it.

### 4. Build the evidence matrix

For each claim:

```text
claim,evidence,source,strength,gap
```

`strength` must be:

- strong
- moderate
- weak
- missing
- contradictory

Do not pad weak evidence with invented citations.

### 5. Identify source gaps

List:

- claims with no evidence
- claims supported only by a weak source
- missing counterarguments
- missing method detail
- missing data
- missing literature
- questions that need a supervisor or librarian

### 6. Writing plan

Build a realistic plan:

- chapter or section order
- milestones
- daily or weekly writing blocks
- review checkpoints
- supervisor feedback points
- buffer

If the deadline is unrealistic, say so.

### 7. Literature context

Web research may be used only for public literature context. Prefer primary sources. Cite title, URL, and access date. Do not claim a literature review is complete.

## Outputs

Generate only the requested files:

```text
thesis-plan.<format>
outline.<format>
evidence-matrix.csv
writing-plan.<format>
literature-context.md
```

Typical defaults:

- Thesis plan: PDF.
- Outline: DOCX for editing.
- Evidence matrix: CSV only if requested.
- Writing plan: DOCX or PDF.
- Literature context: Markdown only if requested.

## Required sections in the thesis plan

1. Cover: topic, research question, stage, date, "StudySkills".
2. How to use this plan.
3. Research question and scope.
4. Argument map.
5. Outline.
6. Evidence matrix summary.
7. Source gaps.
8. Method and data needs.
9. Risks and limitations.
10. Writing plan.
11. Literature context, kept separate.
12. Next milestones.

## Rules

- Do not fabricate sources or results.
- Do not write final thesis prose unless asked.
- Do not claim the literature review is complete.
- Mark unsupported claims.
- Do not send private drafts or notes to the web.
- Do not create flashcards, exams, or unrelated notes.
- Set `quality.required` to `true` in `plan.json`.
