# Grilling protocol

Interview the user until the plan is settled, then stop.

This is the same design tree discipline as a grilling session, adapted to native question cards.

## The design tree

Every decision branches into decisions that depend on it. The **frontier** is every decision whose prerequisites are already settled.

Work the tree in rounds.

1. Compute the frontier.
2. Ask the whole frontier in one round.
3. Give a recommended answer for each question.
4. Wait for the answers before the next round.
5. Recompute the frontier after each round.

A question whose answer depends on another open question belongs to a later round.

## Native question constraints

- Maximum 4 questions per call.
- Maximum 4 options per question.
- Put the recommended option first.
- Every question must allow a custom typed answer.
- One decision per question.
- Use multi-select only when choices can combine.
- Keep option labels short. Put the explanation in the description.
- Do not use the question tool to collect the Canvas token or any secret.

If a round needs more than 4 questions, use multiple native calls in the same round.

## Facts are your job

Inspect the environment and Canvas before asking. Do not ask the user for something you can fetch:

- Active courses and terms
- Module, page, assignment, and file counts
- File sizes
- Token presence
- Existing output directory

Ask only for decisions.

## Recommended answer

Each question gets one recommended answer. Word it so the user can accept it in a word.

If the recommendation needs a short explanation, put it in the option description. Do not write an essay into the question.

## Rounds for Canvas Study

### Round 1 - Connection

- Canvas URL (text)
- Token state is inspected, not asked.

### Round 2 - Course

- Term if needed
- Course

### Round 3 - Deliverables

- Core outputs (multi-select)
- Add-on
- Optional format preferences
- Output language

### Round 4 - Settings and scope

- Per-output settings
- Material scope, only if changed from the default

### Round 5 - Plan

- Approve / Edit / Cancel

## Stop condition

The frontier is empty when every branch that affects the output is settled and the user has approved the plan.

Do not fetch materials before approval.

Do not keep asking after the plan is approved. Move to execution.

## Attribution

The design-tree and frontier structure is adapted from the `grilling` skill in
[mattpocock/skills](https://github.com/mattpocock/skills), which is MIT licensed.
The native question adapter and the Canvas-specific rounds are original to StudySkills.
