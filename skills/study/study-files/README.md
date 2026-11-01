# File Study

## What it does

Turns local folders, files, or harness attachments into study documents.

## When to use it

You have slides, readings, notes, or PDFs and want study material without Canvas.

## What you need

A folder, file paths, or attachments the harness can read.

## How to use it

1. Install StudySkills or this skill alone. See the [root README](../../../README.md).
2. Run `/study-files` in Claude Code, OpenCode, or Codex.
3. Answer the questions. The native tool accepts a typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, fallbacks, and sources.

The skill inventories the source, reports exact and near duplicates, and asks you to confirm the set. Large sources move through sections.

## What it produces

The study documents you request in PDF, DOCX, PPTX, Markdown, or CSV.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /study-files
>
> Source: ~/Documents/Statistics
> Output: summary PDF and flashcards CSV
> Language: English

## Safety and limits

- Sources stay read-only.
- Only requested files enter Documents.
- The skill creates no source copies, prompt packs, or zip files.
- The skill uses no network.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- The skill sends no telemetry and uses no external study service.

## Troubleshooting

- **Attachment not found:** give a concrete path.
- **Source too large:** narrow the folder or process one part.
- **Duplicates:** read the duplicate report before confirming the set.
