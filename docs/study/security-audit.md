# StudySkills Security Audit

## Scope

This audit covers the 13 StudySkills skills and their shared self-contained core:

- Canvas access and tokens
- local source handling
- generated outputs
- plugin and marketplace distribution
- web research
- cleanup behavior
- zero-dependency supply chain

## Assets to protect

- Canvas personal access tokens
- local source files and course materials
- generated study documents
- user file paths and directory structure
- plugin and marketplace metadata
- repository integrity

## Threat model

| Threat | Impact | Control |
| --- | --- | --- |
| Token printed in chat or output | Account compromise | Token never requested in chat; outputs scanned; redaction |
| Token committed or copied into Documents | Credential leak | Files live under `~/.studyskills`; repository guidance |
| Canvas write operation | Account/course mutation | GET-only guard and read allowlist |
| Cross-origin redirect leaks Authorization | Token theft | Redirect checks and header dropping |
| Prompt injection in course content | Agent follows untrusted instructions | Course content treated as data; no instruction execution |
| Path traversal or symlink escape | Writes or reads outside allowed roots | Filename sanitization, containment checks, catalog realpath |
| Source mutation | Data loss | Read-only source rules and hash checks |
| Failed output left behind | Incorrect study material | Validation and cleanup-failed |
| Work directory retained | Source/privacy residue | Work directory removed on success and failure |
| Web query leaks private data | Privacy breach | Hard do-not-send list; public concepts only |
| Web result prompt injection | Incorrect or unsafe output | Web results treated as untrusted; citations |
| Plugin auto-update from `main` | Supply-chain trust | Public main review, versioning, manifests |
| Third-party dependencies | Supply-chain risk | Zero runtime dependencies |

## Controls and evidence

- Canvas is GET-only.
- Canvas read paths are allowlisted.
- Cross-origin API redirects are refused.
- Authorization is dropped on cross-origin downloads.
- Tokens are host-specific.
- Token files are written with restrictive permissions where supported.
- Token values are redacted from errors.
- Outputs are scanned for token leakage.
- File names are sanitized.
- Document output paths are contained under the Documents directory.
- Work directories are contained under `~/.studyskills/work`.
- Work directories are removed after reporting.
- Failed partial files are removed.
- Source files are read-only.
- Web research has a hard do-not-send list.
- No telemetry, analytics, or remote logging.
- No git operations during study runs.
- No runtime dependencies.
- 115 automated tests cover the script layer and Canvas mock behavior.
- Linux, macOS, and Windows CI runs on Node 20 and 22.

## Findings

### Fixed or controlled

- Token file age warning no longer implies credential expiry.
- 401 errors carry explicit expiry guidance.
- Section-level 403 no longer stops a partial Canvas run.
- All-core-section 403 produces a clear blocked state.
- Output directory returns both `runDir` and `outputDir`.
- Retry backoff no longer becomes zero when `Retry-After` is absent.
- Quality scores below published minimums fail validation.
- Invalid original files are reported when a fallback exists.
- Catalog roots are checked with realpath.
- Windows/OneDrive Documents can be selected explicitly.

### Accepted residual risks

1. **Module-linked content**
   - The skill records module links but does not resolve every linked Page, File, or Assignment.
   - Modules with only titles can look richer than their readable content.
   - Mitigation: `manual-materials.md` and `study-files`.

2. **Module item completeness**
   - Inline module items may be incomplete even when `items_count` is present.
   - The separate module-items fallback is not complete.

3. **Module selection**
   - Selecting a module does not guarantee all child resources are included.

4. **Canvas permissions**
   - Files or Pages may be forbidden by course policy.
   - No permission bypass is attempted.

5. **Private media**
   - Google Drive files and videos are not downloaded or transcribed.
   - Users download manually or provide transcripts.

6. **Quality evidence**
   - `checks.json` is self-attested by the agent.
   - Validation covers structure and declarations, not factual truth.

7. **Web research**
   - Harness web access can be unavailable or denied.
   - Web results are untrusted and may be incomplete, outdated, or malicious.

8. **Public distribution**
   - Public Claude and Codex store listings are not part of v1.
   - The repository is a self-hosted marketplace.

## Release recommendation

No unresolved security blocker remains for v1.0.1.

The residual risks above are documented and have user-facing mitigations. They should remain in the release notes and future roadmap.
