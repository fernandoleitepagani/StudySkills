# Canonical install block

One install route per harness. Do not install both the plugin and the copied skill for the same harness.

## Claude Code

```bash
claude plugin marketplace add fernandoleitepagani/StudySkills
claude plugin install study-skills@studyskills
```

Updates when the marketplace refreshes.

## Codex

```bash
codex plugin marketplace add fernandoleitepagani/StudySkills
codex plugin add study-skills@studyskills
```

Updates at startup when the marketplace is refreshed.

## OpenCode

```bash
npx skills@latest add fernandoleitepagani/StudySkills -a opencode
```

Update later with `npx skills@latest update`.

## Local development

```bash
npx skills@latest add /absolute/path/to/StudySkills -a opencode
```

If the installer does not support local paths, run `./scripts/link-skills.sh`.

## Rules

- The commands above assume the repository is hosted at `fernandoleitepagani/StudySkills`.
- No `npm install` is required. StudySkills has no runtime dependencies.
- Install the whole collection. The v0.2 study skills call the internal `study-core` skill; installing one alone is not supported.
- Do not promise automatic updates for routes that require a manual command.
