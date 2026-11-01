# Paper Reader

## What it does

Reads a research paper and writes a brief with the question, method, results, limitations, critique, evidence, and follow-up questions.

## When to use it

You need to understand a paper, prepare for a seminar, or connect it to a thesis or course.

## What you need

A local paper in PDF, DOCX, or Markdown. Scanned papers need readable text.

## How to use it

1. Install StudySkills or this skill alone. See the [root README](../../../README.md).
2. Run `/paper-reader` in Claude Code, OpenCode, or Codex.
3. Answer the questions. The native tool accepts a typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, sources, skips, and fallbacks.

Choose depth, related context, evidence map, and output format. The brief marks missing metadata as unknown and keeps paper claims apart from web context.

## What it produces

A paper brief, optional evidence-map CSV, optional reading notes, and optional related context.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /paper-reader
>
> Paper: smith-2025-working-memory.pdf
> Goal: seminar critique
> Depth: deep
> Include related context: yes
> Output: PDF

## Safety and limits

- Sources stay read-only.
- Only requested files enter Documents.
- The skill creates no source copies, prompt packs, or zip files.
- The skill marks missing metadata and citations as unknown.
- It quotes briefly and cites the page.
- Paper content never goes to the web.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- The skill bypasses no paywall and sends no telemetry.

## Troubleshooting

- **Scanned PDF unreadable:** provide a text-based PDF or OCR copy.
- **Unknown citation:** the brief marks it unknown.
- **Too much context:** ask for a quick brief instead of a deep critique.
