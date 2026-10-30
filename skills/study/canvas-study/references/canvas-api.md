# Canvas API reference

Canvas is read-only. Only GET requests are allowed.

## Read-only allowlist

Allowed paths:

- `/api/v1/users/self`
- `/api/v1/courses`
- `/api/v1/courses/:id`
- `/api/v1/courses/:id/modules`
- `/api/v1/courses/:id/pages`
- `/api/v1/courses/:id/pages/:url`
- `/api/v1/courses/:id/assignments`
- `/api/v1/courses/:id/discussion_topics`
- `/api/v1/courses/:id/front_page`
- `/api/v1/courses/:id/files`
- `/api/v1/files/:id/download`

Forbidden:

- Any `POST`, `PUT`, `PATCH`, or `DELETE`
- Submissions
- Discussion posts or replies
- Page, module, assignment, or file edits
- Uploads
- Profile, notification, calendar, or account changes
- Token creation, rotation, or revocation
- Browser automation that clicks or submits

The client enforces `method === "GET"` and an `/api/v1/` path prefix before any network call.

## Authentication

Send the token only in the `Authorization: Bearer <token>` header.

Never put it in a URL, query string, output file, log, or error message.

## Endpoints used

### Current user

```text
GET /api/v1/users/self
```

Used to validate the token and URL.

### Courses

```text
GET /api/v1/courses?enrollment_state=active&include[]=term&per_page=100
```

Filter to `workflow_state === "available"` and `access_restricted_by_date !== true`.

### Course detail

```text
GET /api/v1/courses/:id?include[]=syllabus
```

The response includes `syllabus_body`.

### Modules

```text
GET /api/v1/courses/:id/modules?include[]=items&per_page=100
```

Module items include type, title, position, content ID, HTML URL, and external URLs.

### Pages

```text
GET /api/v1/courses/:id/pages?per_page=100
GET /api/v1/courses/:id/pages/:url
```

The list gives titles and page URLs. The detail gives the HTML body.

### Assignments

```text
GET /api/v1/courses/:id/assignments?per_page=100
```

Use `description`, `due_at`, `points_possible`, `html_url`, and rubric data when present.

### Discussions

```text
GET /api/v1/courses/:id/discussion_topics?per_page=100
```

Use the topic title, posted date, and message. Do not fetch replies.

### Announcements

```text
GET /api/v1/courses/:id/discussion_topics?only_announcements=true&per_page=100
```

Use the title, posted date, and message.

### Front page

```text
GET /api/v1/courses/:id/front_page
```

If it returns 404, skip it.

### Files

```text
GET /api/v1/courses/:id/files?per_page=100&sort=position&order=asc
```

Download with the file URL from the response or:

```text
GET /api/v1/files/:id/download?download_frd=1
```

If a download redirects to another host, drop the Authorization header before following the redirect.

## Pagination

Follow the `Link` header with `rel="next"`.

Stop after 100 pages for a single collection. Stop after 300 pages for all pages.

The next URL must remain on the Canvas host.

## Rate limits

Canvas returns `403` with a body containing `Rate Limit Exceeded` when throttled.

- Read `Retry-After` when present.
- Otherwise use exponential backoff capped at 30 seconds.
- Retry up to 5 times.
- Keep requests sequential. Do not run parallel downloads.

## File rules

Allowed extensions:

```text
.pdf .doc .docx .ppt .pptx .xls .xlsx .txt .md .csv .rtf .odt .odp .ods .epub .html
```

Skipped by default:

- Images, audio, video, archives, and binaries outside the list.
- Files over 50 MB.
- Files after the 300 MB total cap.
- Quizzes and question banks.

Sanitize every filename. Remove path separators, control characters, Windows reserved names, and excess length. Never follow a path outside the files directory.

## Errors

Record and continue when a single item fails:

- 404 page, module item, or front page.
- 403 files tab disabled.
- File too large.
- Unsupported extension.

Stop when the course itself cannot be fetched, the token is invalid, or the base URL is wrong.

Error codes:

- `UNAUTHORIZED` for 401.
- `FORBIDDEN` for 403 without a rate-limit marker.
- `RATE_LIMITED` for 429 or a 403 with `Rate Limit Exceeded`.
- `NOT_FOUND` for 404.
- `SERVER_ERROR` for 5xx.
- `INSECURE_REDIRECT` for a cross-origin API redirect.

## Truncation

Follow `Link` headers up to 100 pages per collection. If the next link remains, mark the collection as truncated and report it. Fetch page bodies up to 500 pages. Report the number of pages skipped.

## Images

Download same-origin Canvas page images with these limits:

- PNG, JPEG, GIF, WebP, SVG.
- 10 MB per image.
- 50 MB total.
- 200 images.

Rewrite local image references in `materials.md`. List external image URLs under external images. Do not fetch images from third-party hosts.

## External materials

List but do not fetch:

- External URL module items.
- LTI tools.
- Google Drive, Panopto, Perusall, and similar links.
- Quizzes.

Write them to `materials.md` and `manifest.json` under external materials. Report them in the final summary.

## HTML to text

Convert Canvas HTML with the skill converter. Preserve:

- Headings
- Paragraphs
- Lists
- Links
- Basic emphasis
- Line breaks

Remove scripts, styles, and unknown tags. Decode HTML entities. Collapse excess whitespace.

## Manifest

Write `sources/manifest.json` with:

- Course ID, name, and code
- Fetch timestamp
- Counts
- Downloaded files
- Skipped files and reasons
- Endpoint errors
- Total bytes

Never include the token or the user's account ID.
