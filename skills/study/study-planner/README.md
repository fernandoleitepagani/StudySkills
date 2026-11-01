# Study Planner

## What it does

Builds a multi-course schedule or a progressive mastery path for one subject.

## When to use it

Use **schedule** mode for courses, deadlines, weekly hours, and fixed commitments. Use **mastery** mode for a step-by-step path from basics to full knowledge.

## What you need

For schedule mode, bring your courses, deadlines, and available hours. For mastery mode, bring the subject, current level, target, and available time. The skill uses no Canvas or source pack.

## How to use it

1. Install StudySkills or this skill alone. See the [root README](../../../README.md).
2. Run `/study-planner` in Claude Code, OpenCode, or Codex.
3. Answer the questions. The native tool accepts a typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, fallbacks, and sources.

## What it produces

A schedule or learning path in DOCX or PDF. Add a schedule or milestone CSV when you ask for it.

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
> Target: solve exam problems with confidence
> Hours per week: 6
> Target date: 2026-12-15

## Safety and limits

- The skill invents no courses, deadlines, hours, or prior knowledge.
- Past deadlines need confirmation.
- No Canvas access.
- The skill writes no notes, flashcards, or exams.
- Sources stay read-only.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.

## Troubleshooting

- **Schedule over capacity:** reduce scope or add weeks.
- **Mastery path skips basics:** lower the starting level or add the prerequisite.
- **Deadline in the past:** confirm the date before continuing.
