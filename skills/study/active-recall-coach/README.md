# Active Recall Coach

## What it does

Builds retrieval practice from StudySkills documents or sources you add. Produces question sets, cloze prompts, answer keys, and a spaced review schedule.

## When to use it

You have study material and want to remember it through repeated recall instead of rereading.

## What you need

One or more documents under `~/Documents/StudySkills`, or additional local files or folders.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/active-recall-coach` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for changes, sources, skips, and fallbacks.

- Choose **Everything in the selected topic or run** or **Choose specific materials**.
- Choose question types, count, session length, and review period.
- This is retrieval practice, not a timed exam.

## What it produces

A question set, answer key, optional session guide, and optional review-schedule CSV.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /active-recall-coach
>
> Materials: statistics/2026-10-30-1200
> Questions: 30
> Types: mixed
> Sessions per week: 3
> Output: PDF questions and answers

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- No timer and no exam simulation.
- Every question has an answer and a source.
- Sources are not modified or copied.
- Unverified claims are marked.

## Troubleshooting

- **Questions too easy:** raise the application and explanation mix.
- **Too many sessions:** reduce the question count or extend the period.
- **Missing answers:** request the answer key explicitly.
