# Exam Debrief

## What it does

Analyzes a completed exam or practice test: score if a key exists, error patterns, timing, topic weaknesses, and a targeted remediation plan.

## When to use it

You have an exam result or practice attempt and want to know what to fix next.

## What you need

The exam or question list, your answers, and an answer key if you want a score. Timing and confidence notes are optional.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/exam-debrief` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, and fallbacks.

- If no answer key is supplied, the skill will not invent a score.
- Errors are classified with evidence.
- An optional retest uses new questions on the same topics.

## What it produces

A debrief report, optional error-analysis CSV, a remediation plan, and an optional retest.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /exam-debrief
>
> Exam: midterm.pdf
> Answers: my-answers.md
> Answer key: yes
> Include retest: yes
> Output: PDF

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- No fake grading.
- No blame or unsupported diagnosis.
- No reuse of original exam questions in the retest.
- Exam content is never sent to the web.

## Troubleshooting

- **No score:** provide the answer key.
- **Wrong error cause:** add your reasoning notes or confidence.
- **Retest too similar:** ask for new contexts and question forms.
