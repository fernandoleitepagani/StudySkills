# Exam Sim

## What it does

Generates a timed practice exam with questions, an answer key, a topic map, and an optional review schedule.

## When to use it

You want exam practice from a StudySkills pack, local files, or a topic.

## What you need

A source, a topic, or a pack. You choose question count, format, difficulty, and time limit.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/exam-sim` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, fallbacks, and web sources.

- The time limit is printed in the document. It is not a live timer.
- The answer key and topic map are generated only when requested.

## What it produces

A practice exam in PDF or DOCX, plus optional review-schedule CSV or Markdown.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /exam-sim
>
> Source: statistics-notes.md
> Questions: 20
> Format: mixed
> Time limit: 90 minutes
> Answer key: yes

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- Match the requested question count exactly.
- No live timer application.
- No questions answerable by keyword matching alone.

## Troubleshooting

- **Too easy:** raise the difficulty or include application questions.
- **Too long:** lower the question count.
- **Missing answer key:** request it explicitly.
