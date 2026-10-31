# Canonical install block

One install route per harness. Do not install both the plugin and the copied skills for the same harness.

Every skill is self-contained. Install the whole collection or a single skill.

## Claude Code

```bash
claude plugin marketplace add fernandoleitepagani/StudySkills
claude plugin install study-skills@studyskills
```

The marketplace refreshes from `main`.

## Codex

```bash
codex plugin marketplace add fernandoleitepagani/StudySkills
codex plugin add study-skills@studyskills
```

The marketplace refreshes from `main`.

## OpenCode

```bash
DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 npx skills@latest add \
  fernandoleitepagani/StudySkills \
  --skill '*' -a opencode -g -y
```

Update later with `npx skills@latest update`.

## Local development

```bash
npx skills@latest add /absolute/path/to/StudySkills --skill '*' -a opencode -g -y
```

If the installer does not support local paths, run `./scripts/link-skills.sh`.

## Rules

- The commands above assume the repository is hosted at `fernandoleitepagani/StudySkills`.
- No `npm install` is required. StudySkills has no runtime dependencies.
- Every skill is self-contained. Install the whole collection or a single skill.
- Plugin marketplaces and OpenCode track `main`, not a release tag.
- Use `dev` for development; merge to `main` for stable installs.
- Do not promise automatic updates for routes that require a manual command.
