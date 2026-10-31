# Study skills documentation

One collection page. Per-skill guides live in each skill `README.md`.

## Collection conventions

- Output language is PT-BR or EN. Default to PT-BR when the user writes Portuguese; otherwise EN.
- Source quotes stay in their original language.
- Documents use the shared didactic style and accessibility rules.
- Sources are read locally and never modified or copied into Documents.
- Citations use filenames, not absolute paths.
- No telemetry. Canvas access is limited to the read-only Canvas skill.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- Every skill has its own README with a usage guide.

## canvas-study

- **What it does:** fetches one Canvas course read-only and generates study documents.
- **When to use it:** you have a Canvas course and want a summary, plan, flashcards, practice exam, concept map, or custom study output.
- **Common questions:** token setup, formats, read-only access, output location.
- **It's working if:** native questions appear, a plan is shown before fetching, only requested files are written to Documents, and failures are reported.

Full page: [canvas-study.md](./canvas-study.md).

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

- **What it does:** builds a multi-course schedule or a progressive mastery path.
- **When to use it:** use schedule mode for deadlines and weekly hours; use mastery mode for a subject path from basics to full knowledge.
- **Common questions:** deadlines are validated and never invented. Mastery mode starts with a diagnostic and prerequisite map.
- **It's working if:** every course and deadline appears in the schedule, or the mastery path has stages, checkpoints, and evidence.
- **Guide:** [study-planner README](../../skills/study/study-planner/README.md).

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

## revisit-and-improve

- **What it does:** audits existing StudySkills documents, finds duplicates, ambiguity, errors, and weak sections, and writes improved copies.
- **When to use it:** a previous run needs a correction or quality pass.
- **Common questions:** originals are never modified. Revised files go to a new run.
- **It's working if:** the audit identifies issues, changes are evidence-based, and the original hashes remain unchanged.

## language-coach

- **What it does:** builds a language-learning path with vocabulary, grammar, sentence mining, drills, and review.
- **When to use it:** you want a structured path toward a language goal.
- **Common questions:** no audio or pronunciation scoring. Vocabulary uses the Anki CSV contract.
- **It's working if:** the path matches your level and goal, vocabulary is deduplicated, and the review schedule is realistic.

## active-recall-coach

- **What it does:** builds retrieval practice from StudySkills documents or added sources.
- **When to use it:** you want to remember material through repeated recall, not rereading.
- **Common questions:** this is not a timed exam. Every question has an answer and source.
- **It's working if:** source coverage is complete, questions mix recall and application, and the schedule is usable.

## math-practice

- **What it does:** generates original math and STEM problems with hints, worked solutions, and common errors.
- **When to use it:** you want deliberate practice with explanations.
- **Common questions:** problems are original. The skill does not run a math engine.
- **It's working if:** problem and solution counts match, steps are complete, and assumptions are stated.

## exam-debrief

- **What it does:** analyzes a completed exam or practice test and builds a remediation plan.
- **When to use it:** you have results and want to know what to fix next.
- **Common questions:** no answer key means no score. A retest uses new questions.
- **It's working if:** errors are classified with evidence and the remediation plan is specific.

## code-kata-coach

- **What it does:** generates programming katas with requirements, tests, hints, reference solutions, and review questions.
- **When to use it:** you want deliberate coding practice on a language or concept.
- **Common questions:** no packages are installed. Unexecuted tests are marked unexecuted.
- **It's working if:** each kata has tests and a solution, and the tests match the requirements.

## paper-reader

- **What it does:** reads a research paper and produces a structured brief with method, results, limitations, critique, evidence, and follow-up questions.
- **When to use it:** you need to understand or critique a paper efficiently.
- **Common questions:** metadata is marked unknown when absent. No paywall bypass and no invented citations.
- **It's working if:** paper claims are separate from web context, evidence is classified, and page references are present.

## thesis-organizer

- **What it does:** turns a thesis topic, notes, sources, or draft into a research question, argument map, outline, evidence matrix, source gaps, and writing plan.
- **When to use it:** you are planning or revising a thesis or substantial research project.
- **Common questions:** the default is planning, not final thesis prose. Evidence and interpretation are separate.
- **It's working if:** unsupported claims are marked, the outline matches the question, and the writing plan is realistic.

## Skill guides

Every skill has its own README:

- [canvas-study](../../skills/study/canvas-study/README.md)
- [lecture-notes](../../skills/study/lecture-notes/README.md)
- [flashcard-forge](../../skills/study/flashcard-forge/README.md)
- [explain-back](../../skills/study/explain-back/README.md)
- [exam-sim](../../skills/study/exam-sim/README.md)
- [study-planner](../../skills/study/study-planner/README.md)
- [note-organizer](../../skills/study/note-organizer/README.md)
- [file-study](../../skills/study/file-study/README.md)
- [revisit-and-improve](../../skills/study/revisit-and-improve/README.md)
- [language-coach](../../skills/study/language-coach/README.md)
- [active-recall-coach](../../skills/study/active-recall-coach/README.md)
- [math-practice](../../skills/study/math-practice/README.md)
- [exam-debrief](../../skills/study/exam-debrief/README.md)
- [code-kata-coach](../../skills/study/code-kata-coach/README.md)
- [paper-reader](../../skills/study/paper-reader/README.md)
- [thesis-organizer](../../skills/study/thesis-organizer/README.md)
