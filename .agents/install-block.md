# Canonical install block

One install route per harness. Do not install both the plugin and the copied skill for the same harness.

Install the whole collection. The study skills call the internal `study-core` skill; installing one alone is not supported.

These commands install the latest published release or the pinned v0.4.0 release. They do not install from `main`.

## OpenCode

Latest published release:

```bash
npx skills@latest add \
  https://github.com/fernandoleitepagani/StudySkills/releases/latest/download/StudySkills.zip \
  --skill '*' -a opencode -g -y
```

Pinned v0.4.0 fallback:

```bash
npx skills@latest add \
  https://github.com/fernandoleitepagani/StudySkills/archive/refs/tags/v0.4.0.zip \
  --skill '*' -a opencode -g -y
```

Update later with `npx skills@latest update`.

## Claude Code

```bash
claude plugin marketplace add fernandoleitepagani/StudySkills@v0.4.0
claude plugin install study-skills@studyskills
```

## Codex

```bash
codex plugin marketplace add fernandoleitepagani/StudySkills --ref v0.4.0
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
- Install the whole collection. The study skills call the internal `study-core` skill; installing one alone is not supported.
- Claude Code and Codex pin the release tag. OpenCode can use the latest-release asset.
- Do not promise automatic updates for routes that require a manual command.
