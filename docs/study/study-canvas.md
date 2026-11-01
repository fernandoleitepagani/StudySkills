# Canvas Study

## What it does

`study-canvas` turns one Canvas course into finished study documents. It fetches the course materials read-only, asks what you want through the harness native question UI, and generates only the formats you request. The current release is v0.9.6.

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

In `~/.studyskills/canvas/<host>/token.txt` or `.env`. Legacy global files are read only as a migration fallback. A token file older than 30 days gets a warning. If Canvas rejects the token, expiry is the most likely cause; Canvas tokens commonly expire after 30 days. The skill never asks for it in chat.

**Does it change anything in Canvas?**

No. It only makes GET requests. It cannot submit assignments, post discussions, edit pages, or upload files.

**What if no token is found?**

The skill warns you and offers Exit or Guide me. The guide creates the folder and an empty token file, then exits so you can save the token and run the skill again. If the token file is unreadable or is a directory, the same guide flow is offered.

**What formats can it produce?**

Whatever your harness can render. The agent chooses when you do not specify. If one requested format fails, the skill produces the rest and reports the failure. It also verifies that every requested file is accounted for before reporting success.

**Where are the files?**

In `~/Documents/StudySkills/<course>/<run>/`. Only requested outputs are saved there.

**Does it install anything?**

No. StudySkills has no runtime dependencies.

## Example

```text
/study-canvas
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

## Known limitations

- Semantic checks are agent-side. The validator checks file structure, requested-versus-produced coverage, extras, and token leakage, not document prose.
- Quizzes, LTI tools, cloud drives, and external tools are listed but not downloaded.
- Inline images are downloaded only from Canvas. External images are listed as links.
- Courses with more than 500 pages report skipped pages.
- If a requested format fails, a Markdown fallback is written and reported.

If Canvas forbids one section, such as Files or Pages, the skill continues with the sections it can read and reports the partial result. It stops only when every core section is forbidden or no readable material remains.

When the course relies on Google Drive, videos, or other external resources, the skill produces `manual-materials.md` with the links and clear instructions: download through the browser, save the files locally, then run `/study-files` on the folder. Videos require a transcript or subtitles.

## It's working if

- The native question cards appear in your harness.
- The skill shows a plan before downloading anything.
- The output folder contains only the requested files.
- The report lists any requested format that could not be produced.
- Truncated collections, external materials, and skipped images appear in the report.
- No token appears in any file or message.
