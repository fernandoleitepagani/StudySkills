---
name: study-planner
description: "Build a multi-course study plan from deadlines, weekly hours, priorities, and fixed commitments. No source pack or Canvas access."
disable-model-invocation: true
---

# Study Planner

Call the Skill tool with **study-core** before doing anything else. Follow its shared workflow and invariants.

## Input

Manual only. No pack, no source files, no Canvas.

## Interview

Ask only when the answer is not already clear:

- Courses. Prefer one typed line per course:

```text
Course name | exam or deadline date | hours per week | priority
```

- Start date.
- Number of weeks, or the date range.
- Fixed commitments: classes, work, recurring blocks.
- Output format.
- Language.

Parse the typed lines, show the resulting course table, and ask the user to confirm or correct it before planning.

## Output

```text
study-plan.<format>
```

Optional `schedule.csv` only if requested.

Default to DOCX for editing, or PDF when the user wants a printable plan.

## Required sections

1. Cover: date range, courses, "StudySkills".
2. How to use this plan.
3. Course and deadline table.
4. Weekly schedule table: week, courses, topics, activities, hours, checkpoint.
5. Daily or session routine.
6. Fixed commitments and buffers.
7. Spaced review cadence.
8. Final week plan.
9. Next steps.

## Rules

- Do not invent courses, deadlines, or hours.
- Validate all dates before planning.
- If a deadline is before the start date, ask before continuing.
- If total hours exceed available time, say so and propose trade-offs.
- Balance new material, practice, and review.
- No Canvas access.
- Do not create notes, flashcards, or an exam.
