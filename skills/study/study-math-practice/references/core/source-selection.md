# Source selection

Use this contract when a skill can read more than one source group.

Do not use it when the user already named one file, one folder, or one attachment.

## Step 1 - Inventory first

Run the skill's inventory or catalog command before asking.

Show the user:

- source groups, such as Canvas modules or StudySkills runs
- file counts
- file types
- estimated size
- skipped categories
- anything that exceeds a cap

Do not ask the user to choose from a list you have not inspected.

## Step 2 - Ask one question

Use the harness native question tool.

Question: **Which materials should I use?**

Options:

1. **Everything within safe limits** (recommended)
2. **Choose specific materials**

Every question supports a custom typed answer. Do not add a separate "Type your answer" option when the harness already provides one.

## Step 3 - Resolve the answer

### Everything

Select every eligible source.

For Canvas, "Everything" means:

- syllabus, front page, modules, pages, assignments, discussions, announcements, and course files
- same-origin page images
- HTML converted to text

It still skips media, quizzes, unsupported files, files over the per-file cap, and downloads over the total cap. State those limits in the plan.

For the StudySkills library, "Everything" means every document in the selected topic or run. Use source mode `library` in `plan.json`. If the user says "everything in StudySkills", group the result by topic and run before proceeding.

### Specific materials

Accept any of these answers:

- module names
- page names
- assignment names
- file names
- document names
- topic names
- run names
- a comma-separated or line-separated list

Resolve names against the inventory. If a name is ambiguous, show the matches and ask once more. If a name is not found, show the closest matches and ask once more. Do not guess silently.

### Custom typed answer

Treat the typed text as the selection. If it cannot be resolved, ask for clarification. Do not fall back to "everything" without permission.

## Step 4 - Handle caps

If "Everything" exceeds a cap:

1. Show the exact overage.
2. Show the largest groups.
3. Ask the user to narrow the set.
4. Do not truncate silently.
5. Do not start generation until the selection fits or the user explicitly accepts the documented limit.

## Step 5 - Confirm and record

Show the final selection as a short summary:

```text
Selected: 3 modules, 18 pages, 4 files, 12 MB
Skipped: 2 quizzes, 1 video, 1 file over 50 MB
```

Ask the user to confirm before planning.

Record the selection in `plan.json`:

```json
{
  "source": {
    "mode": "pack",
    "inputs": ["pack"],
    "selection": {
      "mode": "everything",
      "items": []
    }
  }
}
```

For specific selections:

```json
{
  "selection": {
    "mode": "specific",
    "items": ["Module 1", "Week 3 notes.pdf"]
  }
}
```

Never put absolute source paths in the output files. Relative names and source IDs are enough.

## Step 6 - Coverage

Maintain a source coverage ledger in the work directory:

```text
source -> output sections -> used or skipped
```

Every selected source must be used or explicitly marked skipped. Report skipped sources in the final answer.
