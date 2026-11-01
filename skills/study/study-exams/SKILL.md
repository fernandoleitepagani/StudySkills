---
name: study-exams
description: "Create a timed practice exam, or debrief a completed exam and build a remediation plan. Choose the practice-exam or exam-debrief mode."
disable-model-invocation: true
---

# Study Exams

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants. Read `references/core/math.md` when the source contains formulas, graphs, or math images.

## Math format

Quantitative questions and answer keys use LaTeX for formulas. Graphs use `latex-graph` blocks with labeled axes and captions. Answer-key CSV stays plain.

## Modes

Choose one mode first:

1. **Create a practice exam** — timed exam, answer key, topic map, optional review schedule.
2. **Debrief a completed exam** — score analysis, error patterns, remediation, optional retest.

The mode question counts toward the four-question interview limit.

## Input

### Practice exam mode

Use one of:

- A StudySkills pack containing `sources/materials.md`.
- Local files or folders.
- A topic with no source files.

### Exam debrief mode

Use one of:

- A completed exam PDF, DOCX, or Markdown file.
- A StudySkills practice exam.
- A question list plus the learner's answers.
- An optional answer key.
- Optional timing or confidence notes.

Accept multiple paths when the exam and answer sheet are separate.

## Interview

Ask at most four questions. Ask only when the answer is not already clear.

1. Mode.
2. Source.
3. Practice exam: count, format/difficulty, and optional web research. Debrief: answer key, retest, and optional web research.
4. Output format.

Ask the shared **Optional extras** question as part of question 3. Leave **Use public web research** unchecked by default. **No extras** is exclusive.

Infer the output language from the user's message unless specified. Additional settings go in the plan and remain editable.

## Output

### Practice exam mode

```text
practice-exam.<format>
```

Optional `review-schedule.csv` only if requested.

Default to PDF. Use DOCX for an editable exam.

### Exam debrief mode

```text
exam-debrief.<format>
error-analysis.csv
remediation-plan.<format>
retest.<format>
```

Typical defaults:

- Debrief: PDF.
- Error analysis: CSV only if requested.
- Remediation plan: DOCX for editing or PDF for printing.
- Retest: PDF.

## Required sections

### Practice exam

1. Cover: course or topic, date, time limit, question count, "StudySkills".
2. Instructions: time limit, number of questions, allowed materials.
3. Questions, numbered.
4. Answer sheet or answer spaces.
5. Answer key with explanations.
6. Topic map: question number, topic, skill tested.
7. Optional review schedule table.

### Exam debrief

1. Cover: exam, date, score state, "StudySkills".
2. How to use this debrief.
3. Attempt summary.
4. Score, only if a key exists.
5. Error table.
6. Error patterns.
7. Topic weaknesses.
8. Timing and confidence analysis.
9. What went well.
10. Remediation priorities.
11. Retest plan, if requested.
12. Sources and references.

## Rules

### Both modes

- Read-only sources.
- No Canvas access.
- Follow `references/core/quality.md`.
- Set `quality.required` to `true` in `plan.json`.

### Practice exam mode

- Match the requested question count exactly.
- Mix recall, application, and analysis.
- The time limit in the cover and instructions must agree.
- No live timer application.
- Do not create notes, flashcards, or a summary.

### Exam debrief mode

- Do not fake grading.
- No answer key means no score.
- No key means no score.
- Do not shame the learner.
- Do not claim a cause without evidence.
- Do not reuse original exam questions in the retest.
- Do not send private exam content to the web.
- Do not create notes, flashcards, or a general study guide.
