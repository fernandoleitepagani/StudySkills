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
- Availability and field names can vary by Codex version and mode. If `request_user_input` is unavailable or its schema differs, use the available native question tool or the single fallback.
- Do not assume every Codex GUI session supports the same multi-select fields.

## Compatibility rules

- Use the native question tool that is actually available in the current session.
- Do not assume a tool schema from an older harness version.
- If the expected fields are missing, map the question to the available schema.
- If no native question tool is available, use the single fallback.
- A GUI, CLI, or WSL session can expose different tools. Adapt to the actual session.
- Never collect secrets through any question tool.

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

## Optional extras

Ask one native multi-select question after outputs and before plan approval:

Question: **Optional extras**

Options:

1. **No extras** (recommended)
2. **Use public web research**
3. Skill-specific extras, when the skill already has them, such as related context, an evidence map, or an immersion checklist.

The web research option is a checkbox. Leave it unchecked by default. The user must check **Use public web research** before any web search or fetch.

Rules:

- **No extras** and any other option are mutually exclusive. If both are selected, ask once to resolve.
- Do not add a separate web research question. This question replaces older web or related-context prompts.
- If the harness does not support multi-select, use a single-select question with **No web research** (recommended) and **Use public web sources**.
- This question counts toward the four-question limit. Merge it into an existing settings question when needed.
- Never collect secrets.

## Rules

- Maximum 4 questions per call and 4 options per question.
- Recommended option first.
- Every question supports a custom typed answer.
- One decision per question.
- Do not collect secrets.
- Do not ask for facts the inventory or environment can provide.
- Split long lists into rounds or ask for a typed answer.
