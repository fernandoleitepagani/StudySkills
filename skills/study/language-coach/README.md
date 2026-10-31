# Language Coach

## What it does

Builds a progressive language-learning path with vocabulary, grammar, sentence mining, drills, reading and writing practice, and spaced review.

## When to use it

You want to learn a language from a chosen level toward a concrete goal, with a plan rather than a random list of words.

## What you need

A target language, current level, goal, and available time. Local texts or notes are optional.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/language-coach` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for changes, sources, skips, and fallbacks.

- A diagnostic estimates your starting level. It is not an official CEFR certification.
- Vocabulary is produced as Anki-ready CSV and/or Markdown.
- Pronunciation support is text-only: IPA, stress, and written notes. No audio and no pronunciation scoring.

## What it produces

A language plan, vocabulary CSV/Markdown, drills, an optional review schedule, and an optional immersion checklist.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /language-coach
>
> Language: Spanish
> Level: A2
> Goal: travel conversation
> Hours per week: 4
> Output: PDF plan and CSV vocabulary

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- No audio generation or pronunciation scoring.
- No claim of official CEFR certification.
- Short quotations only.
- Unverified language claims are marked.

## Troubleshooting

- **Level is unclear:** use the diagnostic.
- **Too much vocabulary:** lower the weekly load and extend the timeline.
- **No sources:** the plan uses topic mode and cites public references.
