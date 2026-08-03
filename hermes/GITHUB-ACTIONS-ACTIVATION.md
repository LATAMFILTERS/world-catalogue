# HERMES — GitHub Actions Activation Guide

How to operate the **HERMES Weekly Intelligence Collection** workflow
(`.github/workflows/hermes-weekly.yml`) in GitHub's UI: where its
configuration lives, how to run it manually, how to check its output, and
how to turn it off again. This is an operating guide, not an authorization
— nothing here should be done without Victor's decision to proceed.

## Where Secrets and Variables live

Both live under the same repository settings page, in two separate tabs:

**Settings → Secrets and variables → Actions**

- **Secrets** tab: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET`,
  `HERMES_SENDER_EMAIL`, `HERMES_REVIEW_EMAIL`. Values are write-only —
  once saved, GitHub never displays them again, even to admins.
- **Variables** tab: `HERMES_COLLECTION_DRY_RUN`, `HERMES_EMAIL_LIVE`.
  Values ARE visible in this tab at any time — that's intentional, since
  these are just on/off switches, not credentials.

See `hermes/MICROSOFT-GRAPH-SETUP.md` for how to obtain the Secret values.

## Initial safe values

Before any activation, these should read (see
`hermes/OPERATIONAL-ACTIVATION-CHECKLIST.md` section B):

- `HERMES_COLLECTION_DRY_RUN` = `true` (or unset — the workflow defaults to
  `true` either way)
- `HERMES_EMAIL_LIVE` = `false` (or unset — same default behavior)

## Running the workflow manually (`workflow_dispatch`)

1. GitHub → **Actions** tab.
2. In the left sidebar, select **HERMES Weekly Intelligence Collection**.
3. Click **Run workflow** (top right of the runs list).
4. Confirm the branch dropdown shows `main`, then click the green **Run
   workflow** button.
5. A new run appears at the top of the list within a few seconds; click it
   to watch progress live.

## Reviewing logs

1. Open the run from the list.
2. The job is named `weekly-collection`; click it to expand its steps.
3. Each step's log is collapsible — the steps of interest are **Guard
   against DST duplicate run** (confirms the run proceeded rather than
   skipping), **Collect real sources**, **Validate real candidates**,
   **Generate weekly review report**, and **Send weekly review email**.
4. A step highlighted in yellow/skipped (rather than green) usually means
   the DST guard set `proceed=false` — expected behavior for the
   DST-shifted cron firing, not an error (see `hermes/PHASE5-LITE.md`).

## Downloading artifacts

1. On the same run page, scroll to the bottom **Artifacts** section.
2. Download **hermes-weekly-collection** — it contains
   `hermes/real-candidates/`, `hermes/reports/`, `hermes/source-cache/`, and
   `elimfilters-vault/94-sync-log/` as they existed at the end of that run.
3. Unzip locally and inspect: an empty `hermes/real-candidates/` confirms
   DRY RUN behaved correctly (no persistence); the `hermes-weekly-*.md`
   report under `hermes/reports/` is the human-readable summary; the
   `.collection.json` file(s) under `elimfilters-vault/94-sync-log/` are
   the machine-readable audit trail for that run.

## Confirming zero productive writes

For any run, before trusting its output:

- `hermes/real-candidates/` in the downloaded artifact should be **empty**
  unless `HERMES_COLLECTION_DRY_RUN` was deliberately set to `false`.
- The only file that ever changes under `elimfilters-vault/` should be a
  new entry in `94-sync-log/` — nothing under `01-technologies/` through
  `17-technology-watch/` should ever appear in a workflow run's diff,
  because this workflow never calls `hermes:publish`, `hermes:update`, or
  `hermes:rollback`.
- The run's log for the email step should either say `DRY RUN` (when
  `HERMES_EMAIL_LIVE` is `false`) or, if it says `sent to ...`, that means
  `HERMES_EMAIL_LIVE` was `true` — check the Variables tab immediately if
  that wasn't expected.

## Disabling the schedule

GitHub → **Actions** → **HERMES Weekly Intelligence Collection** → **···**
(top right) → **Disable workflow**. This stops both the weekly cron
triggers and manual `workflow_dispatch` runs until re-enabled from the same
menu (**Enable workflow**).

## Cancelling a run in progress

Open the running workflow run → **Cancel workflow** button (top right of
the run page). Safe at any point — every step here is either read-only or,
at most, writes to `hermes/` and `elimfilters-vault/94-sync-log/`; there is
no step that leaves canonical data in a partial state if interrupted.

## Keeping DRY RUN

Simply never set the `HERMES_COLLECTION_DRY_RUN` repository Variable to
`false`. Leaving it unset, or explicitly `true`, keeps every run — scheduled
or manual — writing previews only, indefinitely.

## Interpreting failures from external sources

Not every red ✗ on this workflow (or on other CI checks in this repository)
means HERMES broke something. Two known examples, both confirmed unrelated
to any HERMES documentation or code change on PR #279:

- A `validate`/Search Engine check failing because
  `https://part-search.elimfilters.com` returned zero results for a live
  query — that's the production search API's behavior, not this workflow.
- A `Validation Gates` lint check failing on frontend files this workflow
  never touches — that's pre-existing frontend lint debt, not something
  HERMES introduced.

When a check fails, check first whether it even runs against files this
workflow or PR touches before assuming HERMES is at fault.

## Avoiding origin vs. upstream confusion

This repository's git remotes are:

- `origin` → `https://github.com/LATAMFILTERS/world-catalogue.git` — the
  real repository. Every HERMES branch, PR, and workflow run belongs here.
- `upstream` → `https://github.com/twentyhq/twenty.git` — an unrelated
  upstream remote from this codebase's history. It is not part of HERMES
  and must never be pushed to or read from for HERMES work.

When using `gh` (the GitHub CLI), always pass `--repo LATAMFILTERS/world-catalogue`
explicitly. Without it, `gh` may resolve to whichever remote it considers
the repository's "default" — which has been observed in this project to
resolve to `upstream` (`twentyhq/twenty`) instead of `origin`, causing
commands like `gh pr create` or `gh pr diff` to silently operate against the
wrong repository. Always double-check with `gh repo view --json
nameWithOwner` if a `gh` command behaves unexpectedly.
