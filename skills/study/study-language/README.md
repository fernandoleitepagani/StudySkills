# Language Coach

## What it does

Builds a language-learning path with vocabulary, grammar, sentence mining, drills, reading and writing practice, and spaced review.

## When to use it

You want to learn a language from a chosen level toward a concrete goal, with a plan instead of a random word list.

## What you need

A target language, current level, goal, and available time. Local texts or notes are optional.

## How to use it

1. Install StudySkills or this skill alone. See the [root README](../../../README.md).
2. Run `/study-language` in Claude Code, OpenCode, or Codex.
3. Answer the questions. The native tool accepts a typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, sources, skips, and fallbacks.

A diagnostic estimates your starting level. It is not official CEFR certification. Vocabulary uses the card contract: `front,back,tags`.

## What it produces

A language plan, vocabulary CSV/Markdown, drills, an optional review schedule, and an optional immersion checklist.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /study-language
>
> Language: Spanish
> Level: A2
> Goal: travel conversation
> Hours per week: 4
> Output: PDF plan and CSV vocabulary

## Safety and limits

- Sources stay read-only.
- Only requested files enter Documents.
- The skill creates no source copies, prompt packs, or zip files.
- Pronunciation support is text only: IPA, stress, and notes.
- The skill does not score speech or claim CEFR certification.
- Short quotations only.
- The skill marks unverified language claims.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.

## Troubleshooting

- **Level unclear:** use the diagnostic.
- **Too much vocabulary:** lower the weekly load and extend the timeline.
- **No sources:** topic mode uses public references.
