---
name: study-explain-back
description: "Explain a concept in layers, from ELI5 to exam level to expert level, using the Feynman technique. Optional StudySkills pack or local sources."
disable-model-invocation: true
---

# Explain Back

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants. Read `references/core/math.md` when the concept contains formulas or graphs.

## Math format

Use LaTeX for formulas. Use `latex-graph` blocks for graphs and caption every graph or image.

## Input

Use one of:

- A topic or concept.
- A StudySkills pack path.
- Local files or notes.

A source is optional. If none is given, explain from general knowledge and say so.

## Interview

Ask only when the answer is not already clear:

- The concept to explain.
- Audience: beginner, exam student, or expert.
- Length: short, standard, deep.
- Include an analogy?
- Include a self-test?
- Optional extras: use the shared checkbox. Leave **Use public web research** unchecked by default.
- Output format.
- Language.

## Output

```text
study-explain-back.<format>
```

Default to PDF; use DOCX when the user wants to edit.

## Required sections

1. One-sentence explanation.
2. ELI5 explanation.
3. Exam-level explanation.
4. Expert-level explanation.
5. Analogy.
6. Step-by-step walkthrough.
7. Common misconceptions.
8. Self-test questions with answers.
9. Recap.
10. Sources, if a pack or local files were used.

## Rules

- Use plain language first, then add precision.
- Do not skip the ELI5 layer.
- Do not pretend a source was used when it was not.
- Do not create notes, flashcards, or an exam.
- Never modify source files.
- Never access Canvas.
