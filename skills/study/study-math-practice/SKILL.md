---
name: study-math-practice
description: "Generate graded math or STEM problem sets with progressive hints, worked solutions, common errors, and an optional answer key."
disable-model-invocation: true
---

# Math Practice

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants. Read `references/core/math.md` before writing formulas or graphs.

## Invariants

- **Original problems.** Do not copy a problem bank or a long passage from a source.
- **Show the work.** Every solution needs reasoning, not only a final answer.
- **Use LaTeX.** Write formulas as `$...$` or `$$...$$`. Use `latex-graph` blocks for graphs.
- **Mark assumptions.** If a problem depends on an unstated convention, say so.
- **No code execution required.** Do not install packages, run a math engine, or claim a result was verified by a tool unless it actually was.
- **Sources are read-only.**
- **Only requested files** go to `~/Documents/StudySkills/<topic>/<run>/`.
- **Web research follows `references/core/web-research.md`.** The do-not-send list is absolute.
- **Quality is evidence.** Follow `references/core/quality.md`.

## Input

Use one of:

- `topic`: a topic, level, and goal with no source files.
- `paths`: local textbook pages, notes, or problem sets.
- `pack`: a StudySkills pack.

If a source is supplied, use it for terminology, methods, and difficulty calibration. Do not reproduce its problems verbatim.

## Interview

Ask only what is not already known:

- Topic or unit.
- Level: middle school, high school, undergraduate, graduate, or a custom level.
- Number of problems.
- Difficulty mix: easy, standard, hard, or custom.
- Problem types: calculation, proof, word problem, graph, multiple choice, or mixed.
- Include progressive hints.
- Include worked solutions.
- Include a separate answer key.
- Optional extras: use the shared checkbox. Leave **Use public web research** unchecked by default.
- Output format.
- Output language.

## Procedure

### 1. Define objectives

State the skills the set is testing:

- recall
- procedure
- application
- interpretation
- proof or justification
- transfer

### 2. Build the progression

Use a deliberate difficulty ramp:

1. Warm-up.
2. Core procedure.
3. Application.
4. Multi-step or transfer.
5. Challenge, optional.

### 3. Generate original problems

For each problem, record:

- prompt
- given information
- what the learner must find or prove
- difficulty
- topic
- expected method
- answer
- common error
- formula or graph block, when needed

Vary numbers and contexts. Do not produce near-duplicates.

### 4. Write hints

Hints should be progressive:

1. What concept to use.
2. The first step.
3. A stronger nudge.

Do not reveal the full solution in the first hint.

### 5. Write worked solutions

Every solution:

1. Restates the goal.
2. Shows the method.
3. Shows the steps with display equations.
4. States the answer with units where relevant.
5. Notes a common mistake.
6. Checks plausibility or substitutes back when possible.

Mark any assumption or convention. Use LaTeX for every formula.

### 6. Answer key

Use a compact CSV when requested:

```text
number,answer,topic,difficulty
1,42,linear equations,easy
```

The answer key must match the problem and solution counts exactly.

### 7. Common errors

List the likely error, why it happens, and how to avoid it.

## Math format

- Every formula uses LaTeX.
- Every graph uses a `latex-graph` block with `tikzpicture` or `axis`.
- Every graph and image has a caption.
- Every image has alt text and a relative path.
- Keep units and significant figures consistent.
- Answer keys stay plain CSV.
- Never leave raw LaTeX in rendered PDF, DOCX, or PPTX.
- Report `Math rendering: latex`, `image fallback`, or `plain-text fallback`.

## Outputs

Generate only the requested files:

```text
problem-set.<format>
solutions.<format>
hints.<format>
answer-key.csv
common-errors.md
```

Typical defaults:

- Problem set: PDF.
- Solutions: PDF.
- Hints: Markdown or PDF.
- Answer key: CSV only if requested.

## Required sections in the problem set

1. Cover: topic, level, date, "StudySkills".
2. How to use this set.
3. Learning objectives.
4. Instructions.
5. Problems by section.
6. Formula or reference sheet, if relevant.
7. Self-check prompts.
8. Sources and references.

## Required sections in the solutions

1. Cover.
2. Method summary.
3. Worked solutions in problem order.
4. Common errors.
5. Answer key summary.
6. Sources and references.

## Rules

- Match the requested problem count exactly.
- Every problem has a worked solution and an answer.
- Do not use a problem that cannot be solved from the given information.
- Do not claim a numerical answer is verified unless it was checked.
- Do not send source content to the web.
- Do not create flashcards, notes, or an exam.
- Set `quality.required` to `true` in `plan.json`.
- Set `math.required` to `true` when the set contains formulas or graphs.
- Record `math.formulas`, `math.graphs`, `math.images`, `math.rendering`, and `math.fallback` in `checks.json`.
- Run `scripts/core.mjs math-check` on the draft before rendering.
