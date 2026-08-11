# HERMES Operational Activation Checklist

This is the step-by-step checklist for turning HERMES Phase 5 Lite from
"code complete, everything safe/off" into a live weekly operation. Nothing
in this document is authorization to flip any switch — it is the list Victor
Abreu works through, in order, when he decides to.

See `hermes/PHASE5-LITE.md` for the full architecture and environment
variable reference. This file only tracks activation state and sequencing.

## A. GitHub Secrets required

Configure under **Settings → Secrets and variables → Actions → Secrets**:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_SECRET`
- `HERMES_REVIEW_EMAIL`
- `HERMES_SENDER_EMAIL`
- `HERMES_BASELINE_APPROVAL_TOKEN` — required only to promote a baseline
  preview or roll back (section H); collection/report/email never read it.
  Never entered into any workflow_dispatch input form.

Secret values are never stored in this repository. Victor confirmed that the
Microsoft Azure/Graph transport is configured; before each activation, verify
the required secret names are present in GitHub Actions without exposing their
values.

## B. Initial safe Variables

Configure under **Settings → Secrets and variables → Actions → Variables**:

- `HERMES_COLLECTION_DRY_RUN=true`
- `HERMES_EMAIL_LIVE=false`
- `HERMES_BASELINE_MODE=true`

`HERMES_BASELINE_MODE=true` means every run — including the first manual
one — only bootstraps/refreshes `hermes/baselines/source-baseline.json`
and never produces a candidate. This is intentional and is never
auto-disabled by code; only set the `HERMES_BASELINE_MODE` Variable to
`false` after a baseline run has been reviewed (section D) and looks
correct, so that a later run with genuinely changed content can produce a
real candidate to review.

These are the same values the workflow already defaults to when the
Variables are unset — setting them explicitly here just makes the current
safe state visible and intentional in repository settings, rather than
implicit in code.

## C. Sender

- The active transport is the existing Microsoft Azure/Graph integration.
- The sending mailbox must be a confirmed corporate ELIMFILTERS account and
  is supplied through `HERMES_SENDER_EMAIL`; this repository does not record
  or guess its address.
- Victor confirmed the review recipient as `vabreu@elimfilters.com`.
- The Gmail account created during setup is not the active transport. It may
  remain an inactive contingency only and must not silently replace Azure.

## D. First manual workflow run

1. Open **GitHub → Actions**.
2. Select **HERMES Weekly Intelligence Collection**.
3. Click **Run workflow**, targeting `main`.
4. Leave `HERMES_COLLECTION_DRY_RUN` unset or `true` (DRY RUN).
5. When the run finishes, open the **hermes-weekly-collection** artifact and
   review the logs for each step.
6. Confirm in the logs and artifact contents:
   - Zero files were written to `hermes/real-candidates` (previews only, in
     `hermes/real-candidates-previews`, which is included in the uploaded
     artifact set).
   - `hermes/reports/hermes-weekly-*.md` was generated.
   - No step logged an error from the "Send weekly review email" step
     other than a DRY RUN preview notice.
7. Confirm zero productive writes: no changes appear anywhere under
   `elimfilters-vault/` except a new file in `elimfilters-vault/94-sync-log/`
   (the audit record — expected every run, dry or live).

## E. First email test

1. Keep `HERMES_EMAIL_LIVE=false`.
2. Run `npm run hermes:email:real` locally (or rely on step D's workflow
   run) to generate `hermes/reports/hermes-email-preview-*.html`.
3. Open that HTML file and review it manually — check subject line,
   candidate list, and that it states no change is applied without Victor's
   approval.
4. Do not send a real email at this stage.

## F. Criteria to activate LIVE email

All of the following must be true before setting `HERMES_EMAIL_LIVE=true`:

- [ ] `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET` secrets
      configured (section A).
- [ ] Sender mailbox confirmed by Victor Abreu (section C) and set as
      `HERMES_SENDER_EMAIL`.
- [ ] Microsoft Graph application permissions validated — the app
      registration has `Mail.Send` (application permission, admin-consented)
      for the sender mailbox.
- [ ] HTML preview from section E reviewed and approved by Victor.
- [ ] At least one successful manual workflow run completed (section D).
- [ ] `HERMES_REVIEW_EMAIL` recipient confirmed as Victor Abreu's actual
      inbox.

Only once every box above is checked should `HERMES_EMAIL_LIVE` be set to
`true` as a repository Variable.

## G. Deactivation procedure

If anything looks wrong at any point:

1. GitHub → **Actions** → **HERMES Weekly Intelligence Collection** →
   **···** → **Disable workflow**.
2. Set the `HERMES_EMAIL_LIVE` repository Variable to `false`.
3. Set the `HERMES_COLLECTION_DRY_RUN` repository Variable to `true`.
4. Revoke or rotate the `AZURE_CLIENT_SECRET` in Azure AD when appropriate
   (e.g. suspected leak, offboarding, or routine rotation), then update the
   GitHub secret with the new value.

## H. Durable baseline state — the `hermes-state` branch

GitHub Actions runners are ephemeral: anything written only to
`hermes/baselines/source-baseline.json` inside a runner's filesystem is gone
the moment the job ends. The durable copy of the governed source baseline
lives on a dedicated branch, `hermes-state`, which holds exactly three
files and nothing else:

```
state/source-baseline.json           # the real baseline comparisons read
state/backups/source-baseline.<ISO-timestamp>.json   # max 5 kept
state/promotion-audit.json           # append-only log of promotions/rollbacks (last 20)
```

`hermes-state` is never merged into `main` and no PR is ever opened from it
— it only ever receives direct, single-commit pushes from
`scripts/hermes/git-state-branch.mjs` plumbing (fetch/read/commit-tree/push
via an isolated temporary git index; it never runs `git checkout` and never
touches whatever branch a job has checked out). `hermes/baselines/` in a
normal checkout remains a local, gitignored, operational cache only — it is
always re-derived from `hermes-state` at the start of a run and is never
itself the source of truth.

### Reading (every weekly run)

Before collection, `npm run hermes:baseline:restore` fetches `hermes-state`
and copies `state/source-baseline.json` into the local
`hermes/baselines/source-baseline.json` the collector compares against. If
the branch or that file does not exist yet, nothing is written locally —
every source then reports `BASELINE_REQUIRED` for that run rather than
HERMES silently seeding a baseline from a single observation. This step
only ever fetches and reads; it needs nothing beyond the default
`contents: read` permission.

### Promoting a baseline preview

1. Review the preview (from a `hermes-baseline-promotion` workflow artifact,
   or locally via `HERMES_BASELINE_MODE=true HERMES_COLLECTION_DRY_RUN=true
   npm run hermes:collect`) and confirm every source has a real
   `normalized_hash`, HTTP 200, and sufficient `content_length`.
2. Confirm the `HERMES_BASELINE_APPROVAL_TOKEN` **repository secret** (under
   **Settings → Secrets and variables → Actions → Secrets**, not a
   Variable) is set to the exact approval token value (see
   `scripts/hermes/promote-baseline-core.mjs` — it is not written down here
   or anywhere else in this repository; treat it like a credential). It is
   never entered into the workflow's manual-run form — only ever read from
   this secret.
3. Trigger the workflow manually (**Actions → HERMES Weekly Intelligence
   Collection → Run workflow**) with `promote_baseline` set to `true`.
4. Promotion only ever happens when **all** of `HERMES_BASELINE_MODE=true`,
   `HERMES_BASELINE_PROMOTE=true`, `HERMES_COLLECTION_DRY_RUN=true`, and an
   exact match against the `HERMES_BASELINE_APPROVAL_TOKEN` secret hold at
   once — any one missing or wrong yields `BASELINE PROMOTION NOT
   AUTHORIZED`, and nothing is pushed to `hermes-state`.
5. A validation failure (empty-content hash, disabled/non-ACTIVE endpoint,
   stale timestamp, etc.) yields `BASELINE PROMOTION FAILED` — `hermes-state`
   is left completely untouched.
6. A concurrent promotion or rollback that changed `hermes-state` in the
   meantime is detected by git itself (a non-fast-forward push is
   rejected) and also yields `BASELINE PROMOTION FAILED` — nothing is
   overwritten silently.
7. On success, the new commit is pushed to `hermes-state` and then the
   branch is re-read to confirm the pushed commit is really there before
   anything reports `BASELINE PROMOTED`.
8. The only durable writes this ever performs are the three files listed
   above, on `hermes-state` — never `main`, never a candidate, never
   `elimfilters-vault/94-sync-log`, never PostgreSQL/pgvector/unified-data.

### Rolling back

Trigger the workflow manually with `rollback_backup_name` set to the exact
filename shown under `state/backups/` (e.g.
`source-baseline.2026-08-04T04-29-21-909Z.json`) — same
`HERMES_BASELINE_APPROVAL_TOKEN` secret, same non-fast-forward concurrency
protection, same remote-verification-before-success rule. The baseline
being replaced is itself backed up first. Locally, the equivalent is
`HERMES_BASELINE_APPROVAL_TOKEN=<token> npm run hermes:baseline:rollback --
<backup-filename>`.

This mirrors the "Emergency procedure" section in `hermes/PHASE5-LITE.md`.
