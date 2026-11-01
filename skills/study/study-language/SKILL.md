---
name: study-language
description: "Build a language-learning path with vocabulary, grammar, sentence mining, drills, reading and writing practice, and a spaced review schedule. Text-only; no audio generation or pronunciation scoring."
disable-model-invocation: true
---

# Language Coach

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants.

## Invariants

- **No audio generation.** No speech synthesis, voice recording, or pronunciation scoring.
- **Text only for pronunciation.** IPA, stress, and written pronunciation notes are allowed.
- **Do not invent language facts.** Mark uncertain grammar, usage, or etymology.
- **Source files are read-only.**
- **Only requested files** go to `~/Documents/StudySkills/<topic>/<run>/`.
- **Web research follows `references/core/web-research.md`.** The do-not-send list is absolute.
- **Quality is evidence.** Follow `references/core/quality.md`.

## Input

Use one of:

- `topic`: a target language, level, and goal with no source files.
- `paths`: local texts, notes, subtitles, or vocabulary files.
- `pack`: a StudySkills pack.

Optional sources are useful for sentence mining. If no source is provided, use the topic mode and say that examples come from model knowledge and web references.

## Interview

Ask only what is not already known:

- Target language.
- Current level: A1, A2, B1, B2, C1, C2, or a plain description.
- Goal: travel, exam, reading, writing, conversation, work, or a custom goal.
- Available hours per week and target date, if any.
- Focus: vocabulary, grammar, reading, writing, listening, speaking, or balanced.
- Source language for translations.
- Output language for explanations.
- Formats: PDF, DOCX, Markdown, CSV.
- Whether to include a diagnostic.

## Diagnostic

If the user is unsure of their level, ask 8 to 12 short questions covering:

- vocabulary recognition
- sentence comprehension
- grammar patterns
- translation
- a short writing prompt

Use the result as a placement estimate, not a certification. Record the estimate in the plan.

## Plan

Build a progressive path:

1. Goal and current level.
2. Diagnostic result.
3. Vocabulary priorities.
4. Grammar sequence.
5. Sentence mining.
6. Reading and writing practice.
7. Review schedule.
8. Immersion checklist.

Write `plan.json` with `quality.required: true`. Use source mode `topic`, `paths`, or `pack`.

## Outputs

Generate only the requested files:

```text
language-plan.<format>
vocabulary.csv
vocabulary.md
drills.<format>
review-schedule.csv
immersion-checklist.md
```

Typical defaults:

- Language plan: PDF.
- Vocabulary: CSV and Markdown.
- Drills: PDF.
- Review schedule: CSV only if requested.
- Immersion checklist: Markdown only if requested.

## Vocabulary contract

Use the same CSV shape as `study-recall`:

```text
front,back,tags
```

- One item per card.
- Front: a word, phrase, or prompt in the target language.
- Back: meaning, translation, or a short example.
- Tags: lowercase topic, level, or grammar labels.
- No duplicate fronts.
- Include a short example sentence where useful.
- Do not copy long passages from the source.

## Grammar sequence

Order grammar by prerequisite, not alphabetically.

For each grammar point include:

- what it does
- form or pattern
- one clear example
- common mistake
- a short drill
- a review checkpoint

Do not claim a grammar rule is universal if it depends on register, dialect, or context. Mark exceptions.

## Sentence mining

Use short sentences from the user's sources:

- original sentence
- translation
- target word or structure
- source citation
- one personal example prompt

Keep quotes short. Do not reproduce long copyrighted passages.

## Practice

Generate a mix of:

- recognition
- recall
- cloze
- translation
- sentence correction
- short writing prompts
- reading questions

No audio tasks. For speaking, use written role-play scripts and self-assessment rubrics. Do not score pronunciation.

## Review schedule

Use spaced review intervals. Include:

- new items
- review items
- interleaved grammar
- reading and writing checkpoints
- weekly workload

If a requested workload is unrealistic, say so and propose a smaller plan.

## Required sections in the language plan

1. Cover: language, level, goal, date, "StudySkills".
2. How to use this plan.
3. Diagnostic result.
4. Learning objectives.
5. Vocabulary plan.
6. Grammar sequence.
7. Sentence mining.
8. Reading and writing practice.
9. Speaking and listening text practice.
10. Review schedule.
11. Immersion checklist.
12. Sources and references.
13. Risks and next steps.

## Rules

- No audio or pronunciation scoring.
- No claim of official CEFR certification.
- Cite local sources by filename and web sources by title, URL, and access date.
- Separate local and web citations.
- Do not send source text, filenames, paths, or personal data to a web tool.
- Do not create a general summary, exam, or unrelated study document.
- Set `quality.required` to `true` in `plan.json`.
