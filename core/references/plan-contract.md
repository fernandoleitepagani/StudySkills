# Plan contract

Write two files in the work directory.

## `study-plan.md`

Human-readable plan:

```markdown
# <Topic> Plan

## Source

- Mode: pack | paths | topic | manual | library
- Inputs:
- Inventory:

## Requested outputs

| Output | Format | File name |
| --- | --- | --- |
| Summary | PDF | summary.pdf |

## Settings

- Language:
- Skill settings:

## Risks

- Truncated inventory.
- Unsupported formats.
```

## `plan.json`

Machine-readable source of truth:

```json
{
  "topic": "Statistics 101",
  "language": "pt-BR",
  "source": {
    "mode": "pack",
    "inputs": ["pack"],
    "selection": {
      "mode": "everything",
      "items": []
    }
  },
  "requested": [
    {
      "output": "summary",
      "formats": ["pdf", "docx"],
      "files": ["summary.pdf", "summary.docx"]
    }
  ],
  "fallbacks": {
    "summary.pdf": "summary.md"
  },
  "quality": {
    "required": true
  },
  "research": {
    "web": "used",
    "sources": []
  },
  "settings": {},
  "checks": {}
}
```

Rules:

- Include every requested output and every requested file.
- Use `source.selection.mode` with `everything` or `specific`.
- When `specific`, list selected names or IDs in `source.selection.items`.
- Never put absolute source paths in output files.
- Never remove a failed format from `plan.json`.
- Add a `fallbacks` entry when a failed requested format is replaced by a Markdown file.
- Use plain file names, no folders.
- `quality.required: true` makes the quality block mandatory during validation.
- Record web use in `research.web` as `used`, `not-used`, or `unavailable`.
- `validate` treats `plan.json` as the requested set.

## `checks.json`

Agent attestation after reading each generated file:

```json
{
  "files": {
    "summary.pdf": {
      "sections": ["cover", "how-to-use", "recap"],
      "counts": { "pages": 4 }
    }
  },
  "quality": {
    "sourceCoverage": {
      "selected": 12,
      "used": 11,
      "skipped": ["old-notes.pdf"]
    },
    "rubric": {
      "grounding": 5,
      "coverage": 4,
      "learningDesign": 4,
      "accuracy": 4,
      "clarity": 5,
      "visualClarity": 4,
      "accessibility": 4,
      "formatIntegrity": 5
    },
    "review": "pass"
  },
  "research": {
    "web": "used",
    "sourceCount": 4,
    "domains": ["example.edu"]
  }
}
```

Every produced file needs an entry. The validator checks coverage, declared counts, quality evidence, and research metadata. It does not prove prose accuracy or visual quality.

Read `quality.md` for the rubric and `web-research.md` for the absolute web prohibition list.
