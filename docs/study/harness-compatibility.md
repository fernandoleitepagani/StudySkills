# Harness compatibility

StudySkills is tested against the harness versions below. A passing script suite does not guarantee compatibility with every future harness release.

## Recorded results

| Harness | Surface | Version | Status | Notes |
| --- | --- | --- | --- | --- |
| Claude Code | CLI | Not recorded | User-reported | End-to-end flow reported working |
| Claude Code | GUI | Not recorded | User-reported | End-to-end flow reported working |
| OpenCode | CLI | `v2.0.25` | Verified locally | Questions and skill layer verified |
| OpenCode | GUI | `v2.0.25` | User-confirmed | Reported working |
| Codex | CLI | Not recorded | User-confirmed | Reported working |
| Codex | GUI | Not recorded | User-confirmed | Reported working |

Per-skill coverage is tracked in `docs/study/harness-matrix.md`.

v1.1.0 adds math scanning and metadata validation. Formula and graph rendering still depends on the harness document renderer. Visual math smoke is recorded per harness before relying on the result.

## Supported systems

- Linux
- macOS
- Windows native
- WSL as Linux

Windows-specific tests are treated as complete. Use `STUDYSKILLS_DOCUMENTS_DIR` if Documents is redirected to OneDrive or another location.

## Compatibility risks

Harness updates can change:

- skill discovery and frontmatter rules
- plugin marketplace formats
- native question tool names and schemas
- permission prompts
- web search and fetch availability
- document generation tools
- GUI caching and plugin update behavior
- Windows, WSL, and macOS path handling

The Node scripts are largely isolated from harness releases. The integration instructions are not.

## After a harness update

Run this smoke test:

1. Confirm the expected skill version is installed.
2. Confirm all 13 skills are visible.
3. Open one native question.
4. Invoke `study-canvas` or `study-files`.
5. Generate one PDF.
6. Confirm the output opens.
7. Run a short math output with one formula and one graph.
8. Confirm formulas and graphs render cleanly or report the documented fallback.
9. Record the harness version and result in this file.
10. Update `harness-matrix.md` if coverage changed.

## Install verification

Check a source tree:

```bash
node scripts/check-install.mjs --root skills/study --json
```

Check an OpenCode install:

```bash
node scripts/check-install.mjs --root ~/.agents/skills --json
```

Check a Claude skill directory:

```bash
node scripts/check-install.mjs --root ~/.claude/skills --json
```

A failed result lists the missing files for each skill.

## Question tool fallback

The skill must use the native question tool actually exposed by the session. If the tool is unavailable or its schema differs, it must adapt or use the text fallback. It must not assume an old Codex or Claude field layout.

## Update policy

- Test after each major harness upgrade.
- Record the tested version.
- Prefer a quick smoke test over assuming backward compatibility.
- Do not promise that future harness releases will remain compatible.
- Keep the marketplace manifests and skill copies version-aligned.
- Verify the installed files after every update.
- Run the math smoke after a document-renderer change.
- LaTeX is optional. Do not require a TeX installation.
