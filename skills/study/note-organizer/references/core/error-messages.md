# Error messages

Use plain language first. Put technical detail second.

Every terminal result starts with one of:

```text
Result: success
Result: partial success
Result: failed
```

Every failure explains:

1. What happened.
2. What still works.
3. Why it happened.
4. What to do next.

## Catalog

### `NO_TOKEN`

**What happened:** No Canvas token was found for this Canvas host.

**What still works:** Nothing that needs Canvas.

**Why:** The token file is missing, empty, or in the wrong host folder.

**Next step:** Choose **Guide me** to create or replace the token, then run `/canvas-study` again.

### `UNREADABLE_TOKEN_FILE`

**What happened:** The token file exists but cannot be read.

**Why:** It may be a directory, restricted by permissions, or damaged.

**Next step:** Fix the path or permissions, or use the guide.

### `UNAUTHORIZED` / 401

**What happened:** Canvas rejected the token.

**Why:** The token is expired, revoked, wrong for this Canvas host, or invalid.

**Next step:** Create a new token and replace the value in the host-specific file. Canvas tokens commonly expire after 30 days, but your institution controls expiry.

### `FORBIDDEN` / 403 on one section

**What happened:** Canvas accepted the token but blocked one part of the course.

**What still works:** Other readable sections.

**Why:** Course permissions, a disabled section, or a restricted folder. This is not normally a token-expiry problem.

**Next step:** Report which section was blocked. Continue with the rest. Do not tell the user to recreate the token automatically.

### `ALL_SECTIONS_FORBIDDEN`

**What happened:** Canvas accepted the token but blocked every core course section.

**What still works:** Possibly syllabus, front page, or module link references.

**Why:** Course visibility, role permissions, or an institutional API restriction.

**Next step:** Produce a `manual-materials.md` report when links are available. Otherwise ask the user to check course access, try another course, or attach local files.

### `NO_USABLE_MATERIALS`

**What happened:** Canvas sections were accessible, but they contained no readable study material.

**Why:** The course may contain only links, videos, empty pages, or external tools.

**Next step:** Ask the user to attach slides, notes, PDFs, or transcripts. Do not generate study documents from titles alone.

### `SELECTION_NOT_FOUND`

**What happened:** The selected module, page, assignment, or file was not found.

**Next step:** Show the closest matches and ask once more.

### `RATE_LIMITED`

**What happened:** Canvas asked the skill to slow down.

**Next step:** Wait and retry. Do not treat it as a token failure.

### `NETWORK_ERROR`

**What happened:** Canvas could not be reached.

**Why:** Connection, proxy, DNS, or Canvas availability.

**Next step:** Check the connection and try again.

### `INVALID_URL`

**What happened:** The Canvas address is not valid.

**Next step:** Use a URL such as `school.instructure.com`.

### `FORMAT_FAILED`

**What happened:** The requested document format could not be created.

**What still works:** Other requested formats and a Markdown fallback.

**Next step:** Report the failed format, produce the fallback, and keep the original request visible.

### `QUALITY_REVIEW_FAILED`

**What happened:** The generated document did not meet the quality gate.

**Next step:** Revise the weak sections and validate again.

## Style rules

- Do not lead with HTTP status codes.
- Do not print stack traces.
- Do not print tokens or signed URLs.
- Do not say “unknown error” without a next step.
- Say whether the result is complete, partial, or failed.
- Explain what remains usable.
- Offer one clear next action.
