# Phase 03 — Manufacturer Intake Portal (Factory Portal)

**Status:** `Built` — implemented 2026-07-13, immediately following Phase
2's approval and freeze. **Not** `APPROVED / FROZEN` — freezing is a
separate, later step, per the same discipline applied to Phase 1 and
Phase 2.
**Depends on:** Phase 01 (`APPROVED / FROZEN v1.0`), Phase 02
(`APPROVED / FROZEN v1.0`)
**Blocks:** Phase 04

**Correction notice (first round):** This phase was originally drafted as
"Supplier Portal" — a raw-material/component vendor management module
scoped per Manufacturer. That is not the agreed MVP architecture. That
revision replaced it entirely with the **Manufacturer Intake Portal**: the
mechanism by which ELIMFILTERS sends assigned products to Manufacturers
and collects each Manufacturer's own offered response. The file name
(`phase-03-supplier-portal.md`) is unchanged to avoid unnecessary
cross-reference churn — the content below, not the file name, is
authoritative. See ADR-0005 in `DECISIONS.md`. Raw-material/component
suppliers are explicitly deferred to a possible future phase, outside the
current 00-09 roadmap, and are not a dependency of this phase or any other
in the current roadmap. **This module is visibly and consistently called
"Manufacturer Intake Portal" or "Factory Portal" throughout this document
and in code/API paths — "Supplier Portal" is never used to refer to the
finished-product factory.**

**Correction notice (second round):** A Manufacturer Product Offer is no
longer "exactly one per (Manufacturer, Passport version)." A Manufacturer
may submit many versioned Offers over time; exactly one stays active at
any moment, and the full history is retained (ADR-0007). This phase also
gains the **Offer Approval** entity (`ebp_manufacturer_offer_approvals`) —
ELIMFILTERS' packaging/commercial decision about a specific Offer,
distinct from technical validation (Phase 4) — and the Offer's packaging
fields are now explicitly scoped as that Manufacturer's own proposal,
never a Passport field (ADR-0008). The Passport's note field is now two
fields; a Manufacturer sees `manufacturer_instruction_notes` only, scoped
to Passports it was actually sent (ADR-0009), which resolves this phase's
prior open question on that point.

**Governance decisions (2026-07-13, Phase 0 closure):** (1) Request Batch
deadlines are per-batch, not global — every batch carries
`response_due_at`, a seven-state lifecycle, and late Offers are flagged
`late_submission` rather than rejected or silently backdated (ADR-0012).
(2) Offer Approval requires **two independent role decisions** —
`ENGINEERING_APPROVER` and `COMMERCIAL_APPROVER` — before an Offer reaches
`APPROVED`; neither role may exercise the other's authority, and
`ADMIN_OWNER` (Phase 5's sourcing-decision role) can never override a
technical `INVALID` into valid (ADR-0011). (3) Offer Approval must
complete — `APPROVED` — before an Offer is eligible for an *official*
Manufacturer Selection recommendation (ADR-0010).

**Implementable-spec notice (this revision, 2026-07-13):** Per the project
owner's authorization to begin Phase 3 immediately following Phase 2's
freeze, this document is converted from a first-pass draft into a
complete, implementable specification: real SQL schema (12 tables), the
Manufacturer Request Batch / Batch Item / Offer / Offer-technical-field /
Offer-packaging / Document data model, Factory user authentication
(resolving ADR-0002 for Manufacturers only), the Portal-vs-Excel dual
intake flow, and a hard split between the internal and factory-facing API
surfaces. See ADR-0023 through ADR-0029 in `DECISIONS.md` for the specific
decisions this resolves. **This phase does not decide whether an Offer
complies technically (Phase 4), does not select a Manufacturer (Phase 5),
and does not compute landed cost or publish price (Phase 6/7).**

**Frozen-baseline notice:** Nothing in this phase modifies any Phase 0,
Phase 1, or Phase 2 file, table, API, or rule. Phase 1's Passport tables
and Phase 2's Manufacturer tables are read-only reference material to
Phase 3 — never written to, never altered. Phase 3 introduces exactly one
real foreign key into a Phase 1 table (`ebp_manufacturer_request_batch_
items.passport_id → ebp_engineering_passports.id`, `ON DELETE RESTRICT`,
ADR-0025) — a read-only reference relationship, not a schema change to
Phase 1 itself.

## Objective

Build the private mechanism by which ELIMFILTERS (1) selects Passports,
(2) creates a **Manufacturer Request Batch**, (3) assigns it to one or
more Manufacturers, (4) delivers to each Manufacturer only the information
that belongs to it, (5) lets that Manufacturer complete a **Manufacturer
Product Offer**, (6) receives that Offer via the Factory Portal or an
Excel round-trip, (7) retains full version/revision/document/evidence
history and traceability, and (8) leaves every response in a state prior
to technical validation. **Phase 3 never decides whether an Offer
complies.**

## Scope

**In scope:**
- **Manufacturer Request Batch** (`ebp_manufacturer_request_batches`): a
  set of Passports ELIMFILTERS assigns to **one** Manufacturer (a
  multi-Manufacturer solicitation is multiple batch rows sharing the same
  set of Passports, keeping status/deadline independent per
  Manufacturer). Classified by `purpose` — `CAPABILITY_ASSESSMENT`,
  `COMMERCIAL_QUOTATION`, or `PRODUCTION_CANDIDATE` — which determines the
  eligibility gate applied before it may be sent (ADR-0024). Carries a
  `channel` (`PORTAL`/`EXCEL`/`HYBRID`), `response_due_at` (per batch, no
  global deadline, ADR-0012), delivery language, requested currency, and
  a seven-state lifecycle (`DRAFT`/`SENT`/`PARTIALLY_RESPONDED`/
  `RESPONDED`/`OVERDUE`/`CLOSED`/`CANCELLED`).
- **Batch Items** (`ebp_manufacturer_request_batch_items`): each assigned
  Passport is pinned, at add-time, to its exact `engineering_revision` and
  an immutable snapshot of the Manufacturer-visible DTO (ADR-0025) — a
  later Phase 1 revision never silently changes an already-sent batch.
- **Manufacturer Product Offers** (`ebp_manufacturer_offers`), versioned
  per ADR-0007/ADR-0026: many revisions over time per (Passport revision
  × Manufacturer), exactly one active at a time, atomic supersession,
  nine-state lifecycle, `late_submission` flag, exact-decimal money
  fields (`NUMERIC`, never `float`), immutable once `SUBMITTED` (a
  correction is always a new revision). Phase 3 writes `DRAFT`,
  `SUBMITTED`, `WITHDRAWN`, `SUPERSEDED`, and the computed `EXPIRED`
  state only — it never writes `UNDER_REVIEW`, `VALIDATED`, `REJECTED`
  (Phase 4), or `APPROVED` (Offer Approval).
- **Offer technical fields** (`ebp_manufacturer_offer_technical_fields`):
  one row per applicable Passport `required_*` field per Offer revision —
  `offered_value`, `unit`, `tolerance`, `manufacturer_note`, an optional
  linked evidence document, and an explicit `completeness_status`
  (`ANSWERED`/`CANNOT_MEET`/`NOT_APPLICABLE`) so "unanswered" is never
  ambiguous with "explicitly cannot meet." `compliance_status` stays
  `NULL` until Phase 4 writes it — Phase 3 never sets it.
- **Offer packaging** (`ebp_manufacturer_offer_packaging`): the
  Manufacturer's own proposal only (`BUSINESS_RULES.md` §3.1.B) — never
  `elimfilters_approved_quantity`, which belongs to the future Offer
  Approval phase.
- **Documents/evidence** (`ebp_manufacturer_documents`): metadata in
  Postgres, binaries on a local-filesystem storage adapter behind a
  four-method interface (ADR-0027) — never a binary column, never a
  public path.
- **Portal and Excel intake, both supported (ADR-0028):** a Manufacturer
  can complete an Offer via the Factory Portal, or via an exported/
  re-imported Excel workbook with a hash-verified locked-column boundary,
  staged validation, an explicit preview, and an explicit confirm step —
  never a silent partial persist.
- **Factory user authentication** (`ebp_factory_users`,
  `ebp_factory_user_invitations`, `ebp_factory_sessions`,
  `ebp_factory_user_audit_log`) — resolves ADR-0002 for Manufacturers
  only (ADR-0023): scrypt password hashing, opaque hashed session
  tokens, four roles, structural tenant isolation, invite/reset/lockout/
  revocation, audit log. Distributor auth (Phase 8) remains separately
  undecided.
- **Two API surfaces, hard-split** (ADR-0029): internal
  (`/api/ebp/internal/manufacturer-batches/*`, `requireAdmin`) and
  factory-facing (`/api/ebp/factory/*`, `requireFactorySession`) — no
  shared route file, no factory-facing function that accepts an arbitrary
  `manufacturer_id`.
- **A minimal private Factory Portal frontend** (`/portal/*`,
  server-rendered from `server.js`, ADR-0029): login, batch dashboard,
  batch/item detail, Offer form, Excel upload/download, and error/empty
  states — `noindex, nofollow`, outside public nav/sitemap, no anonymous
  shared state.

**Out of scope:**
- Raw-material/component supplier management of any kind (ADR-0005). A
  supplier certificate a Manufacturer wants to cite is recorded as a
  `TECHNICAL_EVIDENCE`/`CERTIFICATION_EVIDENCE` document on the relevant
  Offer field — it never creates an independent Supplier record.
- Whether an Offer actually complies with the Passport (Phase 4). Phase 3
  collects the Offer only.
- Which Manufacturer is selected (Phase 5) and landed cost/pricing
  (Phase 6/7).
- The `ebp_manufacturer_offer_approvals` entity's actual approval
  **decisioning** UI/workflow — the entity and its two-role rule are
  defined in `BUSINESS_RULES.md` §7/ADR-0011 for a later phase to
  implement; Phase 3 does not build the Offer Approval surface.
- Distributor authentication (Phase 8) — ADR-0023 resolves Manufacturer
  auth only.

## Dependencies

- Phase 1 (`APPROVED / FROZEN v1.0`): `toManufacturerPassportDTO`
  (ADR-0009) is the exact snapshot source for Batch Items (ADR-0025); the
  Passport's required-engineering-field list is what an Offer's technical
  fields mirror one-to-one.
- Phase 2 (`APPROVED / FROZEN v1.0`): Manufacturer identity by
  `manufacturer_code`; `ebp_manufacturers.status` and
  `ebp_manufacturer_qualifications` (read-only) drive the
  `purpose`-scoped eligibility gate (ADR-0024).
- `ebp/phase1/actor.js` — reused unmodified for the **internal** surface's
  declared-actor semantics (an ELIMFILTERS admin action via
  `ADMIN_KEY_SHARED`). The **factory** surface uses a materially stronger
  identity — a real authenticated `factory_user_id` (ADR-0023) — recorded
  as `identity_mechanism = 'FACTORY_SESSION'` on every factory-originated
  write, never conflated with `ADMIN_KEY_SHARED`.

## Actor & Audit Semantics

Every write in this phase records who did it and how strongly that claim
is backed, using **two** distinct identity mechanisms depending on which
API surface made the request:
- **Internal surface:** `declared_actor` (self-reported label) +
  `identity_mechanism = 'ADMIN_KEY_SHARED'` — identical semantics to
  Phase 1/Phase 2, reusing `ebp/phase1/actor.js` directly.
- **Factory surface:** `factory_user_id` (a real foreign key to
  `ebp_factory_users`, not a self-reported label) + `identity_mechanism =
  'FACTORY_SESSION'` — this is a materially stronger identity claim than
  `ADMIN_KEY_SHARED` (a real authenticated individual, not a shared
  secret), and the two mechanisms are never presented as equivalent in
  any DTO or document.

## Key Entities / Data Model

All tables live under `migrations/ebp-phase3/`, additive to the existing
database, following the exact convention established by
`migrations/ebp-phase1/` and `migrations/ebp-phase2/`.

### 1. Manufacturer Request Batches — `ebp_manufacturer_request_batches`

`id UUID PK`, `batch_code VARCHAR(12) UNIQUE NOT NULL` (readable,
non-sequential — `MRB-XXXXXX`, same generation discipline as Phase 2's
`EFM-XXXX`, ADR-0015-style: `node:crypto` random, ambiguity-free
alphabet, retry-on-collision), `manufacturer_id UUID NOT NULL REFERENCES
ebp_manufacturers(id)`, `purpose VARCHAR(30) NOT NULL` (`CHECK IN
('CAPABILITY_ASSESSMENT','COMMERCIAL_QUOTATION','PRODUCTION_CANDIDATE')`,
ADR-0024), `channel VARCHAR(10) NOT NULL` (`CHECK IN
('PORTAL','EXCEL','HYBRID')`), `status VARCHAR(20) NOT NULL DEFAULT
'DRAFT'` (`CHECK IN
('DRAFT','SENT','PARTIALLY_RESPONDED','RESPONDED','OVERDUE','CLOSED','CANCELLED')`),
`created_at`, `sent_at`, `response_due_at`, `timezone TEXT NOT NULL`,
`delivery_language VARCHAR(10)`, `requested_currency CHAR(3)`,
`template_version TEXT`, `created_by TEXT NOT NULL`, `identity_mechanism
VARCHAR(30) NOT NULL DEFAULT 'ADMIN_KEY_SHARED'` (always the internal
surface — only ELIMFILTERS creates batches), `internal_notes TEXT`
(ELIMFILTERS-internal only, same confidentiality discipline as ADR-0021),
`updated_at`.

**Batch status state machine** (mirrors Phase 2's ADR-0020 discipline —
explicit transition table, no arbitrary jump):
```
DRAFT                → SENT, CANCELLED
SENT                 → PARTIALLY_RESPONDED, RESPONDED, OVERDUE, CANCELLED
PARTIALLY_RESPONDED  → RESPONDED, OVERDUE, CLOSED, CANCELLED
OVERDUE              → PARTIALLY_RESPONDED, RESPONDED, CLOSED, CANCELLED
RESPONDED            → CLOSED, CANCELLED
CLOSED               → (terminal)
CANCELLED            → (terminal)
```
`DRAFT → SENT` additionally requires the `purpose`-scoped eligibility gate
(ADR-0024) to pass for the target Manufacturer against every Passport
family in the batch's items — checked at the moment of transition, not
frozen from batch-creation time (mirrors ADR-0014's "re-check current
state, not creation-time state" discipline).

### 2. Batch Status History — `ebp_manufacturer_request_batch_status_history`

Append-only, identical shape to Phase 2's `ebp_manufacturers_status_
history`: `id SERIAL PK`, `batch_id UUID NOT NULL REFERENCES
ebp_manufacturer_request_batches(id) ON DELETE CASCADE`, `from_status`,
`to_status NOT NULL`, `reason`, `declared_actor NOT NULL`,
`identity_mechanism NOT NULL DEFAULT 'ADMIN_KEY_SHARED'`, `changed_at`.

### 3. Batch Items — `ebp_manufacturer_request_batch_items`

`id UUID PK`, `batch_id UUID NOT NULL REFERENCES
ebp_manufacturer_request_batches(id) ON DELETE CASCADE`, `passport_id
UUID NOT NULL REFERENCES ebp_engineering_passports(id) ON DELETE
RESTRICT` (the one real cross-phase FK, ADR-0025), `engineering_revision
INT NOT NULL` (pinned, immutable after insert), `elimfilters_code TEXT
NOT NULL` (denormalized display only), `manufacturer_visible_snapshot
JSONB NOT NULL` (verbatim `toManufacturerPassportDTO` output at
snapshot time, ADR-0025), `status VARCHAR(20) NOT NULL DEFAULT
'PENDING'` (`CHECK IN ('PENDING','RESPONDED','WITHDRAWN')`),
`responded_at`, `created_at`, `UNIQUE(batch_id, passport_id)`.

### 4. Manufacturer Product Offers — `ebp_manufacturer_offers`

`id UUID PK`, `offer_code VARCHAR(12) UNIQUE NOT NULL` (same
`node:crypto`-random generation discipline as `batch_code`),
`offer_revision INT NOT NULL`, `batch_item_id UUID NOT NULL REFERENCES
ebp_manufacturer_request_batch_items(id) ON DELETE RESTRICT`,
`manufacturer_id UUID NOT NULL REFERENCES ebp_manufacturers(id)`,
`passport_id UUID NOT NULL`, `engineering_revision INT NOT NULL`
(copied from the parent Batch Item, ADR-0025/ADR-0026), `status
VARCHAR(20) NOT NULL DEFAULT 'DRAFT'` (`CHECK IN
('DRAFT','SUBMITTED','UNDER_REVIEW','VALIDATED','REJECTED','APPROVED','SUPERSEDED','EXPIRED','WITHDRAWN')`),
`submitted_at`, `late_submission BOOLEAN NOT NULL DEFAULT FALSE`,
`effective_from`, `expires_at`, `supersedes_offer_id UUID REFERENCES
ebp_manufacturer_offers(id)`, `factory_user_id UUID REFERENCES
ebp_factory_users(id)`, `created_by TEXT NOT NULL`, `identity_mechanism
VARCHAR(30) NOT NULL`, `fob_price NUMERIC(12,4) NOT NULL CHECK
(fob_price > 0)`, `currency CHAR(3) NOT NULL`, `incoterm VARCHAR(10)`,
`fob_point TEXT`, `moq INT`, `lead_time_days INT`, `monthly_capacity
INT`, `tooling_cost NUMERIC(12,2)`, `sample_cost NUMERIC(12,2)`,
`offer_validity_until DATE`, `commercial_notes TEXT`, `created_at`,
`updated_at`.

Partial unique index (the versioning-lineage constraint, ADR-0026):
`UNIQUE (passport_id, engineering_revision, manufacturer_id) WHERE
status IN ('SUBMITTED','UNDER_REVIEW','VALIDATED')`.

**Offer status state machine** (nine states, `BUSINESS_RULES.md` §5,
ADR-0026 — Phase 3 only ever writes the states marked ✅; the others exist
in the `CHECK` constraint because they are valid column values a later
phase writes):
```
DRAFT       → SUBMITTED ✅, WITHDRAWN ✅
SUBMITTED   → UNDER_REVIEW (Phase 4), WITHDRAWN ✅, SUPERSEDED ✅ (new revision)
UNDER_REVIEW→ VALIDATED (Phase 4), REJECTED (Phase 4)
VALIDATED   → APPROVED (Offer Approval), SUPERSEDED ✅, EXPIRED (computed)
APPROVED    → SUPERSEDED ✅ (new revision still allowed), EXPIRED (computed)
REJECTED    → (terminal for this revision — a new revision may follow)
SUPERSEDED  → (terminal)
EXPIRED     → (terminal)
WITHDRAWN   → (terminal)
```
`EXPIRED` is computed at read time via
`ebp_manufacturer_offers_effective` (same ADR-0019 view pattern — `WHEN
status IN ('SUBMITTED','UNDER_REVIEW','VALIDATED','APPROVED') AND
expires_at < CURRENT_DATE THEN 'EXPIRED' ELSE status END AS
effective_status`), no scheduled job.

### 5. Offer Status History — `ebp_manufacturer_offer_status_history`

Append-only, same shape as Batch Status History, `offer_id` FK, records
either `declared_actor`/`ADMIN_KEY_SHARED` or a real `factory_user_id`/
`FACTORY_SESSION` depending on which surface made the transition.

### 6. Offer Technical Fields — `ebp_manufacturer_offer_technical_fields`

`id UUID PK`, `offer_id UUID NOT NULL REFERENCES
ebp_manufacturer_offers(id) ON DELETE CASCADE`, `field_name TEXT NOT
NULL` (mirrors a Phase 1 `required_*` field name), `offered_value
JSONB`, `unit TEXT`, `tolerance TEXT`, `manufacturer_note TEXT`,
`evidence_document_id UUID REFERENCES ebp_manufacturer_documents(id) ON
DELETE SET NULL`, `completeness_status VARCHAR(20) NOT NULL DEFAULT
'ANSWERED'` (`CHECK IN ('ANSWERED','CANNOT_MEET','NOT_APPLICABLE')`),
`compliance_status VARCHAR(20)` (`CHECK IN
('PENDING','COMPLIANT','NON_COMPLIANT')`, `NULL` until Phase 4 writes
it — Phase 3 never sets this column), `UNIQUE(offer_id, field_name)`.

### 7. Offer Packaging — `ebp_manufacturer_offer_packaging`

`offer_id UUID PRIMARY KEY REFERENCES ebp_manufacturer_offers(id) ON
DELETE CASCADE`, `recommended_quantity_per_box INT`,
`box_length_mm/box_width_mm/box_height_mm NUMERIC(8,2)`,
`net_weight_kg/gross_weight_kg NUMERIC(8,3)`, `protection_method TEXT`,
`separators_used BOOLEAN`, `palletization TEXT`, `units_per_pallet
INT`, `observations TEXT`, `deviation_from_target TEXT`. No
`elimfilters_approved_quantity` column (reserved for a future Offer
Approval phase).

### 8. Documents — `ebp_manufacturer_documents`

`id UUID PK`, `manufacturer_id UUID NOT NULL REFERENCES
ebp_manufacturers(id) ON DELETE RESTRICT`, `batch_id UUID REFERENCES
ebp_manufacturer_request_batches(id) ON DELETE RESTRICT`, `offer_id
UUID REFERENCES ebp_manufacturer_offers(id) ON DELETE RESTRICT`,
`technical_field_id UUID REFERENCES
ebp_manufacturer_offer_technical_fields(id) ON DELETE RESTRICT`,
`category VARCHAR(30) NOT NULL` (`CHECK IN
('CERTIFICATION_EVIDENCE','TECHNICAL_EVIDENCE','COMMERCIAL_DOCUMENT','EXCEL_IMPORT','EXCEL_EXPORT','OTHER')`),
`original_filename TEXT NOT NULL`, `mime_type TEXT NOT NULL`,
`size_bytes BIGINT NOT NULL CHECK (size_bytes > 0 AND size_bytes <=
26214400)`, `sha256_hash CHAR(64) NOT NULL`, `storage_key TEXT NOT NULL
UNIQUE`, `uploaded_by_factory_user_id UUID REFERENCES
ebp_factory_users(id)`, `uploaded_by_declared_actor TEXT`,
`identity_mechanism VARCHAR(30) NOT NULL`, `review_status VARCHAR(20)
NOT NULL DEFAULT 'UNREVIEWED'` (`CHECK IN
('UNREVIEWED','ACCEPTED','REJECTED')`), `created_at` (ADR-0027).

### 9. Factory Users — `ebp_factory_users`

`id UUID PK`, `manufacturer_id UUID NOT NULL REFERENCES
ebp_manufacturers(id) ON DELETE CASCADE`, `email TEXT NOT NULL UNIQUE`
(`CHECK` format), `full_name TEXT NOT NULL`, `role VARCHAR(30) NOT
NULL` (`CHECK IN
('MANUFACTURER_ADMIN','MANUFACTURER_ENGINEERING','MANUFACTURER_COMMERCIAL','MANUFACTURER_READ_ONLY')`),
`password_hash TEXT`, `password_algo VARCHAR(20) NOT NULL DEFAULT
'SCRYPT'`, `status VARCHAR(20) NOT NULL DEFAULT 'INVITED'` (`CHECK IN
('INVITED','ACTIVE','LOCKED','DISABLED')`), `failed_login_count INT NOT
NULL DEFAULT 0`, `locked_until TIMESTAMPTZ`, `last_login_at`,
`invited_at NOT NULL DEFAULT NOW()`, `activated_at`, `created_at`,
`updated_at` (ADR-0023).

### 10. Factory User Invitations — `ebp_factory_user_invitations`

`id UUID PK`, `factory_user_id UUID NOT NULL REFERENCES
ebp_factory_users(id) ON DELETE CASCADE`, `token_hash CHAR(64) NOT NULL
UNIQUE` (SHA-256 of the raw token — raw token never stored), `purpose
VARCHAR(20) NOT NULL` (`CHECK IN ('INVITE','PASSWORD_RESET')`),
`expires_at TIMESTAMPTZ NOT NULL`, `used_at TIMESTAMPTZ`, `created_at`.

### 11. Factory Sessions — `ebp_factory_sessions`

`id UUID PK`, `factory_user_id UUID NOT NULL REFERENCES
ebp_factory_users(id) ON DELETE CASCADE`, `token_hash CHAR(64) NOT NULL
UNIQUE`, `created_at`, `expires_at TIMESTAMPTZ NOT NULL`, `revoked_at`,
`last_used_at`, `ip_address TEXT`, `user_agent TEXT`.

### 12. Factory User Audit Log — `ebp_factory_user_audit_log`

Append-only: `id SERIAL PK`, `factory_user_id UUID NOT NULL REFERENCES
ebp_factory_users(id) ON DELETE CASCADE`, `event_type VARCHAR(30) NOT
NULL` (`CHECK IN
('LOGIN_SUCCESS','LOGIN_FAILURE','LOCKOUT','PASSWORD_RESET_REQUESTED','PASSWORD_RESET_COMPLETED','INVITED','ACTIVATED','DISABLED','SESSION_REVOKED')`),
`ip_address TEXT`, `occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
`metadata JSONB`.

## Internal API Surface (`requireAdmin`)

Base path `/api/ebp/internal/manufacturer-batches`. Mirrors the
allow-list-DTO discipline of Phase 1/Phase 2 — no generic row
serialization.

1. `POST /` — create batch (`DRAFT`).
2. `GET /` — list, filterable by `manufacturer_id`, `status`, `purpose`.
3. `GET /:batch_code` — get one (internal DTO, includes items).
4. `POST /:batch_code/items` — add a Batch Item (snapshots the Passport).
5. `POST /:batch_code/send` — `DRAFT → SENT`, runs the eligibility gate.
6. `POST /:batch_code/status` — other status transitions (`CLOSE`,
   `CANCEL`, manual `OVERDUE`/`PARTIALLY_RESPONDED`/`RESPONDED`
   recompute).
7. `GET /:batch_code/history` — status history.
8. `GET /:batch_code/offers` — all Offers (all revisions) across the
   batch's items.
9. `GET /offers/:offer_code` — get one Offer (internal DTO, all
   revisions via `?all_revisions=true`).
10. `POST /manufacturer-users` — create/invite a factory user for a
    Manufacturer.
11. `POST /manufacturer-users/:id/status` — `DISABLE`/re-`INVITE`.
12. `GET /documents/:id/download` — stream a document (internal, any
    tenant).
13. `POST /:batch_code/excel/export` — generate and return the Excel
    workbook (also recorded as a document).

## Factory API Surface (`requireFactorySession`)

Base path `/api/ebp/factory`. Every function is scoped to
`req.factorySession.manufacturer_id` — never accepts a caller-supplied
manufacturer identifier.

1. `POST /auth/login` — email + password → session token.
2. `POST /auth/logout` — revoke current session.
3. `POST /auth/accept-invite` — consume an `INVITE` token, set password.
4. `POST /auth/request-password-reset` — issue a `PASSWORD_RESET` token.
5. `POST /auth/reset-password` — consume the token, set new password.
6. `GET /batches` — this Manufacturer's batches only.
7. `GET /batches/:batch_code` — one batch + items (tenant-checked).
8. `POST /batches/:batch_code/items/:item_id/offers` — create/submit an
   Offer revision.
9. `GET /batches/:batch_code/items/:item_id/offers` — this item's Offer
   history (tenant-checked).
10. `POST /offers/:offer_code/withdraw` — withdraw.
11. `POST /offers/:offer_code/documents` — upload evidence (multipart,
    `multer`).
12. `GET /documents/:id/download` — stream (tenant-checked).
13. `GET /batches/:batch_code/excel/export` — download the workbook.
14. `POST /batches/:batch_code/excel/stage` — Stage 1+2 (hash check +
    validation), returns a staging token + preview or errors.
15. `POST /batches/:batch_code/excel/confirm` — Stage 4, persists.

No endpoint on either surface accepts a generic field-map that could
touch `status`, `manufacturer_code`, `engineering_revision`, or history
rows directly — every sensitive transition has its own action endpoint,
same discipline as Phase 2.

## Business Rules Enforced

- `BUSINESS_RULES.md` §5 in full (Request Batch, versioned Offer,
  nine-state lifecycle, single-active-revision rule, `required_*`/
  `offered_*`/`compliance_status`/`manufacturer_note`/
  `evidence_attachment` pattern, no independent Supplier entity).
- `BUSINESS_RULES.md` §3.1 (packaging ownership split).
- ADR-0007, ADR-0009, ADR-0010, ADR-0011, ADR-0012 (Phase 0 governance
  decisions this phase implements).
- ADR-0023 through ADR-0029 (this phase's own implementation decisions).

## Confidentiality

- Manufacturer A's factory session can never read or act on Manufacturer
  B's batches, items, offers, or documents — enforced at the query level
  (every factory-facing repository function takes `manufacturer_id` as a
  mandatory parameter), not only at the response-shaping level.
- `internal_notes` on a Batch is ELIMFILTERS-internal only, never
  returned by any factory-facing DTO.
- A document's `storage_key` never appears in any API response.
- `ebp_factory_users.password_hash` and every session's `token_hash`
  never appear in any API response, including the internal surface's own
  factory-user list (an allow-list DTO omits both fields unconditionally).

## Migrations

`migrations/ebp-phase3/001_schema.sql` (12 tables + 1 effective-Offer
view), `validate.sql`, `rollback.sql` — following the exact convention of
`migrations/ebp-phase1/` and `migrations/ebp-phase2/`. `rollback.sql`
drops only `ebp_manufacturer_request_batch*`/`ebp_manufacturer_offer*`/
`ebp_manufacturer_documents`/`ebp_factory_*`-prefixed structures, verified
to leave Phase 1, Phase 2, the KG tables, `elimfilters_catalog`, and
`technologies` completely untouched.

## New Dependencies (documented per the project owner's explicit instruction)

- **`multer`** — Express's own maintained multipart/upload middleware
  (ADR-0027). `memoryStorage()` only; never disk-buffers an unvalidated
  upload.
- **`exceljs`** — Excel read/write (ADR-0028), chosen over `xlsx`
  (SheetJS) specifically for its cleaner parsing-security history, since
  the highest-risk operation is parsing a Manufacturer-uploaded file.
- No password-hashing or JWT/session library is added — `node:crypto`
  (already used by Phase 2's `efm-code.js`) covers both.

## Integration Points

- Reads Phase 1 (`toManufacturerPassportDTO`, required-field list) and
  Phase 2 (`manufacturer_code`, `status`, `ebp_manufacturer_
  qualifications`) — read-only, no write access to either.
- Read by (later phases, not built yet): Phase 4 (evaluates each Offer
  revision's technical fields, writes `compliance_status` and the
  `UNDER_REVIEW`/`VALIDATED`/`REJECTED` transitions), Phase 5 (selection
  ranks current active + `VALID` Offers), Phase 6 (cost uses the selected
  Offer's `fob_price` as its base input).

## Deliverables

- [x] 12-table schema + effective-Offer view (`migrations/ebp-phase3/`),
  migrated and verified against a real local Postgres instance.
- [x] Batch/Offer state machines, implemented in `ebp/phase3/validation.js`
  and enforced in `service.js` (never a generic status-set path; Phase 3's
  own offer-transition function structurally rejects writing
  `UNDER_REVIEW`/`VALIDATED`/`REJECTED`/`APPROVED`).
- [x] Factory authentication (ADR-0023), implemented
  (`ebp/phase3/factory-auth.js`) and tenant-isolated (every factory-facing
  repository/service function is scoped to the authenticated session's
  `manufacturer_id`).
- [x] Portal (`/portal/*`, `ebp/phase3/portal.routes.js`) and Excel
  (staged, hash-verified, `ebp/phase3/excel.js` + `staging.js`) dual
  intake, both producing the identical Offer lifecycle via the same
  `service.createOfferRevision`.
- [x] Internal (13 endpoints, `internal.routes.js`) and factory (15
  endpoints, `factory.routes.js`) API surfaces, hard-split,
  `requireAdmin`/`requireFactorySession` respectively — confirmed by
  direct route-count grep against the router source.
- [x] Full test suite (29 unit + 30 integration + 28 regression = 87
  tests, counts confirmed by the `node --test` runner output, not
  estimated) against real Postgres, covering every item in the project
  owner's mandatory list — all passing, confirmed stable across 3
  consecutive runs.

## Exit Criteria

- [x] A Batch can be created, an item added (with an immutable snapshot),
  and sent to an eligible Manufacturer per its `purpose`'s gate.
- [x] A factory user can log in, view only its own Manufacturer's
  batches, and submit a complete Offer (every applicable field
  `ANSWERED`/`CANNOT_MEET`/`NOT_APPLICABLE`, no silent gaps) via the
  Portal.
- [x] A second, later revision correctly supersedes the first atomically
  (fixed a real ordering bug during test-writing — see "Bugs found and
  fixed" below), and a second Manufacturer's independent Offer for the
  same Passport revision does not conflict with the first Manufacturer's
  lineage.
- [x] `fob_price` and all money fields round-trip as exact decimals
  (Postgres `NUMERIC`, never `float`/`real`/`double precision`), verified
  through Postgres, the API, and the Excel pipeline.
- [x] The Excel export → edit → stage → confirm round-trip produces the
  same Offer shape the Portal path would; a wrong-template or altered-
  locked-cell file is rejected at the staging step with zero rows
  persisted.
- [x] A Request Batch's `response_due_at` passing correctly flags a late
  Offer `late_submission = true` without rejecting it (verified by test).
- [x] Every status transition (batch, offer, factory-user account state)
  is audited with actor/mechanism/reason/timestamp; invalid transitions
  are rejected before any write.
- [x] A factory session can never read or mutate another Manufacturer's
  data (batches, items, offers, documents) — verified by test (404, not a
  tenant-confirming 403), not assumed.
- [x] Migrations and rollback both verified against a real Postgres
  instance with real data present (120 batches, 68 offers, 29 factory
  users, etc.), leaving Phase 1/Phase 2 completely untouched.
- [x] All tests pass, including the full Phase 1 (59) and Phase 2 (100)
  suites re-run unmodified.
- [x] Phase 4 was not started.

Phase 3 is left in status `Built` — **not** `APPROVED / FROZEN`; freezing
is a separate, later step, per the same discipline applied to Phase 1 and
Phase 2.

## Bugs found and fixed during test-writing (before any freeze)

- **Offer supersession ordering.** `service.createOfferRevision`
  originally inserted the new `SUBMITTED` revision *before* marking the
  prior active revision `SUPERSEDED`. Postgres checks the partial unique
  index (`uq_ebp_offers_one_active_lineage`) at statement time, not
  transaction-commit time, so this produced a spurious `23505` conflict
  the moment a third revision was submitted. Fixed by superseding the old
  offer first, then inserting the new one, in the same transaction — the
  same ordering Phase 1's `activatePassport` already used for Passport
  supersession.
- **`field_name` misclassified as a locked Excel column.** The original
  `excel.js` draft put `field_name` in `LOCKED_COLUMNS`, but the export
  always leaves it blank (this MVP's export produces one row per Batch
  Item, not one row per required Passport field) — meaning a Manufacturer
  could never actually fill in which field they were answering. Fixed by
  moving `field_name` to `EDITABLE_COLUMNS`; `LOCKED_COLUMNS` now covers
  only the genuinely ELIMFILTERS-defined columns
  (`batch_item_id`/`elimfilters_code`/`required_value`/`unit`/
  `instructions`).
- **Test-only bugs** (not implementation defects, listed for completeness
  since they blocked verification): JS string literals using SQL-style
  `''` escaping instead of `\'`/double quotes for apostrophes; hand-rolled
  manufacturer/batch/offer codes in test fixtures that didn't match the
  real ambiguity-free alphabet (fixed by reusing the real
  `ebp/phase2/efm-code.js` and `ebp/phase3/codes.js` generators instead of
  hand-rolling); a `'x'.repeat(n)` JS expression accidentally embedded as
  literal text inside a SQL template string instead of passed as a bound
  parameter; a fixed-literal `token_hash` that collided with a leftover
  row from a previous run against the same persistent database (the same
  class of idempotency bug identified and fixed during Phase 1's
  correction round); and an incorrect test assumption that deleting a
  Manufacturer would cascade-delete its Batches — the schema's actual
  (correct) behavior is `RESTRICT`, matching Documents' "never silently
  destroy a business record" discipline (ADR-0027); the test was
  corrected to assert `RESTRICT`, not the schema.

## Risks

- **Risk: Excel sheet-protection is not itself a security boundary** —
  mitigated by ADR-0028's independent server-side hash verification of
  locked-column content; documented so no future maintainer mistakes
  Excel's native protection for the real guarantee.
- **Risk: local-filesystem document storage does not survive a
  container/host replacement** — acceptable for MVP scope (ADR-0027
  documents a swappable four-method adapter interface specifically so a
  future object-storage backend requires no calling-code change), flagged
  for awareness before production deployment.
- **Risk: no rate limiting beyond Express-level middleware on the login
  endpoint specifically** — implemented as a dedicated `factoryLoginLimiter`
  (10 requests / 15 min) mounted ahead of `factoryLimiter` (300 / 15 min)
  specifically on `/api/ebp/factory/auth/login` in `server.js`, narrower
  than the phase-wide limiter, to slow credential-stuffing.
- ~~**Risk: `OVERDUE` is never automatically computed.**~~ **Resolved in
  the pre-freeze correction round (ADR-0031).** A `response_due_at`
  cron/job is not required: `ebp_manufacturer_request_batches_effective`
  is a computed view exposing `effective_status = OVERDUE` whenever
  `response_due_at < NOW()` and the stored status isn't
  `RESPONDED`/`CLOSED`/`CANCELLED`, exactly mirroring the pre-existing
  Offer-effective-status pattern (ADR-0019). `repository.js`, `dto.js`,
  and `portal.routes.js` all read through this view — no code path
  computes `OVERDUE` independently. The underlying stored `status` can
  still be advanced explicitly (e.g. to `RESPONDED`); `effective_status`
  is a read-time projection, never a second source of truth.
- ~~**Risk: the Excel pipeline's staging store is process-local.**~~
  **Resolved in the pre-freeze correction round (ADR-0030).** Staging is
  now a Postgres table (`ebp_manufacturer_excel_staging`) keyed by a UUID
  token, with `expires_at`/TTL cleanup, single-use atomic consumption
  (`UPDATE ... WHERE status = 'STAGED' ... RETURNING`, no SELECT-then-
  UPDATE race window), and tenant isolation enforced in the same query.
  Verified by a regression test that opens a brand-new `Pool` — simulating
  a process restart — and reads a row written via the original pool.
- ~~**Risk: the Excel round-trip supports exactly one technical field per
  Batch Item row.**~~ **Resolved in the pre-freeze correction round
  (ADR-0032).** The export now expands one row per (Batch Item ×
  applicable PEP field), using the same `pep-fields.js` applicability
  lookup the Portal's multi-field Offer form uses — Portal and Excel
  produce byte-identical `technical_fields[]` payloads consumed by the
  same `service.createOfferRevision`. `field_name` moved back to
  `LOCKED_COLUMNS` (correctly pre-populated from the frozen Passport
  snapshot this time, never blank) since the Manufacturer must never
  type or alter which field a row answers.
- **Risk: the Factory Portal previously required the Manufacturer to call
  the Excel `stage`/`confirm` API endpoints directly (no UI) — resolved.**
  `ebp/phase3/portal.routes.js` now implements the full flow as
  server-rendered HTML: download template, upload `.xlsx`, stage,
  review (valid rows, per-row/field errors, wrong-template/altered-
  locked-column detection), explicit confirm button, and a final
  success/rejection report — reusing `excel.js`/`staging.js`/`service.js`
  directly rather than duplicating any validation logic. No Postman,
  curl, or API token is needed. Verified end-to-end (including the
  tampered-file and re-confirm-rejected paths) against a real Postgres
  instance via a cookie-authenticated integration test.

## Open Questions

- **Not decided in Phase 3, carried to a later phase:** the Offer
  Approval entity's own decisioning workflow/UI (`ebp_manufacturer_
  offer_approvals`, `BUSINESS_RULES.md` §7) — Phase 3 defines and
  respects the entity's existence (Offers can reach `APPROVED` only via
  that future mechanism) but does not build it.
- **Not decided in Phase 3:** Distributor authentication (Phase 8) — only
  the Manufacturer side of ADR-0002 is resolved here.
- Should `portal.elimfilters.com` become a real separate subdomain in a
  later infrastructure change? ADR-0029 documents this as a deployment/
  DNS decision outside this repository's current scope; the code itself
  is already organized (`/portal/*`) so that a later reverse-proxy split
  requires no application-code change.
