# Plan contract

Write two files in the work directory.

## `study-plan.md`

Human-readable plan:

```markdown
# <Topic> Plan

## Source

- Mode: pack | paths | topic | manual
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
    "inputs": ["/path/to/pack"]
  },
  "requested": [
    {
      "output": "summary",
      "formats": ["pdf", "docx"],
      "files": ["summary.pdf", "summary.docx"]
    }
  ],
  "settings": {},
  "checks": {}
}
```

Rules:

- Include every requested output and every requested file.
- Never remove a failed format from `plan.json`.
- Use plain file names, no folders.
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
  }
}
```

Every produced file needs an entry. The validator checks coverage and declared counts, not prose quality.
