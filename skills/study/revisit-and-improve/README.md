# Revisit and Improve

## What it does

Audits documents you already generated, finds duplicates, ambiguity, contradictions, weak sections, and style problems, and writes improved copies in a new run.

## When to use it

A previous StudySkills run needs a quality review, a correction pass, or a clearer and more visual version.

## What you need

One or more documents under `~/Documents/StudySkills`, or another local folder you add.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/revisit-and-improve` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for changes, sources, skips, and fallbacks.

- Choose **Everything in the selected topic or run** or **Choose specific materials**.
- Choose audit only, or audit and revise.
- Originals are never changed. Revised files use a new run directory and a `-revised` name.

## What it produces

Revised documents in the requested formats, plus an optional audit report.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /revisit-and-improve
>
> Documents: statistics/2026-10-30-1200
> Mode: audit and revise
> Focus: correctness, clarity, visual style
> Output: revised summary PDF

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- Does not modify the original run.
- Does not claim a correction without evidence.
- Unverified claims are marked.
- Does not merge unrelated documents unless asked.

## Troubleshooting

- **Document cannot be read:** confirm the harness can read that format.
- **No source evidence:** the audit marks the claim unverified instead of guessing.
- **PDF layout changes:** revised PDFs are regenerated and may use a new layout.
