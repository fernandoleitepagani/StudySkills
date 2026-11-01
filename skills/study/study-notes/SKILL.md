---
name: study-notes
description: "Turn lecture material into structured notes, or inventory and organize Markdown and Obsidian notes read-only. Choose the Lecture notes or Organize notes mode."
disable-model-invocation: true
---

# Study Notes

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants.

## Modes

Choose one mode first:

1. **Lecture notes** — turn slides, transcripts, or notes into structured study notes.
2. **Organize notes** — inventory and organize a Markdown or Obsidian vault read-only.

The mode question counts toward the four-question interview limit.

## Input

### Lecture notes mode

Use one of:

- A StudySkills pack path containing `sources/materials.md`.
- Local lecture files: slides, PDFs, transcripts, or notes.
- A pasted transcript.

No audio or video transcription. If the input is audio or video, ask for a transcript.

### Organize notes mode

Use a Markdown or Obsidian folder, or attached Markdown files.

Run:

```bash
node <skill-dir>/scripts/core.mjs inventory --path <folder> --json
```

Report file count, Markdown titles, tags, wiki links, skipped files, and truncation before planning.

## Interview

Ask at most four questions. Ask only when the answer is not already clear.

1. Mode.
2. Source, if missing.
3. Lecture notes: depth, glossary, self-check, and optional web research. Organize notes: index, tags, note map, study guide, or a combination.
4. Output format.

Ask the shared **Optional extras** question as part of question 3. Leave **Use public web research** unchecked by default. **No extras** is exclusive.

Infer the output language from the user's message unless they specify one. Additional settings go in the plan and remain editable.

## Output

### Lecture notes mode

```text
lecture-notes.<format>
```

Default to DOCX for editing, or PDF for printing. Optional `glossary.csv` only if requested.

### Organize notes mode

Generate only the requested files:

```text
notes-index.md
note-map.pptx
note-map.pdf
tags.csv
study-guide.pdf
```

Typical defaults:

- Index: Markdown.
- Note map: PPTX for editing, PDF for viewing.
- Tags: CSV.
- Study guide: PDF.

## Required sections

### Lecture notes mode

1. Cover: course, lecture, date, "StudySkills".
2. How to use these notes.
3. Lecture overview.
4. Key ideas.
5. Key terms and definitions.
6. Examples and analogies.
7. Formulas or procedures, if relevant.
8. Common mistakes.
9. Check yourself questions.
10. Recap: five things to remember.
11. Next steps.

Cite the source slide, page, or file for each major claim.

### Organize notes mode

Required sections in `notes-index.md`:

1. Vault overview and note count.
2. Notes by topic.
3. Heading outline per note.
4. Tags and tag clusters.
5. Wiki links and orphan notes.
6. Duplicate or near-duplicate notes.
7. Suggested study sequence.
8. Gaps and unsupported files.

## Rules

### Both modes

- Read-only sources.
- Never access Canvas.
- Keep the didactic style from `references/core/style.md`.
- Only write to `~/Documents/StudySkills/<topic>/<run>/`.
- Generate only requested files.
- Follow `references/core/quality.md`.
- Set `quality.required` to `true` in `plan.json`.

### Lecture notes mode

- Do not invent lecture content.
- If sources are incomplete, say what is missing.
- Do not create flashcards, an exam, or a separate summary.

### Organize notes mode

- Never move, rename, rewrite, or delete a source note.
- Never create or edit files inside the source vault.
- Use inventory hashes to confirm the source set did not change.
- Do not upload or sync notes.
- Do not create flashcards, exams, or summaries.
