---
name: study-recall
description: "Build Anki-ready flashcards or active-recall practice. Choose the flashcards mode or the active-recall mode."
disable-model-invocation: true
---

# Study Recall

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants.

## Modes

Choose one mode first:

1. **Flashcards** — question/answer or cloze cards in CSV and Markdown.
2. **Active recall** — retrieval questions, cloze prompts, answer keys, and a review schedule.

The mode question counts toward the four-question interview limit.

## Input

### Flashcards mode

Use one of:

- A StudySkills pack path containing `sources/materials.md`.
- Local files or folders named by the user.
- A topic with no source files.

### Active recall mode

Use the StudySkills library by default:

```bash
node <skill-dir>/scripts/core.mjs catalog --json
```

Show topics, runs, documents, and sizes. Ask **Everything in the selected topic or run** or **Choose specific materials**. Allow additional local folders or files. Run `inventory` on every selected path and confirm the set before planning.

Use source mode `library` when all material comes from StudySkills, or `paths` when external files are added.

## Interview

Ask at most four questions. Ask only when the answer is not already clear.

1. Mode.
2. Source or topic.
3. Flashcards: card count, Q/A or cloze, and optional web research. Active recall: question types, count, and optional web research.
4. Output format.

Ask the shared **Optional extras** question as part of question 3. Leave **Use public web research** unchecked by default. **No extras** is exclusive.

Infer the output language from the user's message unless specified. Additional settings go in the plan and remain editable.

## Output

### Flashcards mode

```text
flashcards.csv
flashcards.md
```

Generate only requested formats. If the user says "Anki", CSV is required.

Card contract:

- One fact per card.
- Front is a question or prompt.
- Back is a short answer.
- Tags are lowercase topic names.
- No duplicate fronts.
- CSV columns: `front,back,tags`.
- Markdown uses `Q:` and `A:` pairs grouped by topic.
- Cloze cards use Anki `{{c1::...}}` syntax.

Build `cards.json` in the work directory and render with:

```bash
node <skill-dir>/scripts/cards.mjs --input <workDir>/cards.json --out <outputDir> --formats csv,md --json
```

### Active recall mode

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

## Required sections

### Active recall session

1. Goal.
2. Sources and coverage.
3. How to use the session.
4. Questions by round.
5. Answer key.
6. Review schedule.
7. Weak spots to watch.
8. Source map.

## Rules

### Both modes

- Read-only sources.
- No source copies.
- Do not access Canvas.
- Do not create extra files.
- Follow `references/core/quality.md`.
- Set `quality.required` to `true` in `plan.json`.

### Flashcards mode

- Do not create `.apkg` files.
- Do not copy long passages; write atomic cards.
- Do not create a summary or exam.

### Active recall mode

- Retrieval practice, not an exam. No timer, exam cover, or score simulation.
- Do not create a flashcard deck as the only active-recall output.
- Match the requested question count exactly.
- Every question has an answer and source.
- Mark unverified claims.
- Do not send source content to the web.
