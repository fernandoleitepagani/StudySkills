---
name: exam-debrief
description: "Analyze a completed exam or practice test, classify errors and timing problems, and produce a targeted remediation plan and optional retest."
disable-model-invocation: true
---

# Exam Debrief

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants.

## Invariants

- **Do not fake grading.** If there is no answer key, do not invent a score.
- **Separate evidence from inference.** A wrong answer is evidence; the reason for it is a hypothesis until the learner confirms it.
- **Sources are read-only.**
- **Only requested files** go to `~/Documents/StudySkills/<topic>/<run>/`.
- **Web research follows `references/core/web-research.md`.** Never send exam content, answers, personal data, course names, or institution details to a web tool.
- **Quality is evidence.** Follow `references/core/quality.md`.

## Input

Use one of:

- A completed exam PDF, DOCX, or Markdown file.
- A StudySkills practice exam.
- A question list plus the learner's answers.
- An optional answer key.
- Optional timing or confidence notes.

If answer sheets are separate from the exam, accept multiple paths.

## Interview

Ask only what is not already known:

- Exam or test source.
- Learner answer source.
- Answer key: supplied, unavailable, or not needed.
- Time limit and actual time used.
- Confidence by section, if available.
- Goal: understand errors, improve a score, prepare a retest, or all three.
- Include a retest?
- Output format.
- Output language.

## Procedure

### 1. Reconstruct the attempt

Build a table:

- question number
- topic
- answer given
- correct answer, if a key exists
- correct, incorrect, or ungraded
- time or confidence, if known

If the answer key is missing, mark every item `ungraded`. Do not produce a score.

### 2. Classify errors

Use these categories:

- missing knowledge
- incomplete knowledge
- method selection
- reasoning or calculation
- misread question
- careless execution
- time pressure
- guessing
- ungraded or unclear

Give evidence for each classification. Do not label a cause without evidence.

### 3. Find patterns

Look for:

- repeated topic weaknesses
- repeated error types
- sections where time ran out
- easy points lost
- accuracy versus speed
- confidence that did not match performance

### 4. Build remediation

Prioritize:

1. High-impact, low-effort fixes.
2. Prerequisite gaps.
3. Repeated errors.
4. Timing strategy.
5. Remaining lower-impact topics.

For each weakness, include:

- what to review
- a short practice task
- how to check improvement
- review date

### 5. Optional retest

Generate new questions on the same topics. Do not reuse the original questions. Include an answer key.

If a retest is requested, label it clearly and state that it is new practice, not the original exam.

## Outputs

Generate only the requested files:

```text
exam-debrief.<format>
error-analysis.csv
remediation-plan.<format>
retest.<format>
```

Typical defaults:

- Debrief: PDF.
- Error analysis: CSV only if requested.
- Remediation plan: DOCX for editing or PDF for printing.
- Retest: PDF.

## Required sections in the debrief

1. Cover: exam, date, score state, "StudySkills".
2. How to use this debrief.
3. Attempt summary.
4. Score, only if a key exists.
5. Error table.
6. Error patterns.
7. Topic weaknesses.
8. Timing and confidence analysis.
9. What went well.
10. Remediation priorities.
11. Retest plan, if requested.
12. Sources and references.

## Rules

- No key means no score.
- Do not shame the learner.
- Do not claim a cause without evidence.
- Do not reuse original exam questions in the retest.
- Do not send private exam content to the web.
- Do not create notes, flashcards, or a general study guide.
- Set `quality.required` to `true` in `plan.json`.
