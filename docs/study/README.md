# Study skills documentation

The 13 skills share one workflow: ask, plan, approve, write, validate, report.

Start with the [installation and update guide](./installation.md). Harness coverage and smoke results live in [harness-compatibility.md](./harness-compatibility.md). The [security audit](./security-audit.md) records controls and accepted risks. The [v1.1.1 release notes](./release-notes-v1.1.1.md) explain the current release.

## How the collection works

- The agent writes in PT-BR or EN. It defaults to PT-BR when you write Portuguese.
- Source quotes keep their original language.
- Documents use the shared style and accessibility rules.
- Sources stay read-only. Nothing enters Documents.
- Citations name files, not absolute paths.
- Canvas access belongs to `study-canvas` alone.
- Web research follows the hard do-not-send list in `../../core/references/web-research.md`.
- Web research is opt-in. The **Optional extras** question has a **Use public web research** box, unchecked by default.
- Every skill carries its own README.

## Development

Repository rules live in [AGENTS.md](../../AGENTS.md). The shared workflow is in [workflow.md](../../core/references/workflow.md), with the plan and quality contracts in [plan-contract.md](../../core/references/plan-contract.md) and [quality.md](../../core/references/quality.md). Harness versions and smoke tests live in [harness-compatibility.md](./harness-compatibility.md). Generation timings and targets live in [performance.md](./performance.md). LaTeX formulas, graphs, images, and fallbacks live in [math.md](./math.md).

## Skill notes

### study-canvas

Reads one Canvas course and writes study documents. Use it when you want a summary, plan, flashcards, practice exam, concept map, or a custom output from Canvas.

Token setup, partial access, and manual materials matter here. The skill reports forbidden sections and points you to `study-notes` or `study-files` when a video or Drive file needs manual download.

[Guide](../../skills/study/study-canvas/README.md) and [full page](./study-canvas.md).

### study-notes

Writes lecture notes or organizes a Markdown/Obsidian vault. Pick the mode first.

Lecture mode handles slides, transcripts, notes, or a StudySkills pack. Organizer mode inventories a vault, finds duplicates, and builds an index or study guide. Audio does not become text on its own.

[Guide](../../skills/study/study-notes/README.md)

### study-recall

Builds flashcards or active-recall practice. Flashcards produce Anki-ready CSV and Markdown. Active recall produces questions, answers, interleaving, and review sessions.

Active recall is not a timed exam. Every question points to a source.

[Guide](../../skills/study/study-recall/README.md)

### study-explain-back

Explains one concept in layers: ELI5, exam level, and expert level. The result includes an analogy, common misconceptions, and a self-test.

Bring a source when accuracy matters. The skill marks unsupported claims.

[Guide](../../skills/study/study-explain-back/README.md)

### study-exams

Creates a practice exam or reviews a finished attempt. Practice mode asks for question count, type, difficulty, time limit, and answer key. Debrief mode reads your answers, the exam, and an optional key.

Debrief without a key means no score. A retest uses new questions.

[Guide](../../skills/study/study-exams/README.md)

### study-planner

Builds a multi-course schedule or a mastery path for one subject. Schedule mode works from deadlines, weekly hours, and fixed commitments. Mastery mode starts with a diagnostic, maps prerequisites, and builds stages with checkpoints.

The skill does not invent deadlines or prior knowledge.

[Guide](../../skills/study/study-planner/README.md)

### study-files

Turns local folders, files, or attachments into study documents. It inventories the source, reports exact and near duplicates, and asks you to confirm the set.

Use it after you download Canvas or Drive material. It reads sources in place and uses no network.

[Guide](../../skills/study/study-files/README.md)

### study-revisit

Audits an earlier StudySkills document and writes a revised copy in a new run. It finds duplicates, ambiguity, contradictions, weak sections, and style problems.

The original stays unchanged. Any correction needs evidence.

[Guide](../../skills/study/study-revisit/README.md)

### study-language

Builds a language-learning path with vocabulary, grammar, sentence mining, drills, reading, writing, and review. A diagnostic sets a starting level; it is not official CEFR certification.

Pronunciation support stays textual: IPA, stress, and notes. The skill does not score speech.

[Guide](../../skills/study/study-language/README.md)

### study-math-practice

Writes original math and STEM problems with progressive hints, worked solutions, common errors, and an optional answer key. Problem and solution counts stay aligned.

The skill does not run a math engine or hide a calculator. Formulas use LaTeX, and graphs use PGFPlots or TikZ blocks.

[Guide](../../skills/study/study-math-practice/README.md)

### study-code-kata

Writes programming katas with requirements, tests, hints, reference solutions, and review questions. Tests cover normal, edge, and invalid cases.

It installs no packages. The skill marks tests it never ran as unexecuted.

[Guide](../../skills/study/study-code-kata/README.md)

### paper-reader

Reads a research paper and writes a brief with the question, method, results, limitations, critique, evidence, and follow-up questions. It marks missing metadata instead of guessing.

Paper claims and web context stay separate. It does not bypass paywalls.

[Guide](../../skills/study/paper-reader/README.md)

### thesis-organizer

Turns notes, sources, or a draft into a research question, argument map, outline, evidence matrix, source gaps, and writing plan. It separates evidence from interpretation.

The default is planning. Final thesis prose requires an explicit request.

[Guide](../../skills/study/thesis-organizer/README.md)

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
