# Revisit and Improve

## What it does

Audits a StudySkills document and writes a revised copy in a new run. It looks for duplicates, ambiguity, contradictions, weak sections, and style problems.

## When to use it

An earlier run needs a quality review, a correction pass, or a clearer version.

## What you need

One or more documents under `~/Documents/StudySkills`, or another local folder you add.

## How to use it

1. Install StudySkills or this skill alone. See the [root README](../../../README.md).
2. Run `/study-revisit` in Claude Code, OpenCode, or Codex.
3. Answer the questions. The native tool accepts a typed answer.
4. Approve the plan before generation.
5. Read the final report for changes, sources, skips, and fallbacks.

Choose **Everything in the selected topic or run** or **Choose specific materials**. Then choose audit only or audit and revise. Revised files use a new run directory and a `-revised` name.

## What it produces

Revised documents in the formats you request, plus an optional audit report.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /study-revisit
>
> Documents: statistics/2026-10-30-1200
> Mode: audit and revise
> Focus: correctness, clarity, visual style
> Output: revised summary PDF

## Safety and limits

- The original run stays untouched.
- Original files remain read-only.
- Only requested files enter Documents.
- The skill copies no source files, prompt packs, or zip files.
- Every correction needs evidence.
- The audit marks unverified claims.
- The skill does not merge unrelated documents unless you ask.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.

## Troubleshooting

- **Document cannot be read:** confirm the harness supports that format.
- **No source evidence:** the audit marks the claim unverified.
- **PDF layout changed:** the skill regenerates the PDF and may use a new layout.
