# Study Exams

## What it does

Creates a timed practice exam or reviews a finished attempt. Pick **Create a practice exam** or **Debrief a completed exam**.

## When to use it

Use practice mode before an exam. Use debrief mode after a practice test or a real exam.

## What you need

For practice mode, bring a source, topic, or StudySkills pack. For debrief mode, bring the exam, your answers, and an answer key when you want a score.

## How to use it

1. Install StudySkills or this skill alone. See the [root README](../../../README.md).
2. Run `/study-exams` in Claude Code, OpenCode, or Codex.
3. Choose **Create a practice exam** or **Debrief a completed exam**.
4. Answer the questions. Mode selection takes one of the four question slots.
5. Approve the plan before generation.

## What it produces

Practice exam:

```text
practice-exam.<format>
```

Add `review-schedule.csv` when you ask for it.

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

- The exam is a document, not a live timer.
- Debrief mode needs an answer key for a score.
- A retest uses new questions.
- Exam content never goes to the web.
- The skill writes no notes, flashcards, or unrelated study documents.

## Troubleshooting

- **No score:** provide the answer key.
- **Wrong error cause:** add reasoning or confidence notes.
- **Exam too long:** lower the question count or split the topic.
