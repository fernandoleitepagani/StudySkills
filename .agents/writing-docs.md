# Writing docs

Every skill in `skills/study/` has a required `README.md`. The collection index lives at `docs/study/README.md`.

A dedicated page at `docs/study/<skill-name>.md` is optional. Add one when the skill README grows too large to scan. Use four sections, in this order:

1. **What it does**: the outcome, in plain language.
2. **When to reach for it**: the situations where this skill is the right tool, and where it is not.
3. **Common questions**: the questions a new user will ask, answered briefly.
4. **It's working if**: observable signs that the skill ran correctly.

Keep the page short. Link to `SKILL.md` or `roadmap2.md` for details instead of duplicating them.

Include one short example prompt and one example output layout. Do not paste entire reference files into the docs page.

## README

The top-level README lists shipped skills with a one-line description and a link to the skill README. The collection index gives each skill a short section. The bucket README (`skills/study/README.md`) lists every shipped skill in the bucket.

Do not duplicate the same material across the root README, collection index, and skill README. Each page should answer a different question.

## Special docs

Update `docs/study/math.md` when formulas, graphs, images, fallbacks, or LaTeX security change.

Update `docs/study/performance.md` when generation stages, benchmarks, or targets change.

Update the matching `docs/study/release-notes-v*.md` for each release.

## Install commands

Copy install commands from `.agents/install-block.md` verbatim. Do not invent a second install route.
