# StudySkills v1.0.1 Release Notes

## Release

v1.0.1 is a patch release for cross-platform test stability.

## Changes

- Made skill frontmatter parsing in tests CRLF-safe.
- Made README install-command checks CRLF-safe.
- Fixed Windows token test isolation by setting `USERPROFILE`.
- Made token path assertions work with Windows path separators.
- No skill behavior changes.

## v1.0.0 baseline

The 13-skill, four-question, Linux/macOS/Windows collection remains unchanged. See `release-notes-v1.0.0.md` and `security-audit.md`.

## Verification

- 96 tests.
- Linux, macOS, and Windows CI on Node 20 and 22.
- `check:install`, `check:marketplaces`, and `check:syntax`.

## Install

Use `main`; no release-tag pinning is required.
