# Thesis Organizer

## What it does

Turns a thesis topic, notes, sources, or draft into a research question, argument map, outline, evidence matrix, source-gap list, and writing plan.

## When to use it

You are planning or revising a thesis, dissertation, or substantial research project.

## What you need

A research question or topic, plus any notes, sources, or drafts. Local files and StudySkills documents are supported.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/thesis-organizer` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, sources, and fallbacks.

- Choose stage, scope, deadline, and writing time.
- The default is planning, not writing final thesis prose.
- Evidence and interpretation are separated.
- Literature context is optional and cited separately.

## What it produces

A thesis plan, outline, optional evidence-matrix CSV, writing plan, and optional literature context.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /thesis-organizer
>
> Topic: algorithmic fairness in hiring
> Stage: outline
> Sources: ~/thesis/notes
> Deadline: 2027-03-01
> Output: PDF plan and DOCX outline

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- No fabricated sources or results.
- No complete literature review claim.
- No final thesis prose unless explicitly requested.
- Drafts and notes are never sent to the web.

## Troubleshooting

- **Question too broad:** ask for narrower versions.
- **Weak evidence:** the matrix marks missing and weak claims.
- **Deadline too tight:** the writing plan proposes scope trade-offs.
