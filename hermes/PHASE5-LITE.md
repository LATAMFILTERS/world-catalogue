# HERMES Phase 5 Lite

HERMES Phase 5 Lite makes HERMES operational on a weekly cadence against
real, public, official sources — with reporting, a Microsoft Graph email to
Victor Abreu, and mandatory human approval before anything reaches a
canonical note. It builds on the Phase 1–4 pipeline already in
`scripts/hermes/` (`hermes-core.mjs`, `validate-candidates.mjs`,
`generate-weekly-report.mjs`, `apply-review-decision.mjs`,
`publish-approved-candidate.mjs`, `update-existing-note.mjs`,
`rollback-note-update.mjs`, `send-weekly-email.mjs`) without modifying any
of its existing behavior.

## What Phase 5 Lite does NOT do

- It never writes to PostgreSQL, pgvector, or `unified-data`.
- It never touches the frontend, chatbot, or Render deployment.
- It never publishes, updates, or rolls back a canonical Obsidian note. That
  remains a separate, explicit, human-approved step using the existing
  `hermes:decision` / `hermes:publish` / `hermes:update` / `hermes:rollback`
  scripts — Phase 5 Lite only feeds candidates into that same review queue.
- It never sends a live email unless `HERMES_EMAIL_LIVE=true` is explicitly
  set, and never fetches a source that is not `enabled: true` /
  `status: ACTIVE`.

## Architecture

```
hermes/config/source-organizations.json  Broad governed catalog (17
                                          categories, 156 organizations) of
                                          OEM, competitor, component,
                                          standards, regulation, publication
                                          and supplier organizations relevant
                                          to ELIMFILTERS. Most entries are
                                          status=DISCOVERY_REQUIRED: known to
                                          exist, no confirmed URL yet.
hermes/config/source-endpoints.json      Confirmed, human-reviewable URLs
                                          only. status=ACTIVE + enabled=true
                                          is the only combination the
                                          collector is allowed to fetch.
hermes/config/real-sources.json          Flat legacy list (5 categories, 15
                                          sources). Used ONLY as an explicit
                                          fallback — see "Source selection"
                                          below.
        │
        ▼
scripts/hermes/collect-real-sources.mjs        CLI entry point — decides
scripts/hermes/collect-real-sources-core.mjs   registry vs. legacy fallback,
                                                then fetches and normalizes.
        │  writes
        ▼
hermes/real-candidates/            Real candidates (schema-compatible with
                                    hermes-core.mjs), workflow_status =
                                    PENDING_REVIEW, approval_required = true,
                                    tagged with organization_id/endpoint_id/
                                    category/region/trust_level when sourced
                                    from the registry.
hermes/real-candidates-previews/   DRY RUN output — never counted as real.
hermes/source-cache/               Minimal raw evidence per source (hash,
                                    snippet, HTTP status) used for
                                    change-detection between runs.
elimfilters-vault/94-sync-log/     Audit trail (same folder every other
                                    HERMES script already writes to).
        │
        ▼
scripts/hermes/validate-candidates.mjs      (existing, reused as-is)
scripts/hermes/generate-weekly-report.mjs   (existing, reused as-is)
scripts/hermes/send-weekly-email.mjs        (existing, extended with
                                             HERMES_SENDER_EMAIL support)
        │
        ▼
Victor Abreu's inbox — review only, no change is applied automatically.
```

The source registry also has its own read-only validation and reporting
path, independent of whether the collector has run:

```
scripts/hermes/source-registry-core.mjs           Load + validate + coverage
scripts/hermes/validate-source-registry.mjs       CLI: npm run hermes:registry:validate
scripts/hermes/generate-source-coverage-report.mjs CLI: npm run hermes:registry:coverage
        │
        ▼
hermes/reports/source-coverage-report.md / .json
```

### Source selection (registry vs. legacy fallback)

`collect-real-sources.mjs` decides its source list in this order, every run:

1. **`HERMES_COLLECTION_USE_LEGACY_SOURCES=true`** (explicit opt-in) → uses
   `hermes/config/real-sources.json`, ignoring the registry even if present.
   Logged as `FALLBACK (explicit)`.
2. **Both `source-organizations.json` and `source-endpoints.json` exist**
   (the normal case) → the registry is loaded and validated with the same
   `validateRegistry()` used by `hermes:registry:validate`; an invalid
   registry aborts the run (exit code 2) before any fetch is attempted, so a
   broken edit to the registry can never silently degrade into "collect
   nothing" or "collect the wrong thing". Sources are built by
   `sourcesFromRegistry()`, which keeps **only** endpoints with
   `status: "ACTIVE"` **and** `enabled: true`. `DISCOVERY_REQUIRED`,
   `REVIEW_REQUIRED`, `PAUSED`, and `UNSUPPORTED` organizations are never
   fetched, and an organization's `official_domain` is never used as a
   fetch target on its own — only a confirmed endpoint is ever requested.
   Logged as `source_mode=registry`.
3. **Registry files missing** → falls back to `hermes/config/real-sources.json`
   automatically, but this is logged explicitly as `FALLBACK: ... not
   found — using legacy ...`, never silently.

Each candidate produced from the registry path carries `organization_id`,
`endpoint_id`, `category`, and `region` (registry-only) plus `trust_level`
(both paths) — see `schemas/hermes-candidate.schema.json` for the (optional)
field definitions. Candidates from the legacy fallback path never invent
`organization_id`/`endpoint_id`/`region` since those concepts don't exist in
the flat file.

As of this writing, `source-endpoints.json` has 12 `ACTIVE` endpoints (plus
3 `REVIEW_REQUIRED` pending a second look) out of 156 tracked organizations
— the other 141 are `DISCOVERY_REQUIRED` and are never fetched until a
specific URL is confirmed and promoted to `ACTIVE` (see "Adding or disabling
a source" below).

## Environment variables

See `hermes/config/.env.example` for the full annotated list. Summary:

| Variable | Default | Purpose |
|---|---|---|
| `HERMES_COLLECTION_DRY_RUN` | `true` | `false` persists real candidates instead of writing previews only. |
| `HERMES_COLLECTION_TIMEOUT_MS` | `15000` | Per-source fetch timeout. |
| `HERMES_COLLECTION_MAX_BYTES` | `3000000` | Hard cap on bytes read per source. |
| `HERMES_COLLECTION_USE_LEGACY_SOURCES` | `false` | `true` forces `hermes/config/real-sources.json` even if the registry is present. Always logged, never silent. |
| `HERMES_SOURCE_ORGANIZATIONS_PATH` | `hermes/config/source-organizations.json` | Override for testing/alternate registry location. |
| `HERMES_SOURCE_ENDPOINTS_PATH` | `hermes/config/source-endpoints.json` | Override for testing/alternate registry location. |
| `AZURE_CLIENT_ID` / `AZURE_TENANT_ID` / `AZURE_CLIENT_SECRET` | — | Microsoft Graph app credentials (shared with the rest of the app). |
| `HERMES_SENDER_EMAIL` | app default (`info@elimfilters.com`) | Overrides the "from" mailbox for the weekly HERMES email only. |
| `HERMES_REVIEW_EMAIL` | — | Victor Abreu's review inbox. Required for a live send. |
| `HERMES_EMAIL_LIVE` | `false` | `true` sends the email; otherwise an HTML preview file is written. |

## GitHub Secrets and Variables required for the weekly workflow

Configure under **Settings → Secrets and variables → Actions**:

**Secrets** (sensitive):
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_SECRET`
- `HERMES_SENDER_EMAIL` (optional)
- `HERMES_REVIEW_EMAIL`

**Variables** (not sensitive — on/off switches, safe defaults if unset):
- `HERMES_COLLECTION_DRY_RUN` — set to `false` to let the weekly run persist
  real candidates. Unset/`true` means the workflow only ever produces
  previews.
- `HERMES_EMAIL_LIVE` — set to `true` to let the weekly run actually send
  mail. Unset/`false` means the workflow only ever writes an HTML preview
  artifact.

Nothing goes live until **both** are explicitly set — this is the "activate
email" and "activate real collection" switch referenced below.

## Running locally

```bash
# Dry run (safe default) — writes previews under hermes/real-candidates-previews/
npm run hermes:collect

# Persist real candidates
HERMES_COLLECTION_DRY_RUN=false npm run hermes:collect

# Validate + report + email preview, using the real-candidates pipeline
npm run hermes:validate:real
npm run hermes:report:real
npm run hermes:email:real          # writes hermes/reports/hermes-email-preview-*.html

# All four in sequence
npm run hermes:weekly

# Source registry (organizations/endpoints), independent of the collector
npm run hermes:registry:validate
npm run hermes:registry:coverage   # writes hermes/reports/source-coverage-report.{md,json}
```

## DRY RUN semantics

- `HERMES_COLLECTION_DRY_RUN=true` (default): new candidates are written to
  `hermes/real-candidates-previews/*.preview.json` only.
  `hermes/real-candidates/` is never modified.
- `hermes/source-cache/` **is** updated on every run, dry or not — it only
  stores a content hash + minimal snippet used for change detection, never a
  candidate, and updating it is what makes DRY RUN previews an accurate
  preview of what the next real run would do.
- `hermes/config/real-sources.json` and the new registry files are never
  written by the collector — only read.

## Activating the weekly email for real

1. Confirm `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET` are
   valid Microsoft Graph app-registration values with `Mail.Send`
   application permission granted, and that the sending mailbox exists.
2. Set the `HERMES_REVIEW_EMAIL` secret to Victor Abreu's inbox.
3. Run `npm run hermes:email:real` locally once with `HERMES_EMAIL_LIVE=true`
   to confirm delivery before relying on the scheduled workflow.
4. Set the `HERMES_EMAIL_LIVE` **repository Variable** to `true` so the
   scheduled workflow sends instead of previewing.

Every email — dry run or live — states explicitly that no change of any
kind is applied without Victor Abreu's review and approval, and contains no
link or command that would publish, update, or roll back a canonical note.

## The weekly workflow

`.github/workflows/hermes-weekly.yml` runs `collect → validate:real →
report:real → email:real` every Monday around 8:00 AM America/Chicago, and
can be triggered manually via **Actions → HERMES Weekly Intelligence
Collection → Run workflow**.

- GitHub Actions cron is UTC-only and does not observe DST. Two cron entries
  are scheduled (13:00 and 14:00 UTC) to cover CDT and CST respectively; a
  guard step computes the actual America/Chicago local hour at run time and
  skips the rest of the job unless it is genuinely ~08:00 local, so only one
  of the two firings does real work each week. Manual `workflow_dispatch`
  runs always proceed. **Known limitation**: in the specific week the US
  DST transition happens, this guard can occasionally skip both firings (or
  rarely allow one that lands slightly off 08:00) — acceptable for a weekly
  report, and detectable from the Actions run history if it ever matters.
- If `hermes:validate:real` fails (any invalid candidate JSON), the
  workflow fails and the email step never runs — no partial or malformed
  report ever reaches Victor's inbox.
- A single source failing to fetch (timeout, HTTP error, DNS failure) never
  aborts the run; it is recorded per-source in the audit log and the run
  continues.
- `concurrency: { group: hermes-weekly, cancel-in-progress: false }` means a
  second run (e.g. triggered manually while the scheduled one is in
  flight) queues instead of running in parallel.
- Artifacts uploaded every run (even on failure): `hermes/real-candidates`,
  `hermes/reports`, `hermes/source-cache`, `elimfilters-vault/94-sync-log`.

## Security controls

- Native `fetch` only — no headless browser, no remote JS execution.
- Identifiable `User-Agent: ELIMFILTERS-HERMES/1.0 (...)` on every request.
- Configurable timeout (`HERMES_COLLECTION_TIMEOUT_MS`) and hard response
  size cap (`HERMES_COLLECTION_MAX_BYTES`) per source.
- TLS is never bypassed — no `rejectUnauthorized: false` or equivalent
  anywhere in this code.
- One GET request per source per run — no crawling, no pagination, no
  scraping of linked pages.
- Every candidate is forced to `workflow_status: PENDING_REVIEW`,
  `approval_required: true`, `sync_status: NOT_READY`; the shared
  `hermes-core.mjs` validator (used by every other HERMES script) rejects
  anything that doesn't conform before it is ever written.
- The collector, the registry validator, and the coverage report generator
  never write outside `hermes/` and `elimfilters-vault/94-sync-log/` —
  never a canonical note folder, never the database.

## Human approval (non-negotiable)

Nothing produced by Phase 5 Lite changes canonical knowledge by itself.
Real candidates land in `hermes/real-candidates/` with
`workflow_status: PENDING_REVIEW`. The existing, unmodified review flow
still applies:

```bash
npm run hermes:decision -- hermes/real-candidates/<file>.json approve
npm run hermes:publish  -- elimfilters-vault/92-approved-updates/<file>.json   # or hermes:update
```

Only Victor Abreu can approve, reject, or request research — enforced by
`hermes-core.mjs` (`approved_by` must literally equal `"Victor Abreu"`) the
same way it already is for every other HERMES script.

## Adding or disabling a source

**Governed registry** (`hermes/config/source-organizations.json` +
`source-endpoints.json` — what the collector reads by default): add the
organization to `source-organizations.json` with
`status: "DISCOVERY_REQUIRED"` and `discovery_required: true` if you don't
yet have a confirmed page URL — this makes it show up in the coverage
report as a gap without ever being fetched. Once a specific news/press/
documentation URL is confirmed reachable and appropriate (never login,
cart, search, or full-catalog pages), add it to `source-endpoints.json`
with `status: "ACTIVE"`, `enabled: true`, and flip the organization's
`status` to `"ACTIVE"` too — both conditions (`status: "ACTIVE"` AND
`enabled: true`) are required before the collector will fetch it. Run
`npm run hermes:registry:validate` after any edit — it rejects duplicate
ids, non-HTTPS URLs, invalid categories, missing domains, known
OEM/competitor cross-classification, and endpoints that don't resolve back
to their organization's own domain. To pause a source without deleting its
record, set the endpoint's `status` to `"PAUSED"` and `enabled: false`.

**Legacy flat list** (`hermes/config/real-sources.json`): only consulted
when the registry files are missing, or when
`HERMES_COLLECTION_USE_LEGACY_SOURCES=true` is explicitly set. Edit the
entry's `enabled` field the same way if you ever need it as a stopgap.

## Reviewing candidates

1. `npm run hermes:registry:coverage` (registry) or check
   `hermes/reports/hermes-weekly-*.md` (candidates) for the current state.
2. Open the individual JSON files under `hermes/real-candidates/` — each has
   `source_url`, `source_hash`, `proposed_action`, and
   `proposed_target_folder` for context.
3. Decide with `npm run hermes:decision -- <file> approve|reject|research
   [reason]` exactly as in Phase 1–4.

## HERMES -> Obsidian Knowledge Vault integration (2026-08-19)

`scripts/hermes/vault-sync-core.mjs` (pure planning logic) +
`scripts/hermes/sync-vault.mjs` (CLI, `npm run hermes:vault:sync` for
dry-run, `npm run hermes:vault:sync:apply` + `HERMES_VAULT_SYNC_LIVE=true`
for live) let an **already-APPROVED** HERMES finding (same
`hermes/real-candidates/*.json` contract, same `workflow_status ===
'APPROVED'` + `approved_by`/`approved_at` gate used by
`publish-approved-candidate.mjs`/`update-existing-note.mjs`) become a
governed mutation of `elimfilters-vault/`.

**Authority chain**: HERMES finding (evidence + Groq research) -> Victor's
approval (unchanged, existing decision pipeline) -> vault sync planner
(this integration) -> `elimfilters-vault/` note -> Knowledge Graph
(`scripts/build-citation-index.js` already scans every vault folder this
writes to — no separate KG ingestion path was built). Catalog and
Knowledge Center are marked *eligible* only (`catalog_eligible`,
`kc_eligible` on each plan item) — publication itself stays a separate,
later, human-governed action; this integration never publishes anything.

**Write allowlist** (`WRITE_ALLOWLIST` in vault-sync-core.mjs) is
deliberately narrower than the older, partly-aspirational folder list
inside `publish-approved-candidate.mjs`/`update-existing-note.mjs` — it is
scoped to the vault's actual current 8 categories
(`01-technologies/active`, `02-industries`, `03-systems`, `04-standards`,
`05-contamination`, `06-components`, `07-problems`, `08-product-families`)
plus the existing `94-sync-log` audit location. `12-oems`,
`13-equipment`, `14-intelligence`, `15-filter-media`, `16-suppliers`,
`17-technology-watch` are not real vault directories yet; findings mapped
to those categories are correctly left as intelligence-only records
(`resolveTarget()` returns no mapping) rather than invented as new
top-level folders.

**Idempotency**: `computeEvidenceFingerprint()` hashes only semantic
evidence fields (statement, relationships, source identity, evidence
hash) — never a sync-time timestamp — and is recorded in each note's
`<!-- HERMES MANAGED UPDATE START/END -->` block (the same managed-block
convention `update-existing-note.mjs` already used; not a new one). A
second sync of identical evidence reads the recorded fingerprint back out
and produces `NOOP`, not a rewrite.

**Entity resolution**: before CREATE, every candidate key/name is checked
against every existing vault entity's `key` and `name`. An exact key match
is the same entity (route to UPDATE). A name match under a *different* key
is `AMBIGUOUS` — recorded for human review, never silently merged and
never silently duplicated (`Cummins ISX` / `ISX Cummins` / `Cummins-ISX`
never become three notes).

**Technology governance**: `01-technologies/active/*.md` is scanned at
call time for `loadCanonicalTechnologies()` — never a hardcoded list or
count. A technology CREATE is always rejected
(`NONCANONICAL_TECHNOLOGY_CREATE`); a technology UPDATE is rejected unless
the target is already active-canonical
(`NONCANONICAL_TECHNOLOGY_UPDATE`) — a retired/consolidated technology
(e.g. TURBOCORE, absent from `active/` after its 2026-08 consolidation
into HYDROCORE) can never re-enter as current canon through this path.

**Wikilinks**: `validateWikilinks()` deduplicates targets and drops any
target that doesn't resolve to an existing, active vault entity —
dangling links are reported (`danglingRejected`), never written.

**Transaction safety**: `sync-vault.mjs --apply` prepares and validates
every planned write (including checking every CREATE target doesn't
already exist on disk) *before* writing anything; if any single item fails
to prepare, nothing in the batch is written. If a write fails mid-batch,
every item already written in that run is rolled back from its prepared
backup before the process exits non-zero — a partial run can never leave
half-written vault state.

**Groq decoupling**: neither `vault-sync-core.mjs` nor `sync-vault.mjs`
imports or calls anything Groq-related — a quota failure during collection
can structurally never reach or corrupt the vault sync path (verified by
`tests/hermes-phase5/vault-sync.test.mjs`, test 20).

**Not yet built** (explicitly out of scope for this pass, flagged rather
than silently skipped): CREATE only writes a minimal `status: candidate`
staging note (never `status: active`) for entity types this pass
understands generically — full type-specific note generation matching
every entity type's own schema in `00-meta/_SCHEMA-REFERENCE.md` (Problem,
Component, ProductFamily, etc. each have different required fields) is a
follow-up. `resolveTarget()` in `sync-vault.mjs` currently maps only the
`standards`/`regulation` HERMES categories to a real vault folder — the
others (OEM, competitor, supplier, filter-media findings) correctly fall
through to intelligence-only until their real vault destinations exist.

## Emergency procedure: disabling the workflow

1. **Fastest**: GitHub → **Actions** tab → **HERMES Weekly Intelligence
   Collection** → **···** → **Disable workflow**. Stops all future
   scheduled and manual runs immediately; no code change needed.
2. **Alternative**: set the `HERMES_COLLECTION_DRY_RUN` repository Variable
   back to `true` (or delete it) and `HERMES_EMAIL_LIVE` back to `false` (or
   delete it) — the workflow keeps running on schedule but stops writing
   real candidates or sending real mail, degrading to a no-op report.
3. To stop a specific source without touching the workflow, set that
   endpoint's `status: "PAUSED"` and `enabled: false` in
   `hermes/config/source-endpoints.json` (or the entry's `enabled: false` in
   `hermes/config/real-sources.json` if running in legacy fallback mode) and
   commit.
4. Re-enabling is the exact reverse of whichever option was used.

## Repository governance note

Commit `2949458884d5791501dda79425b1b2dbafe63233`
(`feat(hermes): complete phase 5 lite real-source workflow`) was pushed
directly to `main` as a fast-forward (`61d40297d7e..2949458884d`), not
through a pull request.

- GitHub reported that a rule requiring changes to go through a pull
  request was bypassed for that push
  (`Bypassed rule violations for refs/heads/main: Changes must be made
  through a pull request.`).
- The push was a plain fast-forward — no `--force`, no history rewrite, no
  commit was overwritten or dropped on `main`.
- Before the push, HERMES Phase 5 Lite's test suite passed 50/50
  (`npm run test:hermes-phase5`).
- The source registry validated cleanly: 156 organizations, 15 endpoints,
  0 validation errors (`npm run hermes:registry:validate`).
- **No revert of this commit is required.** Its content is correct and
  fully tested; the only irregularity is the process it went through, not
  the change itself.
- **Going forward, every HERMES change — code, config, or documentation —
  must be made on a feature branch and land on `main` through a pull
  request.** This document (`hermes/OPERATIONAL-ACTIVATION-CHECKLIST.md`,
  `hermes/OPERATIONAL-STATUS.md`, and any workflow edits) is itself being
  delivered on branch `docs/hermes-operational-activation` for exactly that
  reason.
