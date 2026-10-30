---
name: flashcard-forge
description: "Turn a StudySkills pack, local files, or a topic into Anki-ready flashcards. Writes CSV and Markdown, only the formats requested."
disable-model-invocation: true
---

# Flashcard Forge

Call the Skill tool with **study-core** before doing anything else. Follow its shared workflow and invariants.

## Input

Use one of:

- A StudySkills pack path containing `sources/materials.md`.
- Local files or folders named by the user.
- A topic with no source files.

## Interview

Ask only when the answer is not already clear:

- Card count: 20, 40, 60, or custom.
- Style: question and answer, or cloze.
- Tags: automatic by topic, or custom.
- Formats: CSV, Markdown, or both.
- Language.

## Output

```text
flashcards.csv
flashcards.md
```

Generate only the requested formats. If the user says "Anki", CSV is the required format.

## Card contract

- One fact per card.
- Front is a question or prompt.
- Back is a short answer.
- Tags are lowercase topic names.
- No duplicate fronts.
- CSV columns: `front,back,tags`.
- Markdown uses `Q:` and `A:` pairs grouped by topic.
- Cloze cards use Anki `{{c1::...}}` syntax.

## Procedure

1. Build a `cards.json` file in the work directory:

```json
[
  {
    "front": "What is the mean?",
    "back": "The sum of values divided by the number of values.",
    "tags": ["statistics", "descriptive"]
  }
]
```

2. Render with:

```bash
node <skill-dir>/scripts/cards.mjs --input <workDir>/cards.json --out <outputDir> --formats csv,md --json
```

3. Add every produced file to `plan.json` and `checks.json`. Use the actual card count as the check count.
4. Validate with `study-core`.

## Rules

- Do not create `.apkg` files.
- Do not copy long passages; write atomic cards.
- Do not create a summary or exam.
- Never modify source files.
- Never access Canvas.
