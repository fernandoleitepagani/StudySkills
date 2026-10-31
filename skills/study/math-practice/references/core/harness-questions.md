# Harness question adapter

Use the harness native question tool. Do not replace it with plain text unless the tool is genuinely unavailable.

## Claude Code

`AskUserQuestion`

- 1 to 4 questions per call.
- 2 to 4 options per question.
- `header` max 12 characters.
- `multiSelect` available.
- Use the app free-text affordance when present. Otherwise add a `Type my own answer` option and ask a follow-up text question.
- Not available in subagents. Do not delegate the interview.

## OpenCode

`question`

- `questions` array.
- Each question has `header`, `question`, `options`, and `multiple`.
- The tool adds `Type your own answer` automatically. Do not duplicate it.
- Use `multiple: true` for multi-select choices.

## Codex

`request_user_input`

- `questions` array.
- Each question has `id`, `header`, `question`, `options`, `isOther`, and `isSecret`.
- Set `isOther: true`.
- Do not use `isSecret`; Study Core never collects secrets.
- Availability can vary by mode. If unavailable, use the single fallback.

## Single fallback

```text
1. <question>
   a. <option>
   b. <option>
   c. Type your own answer
```

This is the only fallback.

## Source selection

When the skill has multiple source groups, ask one question after inventory:

Question: **Which materials should I use?**

Options:

1. **Everything within safe limits** (recommended)
2. **Choose specific materials**

The custom typed answer is the path for specific names. Do not add a separate "Type your answer" option when the harness provides one.

If the user chooses specific materials and does not type names, ask a follow-up text question. Do not guess.

## Rules

- Maximum 4 questions per call and 4 options per question.
- Recommended option first.
- Every question supports a custom typed answer.
- One decision per question.
- Do not collect secrets.
- Do not ask for facts the inventory or environment can provide.
- Split long lists into rounds or ask for a typed answer.
