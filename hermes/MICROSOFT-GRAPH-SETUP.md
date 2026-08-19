# HERMES — Microsoft Graph Setup

This document explains how to configure the Microsoft Graph application
HERMES uses to send its weekly review email. It documents the procedure
only — it does not perform any of these steps, and it contains no real
values. Nothing described here has been done yet.

## 1. Create an App Registration in Microsoft Entra

1. Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com)
   with an account that has permission to register applications in the
   ELIMFILTERS tenant.
2. Go to **Identity → Applications → App registrations → New registration**.
3. Name it something identifiable, e.g. `ELIMFILTERS HERMES Mail Sender`.
4. Supported account types: **Accounts in this organizational directory
   only** (single tenant) — HERMES only ever needs to send from one
   ELIMFILTERS mailbox to one ELIMFILTERS reviewer.
5. No redirect URI is needed (this is a daemon/service application using
   client-credentials flow, not an interactive sign-in flow).
6. Register the application.

## 2. Collect the three identifiers

After registration, the **Overview** page shows:

- **Tenant ID** (a GUID — this is `AZURE_TENANT_ID`)
- **Application (client) ID** (a GUID — this is `AZURE_CLIENT_ID`)

Neither of these is a secret by itself, but together with the client secret
below they authenticate as this application — treat all three as sensitive.

## 3. Create a client secret

1. Go to **Certificates & secrets → Client secrets → New client secret**.
2. Set a description and an expiration (shorter is safer; plan to rotate
   before it expires — see section 9).
3. Copy the secret **value** immediately — it is only shown once. This
   value is `AZURE_CLIENT_SECRET`.
4. Do not paste this value into any file in this repository, any commit
   message, any issue, or any chat log. It only ever belongs in the GitHub
   Secret described in section 6.

## 4. Grant the Microsoft Graph application permission

HERMES sends mail via the Graph API's application-permission flow (no
signed-in user), so it needs an **application permission**, not a
delegated one:

1. Go to **API permissions → Add a permission → Microsoft Graph →
   Application permissions**.
2. Add `Mail.Send`.
3. Click **Grant admin consent for [tenant]** — application permissions for
   `Mail.Send` do not work until an administrator explicitly consents. This
   step requires a Global Administrator or Privileged Role Administrator.

Without step 3, every send attempt will fail with an authorization error —
this is a common and expected failure mode to check for during first
activation (see `hermes/OPERATIONAL-ACTIVATION-CHECKLIST.md` section F).

## 5. Select and confirm the sender mailbox

**PENDING CONFIRMATION FROM VICTOR.**

No sender address is assumed anywhere in HERMES documentation or code. The
underlying `lib/outlook-mail.js` service (shared with the rest of the app)
has its own default mailbox for contact-form email, but that default is not
a decision about which mailbox HERMES should send from — it is only what
the code falls back to if `HERMES_SENDER_EMAIL` is left unset. Victor must
confirm:

- Which ELIMFILTERS corporate mailbox HERMES should send as.
- That this mailbox is licensed and enabled for the Graph application above
  (application-permission `Mail.Send` sends "as" a specific mailbox; that
  mailbox must exist and be capable of sending mail in the tenant).

Once confirmed, that address becomes the `HERMES_SENDER_EMAIL` secret —
still never written into any file in this repository.

## 6. Secret vs. repository Variable — what goes where

GitHub Actions has two separate configuration stores under **Settings →
Secrets and variables → Actions**, and HERMES deliberately uses both:

| Store | Used for | Why |
|---|---|---|
| **Secrets** | `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET`, `HERMES_SENDER_EMAIL`, `HERMES_REVIEW_EMAIL` | These are credentials or the specific identities they authenticate/send as. Secrets are encrypted at rest and never shown again after creation, and are masked in logs. |
| **Variables** | `HERMES_COLLECTION_DRY_RUN`, `HERMES_EMAIL_LIVE` | These are plain on/off switches, not credentials. Using a Variable (not a Secret) for them means their current value is visible in repository settings at a glance — a deliberate transparency choice for a switch that controls whether HERMES is live. |

Exact names required in GitHub (case-sensitive, must match exactly):

- `AZURE_CLIENT_ID` (Secret)
- `AZURE_TENANT_ID` (Secret)
- `AZURE_CLIENT_SECRET` (Secret)
- `HERMES_SENDER_EMAIL` (Secret)
- `HERMES_REVIEW_EMAIL` (Secret)
- `HERMES_COLLECTION_DRY_RUN` (Variable)
- `HERMES_EMAIL_LIVE` (Variable)

## 7. First test — keep `HERMES_EMAIL_LIVE=false`

Do not set `HERMES_EMAIL_LIVE=true` yet, even after the four Graph secrets
above are configured. First:

1. Run `npm run hermes:email:real` locally (or via a manual
   `workflow_dispatch` run of **HERMES Weekly Intelligence Collection**)
   with `HERMES_EMAIL_LIVE` unset or `false`.
2. This writes `hermes/reports/hermes-email-preview-*.html` instead of
   sending anything — open it and review the content.
3. Confirm the AZURE_* secrets alone don't cause any send attempt while
   `HERMES_EMAIL_LIVE` is `false` — the code path that calls Microsoft
   Graph is only reached when `HERMES_EMAIL_LIVE=true` (see
   `scripts/hermes/send-weekly-email.mjs`).

## 8. Criteria before going LIVE

See `hermes/OPERATIONAL-ACTIVATION-CHECKLIST.md`, section F, for the full
checklist. In short: all five secrets configured, sender confirmed by
Victor, admin consent granted for `Mail.Send`, the HTML preview reviewed
and approved, and at least one successful manual workflow run completed.

## 9. Rotation and revocation

- **Routine rotation**: create a new client secret in Entra (step 3) before
  the old one expires, update the `AZURE_CLIENT_SECRET` GitHub Secret with
  the new value, confirm a manual `workflow_dispatch` run still succeeds
  with `HERMES_EMAIL_LIVE=false`, then delete the old secret in Entra.
- **Emergency revocation** (suspected leak, compromised token, offboarding):
  delete the client secret immediately in **Entra → App registrations →
  [this app] → Certificates & secrets**; this invalidates it immediately,
  independent of GitHub. Then follow the emergency procedure below.

## 10. Emergency procedure

If the Graph credentials are ever suspected compromised, or HERMES email
needs to stop immediately:

1. Revoke the client secret in Microsoft Entra (section 9) — this works
   even if GitHub is unreachable.
2. Set the `HERMES_EMAIL_LIVE` repository Variable to `false`.
3. GitHub → **Actions → HERMES Weekly Intelligence Collection → ··· →
   Disable workflow**.
4. Rotate in a new client secret only once the cause of the incident is
   understood (see section 9 for the routine procedure).

This mirrors the "Emergency procedure" section in `hermes/PHASE5-LITE.md`
and section G of `hermes/OPERATIONAL-ACTIVATION-CHECKLIST.md`.
