---
name: study-revisit
description: "Review study documents you already generated, find duplicates, ambiguity, errors, weak sections, and style problems, then produce improved copies without changing the originals."
disable-model-invocation: true
---

# Revisit and Improve

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants. Read `references/core/math.md` when the selected document contains formulas, graphs, or math images.

## Invariants

- **The original documents are read-only.** Never edit, move, rename, or delete them.
- **Write revised copies to a new run.** Never overwrite the source run.
- **No Canvas.** No token and no Canvas API.
- **No source copies.** Do not copy the original documents into the new output directory.
- **Only requested files.** The revised documents and an optional audit report are the only outputs.
- **Quality is evidence.** Follow `references/core/quality.md`.
- **Web research follows `references/core/web-research.md`.** The do-not-send list is absolute.
- **Do not invent correctness.** A claim is unverified if neither the selected document nor a cited source supports it.

## Input

Use library mode.

1. Run:

```bash
node <skill-dir>/scripts/core.mjs catalog --json
```

2. Show topics, runs, document names, and sizes.
3. Ask:

Question: **Which documents should I review?**

Options:

1. **Everything in the selected topic or run** (recommended)
2. **Choose specific documents**

Use the custom typed answer for specific names. If the user wants another folder outside StudySkills, allow it only if the harness can read it, and record it as an additional path.

4. Run `inventory` on the selected documents or folders:

```bash
node <skill-dir>/scripts/core.mjs inventory --path <path> --json
```

Repeat `--path` for multiple paths.

5. Confirm the final document set before planning.
6. Report unsupported files, unreadable files, truncated inventories, and exact duplicate hashes.

## Interview

Ask only what is not already known:

- Mode: audit only, or audit and revise.
- Improvement focus: correctness, clarity, completeness, structure, visual style, duplicates, citations, or a custom focus.
- Specific changes requested by the user.
- Optional extras: use the shared checkbox. Leave **Use public web research** unchecked by default.
- Output formats for revised documents.
- Whether to include an audit report.
- Language.

Default to audit and revise when the user says "make it better". Default to audit only when the user says "review" or "check".

## Audit

Read each selected document with the harness document skill.

Check:

### Duplicates

- Exact duplicates by inventory hash.
- Near duplicates by title, headings, repeated sentences, and overlapping content.
- Duplicated sections inside one document.
- Repeated runs that contain the same output.

Report the evidence. Do not delete anything.

### Ambiguity

- Undefined terms.
- Vague claims with no example.
- Inconsistent terminology.
- Headings that do not describe the section.
- Unclear instructions or missing context.

### Errors and contradictions

- Claims that contradict another selected document.
- Claims that contradict a cited source.
- Arithmetic, formula, date, and citation errors.
- Broken links or missing figures.
- Counts that do not match the content.

### Coverage and grounding

- Sections that are unsupported by the source material.
- Missing topics from the selected sources.
- Claims that need a citation.
- Claims that are marked as certain but are only plausible.
- Source coverage gaps.

### Math and graphs

- Unbalanced `$` or `$$` delimiters.
- Formulas flattened into ambiguous plain text.
- Missing units, assumptions, or equation references.
- `latex-graph` blocks without `tikzpicture` or `axis`.
- Graphs without labels, units, captions, or legends.
- Images without alt text or captions.
- Raw LaTeX in a rendered PDF, DOCX, or PPTX.
- Absolute image or include paths.

### Style and format

- Weak visual hierarchy.
- Walls of text.
- Missing tables, diagrams, examples, or retrieval questions.
- Accessibility problems.
- Format problems: overflow, clipped text, missing captions, bad page breaks.

### Web verification

Use web research only for public claims. Never send the selected document, filenames, paths, course names, institution details, or personal data to a web tool.

Mark a claim as:

- **Supported:** the local source or a cited public source supports it.
- **Unverified:** no available source supports it.
- **Contradicted:** sources disagree.
- **Needs review:** the claim is plausible but cannot be checked.

## Plan

Create a work directory and write `plan.json`.

Use:

```json
{
  "topic": "Statistics review",
  "language": "en",
  "source": {
    "mode": "library",
    "inputs": ["statistics/2026-10-30-1200"],
    "selection": {
      "mode": "specific",
      "items": ["summary.pdf", "flashcards.csv"]
    }
  },
  "quality": {
    "required": true
  },
  "requested": [
    {
      "output": "revised summary",
      "formats": ["pdf"],
      "files": ["summary-revised.pdf"]
    }
  ],
  "settings": {
    "mode": "audit-and-revise",
    "focus": ["correctness", "clarity", "visual style"]
  }
}
```

Show the plan and ask **Approve / Edit / Cancel**.

## Generate revised copies

1. Create the output directory only after approval.
2. Preserve the original document type and intent.
3. Use a new file name such as `<stem>-revised.<format>`.
4. Keep the original source content distinct from web context.
5. Apply the requested improvements.
6. Use the visual style rules in `references/core/style.md`.
7. Run the two-pass quality review.
8. Do not copy the original document into the output.

If a format cannot be produced:

- Create a Markdown fallback.
- Add it to `plan.json`.
- Report it.

## Audit report

Generate an audit report only when requested.

Required sections:

1. Documents reviewed.
2. What changed.
3. Duplicates found.
4. Ambiguity found.
5. Errors and contradictions.
6. Unverified or disputed claims.
7. Source coverage.
8. Remaining risks.

## Validate

Write `checks.json` with every produced file, the quality block, and research metadata.

Run:

```bash
node <skill-dir>/scripts/core.mjs validate --run-dir <outputDir> --plan <workDir>/plan.json --checks <workDir>/checks.json --json
```

Fix validation failures before reporting.

## Report

Report:

- Reviewed documents.
- Revised files and their new run directory.
- Audit report, if produced.
- Duplicates, ambiguity, errors, and contradictions.
- Claims that remain unverified.
- Web sources and access dates.
- Formats that fell back to Markdown.
- Confirmation that originals were not modified.

## Rules

- Never modify the original run.
- Never claim a factual correction without evidence.
- Do not merge documents unless the user asks.
- Do not create a new "master" document from unrelated outputs.
- Do not send private content to the web.
- Do not create extra files.
- Do not use the old document as a source copy in Documents.
