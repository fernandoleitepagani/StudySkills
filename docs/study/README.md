# Study skills documentation

One collection page. Per-skill guides live in each skill `README.md`.

Install and update instructions: [installation.md](./installation.md).
Harness compatibility and smoke tests: [harness-compatibility.md](./harness-compatibility.md).

Security audit: [security-audit.md](./security-audit.md).
Release notes: [release-notes-v1.0.0.md](./release-notes-v1.0.0.md).

## Collection conventions

- Output language is PT-BR or EN. Default to PT-BR when the user writes Portuguese; otherwise EN.
- Source quotes stay in their original language.
- Documents use the shared didactic style and accessibility rules.
- Sources are read locally and never modified or copied into Documents.
- Citations use filenames, not absolute paths.
- No telemetry. Canvas access is limited to the read-only Canvas skill.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- Every skill has its own README with a usage guide.

## study-canvas

- **What it does:** fetches one Canvas course read-only and generates study documents.
- **When to use it:** you have a Canvas course and want a summary, plan, flashcards, practice exam, concept map, or custom output.
- **Common questions:** token setup, formats, partial access, manual materials.
- **It's working if:** native questions appear, a plan is shown, only requested files are written, and forbidden sections are reported.
- **Guide:** [study-canvas README](../../skills/study/study-canvas/README.md).

Full page: [study-canvas.md](./study-canvas.md).

## study-notes

- **What it does:** creates lecture notes or organizes Markdown/Obsidian notes read-only.
- **When to use it:** you have lecture material or a notes vault.
- **Common questions:** choose the mode first. Audio is not transcribed. Source notes are never modified.
- **It's working if:** the selected mode produces its expected files and citations or source hashes are intact.
- **Guide:** [study-notes README](../../skills/study/study-notes/README.md).

## study-recall

- **What it does:** builds flashcards or active-recall practice.
- **When to use it:** you want cards or retrieval practice from a source.
- **Common questions:** choose Flashcards or Active recall. Active recall is not a timed exam.
- **It's working if:** cards are deduplicated, or every recall question has an answer and source.
- **Guide:** [study-recall README](../../skills/study/study-recall/README.md).

## study-explain-back

- **What it does:** explains concepts in layers with the Feynman technique.
- **When to use it:** you want an intuitive explanation, exam-level explanation, and self-test.
- **Common questions:** a source is optional. If none is used, the skill says so.
- **It's working if:** ELI5, exam-level, expert-level, analogy, misconceptions, and self-test are present.
- **Guide:** [study-explain-back README](../../skills/study/study-explain-back/README.md).

## study-exams

- **What it does:** creates practice exams or debriefs completed exams.
- **When to use it:** before an exam or after a practice attempt.
- **Common questions:** choose the mode first. Debrief without a key means no score.
- **It's working if:** exam counts agree, or the debrief has evidence-based error analysis and remediation.
- **Guide:** [study-exams README](../../skills/study/study-exams/README.md).

## study-planner

- **What it does:** builds a multi-course schedule or a progressive mastery path.
- **When to use it:** use schedule mode for deadlines and weekly hours; mastery mode for a subject path from basics to full knowledge.
- **Common questions:** deadlines are validated and never invented. Mastery mode starts with a diagnostic and prerequisite map.
- **It's working if:** every course and deadline appears in the schedule, or the mastery path has stages, checkpoints, and evidence.
- **Guide:** [study-planner README](../../skills/study/study-planner/README.md).

## study-files

- **What it does:** turns local folders, files, or harness attachments into study documents.
- **When to use it:** you have local slides, readings, notes, or PDFs and want study outputs without Canvas.
- **Common questions:** sources are read-only; exact and near duplicates are reported; no network.
- **It's working if:** inventory is confirmed, source hashes are unchanged, citations name files, and only requested outputs are written.
- **Guide:** [study-files README](../../skills/study/study-files/README.md).

## study-revisit

- **What it does:** audits existing StudySkills documents, finds duplicates, ambiguity, errors, and weak sections, and writes improved copies.
- **When to use it:** a previous run needs a correction or quality pass.
- **Common questions:** originals are never modified. Revised files go to a new run.
- **It's working if:** issues are evidenced and original hashes remain unchanged.
- **Guide:** [study-revisit README](../../skills/study/study-revisit/README.md).

## study-language

- **What it does:** builds a language-learning path with vocabulary, grammar, sentence mining, drills, and review.
- **When to use it:** you want a structured path toward a language goal.
- **Common questions:** no audio or pronunciation scoring. Vocabulary uses the Anki CSV contract.
- **It's working if:** the path matches level and goal, vocabulary is deduplicated, and the review schedule is realistic.
- **Guide:** [study-language README](../../skills/study/study-language/README.md).

## study-math-practice

- **What it does:** generates original math and STEM problems with hints, worked solutions, and common errors.
- **When to use it:** you want deliberate practice with explanations.
- **Common questions:** problems are original. The skill does not run a math engine.
- **It's working if:** problem and solution counts match, steps are complete, and assumptions are stated.
- **Guide:** [study-math-practice README](../../skills/study/study-math-practice/README.md).

## study-code-kata

- **What it does:** generates programming katas with requirements, tests, hints, reference solutions, and review questions.
- **When to use it:** you want deliberate coding practice.
- **Common questions:** no packages are installed. Unexecuted tests are marked unexecuted.
- **It's working if:** each kata has tests and a solution, and tests match requirements.
- **Guide:** [study-code-kata README](../../skills/study/study-code-kata/README.md).

## paper-reader

- **What it does:** reads a research paper and produces a structured brief with method, results, limitations, critique, evidence, and questions.
- **When to use it:** you need to understand or critique a paper efficiently.
- **Common questions:** metadata is marked unknown when absent. No paywall bypass and no invented citations.
- **It's working if:** paper claims are separate from web context, evidence is classified, and page references are present.
- **Guide:** [paper-reader README](../../skills/study/paper-reader/README.md).

## thesis-organizer

- **What it does:** turns a thesis topic, notes, sources, or draft into a research question, argument map, outline, evidence matrix, source gaps, and writing plan.
- **When to use it:** you are planning or revising a thesis or substantial research project.
- **Common questions:** the default is planning, not final thesis prose. Evidence and interpretation are separate.
- **It's working if:** unsupported claims are marked, the outline matches the question, and the writing plan is realistic.
- **Guide:** [thesis-organizer README](../../skills/study/thesis-organizer/README.md).

## Skill guides

- [study-canvas](../../skills/study/study-canvas/README.md)
- [study-notes](../../skills/study/study-notes/README.md)
- [study-recall](../../skills/study/study-recall/README.md)
- [study-explain-back](../../skills/study/study-explain-back/README.md)
- [study-exams](../../skills/study/study-exams/README.md)
- [study-planner](../../skills/study/study-planner/README.md)
- [study-files](../../skills/study/study-files/README.md)
- [study-revisit](../../skills/study/study-revisit/README.md)
- [study-language](../../skills/study/study-language/README.md)
- [study-math-practice](../../skills/study/study-math-practice/README.md)
- [study-code-kata](../../skills/study/study-code-kata/README.md)
- [paper-reader](../../skills/study/paper-reader/README.md)
- [thesis-organizer](../../skills/study/thesis-organizer/README.md)
