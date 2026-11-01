# Roadmap 2 - File Study and Manual Media

This document tracks the File Study skill and the future media-import work.

## Goal

`file-study` turns local folders, files, and harness attachments into study documents.

It reads sources in place, runs the shared interview and plan flow, and writes only requested outputs to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

There is no Canvas connection, no token, and no network access.

## Shipped in v0.3.0 - File Study

- Accept folder paths, explicit file paths, and harness attachments.
- Inventory names, types, sizes, hashes, dates, Markdown headings, tags, and links.
- Detect exact and near-duplicate sources.
- Confirm the source set before planning.
- Ask for outputs, formats, settings, and language.
- Show a plan and require approval.
- Use the harness document skill for PDF, DOCX, and PPTX.
- Produce Markdown and CSV directly.
- Cite source filenames, not absolute paths.
- Report skipped files, duplicates, truncation, and format failures.
- Keep sources read-only.
- No network access, uploads, or external services.

## Shipped in v0.5.0 - Shared File Workflow

- Shared source-selection contract.
- StudySkills catalog command for existing runs.
- Shared quality rubric and checks.
- Shared web-research contract for skills that opt in.
- Shared visual and accessibility style rules.
- Per-skill READMEs and root collection index.

## Shipped in v0.9.1 - Manual Materials

- Canvas link inventory for modules, assignments, announcements, pages, syllabus, and front page.
- Durable `manual-materials.md` report.
- Optional `links.csv`.
- Exact instructions to download resources through the browser, save them locally, and run `/file-study`.
- Beginner-friendly result and error messages.
- Explicit separation between “downloaded” and “manual download required.”
- No Google Drive download.
- No video download.
- No transcription.

## Current limits

- `file-study` does not fetch remote URLs.
- Private Google Drive links cannot be accessed by the skill.
- Canvas media and video content cannot be downloaded or watched by the core skill.
- Videos need a transcript or subtitles before they can be studied.
- The core skill does not install `ffmpeg`, `yt-dlp`, or a transcription model.
- The skill does not use Whisper.

## Future media plan

Media support is separate from the v1.0.0 core and must stay optional.

### Phase 1 - Manual import

- Keep the durable `manual-materials.md` report.
- Let the user download via the browser.
- Accept downloaded files through `file-study`.
- Accept `.srt`, `.vtt`, `.txt`, and pasted transcripts.
- Never claim that a video was watched.

### Phase 2 - Public Google Drive

- Parse Google Drive file IDs from public links only.
- Support public export/download URLs.
- Require explicit user confirmation before downloading.
- Do not add private Drive OAuth to the core.
- Do not store Google credentials.
- Do not scrape authenticated Drive pages.

### Phase 3 - Captions and transcripts

- Prefer captions or transcripts already provided by Canvas, Panopto, Kaltura, Google Drive, or the video platform.
- Accept subtitles and plain transcripts.
- Feed transcripts into `file-study` like any other source.
- Keep the transcript as a read-only source.

### Phase 4 - Optional external tools

- Detect whether `ffmpeg` or `yt-dlp` is already installed.
- Never install them automatically.
- Ask before running them.
- Report the dependency and permission clearly.
- Keep the tools outside the skill bundle.

## Non-goals

- No Whisper.
- No bundled transcription model.
- No private Google Drive OAuth in the core skill.
- No browser automation.
- No cloud-drive scraping.
- No automatic large-media download without consent.
- No uploads or external study service.
- No requirement that normal `file-study` runs use the network.

## Relationship to v1.0.0

- Manual materials and beginner errors are part of the 0.9.x line.
- Google Drive and video acquisition remain post-v1 unless explicitly pulled forward.
- `file-study` remains usable without any media integration.
- A user can always download a file or transcript manually and use `file-study`.
