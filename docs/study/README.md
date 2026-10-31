# Study skills documentation

One collection page. Per-skill details live in each `SKILL.md`.

## Collection conventions

- Output language is PT-BR or EN. Default to PT-BR when the user writes Portuguese; otherwise EN.
- Source quotes stay in their original language.
- Documents use the shared didactic style and accessibility rules.
- Sources are read locally and never modified or copied into Documents.
- Citations use filenames, not absolute paths.
- No telemetry. Canvas access is limited to the read-only Canvas skill.

## canvas-study

- **What it does:** fetches one Canvas course read-only and generates study documents.
- **When to use it:** you have a Canvas course and want a summary, plan, flashcards, practice exam, concept map, or custom study output.
- **Common questions:** token setup, formats, read-only access, output location.
- **It's working if:** native questions appear, a plan is shown before fetching, only requested files are written to Documents, and failures are reported.

Full page: [canvas-study.md](./canvas-study.md).

## study-core

- **What it does:** shared engine for the v0.2 and v0.3 study skills.
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

## exam-sim

- **What it does:** generates a timed practice exam with answer key and topic map.
- **When to use it:** you want exam practice from a pack, local files, or a topic.
- **Common questions:** the time limit is printed, not a live timer. No answer key means no answer key file.
- **It's working if:** question count, time limit, answer key, and topic map agree.

## study-planner

- **What it does:** plans multiple courses around deadlines, weekly hours, and fixed commitments.
- **When to use it:** you need a term plan without a source pack.
- **Common questions:** deadlines are validated and never invented. Past deadlines require confirmation.
- **It's working if:** every course and deadline appears in the weekly plan.

## note-organizer

- **What it does:** inventories and organizes Markdown or Obsidian notes read-only.
- **When to use it:** you want an index, tags, a note map, or a study guide.
- **Common questions:** source notes are never modified. Only requested outputs are written to Documents.
- **It's working if:** the source hashes are unchanged and the index covers the vault.

## file-study

- **What it does:** turns local folders, files, or harness attachments into study documents.
- **When to use it:** you have local slides, readings, notes, or PDFs and want study outputs without Canvas.
- **Common questions:** sources are read-only; exact and near duplicates are reported; attachments must be available as paths; no network.
- **It's working if:** inventory is confirmed before planning, source hashes are unchanged, citations name the files, and only requested outputs are written.
