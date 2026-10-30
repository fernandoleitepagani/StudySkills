# Options

Use these labels and descriptions when building native question options. Keep them consistent across harnesses.

## Core outputs

| Label | Description |
| --- | --- |
| Study plan | A week-by-week schedule with goals, priorities, and review checkpoints. |
| Summary | Structured notes by topic, with key ideas, definitions, examples, and common mistakes. |
| Flashcards | Question and answer cards, plus an Anki-compatible CSV. |
| Practice exam | Questions, answer key, explanations, and a time limit. |

Ask for core outputs with multi-select.

## Add-ons

| Label | Description |
| --- | --- |
| Concept map | A visual map of topics and relationships. |
| Custom output | Describe your own study material. |
| Nothing else | Finish the output selection. |

## Format preferences

Ask once, optional:

> Any format preferences? Leave this blank and the agent will choose the best format for each output.

The custom typed answer is the main path. Common formats:

- PDF
- DOCX
- PPTX
- Markdown
- CSV

If the user specifies formats per output, respect them exactly. If the user specifies none, the agent chooses.

## Default format heuristics

| Output | Default choice |
| --- | --- |
| Summary | PDF |
| Study plan | DOCX for editing, PDF for printing |
| Practice exam | PDF |
| Concept map | PPTX for editing, PDF for viewing |
| Flashcards | CSV and Markdown |
| Custom | Agent judgment |

## Output language

| Label | Description |
| --- | --- |
| PT-BR | Portuguese output. Keep source quotes in their original language. |
| EN | English output. Keep source quotes in their original language. |

Default to PT-BR when the user writes Portuguese. Otherwise default to EN.

## Material scope

Default, no question needed unless the user wants to change it:

- Include syllabus, front page, modules, pages, assignments, discussions, announcements, and course files.
- Download same-origin Canvas page images.
- Convert HTML to text.
- Skip media and quizzes.
- Skip files over 50 MB.
- Stop downloading after 300 MB total.
- Report skipped files, skipped images, truncated collections, and external materials.

If the user asks for a different scope, honor it.

## Course selection

- Fetch active courses.
- Filter to available courses.
- If more than four active courses, ask for the term first.
- Show up to four courses for the selected term.
- Always allow a typed course name or code.
- If only one course exists, confirm it instead of asking an open question.

## Plan settings

Only ask what the selected outputs need.

### Study plan

- Exam or deadline date
- Hours per week
- Start date
- Current confidence: low, medium, high

### Summary

- Depth: concise, standard, detailed
- Focus topics, optional

### Flashcards

- Count: 20, 40, 60, or custom
- Style: question and answer, or cloze
- Anki CSV: yes or no

### Practice exam

- Question count
- Format: multiple choice, open answer, or mixed
- Difficulty: easy, standard, hard
- Time limit
- Answer key: yes

### Concept map

- Scope: whole course or selected modules

### Custom output

- Purpose
- Format
- Length
- Must-include topics
- Audience
