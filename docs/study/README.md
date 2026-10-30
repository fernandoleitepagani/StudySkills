# Study skills documentation

One collection page. Per-skill details live in each `SKILL.md`.

## canvas-study

- **What it does:** fetches one Canvas course read-only and generates study documents.
- **When to use it:** you have a Canvas course and want a summary, plan, flashcards, practice exam, concept map, or custom study output.
- **Common questions:** token setup, formats, read-only access, output location.
- **It's working if:** native questions appear, a plan is shown before fetching, only requested files are written to Documents, and failures are reported.

Full page: [canvas-study.md](./canvas-study.md).

## study-core

- **What it does:** shared engine for the v0.2 study skills.
- **When to use it:** never directly. A user-invoked skill loads it.
- **Common questions:** why it exists, why it is internal, where it writes.
- **It's working if:** the calling skill can create work/output directories, validate, and report partial formats.

## lecture-notes

- **What it does:** turns lecture slides, transcripts, or notes into structured, didactic study notes.
- **When to use it:** you have a lecture source and want notes, a glossary, or self-check questions.
- **Common questions:** audio is not transcribed; ask for a transcript. Sources are optional only if you provide text.
- **It's working if:** notes cite the source and contain the required sections.

## flashcard-forge

- **What it does:** writes Anki-ready CSV and/or Markdown flashcards.
- **When to use it:** you want atomic cards from a pack, local files, or a topic.
- **Common questions:** no `.apkg`; Anki imports the CSV. Only requested formats are written.
- **It's working if:** the CSV has `front,back,tags`, has no duplicates, and the card count matches the plan.

## explain-back

- **What it does:** explains a concept in layers with the Feynman technique.
- **When to use it:** you want an intuitive explanation, an exam-level explanation, and a self-test.
- **Common questions:** a source is optional. If none is used, the skill says so.
- **It's working if:** ELI5, exam-level, expert-level, analogy, misconceptions, and self-test are present.

## Planned v0.2.1

- `exam-sim`
- `study-planner`
- `note-organizer`

## Planned v0.3.0

- `file-study`
