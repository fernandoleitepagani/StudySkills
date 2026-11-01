# Plan contract

Write two files in the work directory.

## `study-plan.md`

Human-readable plan:

```markdown
# <Topic> Plan

## Source

- Mode: pack | paths | topic | manual | library | canvas
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
  "math": {
    "required": true,
    "engine": "latex",
    "fallback": "image"
  },
  "research": {
    "web": "not-used",
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
- Set `math.required: true` for quantitative outputs with formulas, graphs, or math images. Use `false` for textual and CSV-only outputs.
- `math.engine` is `latex`, `harness`, or `none`.
- `math.fallback` is `image`, `plain`, or `null`.
- Default `research.web` to `not-used`. Set `used` only when the user checks **Use public web research**. Use `unavailable` only after a checked request fails.
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
  "math": {
    "formulas": 8,
    "graphs": 2,
    "images": 1,
    "rendering": "latex",
    "fallback": null,
    "rawLatex": false
  },
  "research": {
    "web": "used",
    "sourceCount": 4,
    "domains": ["example.edu"]
  }
}
```

Every produced file needs an entry. The validator checks coverage, declared counts, quality evidence, research metadata, and math evidence. It does not prove prose accuracy or visual quality.

Math rules:

- If `plan.math.required` is true, `checks.math` is required.
- `formulas`, `graphs`, and `images` are non-negative integers.
- If math is required, their sum must be greater than zero.
- `rendering` is `latex`, `image`, or `plain`.
- `fallback` is `null`, `image`, or `plain`.
- If `rendering` is `plain`, `fallback` cannot be `null`.
- `rawLatex` is a boolean. For a required math run with PDF, DOCX, or PPTX output, it must be `false`.
- Unknown fields are ignored.

Read `quality.md` for the rubric, `math.md` for LaTeX rules, and `web-research.md` for the absolute web prohibition list.
