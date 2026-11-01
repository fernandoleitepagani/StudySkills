# Code Kata Coach

## What it does

Writes programming katas with requirements, examples, tests, hints, reference solutions, and review questions.

## When to use it

You want coding practice on a language or concept, with tests and explanations.

## What you need

A programming language, topic, and level. Local notes or documentation are optional.

## How to use it

1. Install StudySkills or this skill alone. See the [root README](../../../README.md).
2. Run `/study-code-kata` in Claude Code, OpenCode, or Codex.
3. Answer the questions. The native tool accepts a typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, and fallbacks.

Choose the test framework, kata count, hints, and solutions. Tests cover normal, edge, and invalid cases. Unexecuted tests carry that label.

## What it produces

A kata workbook, optional solutions, optional hints, an optional test file, and optional review questions.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /study-code-kata
>
> Language: Python
> Topic: recursion
> Level: intermediate
> Katas: 5
> Tests: pytest
> Output: Markdown workbook

## Safety and limits

- Sources stay read-only.
- Only requested files enter Documents.
- The skill creates no source copies, prompt packs, or zip files.
- The skill installs no packages.
- Code execution is optional.
- The skill writes no unsafe or malicious code.
- User code never goes to the web.
- Tests the skill never ran stay marked unexecuted.

## Troubleshooting

- **Tests do not match:** name the framework or ask for plain assertions.
- **Kata too hard:** lower the level or add a prerequisite kata.
- **Solution too clever:** ask for a clarity-first solution.
