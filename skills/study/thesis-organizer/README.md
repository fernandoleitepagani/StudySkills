# Thesis Organizer

## What it does

Turns a thesis topic, notes, sources, or draft into a research question, argument map, outline, evidence matrix, source-gap list, and writing plan.

## When to use it

You are planning or revising a thesis, dissertation, or substantial research project.

## What you need

A research question or topic, plus notes, sources, or drafts. Local files and StudySkills documents work.

## How to use it

1. Install StudySkills or this skill alone. See the [root README](../../../README.md).
2. Run `/thesis-organizer` in Claude Code, OpenCode, or Codex.
3. Answer the questions. The native tool accepts a typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, sources, skips, and fallbacks.

Choose the stage, scope, deadline, and writing time. The default is planning, not final thesis prose. Evidence and interpretation stay separate. Literature context is optional and cited apart from the thesis sources.

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

- Sources stay read-only.
- Only requested files enter Documents.
- The skill creates no source copies, prompt packs, or zip files.
- The skill fabricates no sources or results.
- It makes no claim to a complete literature review.
- Final thesis prose requires an explicit request.
- Drafts and notes never go to the web.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.

## Troubleshooting

- **Question too broad:** ask for narrower versions.
- **Weak evidence:** the matrix marks missing and weak claims.
- **Deadline too tight:** the writing plan proposes scope trade-offs.
