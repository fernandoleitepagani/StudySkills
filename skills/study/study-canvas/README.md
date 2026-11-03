# Canvas Study

## What it does

Reads one Canvas course and writes study documents. You can ask for a plan, summary, flashcards, practice exam, concept map, or custom output.

## When to use it

You have a Canvas course and want finished study material without downloading every page by hand.

## What you need

A Canvas URL and a personal access token. The skill opens the Canvas token page and saves the token from your clipboard or a file. It never asks for the token in chat.

## How to use it

1. Install StudySkills or this skill alone. See the [root README](../../../README.md).
2. Run `/study-canvas` in Claude Code, OpenCode, or Codex.
3. On the first run, choose **Set it up now**. The skill opens Canvas and saves the token for you.
4. Answer the questions. The native question tool accepts a typed answer.
5. Approve the plan before the skill fetches course material.
6. Read the final report for outputs, skips, fallbacks, and sources.

The skill offers **Everything within safe limits** or **Choose specific materials** after it inspects the course. A token file older than 30 days gets a warning. When Canvas rejects the token, the skill says expiry is the likely cause.

## What it produces

The formats you request. Common choices are PDF, DOCX, PPTX, Markdown, and CSV.

External, video-only, or restricted material can produce `manual-materials.md` with links and download instructions.

## How to use manual materials

1. Download the files in your browser.
2. Save them in a local folder, for example `~/Documents/AEDS-II-materials/`.
3. Run `/study-files` on that folder.

For video, supply a transcript or subtitles. The skill cannot watch or transcribe video.

Outputs go to:

```text
~/Documents/StudySkills/<topic>/<run>/
```

## Example

> /study-canvas
>
> Canvas URL: school.instructure.com
> Materials: Everything within safe limits
> Outputs: summary PDF, flashcards CSV
> Language: English

## Safety and limits

- Canvas access uses GET requests.
- Files stay outside the repository and source files stay read-only.
- Only requested files enter Documents.
- Media and quizzes stay skipped by default.
- A Canvas token can reach the whole account. Use a dedicated token and revoke it when done.
- Web research follows the hard do-not-send list in `references/core/web-research.md`.
- The skill sends no telemetry and uses no external study service.

## Troubleshooting

- **No token:** choose **Set it up now**, or save the token in a file and give the skill the path.
- **Clipboard unavailable:** save the token in a file, for example `~/Downloads/token.txt`, and give the skill the path.
- **Token rejected:** Many institutions expire Canvas tokens after 30 days. Create a new token, then choose **Replace token**.
- **File import fails:** check the path and the file permissions.
- **403 on one section:** the token works, but that section is restricted. The skill continues with the rest.
- **403 on every core section:** the course exposes no accessible core section. Try another course or attach local files.
- **Rate limit:** wait, then retry.
