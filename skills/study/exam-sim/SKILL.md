---
name: exam-sim
description: "Generate a timed practice exam with answer key, topic map, and optional review schedule from a StudySkills pack, local files, or a topic."
disable-model-invocation: true
---

# Exam Sim

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants.

## Input

Use one of:

- A StudySkills pack path containing `sources/materials.md`.
- Local files or folders named by the user.
- A topic with no source files.

## Interview

Ask only when the answer is not already clear:

- Question count.
- Format: multiple choice, open answer, or mixed.
- Difficulty: easy, standard, hard.
- Time limit.
- Include an answer key? Default yes.
- Add a review schedule CSV?
- Output format.
- Language.

## Output

```text
practice-exam.<format>
```

Optional `review-schedule.csv` only if requested.

Default to PDF. Use DOCX only when the user wants an editable exam.

## Required sections

1. Cover: course or topic, date, time limit, question count, "StudySkills".
2. Instructions: time limit, number of questions, allowed materials.
3. Questions, numbered.
4. Answer sheet or answer spaces.
5. Answer key with explanations.
6. Topic map: question number, topic, skill tested.
7. Optional review schedule table if requested.

## Rules

- Match the requested question count exactly.
- Mix recall, application, and analysis where possible.
- No questions answerable by keyword matching alone.
- The time limit in the cover and instructions must agree.
- Every answer references the source topic.
- No live timer application. The exam is a document.
- Do not create notes, flashcards, or a summary.
- Never modify source files.
- Never access Canvas.
