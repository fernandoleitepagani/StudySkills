# Output conventions

## Requested versus produced

- Explicit formats always win.
- Several explicit formats produce several files.
- No explicit format means the active skill chooses one best format.
- Only requested files go to Documents.
- Never create a substitute format.
- Never create prompts, zips, source copies, or duplicate formats.

## Citations and privacy

- Cite source filenames, not absolute paths.
- Include page, slide, or heading when available.
- Do not include home-directory paths, usernames, or full folder trees in outputs.
- Do not copy source files into Documents.

## Partial format report

At the end, state:

- Requested files.
- Produced files.
- Not produced files and the reason.
- Inventory truncation or skipped inputs.

Example:

> Requested: summary PDF and DOCX.
> Produced: summary.pdf.
> Not produced: summary.docx because the harness could not render DOCX.

## Validation

Before reporting success:

- Every requested output exists or is reported missing.
- Every file is non-empty.
- PDF starts with `%PDF`.
- DOCX and PPTX are valid ZIP containers.
- Every produced file has a `checks.json` entry.
- Required sections and counts are present.
- No extra files are in the output directory.
- No source file was modified.

## Destination

```text
~/Documents/StudySkills/<topic>/<run>/
```

Working data:

```text
~/.studyskills/work/<run>/
```

Only the requested outputs stay in Documents. Delete the work directory on success.
