# StudySkills v1.1.0 Release Notes

## Release

v1.1.0 adds a LaTeX-first math format, faster generation, and a documentation truth pass. The 13-skill collection and the four-question interview limit remain unchanged.

The collection supports Claude Code, OpenCode, and Codex, CLI and GUI, on Linux, macOS, Windows native, and WSL as Linux.

## Skills

- `study-canvas`
- `study-notes`
- `study-recall`
- `study-explain-back`
- `study-exams`
- `study-planner`
- `study-files`
- `study-revisit`
- `study-language`
- `study-math-practice`
- `study-code-kata`
- `paper-reader`
- `thesis-organizer`

## Highlights

### Documentation truth pass

- Removed the stale `checklistv1.md`.
- Aligned `AGENTS.md`, `CLAUDE.md`, and `.agents/writing-docs.md` with the real docs layout.
- Fixed the collection docs path to `web-research.md`.
- Corrected the 16-skill roadmap claim, harness matrix version label, and security audit release reference.
- Added a relative Markdown link test.

### Faster generation

- References load just in time.
- Canvas keeps its format preflight before the remote fetch.
- Local-source skills skip the separate preflight and render the real outputs.
- One canonical draft per output renders every requested format.
- Content review runs once per output. Format review runs once per produced file.
- Web research is an explicit **Optional extras** checkbox, unchecked by default.
- Canvas section lists and page details fetch with bounded concurrency.
- File and image downloads remain sequential so size caps and manifest order stay exact.
- Added `docs/study/performance.md`.

### LaTeX math, graphs, and images

- Inline formulas use `$...$`.
- Display formulas use `$$...$$`.
- Graphs use `latex-graph` blocks with PGFPlots or TikZ.
- Images use relative paths, alt text, and captions.
- PDF can render LaTeX directly. DOCX and PPTX use native equations or rendered images. Markdown keeps LaTeX source. CSV stays plain.
- Fallback order is LaTeX or harness math, rendered images, then plain notation.
- Added `core/references/math.md`, `core/scripts/lib/math.mjs`, and `core.mjs math-check`.
- Added `plan.math` and `checks.math` metadata and validation.
- Added math templates for `study-math-practice`.
- Added `docs/study/math.md`.

## Math security

- No automatic TeX installation.
- No shell escape.
- Blocked commands include `\write18`, `\input`, `\include`, `\openout`, `\read`, `\immediate`, and `\special`.
- Absolute image and include paths are rejected.
- Compilation stays in the work directory.
- Auxiliary files are deleted with the work directory.
- No remote compilation.

## Verification

- 116 automated tests pass locally.
- `check:version` checks `package.json`, `.claude-plugin/plugin.json`, and `.codex-plugin/plugin.json`.
- `check:skills` verifies all generated copies.
- `check:syntax` covers 104 JavaScript files.
- `check:install` verifies all 13 skills.
- `check:marketplaces` verifies both manifests.
- `math-check` passes on the math templates.
- CI matrix: Ubuntu, macOS, and Windows on Node 20 and 22.

The v1.0.1 manual harness coverage remains the baseline. Math visual rendering still needs a per-harness smoke test because the renderer owns formula and graph output. The automated suite covers math scanning, metadata validation, and the fallback decision path.

## Accepted limitations

- Math visual quality depends on the harness document renderer.
- A LaTeX toolchain is optional. Outputs fall back to images or plain notation.
- File and image downloads remain sequential.
- Module-linked Pages, Files, and Assignments are not fully resolved automatically.
- Module-only titles can be thinner than expected.
- Canvas Files or Pages may be forbidden by course policy.
- Private Google Drive files and videos are not downloaded.
- Videos require a transcript or subtitles.
- Quality and math evidence are agent-attested, not independently fact-checked.
- Web research depends on harness access and remains untrusted.
- Public Claude and Codex store listings are future work.

## Install

Use `main` for the stable release. No release-tag pinning is required.

See [installation.md](./installation.md) for Claude Code, Codex, OpenCode, Windows PowerShell, WSL, updates, and verification.

## Upgrade note

Install the 13-skill collection cleanly. Remove old copies only after confirming the new collection is visible. Restart the harness after installing or updating.
