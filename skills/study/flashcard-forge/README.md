# Flashcard Forge

## What it does

Creates Anki-ready CSV and Markdown flashcards from a StudySkills pack, local files, or a topic.

## When to use it

You want atomic question-and-answer or cloze cards for spaced repetition.

## What you need

A source, a topic, or a StudySkills pack. Card count and style are asked during the interview.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/flashcard-forge` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, fallbacks, and web sources.

- Choose question/answer or cloze.
- Choose CSV, Markdown, or both.
- Cards are grouped by topic and deduplicated.

## What it produces

`flashcards.csv` with `front,back,tags`, and/or `flashcards.md` with Q/A pairs.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /flashcard-forge
>
> Source: week-3-notes.md
> Cards: 40
> Style: question and answer
> Format: CSV and Markdown

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- No `.apkg` files.
- One fact per card.
- No duplicate fronts.
- Long passages are not copied into cards.

## Troubleshooting

- **Anki:** import the CSV, do not expect an APKG.
- **Too many weak cards:** lower the count or narrow the source.
- **Duplicate cards:** remove duplicate facts from the source or ask for deduplication.
