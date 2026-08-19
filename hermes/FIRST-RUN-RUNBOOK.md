# HERMES — First Run Runbook

The exact sequence for HERMES's first real manual run. Every step here is
safe to run repeatedly and produces no live email and no persistent data by
itself — the runbook only becomes "real" if someone deliberately changes a
DRY RUN or LIVE setting outside of it, which this document does not
authorize.

**No step in this runbook authorizes a live email, real persistence, or
automatic publishing. Victor Abreu must explicitly approve moving past DRY
RUN — this document only prepares for that decision, it does not make it.**

## 1. Preflight (local)

```bash
npm run hermes:preflight
```

Confirm the console prints `SAFE` and exits `0`. If it prints `UNSAFE`,
read the listed blocking issues in `hermes/reports/operational-preflight.md`
and resolve them before continuing — do not proceed past this step with an
`UNSAFE` result.

## 2. Registry validation

```bash
npm run hermes:registry:validate
```

Confirm `PASS` with the expected organization/endpoint counts (156
organizations / 15 endpoints as of this writing — counts will grow as more
endpoints are confirmed and added).

## 3. Tests

```bash
npm run test:hermes-phase5
npm run test:hermes-phase7
npm run test:hermes-readiness
```

All three must report all tests passing. Do not proceed on a red test run.

## 4. Manual workflow execution

Follow `hermes/GITHUB-ACTIONS-ACTIVATION.md` → "Running the workflow
manually" to trigger **HERMES Weekly Intelligence Collection** via
`workflow_dispatch` on `main`, with:

- `HERMES_COLLECTION_DRY_RUN` = `true` (repository Variable unset or `true`)
- `HERMES_EMAIL_LIVE` = `false` (repository Variable unset or `false`)

## 5. Artifact review

Download the `hermes-weekly-collection` artifact from the completed run
(see `hermes/GITHUB-ACTIONS-ACTIVATION.md` → "Downloading artifacts").
Confirm all five expected paths are present:
`hermes/real-candidates/`, `hermes/real-candidates-previews/`,
`hermes/reports/`, `hermes/source-cache/`, and
`elimfilters-vault/94-sync-log/`.

## 6. Candidate verification

For each JSON file that appears anywhere in the artifact (previews or
otherwise), confirm it validates:

```bash
npm run hermes:validate:real
```

(Point it at the downloaded/extracted artifact directory if reviewing
outside the runner.) Every candidate should show `workflow_status:
PENDING_REVIEW`, `approval_required: true`, and a well-formed `source_hash`.

## 7. Email HTML review (DRY RUN)

Open `hermes/reports/hermes-email-preview-*.html` from the artifact in a
browser. Confirm:

- The subject and candidate list match the run's actual report.
- The notice stating no change is applied without Victor Abreu's approval
  is present and prominent.
- No link or instruction in the email would trigger a publish, update, or
  rollback action.

## 8. Zero-writes confirmation

Confirm, from the artifact and the run log:

- `hermes/real-candidates/` is empty (DRY RUN never persists).
- The only new file under `elimfilters-vault/` is in `94-sync-log/` — no
  file under `01-technologies/` through `17-technology-watch/` changed.
- The run log's email step says `DRY RUN`, not `sent to ...`.
- No step in the log invoked `hermes:publish`, `hermes:update`, or
  `hermes:rollback` (the workflow doesn't define these steps, but this is
  the final human check, not an assumption).

## 9. GO / NO-GO criteria

**GO** (safe to consider the next activation step in
`hermes/OPERATIONAL-ACTIVATION-CHECKLIST.md`) requires **all** of:

- [ ] Step 1 preflight: SAFE
- [ ] Step 2 registry: PASS
- [ ] Step 3 tests: all green
- [ ] Step 4 workflow run: completed without an unexpected error
- [ ] Step 5 artifacts: all five paths present
- [ ] Step 6 candidates: all valid
- [ ] Step 7 email preview: reviewed and looks correct
- [ ] Step 8 zero-writes: confirmed

**NO-GO** if any box above is unchecked, or if anything in the run looks
different from what this runbook describes. A NO-GO here means: stop, do
not set `HERMES_EMAIL_LIVE=true` or `HERMES_COLLECTION_DRY_RUN=false`,
document what looked wrong, and get Victor's decision before re-attempting.

## 10. Operational rollback procedure

If, after review, something needs to be undone or paused:

1. GitHub → **Actions** → **HERMES Weekly Intelligence Collection** →
   **···** → **Disable workflow** (stops all future runs immediately).
2. Confirm `HERMES_COLLECTION_DRY_RUN` (Variable) is `true` and
   `HERMES_EMAIL_LIVE` (Variable) is `false`.
3. If a canonical note was ever published/updated by mistake through the
   separate, manually-invoked `hermes:publish`/`hermes:update` scripts
   (never by this workflow), use `npm run hermes:rollback` per
   `hermes/PHASE5-LITE.md` → "Emergency procedure" — this workflow itself
   has no rollback need, since it never writes a canonical note.
4. Re-run this runbook from step 1 once the underlying issue is resolved.

This mirrors `hermes/PHASE5-LITE.md` → "Emergency procedure: disabling the
workflow" and `hermes/OPERATIONAL-ACTIVATION-CHECKLIST.md` → section G.
