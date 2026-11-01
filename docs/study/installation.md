# Install and update StudySkills

StudySkills supports Linux, macOS, Windows native, and WSL as Linux.

Use PowerShell on native Windows and POSIX commands in WSL, Linux, and macOS.

If Documents is redirected to OneDrive or another location, set:

```text
STUDYSKILLS_DOCUMENTS_DIR=C:\Users\<you>\OneDrive\Documents
```

The value must be an absolute path.

StudySkills can be installed through Claude Code, Codex, or OpenCode.

The repository is a self-hosted marketplace. A public directory listing is separate from installing from this repository.

## Claude Code

### CLI

```bash
claude plugin marketplace add fernandoleitepagani/StudySkills
claude plugin install study-skills@studyskills
```

### GUI

1. Open the plugin or marketplace screen.
2. Add `fernandoleitepagani/StudySkills`.
3. Install `study-skills`.
4. Restart Claude Code.
5. Confirm the 13 skills appear.

The CLI and GUI use the same user settings on the same machine.

### Update

Use the plugin update action, or remove and reinstall the plugin. If the old version remains, verify the installed `study-canvas/SKILL.md` contains the current features.

## Codex

### Prerequisites

- Codex CLI or Codex in the ChatGPT desktop app.
- A Codex version with plugin marketplace support.
- The marketplace added in the same environment that runs the GUI.

On Windows, Windows and WSL are separate environments. If Codex GUI runs through WSL, install the marketplace inside WSL. If it runs natively on Windows, install it in Windows.

### CLI

```bash
codex plugin marketplace add fernandoleitepagani/StudySkills
codex plugin marketplace list
```

Then open Codex and run:

```text
/plugins
```

Choose the StudySkills marketplace, install `study-skills`, and start a new session.

To refresh a Git marketplace:

```bash
codex plugin marketplace upgrade
```

### GUI

1. Add the marketplace through Codex settings or the CLI.
2. Restart the ChatGPT desktop app.
3. Open **Plugins**.
4. Choose the StudySkills marketplace.
5. Install `study-skills`.
6. Start a new chat.

If the plugin is missing:

- Run `codex plugin marketplace list`.
- Confirm the marketplace root.
- Confirm the GUI and CLI use the same Windows or WSL home.
- Restart the app after adding the marketplace.

## OpenCode

### macOS, Linux, WSL

```bash
DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 npx skills@latest add \
  fernandoleitepagani/StudySkills \
  --skill '*' -a opencode -g -y
```

### Windows PowerShell

```powershell
$env:DISABLE_TELEMETRY=1
$env:DO_NOT_TRACK=1
npx -y skills@latest add "fernandoleitepagani/StudySkills" --skill "*" -a opencode -g -y
```

### Update

```bash
npx skills@latest update
```

If update does not replace the files, reinstall with the command for your shell.

## Local development

The supported end-user path is the marketplace or `npx` installer.

For local development:

```bash
node scripts/link-skills.mjs
```

Use `--force` only after reviewing which existing skill directories will be replaced.

`scripts/link-skills.sh` is a POSIX-only development helper. It is not the recommended Windows path.

## Verify an installation

Check that `study-canvas/SKILL.md` contains:

```text
manual-materials.md
allForbidden
```

Check that these files exist:

```text
study-canvas/references/core/error-messages.md
study-canvas/scripts/canvas.mjs
study-canvas/README.md
```

Check that all 13 skill directories are present.

Run the installed-skill check:

```bash
node scripts/check-install.mjs --root ~/.agents/skills --json
```

For Claude Code, use:

```bash
node scripts/check-install.mjs --root ~/.claude/skills --json
```

## Marketplace listing

The GitHub repository is installable as a self-hosted marketplace. Public discovery requires submitting the repository or plugin to the relevant directory and completing its review process.

No release tag is required for normal installation. The marketplace tracks `main`.
