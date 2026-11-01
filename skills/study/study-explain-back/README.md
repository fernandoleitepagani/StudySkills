# Explain Back

## What it does

Explains one concept in layers: ELI5, exam level, and expert level. The result includes an analogy, common misconceptions, and a self-test.

## When to use it

You want to understand a concept, find a gap in your explanation, or prepare to teach it.

## What you need

A concept and, when accuracy matters, local sources or a StudySkills pack.

## How to use it

1. Install StudySkills or this skill alone. See the [root README](../../../README.md).
2. Run `/study-explain-back` in Claude Code, OpenCode, or Codex.
3. Answer the questions. The native tool accepts a typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, fallbacks, and sources.

The skill marks unsupported claims and names the source when it uses one.

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

- Sources stay read-only.
- Only requested files enter Documents.
- The skill creates no source copies, prompt packs, or zip files.
- It marks source facts apart from its own explanation.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- The skill sends no telemetry and uses no external study service.
- It does not transcribe audio or run a live tutoring session.

## Troubleshooting

- **Too abstract:** add a concrete example or a source.
- **Too basic:** ask for the expert layer.
- **Wrong context:** name the course or field.
