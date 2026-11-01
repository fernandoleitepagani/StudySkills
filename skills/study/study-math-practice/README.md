# Math Practice

## What it does

Generates original math and STEM problem sets with progressive hints, worked solutions, common errors, and an optional answer key.

## When to use it

You want deliberate practice on a topic and need problems plus explanations, not just an answer key.

## What you need

A topic or source material, a level, and the number of problems. A textbook or notes help calibrate difficulty.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/study-math-practice` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, and fallbacks.

- Choose difficulty mix, problem types, hints, solutions, and answer key.
- Every problem has a worked solution.
- The skill does not run a math engine or install tools.

## What it produces

A problem set, worked solutions, optional hints, optional answer-key CSV, and optional common-errors notes.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /study-math-practice
>
> Topic: linear equations
> Level: high school
> Problems: 20
> Difficulty: easy, standard, hard
> Output: PDF problem set and solutions

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- Problems are original, not copied.
- Assumptions are stated.
- Numerical answers are checked by reasoning, not a hidden calculator.
- Unverified results are marked.

## Troubleshooting

- **Too easy:** raise the difficulty or ask for transfer problems.
- **Too many problems:** lower the count or split by topic.
- **Solution does not match:** specify the method or convention.
