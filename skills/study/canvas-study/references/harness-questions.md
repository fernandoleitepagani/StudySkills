# Harness question adapter

Use the harness native question tool. Do not replace it with a plain-text questionnaire unless the tool is genuinely unavailable.

## Claude Code

Tool: `AskUserQuestion`

- 1 to 4 questions per call.
- 2 to 4 options per question.
- `header` is at most 12 characters.
- `multiSelect` is available.
- Free text depends on the app. If the app exposes "Type something", use it. Otherwise add an option named "Type my own answer" and ask a follow-up text question when it is selected.
- Not available inside subagents. Do not delegate the interview.

## OpenCode

Tool: `question`

- `questions` array.
- Each question has `header`, `question`, `options`, and `multiple`.
- The tool adds "Type your own answer" automatically. Do not add a duplicate.
- Use `multiple: true` for multi-select output choices.

## Codex

Tool: `request_user_input`

- `questions` array.
- Each question has `id`, `header`, `question`, `options`, `isOther`, and `isSecret`.
- Set `isOther: true` so the user can type an answer.
- Do not use `isSecret` for the Canvas token. The token must never enter the model context.
- Availability can vary by mode. If the tool is not exposed, use the single fallback below.

## Single fallback

If a harness does not expose a native question tool, ask the same questions as numbered plain text:

```text
1. <question>
   a. <option>
   b. <option>
   c. Type your own answer
```

This is the only fallback. Do not invent a third UI.

## Rules for every harness

- Maximum 4 questions per call.
- Maximum 4 options per question.
- Recommended option first.
- Every question has a custom typed-answer path.
- One decision per question.
- Do not collect secrets through the question tool.
- Do not ask for facts the skill can fetch.
- Keep labels short and descriptions to one line.
- If a question needs more than four options, split it into rounds or ask for a typed answer.
