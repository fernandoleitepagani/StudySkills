# Lecture Notes

## What it does

Turns lecture slides, transcripts, notes, or a StudySkills pack into structured, didactic study notes.

## When to use it

You have lecture material and want notes that explain the ideas instead of just transcribing the source.

## What you need

A lecture source: slides, a transcript, notes, or a StudySkills pack. Audio and video are not transcribed.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/lecture-notes` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, fallbacks, and web sources.

- Choose depth, glossary, self-check questions, format, and language.
- Notes cite the source slide, page, or file.

## What it produces

Notes in DOCX or PDF, plus an optional glossary CSV only when requested.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /lecture-notes
>
> Source: week-3-slides.pdf
> Depth: standard
> Include a glossary: yes
> Format: DOCX

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- No audio or video transcription.
- Do not invent lecture content.
- Missing source sections are reported.

## Troubleshooting

- **Audio or video input:** provide a transcript first.
- **Weak source:** add readings or a fuller transcript.
- **Wrong course context:** include the course and lecture title.
