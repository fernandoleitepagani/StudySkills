# Study Exams

## What it does

Creates a timed practice exam or debriefs a completed exam with error analysis, remediation, and an optional retest.

## When to use it

- Use **Create a practice exam** before an exam.
- Use **Debrief a completed exam** after a practice test or real exam.

## What you need

A source, topic, or StudySkills pack for exam creation. For debrief, bring the exam, your answers, and an optional answer key.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/study-exams` in Claude Code, OpenCode, or Codex.
3. Choose **Create a practice exam** or **Debrief a completed exam**.
4. Answer the questions. Mode selection counts toward the four-question limit.
5. Approve the plan before generation.

## What it produces

Practice exam:

```text
practice-exam.<format>
```

Optional `review-schedule.csv`.

Debrief:

```text
exam-debrief.<format>
error-analysis.csv
remediation-plan.<format>
retest.<format>
```

Outputs go to `~/Documents/StudySkills/<topic>/<run>/`.

## Example

> /study-exams
>
> Mode: Create a practice exam
> Source: statistics notes
> Questions: 20 mixed, 90 minutes
> Format: PDF

Or:

> /study-exams
>
> Mode: Debrief a completed exam
> Exam: midterm.pdf
> Answers: my-answers.md
> Answer key: yes
> Include retest: yes

## Safety and limits

- No live timer application.
- No fake grading without an answer key.
- No original questions reused in a retest.
- Exam content is never sent to the web.
- No notes, flashcards, or unrelated study documents.

## Troubleshooting

- **No score:** provide the answer key.
- **Wrong error cause:** add reasoning or confidence notes.
- **Exam too long:** lower the question count or split the topic.
