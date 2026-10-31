# Code Kata Coach

## What it does

Generates programming katas with requirements, examples, tests, progressive hints, reference solutions, and review questions.

## When to use it

You want deliberate coding practice on a language or concept, with tests and explanations.

## What you need

A programming language, topic, and level. Local notes or documentation are optional.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/code-kata-coach` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, and fallbacks.

- Choose test framework, number of katas, hints, and solutions.
- Tests must cover normal, edge, and invalid cases.
- The skill never installs packages or claims tests passed unless it ran them.

## What it produces

A kata workbook, optional solutions, optional hints, an optional test file, and optional review questions.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /code-kata-coach
>
> Language: Python
> Topic: recursion
> Level: intermediate
> Katas: 5
> Tests: pytest
> Output: Markdown workbook

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- No package installation.
- No execution requirement.
- No unsafe or malicious code.
- User code is never sent to the web.
- Unexecuted tests are marked unexecuted.

## Troubleshooting

- **Tests do not match:** specify the framework or ask for plain assertions.
- **Kata too hard:** lower the level or ask for a prerequisite kata.
- **Solution too clever:** request a clarity-first solution.
