# Grilling protocol

Interview the user until the plan is settled, then stop.

## Design tree

Every decision branches into decisions that depend on it. The **frontier** is every decision whose prerequisites are settled.

1. Compute the frontier.
2. Ask the whole frontier in one round.
3. Give a recommended answer for each question.
4. Wait for the answers.
5. Recompute the frontier.

A question whose answer depends on another open question belongs to a later round.

## Native constraints

- Maximum 4 questions per call and 4 options per question.
- Recommended option first.
- Every question has a custom typed answer.
- One decision per question.
- Multi-select only when choices combine.
- Keep labels short and descriptions to one line.
- Never collect secrets through the question tool.

## Facts are your job

Inspect sources, inventory, and the environment before asking. Do not ask for:

- file counts
- file sizes
- paths that were already given
- headings or tags from the inventory
- existing output directories

Ask only for decisions.

## Rounds

1. Source mode and source set.
2. Outputs and formats.
3. Skill-specific settings, including the shared **Optional extras** question. The **Use public web research** box stays unchecked by default.
4. Plan approval.

The frontier is empty when every output, format, setting, and source is settled and the user approved the plan.

Do not generate before approval.
