# Study Notes

## What it does

Writes lecture notes or organizes a Markdown/Obsidian vault. Pick a mode first: **Lecture notes** or **Organize notes**.

## When to use it

Use lecture mode for slides, transcripts, notes, or a StudySkills pack. Use organizer mode when you want an index, tags, duplicate report, note map, or study guide from a vault.

## What you need

A lecture source or a Markdown/Obsidian folder. The skill does not transcribe audio or video.

## How to use it

1. Install StudySkills or this skill alone. See the [root README](../../../README.md).
2. Run `/study-notes` in Claude Code, OpenCode, or Codex.
3. Choose **Lecture notes** or **Organize notes**.
4. Answer the questions. Mode selection takes one of the four question slots.
5. Approve the plan before generation.

Lecture mode asks for depth and format. Organizer mode asks for the output mix and format.

## What it produces

Lecture mode:

```text
lecture-notes.<format>
```

Add `glossary.csv` only when you ask for it.

Organizer mode:

```text
notes-index.md
note-map.pptx
note-map.pdf
tags.csv
study-guide.pdf
```

Outputs go to `~/Documents/StudySkills/<topic>/<run>/`.

## Example

> /study-notes
>
> Mode: Lecture notes
> Source: week-3-slides.pdf
> Depth: standard
> Format: DOCX

Or:

> /study-notes
>
> Mode: Organize notes
> Source: ~/Obsidian/Statistics
> Goal: index and note map
> Format: Markdown and PPTX

## Safety and limits

- Sources stay read-only.
- Organizer mode never changes the source vault.
- No Canvas access.
- No audio or video transcription.
- Only requested files enter Documents.
- The skill creates no source copies, prompt packs, or zip files.

## Troubleshooting

- **Audio or video:** provide a transcript first.
- **Missing vault notes:** check the folder and the Markdown extension.
- **Wrong mode:** rerun and choose the other mode.
