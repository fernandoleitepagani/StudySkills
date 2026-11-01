# Math Practice

## What it does

Writes original math and STEM problem sets with progressive hints, worked solutions, common errors, and an optional answer key.

## When to use it

You want practice on a topic and need problems with explanations and worked steps.

## What you need

A topic or source material, a level, and a problem count. A textbook or notes help set difficulty.

## How to use it

1. Install StudySkills or this skill alone. See the [root README](../../../README.md).
2. Run `/study-math-practice` in Claude Code, OpenCode, or Codex.
3. Answer the questions. The native tool accepts a typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, and fallbacks.

Choose the difficulty mix, problem types, hints, solutions, and answer key. Every problem gets a worked solution. Formulas use LaTeX, and graphs use PGFPlots or TikZ blocks. See [Math, graphs, and images](../../../docs/study/math.md).

## What it produces

A problem set, worked solutions, optional hints, an optional answer-key CSV, and optional common-error notes.

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
>
> Example formula: $2x + 5 = 17$
> Example graph: a `latex-graph` block with labeled axes

## Safety and limits

- Sources stay read-only.
- Only requested files enter Documents.
- The skill creates no source copies, prompt packs, or zip files.
- Problems stay original.
- Assumptions appear in the output.
- The skill checks numbers by reasoning, not a hidden calculator.
- It marks unverified results.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.

## Troubleshooting

- **Too easy:** raise the difficulty or ask for transfer problems.
- **Too many problems:** lower the count or split the topic.
- **Solution does not match:** name the method or convention.
