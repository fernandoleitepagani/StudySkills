# Study Notes

## What it does

Turns lecture material into structured study notes, or inventories and organizes Markdown and Obsidian notes read-only.

## When to use it

- Use **Lecture notes** for slides, transcripts, notes, or a StudySkills pack.
- Use **Organize notes** for a Markdown or Obsidian vault.

## What you need

A lecture source, or a Markdown/Obsidian folder. Audio and video are not transcribed.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/study-notes` in Claude Code, OpenCode, or Codex.
3. Choose **Lecture notes** or **Organize notes**.
4. Answer the questions. Mode selection counts toward the four-question limit.
5. Approve the plan before generation.

## What it produces

Lecture mode:

```text
lecture-notes.<format>
```

Optional `glossary.csv` when requested.

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

- Sources are read-only.
- Organizer mode never modifies the source vault.
- No Canvas access.
- No audio/video transcription.
- Only requested files are written.
- No source copies, prompt packs, or zip files.

## Troubleshooting

- **Audio or video:** provide a transcript first.
- **Missing vault notes:** check the folder and Markdown extension.
- **Wrong mode:** rerun and select the other mode.
