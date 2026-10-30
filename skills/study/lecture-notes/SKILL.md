---
name: lecture-notes
description: "Turn lecture slides, transcripts, or notes into structured, didactic study notes. Use a StudySkills pack, local files, or a pasted transcript."
disable-model-invocation: true
---

# Lecture Notes

Call the Skill tool with **study-core** before doing anything else. Follow its shared workflow and invariants.

## Input

Use one of:

- A StudySkills pack path containing `sources/materials.md`.
- Local lecture files: slides, PDFs, transcripts, or notes.
- A pasted transcript.

No audio or video transcription. If the input is audio or video, ask for a transcript.

## Interview

Ask only when the answer is not already clear:

- Course and lecture title.
- Lecture date.
- Source set, if multiple files or a pack.
- Depth: concise, standard, detailed.
- Include a glossary?
- Include self-check questions?
- Output format.
- Language.

## Output

```text
lecture-notes.<format>
```

Default to DOCX for editing, or PDF when the user wants a printable document. Generate only the requested format.

Optional `glossary.csv` only if the user explicitly asks for it.

## Required sections

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

## Rules

- Do not invent lecture content.
- If the sources are incomplete, say what is missing.
- Keep the didactic style from `study-core`.
- Do not create a summary, flashcards, or an exam. Use the dedicated skill for that.
- Never modify source files.
- Never access Canvas.
