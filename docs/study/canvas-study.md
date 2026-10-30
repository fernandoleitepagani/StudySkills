# Canvas Study

## What it does

`canvas-study` turns one Canvas course into finished study documents. It fetches the course materials read-only, asks what you want through the harness native question UI, and generates only the formats you request.

Outputs can include a study plan, summary, flashcards, practice exam, concept map, or a custom study document. Files are saved in `~/Documents/StudySkills/<course>/<run>/`.

## When to reach for it

Use it when:

- You have a Canvas course with modules, pages, readings, and files.
- You want study material for an exam or a course.
- You want a summary, plan, flashcards, practice questions, or a concept map.
- You are comfortable running Claude Code, OpenCode, or Codex.

Do not use it when:

- You want to submit an assignment or change anything in Canvas. The skill is read-only.
- The course material is only available outside Canvas and cannot be downloaded.
- You need a format your harness cannot render.

## Common questions

**Where does the token go?**

In `~/.studyskills/canvas-token.txt` or `~/.studyskills/canvas-token.env`. The skill never asks for it in chat.

**Does it change anything in Canvas?**

No. It only makes GET requests. It cannot submit assignments, post discussions, edit pages, or upload files.

**What if no token is found?**

The skill warns you and offers Exit or Guide me. The guide creates the folder and an empty token file, then exits so you can save the token and run the skill again.

**What formats can it produce?**

Whatever your harness can render. The agent chooses when you do not specify. If one requested format fails, the skill produces the rest and reports the failure.

**Where are the files?**

In `~/Documents/StudySkills/<course>/<run>/`. Only requested outputs are saved there.

**Does it install anything?**

No. StudySkills has no runtime dependencies.

## Example

```text
/canvas-study
```

Then answer the questions:

- Canvas URL: `https://school.instructure.com`
- Course: `Statistics 101`
- Outputs: summary, flashcards
- Formats: PDF summary, CSV flashcards
- Language: PT-BR

The skill shows a plan. After approval, it fetches the course and saves:

```text
~/Documents/StudySkills/statistics-101/2026-10-30-1430/
├── summary.pdf
└── flashcards.csv
```

## It's working if

- The native question cards appear in your harness.
- The skill shows a plan before downloading anything.
- The output folder contains only the requested files.
- The report lists any requested format that could not be produced.
- No token appears in any file or message.
