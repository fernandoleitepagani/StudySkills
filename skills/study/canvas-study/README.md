# Canvas Study

## What it does

Fetches one Canvas course read-only and turns it into study documents. You can request a study plan, summary, flashcards, a practice exam, a concept map, or a custom output.

## When to use it

You have a Canvas course and want finished study material without manually downloading every page and file.

## What you need

A Canvas URL and a personal access token saved in the host-specific token file. The skill never asks for the token in chat.

## How to use it

1. Install StudySkills or this skill individually. See the [root README](../../../README.md).
2. Invoke `/canvas-study` in Claude Code, OpenCode, or Codex.
3. Answer the native questions. Every question supports a custom typed answer.
4. Approve the plan before generation.
5. Read the final report for outputs, skips, fallbacks, and web sources.

- Choose **Everything within safe limits** or **Choose specific materials** after the course is inspected.
- The skill shows the plan before fetching anything.
- A token file older than 30 days gets a warning. If Canvas rejects the token, the skill explains that expiry is the likely cause.

## What it produces

The requested outputs in your chosen formats. Typical outputs are PDF, DOCX, PPTX, Markdown, and CSV.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /canvas-study
>
> Canvas URL: school.instructure.com
> Materials: Everything within safe limits
> Outputs: summary PDF, flashcards CSV
> Language: English

## Safety and limits

- Sources are read-only. Nothing is moved, renamed, rewritten, or deleted.
- Only requested files are written.
- No source copies, prompt packs, or zip files.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- No telemetry and no external study service.
- Canvas is read-only. Only GET requests are allowed.
- Media and quizzes are skipped by default.
- A Canvas token can access the whole account. Use a dedicated token and revoke it when done.

## Troubleshooting

- **No token found:** choose **Guide me** and follow the host-specific path.
- **Token found but rejected:** Canvas commonly expires tokens after 30 days. Create a new token and replace the value in the token file.
- **403:** the token is valid but lacks access to that endpoint.
- **Rate limit:** wait and retry later.
