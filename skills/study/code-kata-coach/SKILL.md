---
name: code-kata-coach
description: "Generate programming katas with constraints, examples, tests, progressive hints, reference solutions, and review questions from a topic or supplied materials."
disable-model-invocation: true
---

# Code Kata Coach

Read `references/core/workflow.md` before doing anything else. Follow its shared workflow and invariants.

## Invariants

- **No dependency installation.** Do not install packages, frameworks, or test tools.
- **No execution required.** Do not claim that code passed tests unless it was actually run.
- **Original katas.** Do not reproduce a copyrighted exercise verbatim.
- **Tests must match the exercise.** A kata without consistent tests is not finished.
- **Sources are read-only.**
- **Only requested files** go to `~/Documents/StudySkills/<topic>/<run>/`.
- **Web research follows `references/core/web-research.md`.** Never send user code, filenames, paths, course names, or personal data to a web tool.
- **Quality is evidence.** Follow `references/core/quality.md`.

## Input

Use one of:

- `topic`: a language, concept, and level with no source files.
- `paths`: local notes, documentation, or exercise files.
- `pack`: a StudySkills pack.

Use the supplied material to match the user's terminology and level. Do not copy its exercises.

## Interview

Ask only what is not already known:

- Programming language.
- Topic or skill, such as arrays, recursion, concurrency, SQL, testing, or API design.
- Level: beginner, intermediate, advanced, or a custom level.
- Number of katas.
- Test framework or plain assertions.
- Include hints.
- Include reference solutions.
- Include review questions.
- Output format.
- Output language for explanations.

## Procedure

### 1. Define the learning target

Each kata tests one main skill. State:

- concept
- prerequisite
- what the learner should demonstrate
- what is out of scope

### 2. Write the kata

For each kata include:

- title
- scenario
- requirements
- constraints
- examples
- starter signature or skeleton
- tests
- progressive hints
- reference solution
- review questions

### 3. Write tests

Tests must cover:

- the normal case
- at least one edge case
- at least one invalid or boundary input

Use the requested framework. If the user wants plain assertions, write a runnable single-file example.

Do not claim the tests pass unless they were executed.

### 4. Write the reference solution

- Prefer clarity over cleverness.
- Include a short complexity note when relevant.
- Explain the main decision.
- Do not hide required behavior in an unexplained helper.

### 5. Hints

Use three levels:

1. What to think about.
2. Which structure or algorithm to use.
3. The next concrete step.

Do not reveal the full solution in the first hint.

### 6. Review questions

Ask about:

- trade-offs
- complexity
- edge cases
- testing strategy
- a variation of the kata

## Outputs

Generate only the requested files:

```text
katas.<format>
solutions.<format>
hints.<format>
tests.<ext>
review-questions.md
```

Typical defaults:

- Katas: Markdown or PDF.
- Solutions: Markdown or PDF.
- Hints: Markdown.
- Tests: a code file only when the user requests a runnable file.
- Review questions: Markdown only if requested.

## Required sections in the kata workbook

1. Cover: language, topic, level, "StudySkills".
2. How to use the workbook.
3. Learning objectives.
4. Prerequisites.
5. Katas in order.
6. Test instructions.
7. Hints.
8. Reference solutions.
9. Review questions.
10. Sources and references.

## Rules

- Match the requested kata count exactly.
- Each kata has requirements, tests, and a solution.
- Do not generate destructive, malicious, or unsafe code.
- Do not send user code to the web.
- Do not run or install anything.
- Do not create flashcards, a general exam, or unrelated notes.
- Mark unexecuted tests as unexecuted.
- Set `quality.required` to `true` in `plan.json`.
