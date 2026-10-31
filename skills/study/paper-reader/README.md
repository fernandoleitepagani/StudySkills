# Paper Reader

## What it does

Reads a research paper or academic PDF and produces a structured brief with the question, method, results, limitations, critical appraisal, evidence, related context, and follow-up questions.

## When to use it

You need to understand a paper efficiently, prepare for a seminar, or connect it to a thesis or course.

## What you need

A local paper, usually PDF, DOCX, or Markdown. Scanned papers need readable text.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/paper-reader` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, sources, and fallbacks.

- Choose depth, related context, evidence map, and output format.
- Metadata is marked unknown when it is not present.
- Paper claims and web context are kept separate.

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

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- No paywall bypass.
- No invented metadata or citations.
- Short quotations only.
- Paper content is never sent to the web.

## Troubleshooting

- **Scanned PDF is unreadable:** provide a text-based PDF or OCR copy.
- **Unknown citation:** the brief marks it unknown instead of guessing.
- **Too much context:** request a quick brief instead of a deep critique.
