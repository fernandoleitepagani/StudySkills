# Invocation

StudySkills skills are user-invoked. The human types the skill name; the model cannot reach it on its own.

Every `SKILL.md` uses:

```yaml
disable-model-invocation: true
```

and the matching `agents/openai.yaml` uses:

```yaml
policy:
  allow_implicit_invocation: false
```

The description is human-facing. Keep it to one useful sentence. Do not add model-trigger phrasing such as "Use when the user mentions...".

## Dependencies between skills

When one skill needs another skill, name the Skill tool explicitly:

> Call the Skill tool with "grilling".

A user-invoked skill can never be called by another skill. If a step needs a user-invoked skill, tell the human to run it.

Shared reference material lives inside the skill that owns it. Other skills reach it by calling that skill, not by linking into its folder.
