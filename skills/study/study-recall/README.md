# Study Recall

## What it does

Builds Anki-ready flashcards or active-recall practice from a StudySkills pack, local files, the StudySkills library, or a topic.

## When to use it

- Use **Flashcards** for atomic question/answer or cloze cards.
- Use **Active recall** for question sets, answer keys, interleaving, and spaced review.

## What you need

A source, a topic, or StudySkills documents. Active recall can add local folders or files.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/study-recall` in Claude Code, OpenCode, or Codex.
3. Choose **Flashcards** or **Active recall**.
4. Answer the questions. Mode selection counts toward the four-question limit.
5. Approve the plan before generation.

## What it produces

Flashcards:

```text
flashcards.csv
flashcards.md
```

Active recall:

```text
recall-questions.<format>
recall-answers.<format>
recall-session.md
review-schedule.csv
```

Outputs go to `~/Documents/StudySkills/<topic>/<run>/`.

## Example

> /study-recall
>
> Mode: Flashcards
> Source: week-3-notes.md
> Cards: 40 Q/A
> Format: CSV and Markdown

Or:

> /study-recall
>
> Mode: Active recall
> Materials: statistics run
> Questions: 30 mixed
> Format: PDF questions and answers

## Safety and limits

- Sources are read-only.
- No `.apkg` files.
- No source copies.
- Active recall is not a timed exam.
- Every active-recall question has an answer and source.
- No Canvas access.

## Troubleshooting

- **Anki:** import the CSV.
- **Questions too easy:** raise the application/explanation mix.
- **Missing source content:** add local files or select more StudySkills documents.
