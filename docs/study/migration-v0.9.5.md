# Migration to v0.9.5

v0.9.5 introduces a common `study-*` prefix and merges three pairs of related skills. Existing users must remove the old skill names and reinstall.

## Name map

| Old skill | New skill |
| --- | --- |
| `canvas-study` | `study-canvas` |
| `lecture-notes` | `study-notes` |
| `note-organizer` | `study-notes` |
| `flashcard-forge` | `study-recall` |
| `active-recall-coach` | `study-recall` |
| `explain-back` | `study-explain-back` |
| `exam-sim` | `study-exams` |
| `exam-debrief` | `study-exams` |
| `study-planner` | `study-planner` |
| `file-study` | `study-files` |
| `revisit-and-improve` | `study-revisit` |
| `language-coach` | `study-language` |
| `math-practice` | `study-math-practice` |
| `code-kata-coach` | `study-code-kata` |
| `paper-reader` | `paper-reader` |
| `thesis-organizer` | `thesis-organizer` |

## Merged modes

- `study-notes`: **Lecture notes** and **Organize notes**
- `study-recall`: **Flashcards** and **Active recall**
- `study-exams`: **Create a practice exam** and **Debrief a completed exam**

All source modes, outputs, settings, and safety rules are preserved.

## OpenCode

Update first:

```bash
npx skills@latest update
```

Then remove the old skill directories if they still exist:

```bash
rm -rf ~/.agents/skills/canvas-study
rm -rf ~/.agents/skills/lecture-notes
rm -rf ~/.agents/skills/note-organizer
rm -rf ~/.agents/skills/flashcard-forge
rm -rf ~/.agents/skills/active-recall-coach
rm -rf ~/.agents/skills/explain-back
rm -rf ~/.agents/skills/exam-sim
rm -rf ~/.agents/skills/exam-debrief
rm -rf ~/.agents/skills/file-study
rm -rf ~/.agents/skills/revisit-and-improve
rm -rf ~/.agents/skills/language-coach
rm -rf ~/.agents/skills/math-practice
rm -rf ~/.agents/skills/code-kata-coach
```

Or reinstall the collection:

```bash
npx -y skills@latest add "fernandoleitepagani/StudySkills" \
  --skill "*" -a opencode -g -y
```

## Claude Code

Update the marketplace and plugin, or remove and reinstall the plugin. Restart Claude Code and confirm the 13 new skill names.

## Codex

Refresh the marketplace:

```bash
codex plugin marketplace upgrade
```

Remove the old plugin and reinstall it from `/plugins` if cached skills remain. Restart Codex.

## Verify

From a clone of the repository:

```bash
node scripts/check-install.mjs --root ~/.agents/skills --json
```

For Claude Code:

```bash
node scripts/check-install.mjs --root ~/.claude/skills --json
```

The result should show 13 expected skills and no `study-core`.

## Important

Do not keep old and new names installed together. They create duplicate commands and confusing plugin listings.
