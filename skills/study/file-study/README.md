# File Study

## What it does

Turns local folders, files, or harness attachments into study documents.

## When to use it

You have local slides, readings, notes, or PDFs and want study outputs without Canvas.

## What you need

A folder, file paths, or attachments that are available to the harness.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/file-study` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, fallbacks, and web sources.

- The skill inventories the source, reports exact and near duplicates, and asks you to confirm the source set.
- Large sources are processed in sections.

## What it produces

The requested study documents in PDF, DOCX, PPTX, Markdown, or CSV.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /file-study
>
> Source: ~/Documents/Statistics
> Output: summary PDF and flashcards CSV
> Language: English

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- Read-only sources.
- No network access from the skill.
- No source copies in Documents.
- Only requested files are written.

## Troubleshooting

- **Attachment not found:** provide a concrete path.
- **Source too large:** narrow the folder or process one part at a time.
- **Duplicates:** review the duplicate report before confirming the source set.
