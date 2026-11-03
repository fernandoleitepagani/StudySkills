# StudySkills v1.2.0 Release Notes

## Release

v1.2.0 adds guided Canvas token onboarding. The skill can open the Canvas token page, save a token from the clipboard or a file, or serve a local browser form. The 13-skill collection and the four-question interview limit stay the same.

The collection supports Claude Code, OpenCode, and Codex, CLI and GUI, on Linux, macOS, Windows native, and WSL as Linux.

## Canvas token setup

### Guided setup

- `token-setup` opens the Canvas profile settings page and returns the host-specific token path.
- `token-save` reads a token from the clipboard or a user-named file.
- `token-save` accepts plain token files and `CANVAS_TOKEN=...` env files.
- The token is validated against `GET /api/v1/users/self` before it is written.
- Writes use a temp file and rename with `0600` where supported.
- A rejected token leaves an existing token file untouched.
- The study run continues in the same session after a successful save.
- Legacy global token files can move to the host-specific path with `token-save --file`.

### Local browser page

- `token-capture` serves a one-page form on `127.0.0.1` with a random port and nonce.
- The page checks `Origin` and `Sec-Fetch-Site`, rejects bodies over 8 KB, and sets no-store, no-referrer, nosniff, and a restrictive CSP.
- The page has no JavaScript, external assets, or analytics.
- Three failed tokens or a timeout close the server.
- Remote SSH sessions fail closed with `REMOTE_SESSION`.

### Safety

- The token never appears in chat, logs, outputs, URLs, or error messages.
- Clipboard reads happen only after explicit user confirmation.
- The browser page serves only localhost.
- The read-only Canvas allowlist is unchanged.

## Documentation

- Updated the Canvas skill guide, Canvas page, security reference, and security audit.
- Added token setup troubleshooting for clipboard, file, browser page, and remote sessions.
- Added capture endpoint threats and controls to the security audit.

## Verification

- 148 automated tests pass locally.
- `check:version`, `check:skills`, `check:syntax`, `check:install`, and `check:marketplaces` pass.
- Capture tests cover form rendering, valid saves, wrong nonce, foreign origin, oversized body, retries, three-attempt lockout, timeout, and HTML escaping.
- The harness matrix carries over from v1.1.1.

## Install

Use `main`. No release-tag pinning is required.

See [installation.md](./installation.md) for install, update, and verification steps.
