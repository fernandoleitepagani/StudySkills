# StudySkills v1.0.0 Release Notes

## Release

StudySkills v1.0.0 is the first stable collection release.

It includes 13 user-invoked skills for Claude Code, OpenCode, and Codex, CLI and GUI, on Linux, macOS, Windows native, and WSL.

## Skills

- `study-canvas`
- `study-notes`
- `study-recall`
- `study-explain-back`
- `study-exams`
- `study-planner`
- `study-files`
- `study-revisit`
- `study-language`
- `study-math-practice`
- `study-code-kata`
- `paper-reader`
- `thesis-organizer`

## Highlights

- Common `study-*` naming.
- Merged mode-based skills:
  - `study-notes`: Lecture notes / Organize notes
  - `study-recall`: Flashcards / Active recall
  - `study-exams`: Create a practice exam / Debrief a completed exam
- Four-question interview limit.
- Read-only Canvas access.
- Per-host Canvas tokens.
- Partial Canvas section access.
- Durable `manual-materials.md` report.
- Browser-download and `study-files` workflow for external material.
- Quality and accessibility checks.
- Self-contained skills with local core files.
- Claude and Codex marketplace metadata.
- OpenCode collection and single-skill installation.
- Linux, macOS, and Windows support.

## Accepted limitations

- Module-linked Pages, Files, and Assignments are not fully resolved automatically.
- Module-only titles can be thinner than expected.
- Inline module items may be incomplete.
- Module selection does not always include child resources.
- Canvas Files or Pages may be forbidden by course policy.
- Private Google Drive files and videos are not downloaded.
- Videos require a transcript or subtitles.
- Quality evidence is agent-attested, not independently fact-checked.
- Web research depends on harness access and remains untrusted.
- Public Claude and Codex store listings are future work.

## Install

See [installation.md](./installation.md) for Claude Code, Codex, OpenCode, Windows PowerShell, WSL, and update instructions.

## Upgrade note

v0.9.5 introduced the current names and merged modes. The old migration guide was removed for the small user base. Users should install the 13-skill collection cleanly and remove old copies.
