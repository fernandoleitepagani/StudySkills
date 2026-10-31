# Canonical install block

One install route per harness. Do not install both the plugin and the copied skill for the same harness.

Every skill is self-contained. Install the whole collection or a single skill.

These commands install the latest published release or the pinned v0.4.0 release. They do not install from `main`.

## OpenCode

```bash
npx skills@latest add 'fernandoleitepagani/StudySkills#v0.4.2' \
  --skill '*' -a opencode -g -y
```

Update later with `npx skills@latest update`.

The `#v0.4.2` ref is the release tag. Update it when a newer release is published.

## Claude Code

```bash
claude plugin marketplace add fernandoleitepagani/StudySkills@v0.4.2
claude plugin install study-skills@studyskills
```

## Codex

```bash
codex plugin marketplace add fernandoleitepagani/StudySkills --ref v0.4.2
codex plugin add study-skills@studyskills
```

## Local development

```bash
npx skills@latest add /absolute/path/to/StudySkills --skill '*' -a opencode -g -y
```

If the installer does not support local paths, run `./scripts/link-skills.sh`.

## Rules

- The commands above assume the repository is hosted at `fernandoleitepagani/StudySkills`.
- No `npm install` is required. StudySkills has no runtime dependencies.
- Every skill is self-contained. Install the whole collection or a single skill.
- Claude Code and Codex pin the release tag. OpenCode can use the latest-release asset.
- Do not promise automatic updates for routes that require a manual command.
