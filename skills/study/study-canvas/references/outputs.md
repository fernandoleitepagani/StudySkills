# Outputs

Generate only the requested outputs and formats. Do not create prompts, zips, source copies, or duplicate formats.

## General rules

1. The user's explicit formats win.
2. If several formats are named, generate all of them.
3. If no format is named, choose the most useful format for that output.
4. If a format fails, generate the formats that work and report the failure.
5. Never substitute a different format.
6. Save files directly in `outputDir`.
7. Use the exact file names recorded in the plan.
8. Keep quotes from source materials in their original language.

## Source materials

- `sources/materials.md` contains Canvas text, local image paths, and external references.
- `sources/files/` contains downloaded course files.
- `sources/images/` contains downloaded Canvas page images.
- External tools, LTI links, cloud drives, and quizzes are listed in `materials.md` and `manifest.json`, not downloaded.
- `manifest.json` reports truncated collections, skipped pages, skipped files, and skipped images.

Do not claim the pack is complete when `manifest.json` reports truncation or external materials. Include those in the final report.

## Plan template

Write `canvas-plan.md` in the work directory:

```markdown
# Canvas Study Plan

## Connection

- Canvas URL:
- Course:
- Course ID:

## Requested outputs

| Output | Format | File name |
| --- | --- | --- |
| Summary | PDF | summary.pdf |

## Settings

- Language:
- Study plan dates:
- Flashcard count:
- Exam format:
- Concept map scope:

## Material scope

- Default text and documents
- Skip media and quizzes
- 50 MB per file
- 300 MB total

## Estimated size

- Modules:
- Pages:
- Assignments:
- Discussions:
- Announcements:
- Files:
- Estimated download size:

## Risks

- Files tab may be disabled.
- Some linked materials may live outside Canvas.
- Scanned PDFs may have no extractable text.
```

## Machine-readable plan

Write `plan.json` beside `canvas-plan.md`:

```json
{
  "course": { "id": "1", "name": "Statistics 101" },
  "requested": [
    {
      "output": "summary",
      "formats": ["pdf", "docx"],
      "files": ["summary.pdf", "summary.docx"]
    }
  ],
  "settings": {},
  "scope": {}
}
```

Every requested file must appear. Do not remove a failed format from `plan.json`; leave it missing and report it.

## Checks

After reading each generated file back, write `checks.json`:

```json
{
  "files": {
    "summary.pdf": {
      "sections": ["cover", "how-to-use", "big-picture", "topics", "recap"],
      "counts": { "pages": 10 }
    }
  }
}
```

Every produced file needs an entry. This is an attestation, not an independent content parser.


## Manual materials

File name: `manual-materials.md`.

Generate this report when:

- the course has external, video, Google Drive, or module-linked resources
- Files or Pages are forbidden
- some materials could not be downloaded
- all core Canvas sections are forbidden but module links exist

The report must use this user-facing structure:

```markdown
# Manual Materials

## Result

Canvas access was partial.

## Available in Canvas

- Item name: link

## Download manually

1. The user downloads them through the browser.
2. The user saves them locally, for example:
   ~/Documents/AEDS-II-materials/
3. The user runs:
   /study-files
   with that folder.

For videos, provide a transcript or subtitles. The skill cannot watch or transcribe videos.

## Could not be accessed

- Item name: reason
```

Use `links.json` from the work directory. Do not claim that a linked video was watched, a Drive file was downloaded, or a blocked resource was studied.

`links.csv` is optional. Generate it only when requested. It uses:

```csv
module,item,title,type,url,status,reason,action
```

Never include the token, signed verifier parameters, or private local paths.

## Study plan

File name: `study-plan.<format>`.

Content:

1. Cover: course, date, "StudySkills".
2. How to use this plan.
3. Deadline and weekly time budget.
4. Priorities: must learn, should review, can skim.
5. Week-by-week schedule table:
   - Week
   - Topics
   - Activities
   - Hours
   - Checkpoint
6. Daily or session-level routine.
7. Spaced review checkpoints.
8. Final week plan.
9. Next steps.

Rules:

- Use the exam date and hours per week from the user.
- If no date is given, build a rolling four-week plan.
- Balance new material and review.
- Put difficult topics earlier.
- Include active recall and practice, not only reading.

## Summary

File name: `summary.<format>`.

Content:

1. Cover.
2. How to use this summary.
3. Big picture: the course in one page.
4. Topic sections:
   - Key idea
   - Explanation
   - Key terms and definitions
   - Example or analogy
   - Common mistake
   - Check yourself
5. Formula or reference sheet, if relevant.
6. Recap: five things to remember.
7. Sources cited by file or page title.

Rules:

- Organize by course topics, not by document order.
- Use tables for comparisons.
- Define jargon on first use.
- Do not copy long passages. Summarize.

## Flashcards

File names: `flashcards.csv` and `flashcards.md`.

CSV columns:

```csv
front,back,tags
```

Rules:

- One fact per card.
- Front is a question or prompt.
- Back is a short answer.
- Tags use lowercase course topic names.
- Escape commas and quotes correctly.
- Markdown uses one section per topic and `Q:` / `A:` pairs.
- If the user asks for only one format, generate only that format.

## Practice exam

File name: `practice-exam.<format>`.

Content:

1. Cover.
2. Instructions: time limit, number of questions, allowed materials.
3. Questions, numbered.
4. Answer sheet or answer spaces.
5. Answer key with explanations.
6. Topic map showing which questions cover which topics.

Rules:

- Match the requested count, format, difficulty, and time limit.
- Mix recall, application, and analysis where possible.
- Do not use questions that can be answered by keyword matching alone.
- Every answer must reference the source topic.

## Concept map

File names: `concept-map.pptx` and/or `concept-map.pdf`.

Content:

1. Central course or topic node.
2. Main branches for modules or themes.
3. Child nodes for key concepts.
4. Labeled relationships.
5. Legend for colors or line types.
6. Source note.

Rules:

- Prefer editable PPTX when the user wants to edit.
- Prefer PDF when the user wants to view or print.
- Use short node labels.
- Avoid crossing lines where possible.
- Keep the map readable at A4 or slide size.

## Custom output

File name: `custom-<slug>.<format>`.

Use the user's purpose, format, length, audience, and must-include topics. If the request is ambiguous, ask one follow-up question before generating.

The custom output still follows the didactic style and the source citation rules.

## Partial format report

At the end, state:

- Requested files.
- Produced files.
- Not produced files and the reason.
- Any skipped sources.

Example:

> Requested: summary PDF and DOCX.
> Produced: summary.pdf.
> Not produced: summary.docx because the harness could not render DOCX.

Never create a substitute file.

## Validation checklist

Before reporting success:

- [ ] Every requested output exists or has a reported failure.
- [ ] Every file is non-empty.
- [ ] PDF starts with `%PDF`.
- [ ] DOCX and PPTX are valid ZIP containers.
- [ ] Every produced file has a `checks.json` entry.
- [ ] Required sections are present.
- [ ] Flashcard and exam counts match the plan.
- [ ] No token appears in any file.
- [ ] No extra files are in the output directory.
- [ ] Truncated collections and skipped pages are reported.
- [ ] External materials and images are reported.
- [ ] Requested formats that failed are still present in `plan.json` and reported.
