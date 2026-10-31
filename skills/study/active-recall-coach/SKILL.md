---
name: active-recall-coach
description: "Build retrieval practice from documents in the StudySkills library or from sources you add. Produces question sets, cloze prompts, answer keys, and a spaced review schedule."
disable-model-invocation: true
---

# Active Recall Coach

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants.

## Invariants

- **Retrieval practice, not an exam.** No timer, no exam cover, no score simulation.
- **Sources are read-only.** Never modify, move, rename, or delete a source document.
- **No Canvas.** No token and no Canvas API.
- **Only requested files** go to `~/Documents/StudySkills/<topic>/<run>/`.
- **No source copies.** Do not copy selected documents into the output.
- **Web research follows `references/core/web-research.md`.** The do-not-send list is absolute.
- **Quality is evidence.** Follow `references/core/quality.md`.

## Input

Use the StudySkills library by default.

1. Run:

```bash
node <skill-dir>/scripts/core.mjs catalog --root ~/Documents/StudySkills --json
```

2. Show topics, runs, documents, and sizes.
3. Ask:

Question: **Which materials should I use?**

Options:

1. **Everything in the selected topic or run** (recommended)
2. **Choose specific materials**

4. Allow the user to add another folder or files outside the library.
5. Run `inventory` on every selected path.
6. Confirm the final source set before planning.

Use source mode `library` when all material comes from StudySkills. Use `paths` when the user adds external folders or files.

## Interview

Ask only what is not already known:

- Learning goal or exam topic.
- Question types: short answer, cloze, application, explain-back, mixed.
- Number of questions.
- Session length and sessions per week.
- Review period, if any.
- Answer key: yes, default yes.
- Format: PDF, DOCX, Markdown, or CSV.
- Language.

## Procedure

### 1. Build the concept map

Read the selected sources and list:

- key concepts
- definitions
- relationships
- procedures
- examples
- common mistakes
- claims that need verification

Map every question to a source.

### 2. Generate retrieval questions

Mix:

- recall
- application
- comparison
- explanation
- error detection
- transfer to a new example

Avoid questions answerable by keyword matching alone. Avoid trivia unless the source makes it important.

### 3. Cloze and prompts

Use cloze only for short, meaningful chunks. Do not turn entire paragraphs into clozes.

### 4. Answer key

Every question gets:

- answer
- short explanation
- source citation
- topic tag

### 5. Interleaving

Mix topics across sessions. Do not group all questions from one topic into one block unless the user asks for blocked practice.

### 6. Review schedule

Provide spaced review sessions with:

- date or day number
- question set
- topics
- expected time
- review or new material

## Outputs

Generate only requested files:

```text
recall-questions.<format>
recall-answers.<format>
recall-session.md
review-schedule.csv
```

Typical defaults:

- Questions: PDF.
- Answers: PDF.
- Session guide: Markdown.
- Schedule: CSV only if requested.

## Required sections in `recall-session.md`

1. Goal.
2. Sources and coverage.
3. How to use the session.
4. Questions by round.
5. Answer key.
6. Review schedule.
7. Weak spots to watch.
8. Source map.

## Rules

- Do not create a timed exam.
- Do not create a flashcard deck as the only output.
- Match the requested question count exactly.
- Every question has an answer and source.
- Mark unverified claims.
- Do not send source content to the web.
- Do not create notes, summaries, or unrelated documents.
- Set `quality.required` to `true` in `plan.json`.
