# Explain Back

## What it does

Explains a concept in layers, from ELI5 to exam level to expert level, using the Feynman technique.

## When to use it

You want to understand a concept deeply, find gaps in your explanation, or prepare to teach it.

## What you need

A concept and, optionally, local sources or a StudySkills pack.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/study-explain-back` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, fallbacks, and web sources.

- The explanation includes an analogy, common misconceptions, and a self-test.
- If no source is used, the output says so.

## What it produces

A layered explanation in PDF, DOCX, or Markdown.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /study-explain-back
>
> Concept: opportunity cost
> Source: economics-notes.md
> Format: PDF
> Language: English

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- Do not invent source facts.
- Unsupported claims are marked.
- No audio or live tutoring.

## Troubleshooting

- **Too abstract:** add a concrete example or source.
- **Too basic:** request the expert layer.
- **Wrong context:** name the course or field.
