# StudySkills v1.1.1 Release Notes

## Release

v1.1.1 is a patch release for validation, math scanning, CI, and documentation.

The 13-skill collection, four-question interview limit, supported harnesses, and output formats stay the same.

## Fixes

### Plan math metadata

- `validate` now checks `plan.math.required`, `plan.math.engine`, and `plan.math.fallback`.
- Bad engine and fallback values fail validation.
- Tests cover valid metadata and rejected metadata.

### Math scanner

- Axis graphs need non-empty `xlabel` and `ylabel`.
- Graphs with multiple `\addplot` entries need a legend.
- `math-check --base-dir` reports missing image and `\includegraphics` assets.
- `checks.math.rawLatex` records whether rendered files contain raw TeX.
- Required math runs with PDF, DOCX, or PPTX output must set `rawLatex: false`.
- Tests cover labels, legends, asset existence, and the CLI base directory.

### CI and release checks

- The test workflow runs on `main` and `dev`.
- The release workflow runs version, skill sync, syntax, marketplace, install, and test checks.
- Workflow tests guard both files.

### Documentation

- Deleted `roadmap.md`.
- Updated release history links.
- Expanded the relative-link test to cover `AGENTS.md`, `CLAUDE.md`, and `.agents/*.md`.
- Added math and performance update rules to repository guidance.
- Added LaTeX math, graphs, and images to the security audit scope.
- Documented graph labels, legends, asset checks, and `rawLatex`.

## Verification

- 125 automated tests pass locally.
- `check:version` checks all three manifests.
- `check:skills` verifies generated copies.
- `check:syntax` covers 105 JavaScript files.
- `check:install` verifies all 13 skills.
- `check:marketplaces` verifies both manifests.
- CI covers Ubuntu, macOS, and Windows on Node 20 and 22.
- The release workflow runs the full check suite.

Math visual rendering remains harness-dependent. The v1.1.0 release notes document the per-harness math smoke.

## Install

Use `main`. No release-tag pinning is required.

See [installation.md](./installation.md) for install, update, and verification steps.
