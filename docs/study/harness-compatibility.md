# Harness compatibility

StudySkills is tested against the harness versions below. A passing script suite does not guarantee compatibility with every future harness release.

## Recorded results

| Harness | Surface | Version | Status | Notes |
| --- | --- | --- | --- | --- |
| Claude Code | CLI | Not recorded | User-reported | End-to-end flow reported working |
| Claude Code | GUI | Not recorded | User-reported | End-to-end flow reported working |
| OpenCode | CLI | `v2.0.25` | Verified locally | Questions and skill layer verified |
| OpenCode | GUI | `v2.0.25` | User-confirmed | Reported working |
| Codex | CLI | Not tested | Pending | Requires final smoke test |
| Codex | GUI | Not tested | Pending | Windows/WSL environment can differ from CLI |

Per-skill coverage is tracked in `docs/study/harness-matrix.md`.

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
2. Confirm all 16 skills are visible.
3. Open one native question.
4. Invoke `canvas-study` or `file-study`.
5. Generate one PDF.
6. Confirm the output opens.
7. Record the harness version and result in this file.
8. Update `harness-matrix.md` if coverage changed.

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
