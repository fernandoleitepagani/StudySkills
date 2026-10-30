---
name: note-organizer
description: "Inventory and organize Markdown or Obsidian notes read-only. Produces an index, tags, map, or study guide only when requested."
disable-model-invocation: true
---

# Note Organizer

Call the Skill tool with **study-core** before doing anything else. Follow its shared workflow and invariants.

## Input

A Markdown or Obsidian folder, or attached Markdown files.

Use the core inventory command:

```bash
node <core-dir>/scripts/core.mjs inventory --path <folder> --json
```

Report the file count, Markdown titles, tags, wiki links, skipped files, and truncation before planning.

## Interview

Ask only when the answer is not already clear:

- Folder or files.
- Goal: index, tags, note map, study guide, or a combination.
- Output formats.
- Language.

## Output

Generate only the requested files:

```text
notes-index.md
note-map.pptx
note-map.pdf
tags.csv
study-guide.pdf
```

Typical defaults:

- Index: Markdown.
- Note map: PPTX for editing, PDF for viewing.
- Tags: CSV.
- Study guide: PDF.

## Required sections in `notes-index.md`

1. Vault overview and note count.
2. Notes by topic.
3. Heading outline per note.
4. Tags and tag clusters.
5. Wiki links and orphan notes.
6. Duplicate or near-duplicate notes.
7. Suggested study sequence.
8. Gaps and unsupported files.

## Rules

- Read-only source. Never move, rename, rewrite, or delete a source note.
- Never create or edit files inside the source vault.
- Use the core inventory hashes to confirm the source set did not change.
- Do not upload or sync notes anywhere.
- Do not create flashcards, exams, or summaries.
- Only write to `~/Documents/StudySkills/<topic>/<run>/`.
- No Canvas access.
