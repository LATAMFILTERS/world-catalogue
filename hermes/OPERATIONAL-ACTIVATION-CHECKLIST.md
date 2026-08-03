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

None of these exist yet in this repository as of this checklist's creation.

## B. Initial safe Variables

Configure under **Settings → Secrets and variables → Actions → Variables**:

- `HERMES_COLLECTION_DRY_RUN=true`
- `HERMES_EMAIL_LIVE=false`

These are the same values the workflow already defaults to when the
Variables are unset — setting them explicitly here just makes the current
safe state visible and intentional in repository settings, rather than
implicit in code.

## C. Sender

- The sending mailbox must be a corporate ELIMFILTERS account.
- **Status: pending confirmation from Victor Abreu.**
- No specific address is assumed anywhere in this checklist or in code. The
  `HERMES_SENDER_EMAIL` secret is left for Victor to set once a mailbox is
  designated; until then the underlying Microsoft Graph service falls back
  to its own existing default (`info@elimfilters.com`, used elsewhere in the
  app for contact-form mail) — which may or may not be the mailbox HERMES
  should ultimately send from. Do not treat that fallback as a decision.

## D. First manual workflow run

1. Open **GitHub → Actions**.
2. Select **HERMES Weekly Intelligence Collection**.
3. Click **Run workflow**, targeting `main`.
4. Leave `HERMES_COLLECTION_DRY_RUN` unset or `true` (DRY RUN).
5. When the run finishes, open the **hermes-weekly-collection** artifact and
   review the logs for each step.
6. Confirm in the logs and artifact contents:
   - Zero files were written to `hermes/real-candidates` (previews only, in
     `hermes/real-candidates-previews` — note that folder is not currently
     part of the uploaded artifact set; the absence of real candidates is
     what matters here).
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

This mirrors the "Emergency procedure" section in `hermes/PHASE5-LITE.md`.
