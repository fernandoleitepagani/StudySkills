---
name: study-planner
description: "Build a multi-course study schedule or a progressive mastery path for one subject. Use scheduling for deadlines and weekly hours; use mastery for a step-by-step path from basics to full knowledge."
disable-model-invocation: true
---

# Study Planner

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants.

## Modes

Choose one mode during the interview:

- **Schedule:** multiple courses, deadlines, weekly hours, priorities, and fixed commitments.
- **Mastery:** one subject, current level, target level, prerequisite gaps, and a progressive path from basics to full knowledge.

If the request is ambiguous, ask which mode the user wants.

## Input

Manual only. No StudySkills pack, no source files, no Canvas.

Web research may be used for public subject references, definitions, and learning resources. Never send personal schedules, course names, institution details, or private data to a web tool.

## Interview

Ask only when the answer is not already clear.

### Common

- Mode: schedule or mastery.
- Output format.
- Language.

### Schedule mode

- Courses. Prefer one typed line per course:

```text
Course name | exam or deadline date | hours per week | priority
```

- Start date.
- Number of weeks, or the date range.
- Fixed commitments: classes, work, recurring blocks.

Parse the typed lines, show the resulting course table, and ask the user to confirm or correct it before planning.

### Mastery mode

- Subject or skill.
- Current level and target level.
- Available hours per week.
- Start date and target date, if any.
- Known weak areas or prerequisites.
- Preferred learning style, if any.

Show the resulting mastery brief and ask the user to confirm or correct it before planning.

## Output

### Schedule mode

```text
study-plan.<format>
```

Optional `schedule.csv` only if requested.

Default to DOCX for editing, or PDF when the user wants a printable plan.

### Mastery mode

```text
learning-path.<format>
```

Optional `milestones.csv` only if requested.

Default to PDF for a visual path, or DOCX when the user wants editing.

## Required sections

### Schedule mode

1. Cover: date range, courses, "StudySkills".
2. How to use this plan.
3. Course and deadline table.
4. Weekly schedule table: week, courses, topics, activities, hours, checkpoint.
5. Daily or session routine.
6. Fixed commitments and buffers.
7. Spaced review cadence.
8. Final week plan.
9. Next steps.

### Mastery mode

1. Cover: subject, current level, target level, target date, "StudySkills".
2. How to use this path.
3. Diagnostic questions.
4. Prerequisite map.
5. Mastery stages from basics to full knowledge.
6. Practice and retrieval checkpoints for each stage.
7. Spaced review schedule.
8. Milestones and evidence of mastery.
9. Resources and references.
10. Risks, gaps, and next steps.

## Rules

- Do not invent courses, deadlines, or hours. In mastery mode, do not invent prior knowledge.
- Validate all dates before planning.
- If a deadline is before the start date, ask before continuing.
- If total hours exceed available time, say so and propose trade-offs.
- Balance new material, practice, and review.
- In mastery mode, start from the user's actual level. Do not skip prerequisites silently.
- In mastery mode, include a diagnostic before the full plan.
- No Canvas access.
- No StudySkills pack or source-file input.
- Do not create notes, flashcards, or an exam.
- Use web research for public references and learning resources. Cite title, URL, and access date.
- Set `quality.required` to `true` in `plan.json`.
