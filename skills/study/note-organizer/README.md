# Note Organizer

## What it does

Inventories and organizes Markdown or Obsidian notes read-only. It can produce an index, tags, a note map, or a study guide.

## When to use it

You have a notes folder or vault and want structure, links, duplicate detection, and a study sequence.

## What you need

A Markdown or Obsidian folder, or attached Markdown files.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/note-organizer` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, fallbacks, and web sources.

- The skill reports file count, headings, tags, wiki links, and duplicates before planning.
- Source hashes are compared before and after the run.

## What it produces

A notes index, tag CSV, note map PPTX/PDF, or study guide PDF, only when requested.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /note-organizer
>
> Source: ~/Obsidian/Statistics
> Goal: index and note map
> Formats: Markdown and PPTX

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- Source notes are never modified.
- Orphan notes and unsupported files are reported.
- No notes are uploaded or synced.

## Troubleshooting

- **Missing notes:** check the folder path and Markdown extension.
- **Wrong tags:** add tags to the source or request a tag pass.
- **Large vault:** narrow to a subject folder.
