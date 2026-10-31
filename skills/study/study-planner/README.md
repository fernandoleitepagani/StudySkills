# Study Planner

## What it does

Builds either a multi-course schedule or a progressive mastery path for one subject.

## When to use it

Use **schedule** mode for multiple courses, deadlines, weekly hours, and fixed commitments. Use **mastery** mode when you want a step-by-step path from basics to full knowledge.

## What you need

Your courses and deadlines, or your subject, current level, target, and available time. No Canvas or source pack.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/study-planner` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, fallbacks, and web sources.

- Schedule mode produces `study-plan.<format>`.
- Mastery mode produces `learning-path.<format>`.
- Mastery mode starts with a diagnostic and prerequisite map.

## What it produces

A schedule or learning path in DOCX or PDF, plus an optional schedule or milestone CSV.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /study-planner
>
> Mode: mastery
> Subject: linear algebra
> Current level: beginner
> Target: solve exam problems confidently
> Hours per week: 6
> Target date: 2026-12-15

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- Do not invent courses, deadlines, hours, or prior knowledge.
- Past deadlines require confirmation.
- No Canvas access.
- No notes, flashcards, or exams.

## Troubleshooting

- **Schedule is over capacity:** reduce scope or add weeks.
- **Mastery path skips basics:** lower the starting level or add the missing prerequisite.
- **Deadline in the past:** confirm the date before continuing.
