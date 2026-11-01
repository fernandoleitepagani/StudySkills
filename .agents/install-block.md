# Canonical install block

One install route per harness. Every skill is self-contained.

See `docs/study/installation.md` for GUI steps, WSL notes, verification, troubleshooting, and updates.

## Claude Code

```bash
claude plugin marketplace add fernandoleitepagani/StudySkills
claude plugin install study-skills@studyskills
```

Restart Claude Code after installation.

## Codex

```bash
codex plugin marketplace add fernandoleitepagani/StudySkills
```

Then run `/plugins` in Codex, choose the StudySkills marketplace, and install `study-skills`. Restart Codex after installation.

On Windows, use the same Windows or WSL environment as the Codex GUI.

## OpenCode

macOS, Linux, and WSL:

```bash
DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 npx skills@latest add \
  fernandoleitepagani/StudySkills \
  --skill '*' -a opencode -g -y
```

Windows PowerShell:

```powershell
$env:DISABLE_TELEMETRY=1
$env:DO_NOT_TRACK=1
npx -y skills@latest add "fernandoleitepagani/StudySkills" --skill "*" -a opencode -g -y
```

Update with `npx skills@latest update`.

## Local development

```bash
node scripts/link-skills.mjs
```

Use `--force` only after checking which existing directories will be replaced. `scripts/link-skills.sh` is POSIX-only and not the recommended Windows path.

## Rules

- The commands assume the repository is hosted at `fernandoleitepagani/StudySkills`.
- No `npm install` is required.
- The marketplace tracks `main`; no release tag is required.
- Use `dev` for development and `main` for stable installs.
- Do not promise automatic updates for routes that require a manual command.
