# Writing docs

Each skill in `skills/study/` has a page at `docs/study/<skill-name>.md`.

The page has four sections, in this order:

1. **What it does**: the outcome, in plain language.
2. **When to reach for it**: the situations where this skill is the right tool, and where it is not.
3. **Common questions**: the questions a new user will ask, answered briefly.
4. **It's working if**: observable signs that the skill ran correctly.

Keep the page short. Link to `SKILL.md`, `roadmap.md`, or `roadmap2.md` for details instead of duplicating them.

Include one short example prompt and one example output layout. Do not paste entire reference files into the docs page.

## README

The top-level README lists promoted skills with a one-line description and a link to the skill page. The bucket README (`skills/study/README.md`) lists every skill in the bucket, including planned skills.

## Install commands

Copy install commands from `.agents/install-block.md` verbatim. Do not invent a second install route.
