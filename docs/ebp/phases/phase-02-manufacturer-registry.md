# Phase 02 — Manufacturer Registry

**Status:** `APPROVED / FROZEN v1.0` — approved 2026-07-13, branch
`claude/phase-0-audit-review-wanxa3`. See ADR-0015 through ADR-0022 in
`DECISIONS.md` and the "Phase 2 approved and frozen — v1.0" entry in
`CHANGELOG.md` for the closing commit hash. Phase 3 — Manufacturer Intake
Portal / Factory Portal is authorized to begin immediately; no phase
beyond Phase 3 is authorized.
**Depends on:** Phase 01 (`APPROVED / FROZEN v1.0`)
**Blocks:** Phases 03, 04, 05, 06

**Correction notice (Phase 0 correction round):** This revision adds the
permanent confidential `EFM-XXXX` manufacturer code as the functional key
(replacing any implicit use of `legal_name`), adds the `CONDITIONAL`
status value, and makes explicit that a Manufacturer is the factory
producing the *finished* filter — not a raw-material vendor. See ADR-0006
in `DECISIONS.md`.

**Implementable-spec notice (2026-07-13):** Per the project owner's
authorization to begin Phase 2 immediately following Phase 1's freeze,
this document was converted from a first-pass draft to a complete,
implementable specification: real SQL schema (8 tables), the
`EFM-XXXX` generation algorithm, manufacturer and qualification status
state machines, structured (non-free-text) qualification conditions, the
internal API surface, and confidentiality DTOs. See ADR-0015 through
ADR-0021 in `DECISIONS.md` for the specific decisions this resolved.

**Freeze notice (2026-07-13):** The project owner reviewed the `Built`
delivery and formally approved it. Four closing decisions were made at
approval time and are recorded in ADR-0022: `registered_on`'s semantics
are now unambiguous (see "Key Entities" below); the certification-
validity view design (ADR-0019) is approved as final, with no scheduled
job required; `country_code`/`timezone` syntactic-only validation is
accepted and tracked as controlled debt under
`FUTURE_REFERENCE_DATA_VALIDATION`; and every fixed enum introduced by
this phase may only be extended via documentation + ADR + migration +
tests, never a free-form value. No implementation change was required by
the freeze — Phase 2's code already matched all four decisions.

**Frozen-baseline notice:** Nothing in this phase modifies any Phase 0 or
Phase 1 file, table, API, or rule. Phase 1's tables
(`ebp_engineering_passports` and its children) are read-only reference
material to Phase 2 (for family-vocabulary consistency, ADR-0016) — never
written to, never altered. As of this freeze, Phase 2's own files, tables,
and rules carry the same protection: no future phase may modify them
except via a new ADR that explains the impact and is strictly necessary
for that phase.

## Objective

Build ELIMFILTERS' private master registry of manufacturers that may
receive product batches and submit manufacturing proposals — the
Manufacturer Intake Portal (Phase 3) and every phase after it identify a
factory exclusively by this registry's confidential `manufacturer_code`,
never by name.

## Scope

**In scope:**
- Manufacturer master record: identity, status, audit metadata, soft
  retirement (never destructive deletion).
- `manufacturer_code` (`EFM-XXXX`) generation, permanence, immutability,
  and non-reuse (ADR-0015).
- Manufacturer status state machine (six states, ADR-0020) with a full,
  immutable transition history.
- Contacts (multiple per manufacturer, exactly one active primary).
- Locations (multiple physical facilities per manufacturer — the sole
  address model, ADR-0018).
- Certifications, with a computed, always-current validity view
  (ADR-0019) — a certification is never presented as verified-and-valid
  once it has expired.
- Product family qualifications, scoped to a specific manufacturer
  **and** location (ADR-0018), reusing Phase 1's category/subtype
  vocabulary (ADR-0016), with structured, verifiable conditions
  (ADR-0017) rather than free text.
- Manufacturer capabilities (declared/verified/rejected/expired),
  covering the full list requested: product families, construction
  types, dimensional ranges, processes, monthly capacity, labs, internal
  tests, packaging, printing/lithography, markets served, languages,
  currencies accepted.
- Internal-only API surface (`requireAdmin`), and internal-only DTOs —
  no Manufacturer- or Distributor-facing projection is built in this
  phase (ADR-0021).

**Out of scope:**
- Manufacturer Request Batches and Manufacturer Product Offers (Phase 3,
  Manufacturer Intake Portal).
- Whether a specific Offer complies with Passport requirements (Phase 4).
- Manufacturer Selection ranking logic (Phase 5) and Cost Engine (Phase
  6) — Phase 2 only records the data those phases will read.
- Any Manufacturer- or Distributor-facing login/portal (ADR-0002, still
  undecided; Phase 3/8 concern).
- Raw-material/component supplier management — not an MVP entity
  (ADR-0005), unaffected by this phase.

## Dependencies

- Phase 1's `ebp_engineering_passports` / `ebp_field_applicability_
  matrix` vocabulary for `product_category`/`product_subtype` — read-only
  reference, not a foreign key (ADR-0016).
- Existing `requireAdmin` middleware in `server.js`.
- `ebp/phase1/actor.js` — reused, unmodified, per the project owner's
  explicit instruction not to duplicate it unnecessarily. Phase 2 imports
  `resolveDeclaredActor`/`IDENTITY_MECHANISM` directly rather than
  re-implementing declared-actor resolution.

## Decisions Made at Implementation

Resolving all nine items the project owner listed as needing closure —
each backed by an ADR in `DECISIONS.md`:

1. **`EFM-XXXX` generation algorithm** — ADR-0015: cryptographically
   random 4-character suffix from a 32-character ambiguity-free alphabet,
   retry-on-collision, DB-enforced immutability and format.
2. **Family taxonomy** — ADR-0016: reuse Phase 1's `product_category`/
   `product_subtype` vocabulary directly; no parallel taxonomy table.
3. **Structured condition model** — ADR-0017: typed `condition_type` +
   `parameters JSONB` rows, each independently verifiable via
   `is_satisfied`.
4. **Corporate manufacturer vs. physical factory** — ADR-0018: Locations
   is the sole address/facility model; qualifications bind to a specific
   `(manufacturer_id, location_id)` pair via a composite foreign key.
5. **Certification expiry policy** — ADR-0019: computed via a SQL view
   (`ebp_manufacturer_certifications_effective`), never trusted from a
   possibly-stale stored `status` alone.
6. **Suspension/reactivation policy** — ADR-0020: `SUSPENDED` can only
   reactivate via `UNDER_REVIEW`, never directly back to `QUALIFIED`.
7. **Soft delete/retirement rule** — ADR-0020/ADR-0015: `RETIRED` is a
   terminal status, not a `DELETE`; the row and its `manufacturer_code`
   are retained forever.
8. **What a future plant user will see** — explicitly **not decided** in
   Phase 2; carried as an open question (below), since it depends on the
   still-undecided Manufacturer/Distributor auth (ADR-0002) and belongs
   to Phase 3's design, not Phase 2's.
9. **Strictly ELIMFILTERS-internal fields** — ADR-0021: `internal_notes`
   and the entire registry are internal-only; no Distributor- or
   Manufacturer-facing projection exists in this phase at all.

## Key Entities / Data Model (implemented)

All tables live under `migrations/ebp-phase2/`, additive to the existing
database, following the same convention as `migrations/ebp-phase1/`.

### 1. Manufacturer Master Record — `ebp_manufacturers`

| Field | Type | Notes |
|---|---|---|
| `id` | `UUID PK` | `uuid_generate_v4()`. |
| `manufacturer_code` | `VARCHAR(9) UNIQUE NOT NULL` | `EFM-XXXX`. `CHECK` enforces format + canonical case (ADR-0015). Immutable after insert (DB trigger). |
| `legal_name` | `TEXT NOT NULL` | Descriptive metadata only — never a join key (ADR-0006). |
| `trade_name` | `TEXT` | Nullable. |
| `country_code` | `CHAR(2) NOT NULL` | ISO 3166-1 alpha-2, `CHECK (country_code ~ '^[A-Z]{2}$')`. No `countries` table exists in this codebase to reference (audited — none found under `database/schema/`); validated by `CHECK`, not FK. |
| `timezone` | `TEXT NOT NULL` | IANA timezone string (e.g. `Asia/Shanghai`). |
| `website` | `TEXT` | Nullable. |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE'` | `CHECK` against the six states below. |
| `status_reason` | `TEXT` | Reason for the current status (mirrors the latest status-history row for quick reads). |
| `internal_notes` | `TEXT` | ELIMFILTERS-internal only (ADR-0021) — never returned to any non-internal consumer. |
| `registered_on` | `DATE NOT NULL DEFAULT CURRENT_DATE` | **Formalized meaning (ADR-0022):** the date ELIMFILTERS formally incorporated the manufacturer into the Manufacturer Registry. Does **not** mean the manufacturer's founding date, the start of a commercial relationship, a qualification date, an approval date, or a first-production date. Settable at creation (e.g. for backfilled/historical records) and distinct from `created_at`'s row-insert timestamp — the two are never conflated. |
| `created_by` | `TEXT NOT NULL` | Declared-actor label — see "Actor & Audit Semantics". |
| `identity_mechanism` | `VARCHAR(30) NOT NULL DEFAULT 'ADMIN_KEY_SHARED'` | |
| `created_at`, `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | |
| `retired_at` | `TIMESTAMPTZ` | Nullable; set when `status` becomes `RETIRED`. The row is **never** `DELETE`d — this is the soft-retirement marker. |

No flat address column — see ADR-0018; addresses live in `ebp_manufacturer_locations`.

### 2. Status History — `ebp_manufacturers_status_history`

Append-only: `id SERIAL PK`, `manufacturer_id UUID NOT NULL REFERENCES
ebp_manufacturers(id)`, `from_status VARCHAR(20)`, `to_status
VARCHAR(20) NOT NULL`, `reason TEXT`, `evidence_reference TEXT`,
`declared_actor TEXT NOT NULL`, `identity_mechanism VARCHAR(30) NOT NULL
DEFAULT 'ADMIN_KEY_SHARED'`, `changed_at TIMESTAMPTZ NOT NULL DEFAULT
NOW()`.

**Manufacturer status state machine (ADR-0020) — six states:**
`CANDIDATE`, `UNDER_REVIEW`, `CONDITIONAL`, `QUALIFIED`, `SUSPENDED`,
`RETIRED`.

```
CANDIDATE     → UNDER_REVIEW, RETIRED
UNDER_REVIEW  → CANDIDATE, CONDITIONAL, QUALIFIED, RETIRED
CONDITIONAL   → UNDER_REVIEW, QUALIFIED, SUSPENDED, RETIRED
QUALIFIED     → SUSPENDED, RETIRED
SUSPENDED     → UNDER_REVIEW, RETIRED
RETIRED       → (terminal)
```

Any transition not in this table is rejected before any row is written.

### 3. Contacts — `ebp_manufacturer_contacts`

`id UUID PK`, `manufacturer_id UUID NOT NULL REFERENCES
ebp_manufacturers(id)`, `full_name TEXT NOT NULL`, `title TEXT`, `email
TEXT NOT NULL` (`CHECK` basic format), `phone TEXT`, `preferred_language
VARCHAR(10)`, `is_primary BOOLEAN NOT NULL DEFAULT FALSE`, `is_technical
BOOLEAN NOT NULL DEFAULT FALSE`, `is_commercial BOOLEAN NOT NULL DEFAULT
FALSE`, `is_active BOOLEAN NOT NULL DEFAULT TRUE`, `created_at`,
`updated_at`.

**Constraint:** at most one active primary contact per manufacturer —
partial unique index `ON ebp_manufacturer_contacts(manufacturer_id)
WHERE is_primary = TRUE AND is_active = TRUE`, the same pattern Phase 1
uses for "one `ACTIVE` Passport revision per SKU."

### 4. Locations — `ebp_manufacturer_locations`

`id UUID PK`, `manufacturer_id UUID NOT NULL REFERENCES
ebp_manufacturers(id)`, `location_code TEXT`, `location_type
VARCHAR(20) NOT NULL` (`CHECK IN ('HEADQUARTERS','FACTORY','WAREHOUSE',
'LAB','OTHER')`), `country_code CHAR(2) NOT NULL`, `region TEXT`, `city
TEXT`, `address_line TEXT`, `postal_code TEXT`, `timezone TEXT NOT
NULL`, `is_active BOOLEAN NOT NULL DEFAULT TRUE`, `created_at`,
`updated_at`.

`UNIQUE (id, manufacturer_id)` — enables the composite FK from
qualifications/certifications (ADR-0018).

### 5. Certifications — `ebp_manufacturer_certifications`

`id UUID PK`, `manufacturer_id UUID NOT NULL`, `location_id UUID`
(nullable — a certification may cover the whole corporate entity),
composite `FOREIGN KEY (location_id, manufacturer_id) REFERENCES
ebp_manufacturer_locations(id, manufacturer_id)`, `certification_code
TEXT NOT NULL`, `certificate_number TEXT`, `issuing_body TEXT NOT
NULL`, `issued_on DATE NOT NULL`, `expires_on DATE`, `status
VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION'` (`CHECK IN
('PENDING_VERIFICATION','VERIFIED','EXPIRED','REVOKED','REJECTED')`),
`evidence_reference TEXT`, `scope TEXT`, `created_at`, `updated_at`.

**`ebp_manufacturer_certifications_effective`** (view, ADR-0019):
`SELECT *, CASE WHEN status = 'VERIFIED' AND expires_on < CURRENT_DATE
THEN 'EXPIRED' ELSE status END AS effective_status FROM
ebp_manufacturer_certifications`. Every "is this certification currently
valid" read goes through this view, never the raw `status` column.

### 6. Product Family Qualifications — `ebp_manufacturer_qualifications`

`id UUID PK`, `manufacturer_id UUID NOT NULL`, `location_id UUID NOT
NULL`, composite `FOREIGN KEY (location_id, manufacturer_id) REFERENCES
ebp_manufacturer_locations(id, manufacturer_id)`, `product_category
VARCHAR(100) NOT NULL`, `product_subtype VARCHAR(100) NOT NULL`
(ADR-0016 vocabulary), `status VARCHAR(20) NOT NULL DEFAULT 'CANDIDATE'`
(`CHECK IN ('CANDIDATE','CONDITIONAL','QUALIFIED','SUSPENDED',
'REVOKED')`), `effective_from DATE`, `review_due_on DATE`, `approved_by
TEXT`, `evidence_reference TEXT`, `created_at`, `updated_at`.

Qualification status state machine (ADR-0020, analogous to the
manufacturer machine but with `REVOKED` as its terminal state instead of
`RETIRED` — revoking one family does not retire the whole manufacturer):

```
CANDIDATE     → CONDITIONAL, QUALIFIED, REVOKED
CONDITIONAL   → QUALIFIED, SUSPENDED, REVOKED
QUALIFIED     → SUSPENDED, REVOKED
SUSPENDED     → CONDITIONAL, QUALIFIED, REVOKED
REVOKED       → (terminal)
```

### 7. Qualification Conditions — `ebp_manufacturer_qualification_conditions`

`id UUID PK`, `qualification_id UUID NOT NULL REFERENCES
ebp_manufacturer_qualifications(id) ON DELETE CASCADE`, `condition_type
VARCHAR(50) NOT NULL` (`CHECK IN ('MAX_OUTER_DIAMETER_MM','MAX_HEIGHT_MM',
'CONSTRUCTION_TYPE','ALLOWED_MATERIAL','APPROVED_TECHNOLOGY',
'LOCATION_RESTRICTED','INITIAL_SAMPLE_REQUIRED','MIN_MONTHLY_CAPACITY')`),
`parameters JSONB NOT NULL`, `is_satisfied BOOLEAN NOT NULL DEFAULT
FALSE`, `satisfied_at TIMESTAMPTZ`, `notes TEXT`, `created_at`.

`parameters` shape per `condition_type` (documented here as the
authority):
- `MAX_OUTER_DIAMETER_MM` / `MAX_HEIGHT_MM`: `{"max_mm": number}`
- `CONSTRUCTION_TYPE`: `{"allowed": [string, ...]}`
- `ALLOWED_MATERIAL`: `{"materials": [string, ...]}`
- `APPROVED_TECHNOLOGY`: `{"technology_codes": [string, ...]}`
- `LOCATION_RESTRICTED`: `{"location_id": uuid}`
- `INITIAL_SAMPLE_REQUIRED`: `{"sample_quantity": number}`
- `MIN_MONTHLY_CAPACITY`: `{"units_per_month": number}`

### 8. Capabilities — `ebp_manufacturer_capabilities`

`id UUID PK`, `manufacturer_id UUID NOT NULL REFERENCES
ebp_manufacturers(id)`, `location_id UUID` (nullable — capability may be
manufacturer-wide), composite `FOREIGN KEY (location_id, manufacturer_id)
REFERENCES ebp_manufacturer_locations(id, manufacturer_id)`,
`capability_type VARCHAR(50) NOT NULL` (`CHECK IN ('PRODUCT_FAMILY',
'CONSTRUCTION_TYPE','DIMENSIONAL_RANGE','PROCESS','MONTHLY_CAPACITY',
'LAB','INTERNAL_TEST','PACKAGING','PRINTING_LITHOGRAPHY','MARKET_SERVED',
'LANGUAGE','CURRENCY_ACCEPTED')`), `capability_value JSONB NOT NULL`,
`review_status VARCHAR(20) NOT NULL DEFAULT 'DECLARED'` (`CHECK IN
('DECLARED','VERIFIED','REJECTED','EXPIRED')`), `declared_at
TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `verified_at TIMESTAMPTZ`,
`verified_by TEXT`, `expires_on DATE`, `notes TEXT`.

One generic `capability_type` + `capability_value JSONB` pair covers the
full requested capability list without twelve near-duplicate tables — the
same JSONB-for-open-ended-data pattern already used by
`elimfilters_catalog` and Phase 1's `dimensions_tolerances`.

## Actor & Audit Semantics (reused from Phase 1, not duplicated)

Phase 2 imports `resolveDeclaredActor` and the `ADMIN_KEY_SHARED`
constant directly from `ebp/phase1/actor.js` rather than re-implementing
them — the project owner's explicit instruction. Every Phase 2 write
records `declared_actor`/`identity_mechanism` with the identical
semantics already frozen in Phase 1: a self-reported label, never named
or treated as a verified/authenticated identity, paired with
`identity_mechanism = 'ADMIN_KEY_SHARED'` on every audit record.

## Internal API Surface (implemented, `requireAdmin`-gated, 16 endpoints)

Base path `/api/ebp/manufacturers`. All reads/writes go through
`ebp/phase2/dto.js` projections — no generic row serialization anywhere
(ADR-0021).

1. `POST /` — create manufacturer (`manufacturer_code` server-generated;
   `status` starts `CANDIDATE`).
2. `GET /` — list, filterable by `status`, `country_code`, free-text `q`
   (matches `legal_name`/`trade_name`, internal use only).
3. `GET /:manufacturer_code` — get one, internal DTO.
4. `PATCH /:manufacturer_code` — update allowed mutable fields
   (`legal_name`, `trade_name`, `website`, `timezone`, `internal_notes`)
   only. Never `status`, `manufacturer_code`, or audit fields — no
   generic field-update endpoint exists.
5. `POST /:manufacturer_code/status` — status transition (validated
   against the state machine; writes history).
6. `POST /:manufacturer_code/contacts` — add contact.
7. `PATCH /:manufacturer_code/contacts/:contact_id` — update/deactivate
   a contact.
8. `POST /:manufacturer_code/locations` — add location.
9. `PATCH /:manufacturer_code/locations/:location_id` — update/deactivate
   a location.
10. `POST /:manufacturer_code/certifications` — register a certification
    (`PENDING_VERIFICATION`).
11. `POST /:manufacturer_code/certifications/:certification_id/verify` —
    verify or reject a certification (explicit action, not a generic
    `PATCH`).
12. `POST /:manufacturer_code/capabilities` — declare a capability.
13. `POST /:manufacturer_code/capabilities/:capability_id/verify` —
    verify or reject a declared capability.
14. `POST /:manufacturer_code/qualifications` — create a qualification
    (manufacturer × location × family).
15. `POST /:manufacturer_code/qualifications/:qualification_id/status` —
    qualification status transition (validated against its own state
    machine).
16. `GET /:manufacturer_code/history` — manufacturer status-change
    history.

No endpoint accepts an arbitrary field-map that could touch `status`,
`manufacturer_code`, or history rows — every sensitive transition has its
own dedicated action endpoint.

## Confidentiality

Per ADR-0021: manufacturer identity, `manufacturer_code`, contacts,
locations, certifications, capabilities, qualifications, and
`internal_notes` are private. None of the sixteen endpoints above is
reachable from any public surface, and Phase 2 builds **no**
Distributor-facing or Manufacturer-facing (Factory Portal) projection —
those are Phase 8's and Phase 3's own, later, explicitly-reviewed work.
`ebp/phase2/dto.js` contains exactly the internal projection functions
listed under "Role-Scoped DTOs" below; there is no generic
`SELECT * FROM ebp_manufacturers` response path anywhere in the module.

## Role-Scoped DTOs (internal-only; no distributor/manufacturer projection exists)

- `toInternalManufacturerDTO(row)` — full manufacturer record including
  `internal_notes`, `manufacturer_code`, `status`, audit fields.
- `toInternalContactDTO`, `toInternalLocationDTO`,
  `toInternalCertificationDTO` (via the effective-status view),
  `toInternalCapabilityDTO`, `toInternalQualificationDTO` (with nested
  conditions) — each an explicit allow-list of that entity's own columns.

## Migrations

`migrations/ebp-phase2/001_schema.sql` (8 tables, the effective-
certification view, the composite FKs, the `manufacturer_code`
immutability trigger, all indexes), `validate.sql`, `rollback.sql` —
following the exact convention established by `migrations/ebp-phase1/`.
`rollback.sql` drops only `ebp_manufacturer*`-prefixed structures; it is
verified (see Exit Criteria) to leave Phase 1's tables, the KG tables,
`elimfilters_catalog`, and `technologies` completely untouched.

## Business Rules Enforced

- `BUSINESS_RULES.md` §4 in full (qualification status gating including
  `CONDITIONAL`, family taxonomy alignment, `manufacturer_code` as
  functional key, audit logging of status changes).
- ADR-0006 (`EFM-XXXX` as functional key; `legal_name` never a join key
  or Distributor-visible).
- ADR-0015 through ADR-0021 (this phase's own implementation decisions).
- `PLATFORM_ARCHITECTURE.md` §6 (auditability — status never silently
  overwritten; confidentiality by construction, allow-list DTOs).

## Integration Points

- Reads Phase 1's category/subtype vocabulary (informally, per ADR-0016)
  — no FK, no write access.
- Read by (in later phases, not built yet): Phase 3 (Request Batches sent
  to Manufacturers by `manufacturer_code`), Phase 4 (validation checks
  `QUALIFIED`/`CONDITIONAL`-satisfied status), Phase 5 (selection
  candidates must be qualified), Phase 6 (cost inputs reference
  manufacturer region for freight/duties estimation).

## Deliverables

- [x] Manufacturer master record + 7 child entities — implemented as
  real, executable SQL migrations.
- [x] `EFM-XXXX` generation, retry-on-collision, DB-enforced immutability
  — implemented and tested.
- [x] Manufacturer and Qualification status state machines — implemented
  in `ebp/phase2/validation.js`, enforced in `service.js`, never
  bypassable via a generic update endpoint.
- [x] Certification effective-validity view — implemented and tested.
- [x] Structured qualification conditions — implemented and tested.
- [x] Internal API surface (16 endpoints) — implemented and gated by
  `requireAdmin`.
- [x] Confidentiality DTOs — implemented; no generic row serialization.

## Exit Criteria

- [x] A Manufacturer can be created with an automatic `EFM-XXXX` code.
- [x] It can have multiple locations and contacts, with exactly one
  active primary contact enforced at the DB level.
- [x] Its certifications have DB-verifiable validity (expired ≠
  currently verified, via the effective-status view).
- [x] It can be qualified by family and location, with structured,
  independently-verifiable conditions.
- [x] Every status transition (manufacturer and qualification) is
  audited with `declared_actor`/`identity_mechanism`/reason/timestamp,
  and invalid transitions are rejected before any write.
- [x] No private field is reachable through any DTO not explicitly
  reviewed for that purpose — there is no public or distributor-facing
  surface in this phase at all.
- [x] Migrations and rollback both verified against a real, from-scratch
  Postgres instance.
- [x] All tests pass.
- [x] Phase 1 remains completely intact (no file, table, row, or test
  under its scope touched).
- [x] Phase 3 was not started.

Phase 2 was left in status `Built` (not `APPROVED / FROZEN`) immediately
after implementation, per the project owner's explicit instruction that
freezing is a separate, later step. The project owner subsequently
reviewed the `Built` delivery, closed the four decisions recorded in
ADR-0022, and formally approved Phase 2 as `APPROVED / FROZEN v1.0` on
2026-07-13 (see the "Freeze notice" at the top of this document).

## Risks (as closed at freeze, ADR-0022)

- **`registered_on` semantics — CLOSED.** Formalized as the date
  ELIMFILTERS incorporated the manufacturer into the registry; see the
  "Key Entities" table above and ADR-0022. No longer an open risk.
- **`country_code`/`timezone` have no lookup-table validation, only
  syntactic `CHECK`s — ACCEPTED as controlled debt, tag
  `FUTURE_REFERENCE_DATA_VALIDATION` (ADR-0022).** A typo'd country code
  is accepted if it matches the two-letter pattern; `timezone` is
  accepted if non-empty. This is a deliberate, approved trade-off for the
  MVP (no `countries`/IANA reference table exists anywhere in this
  codebase), to be resolved by a future phase validating against real
  reference data. No document or code comment may describe the current
  check as verifying real-world existence.
- **`condition_type` (and every other Phase 2 fixed enum) growth —
  governed, not open, per ADR-0022.** Extending any fixed `CHECK`-backed
  enum in this phase always requires all four of: a documentation update,
  a new ADR, a migration, and new/updated tests. This was already the de
  facto practice; ADR-0022 makes it a formal, standing rule for every
  Phase 2 enum, not just `condition_type`.
- **No scheduled job for certification/capability expiry — approved
  as-is, not a gap (ADR-0022).** The effective-status view (ADR-0019) is
  the final, approved design. A certification's raw `status` column will
  not itself flip to `EXPIRED` without a manual admin action, but every
  later phase is required to read `effective_status` (never the raw
  `status` column) for validity, so this is a reporting/audit-trail
  nicety, not a correctness gap.

## Open Questions

- **What will a future plant user (Factory Portal, Phase 3) be
  permitted to see about its own record?** Not decided in Phase 2 —
  depends on the still-undecided Manufacturer/Distributor auth
  (ADR-0002) and is Phase 3's design responsibility, not Phase 2's. Phase
  2 deliberately does not pre-build a Manufacturer-facing projection to
  avoid guessing this answer prematurely (ADR-0021).
- Should certification/capability expiry eventually get a real scheduled
  job (vs. the always-correct-at-read-time view), and if so, where does
  that job run given the stack has no background-job infrastructure
  today? Carried from `PLATFORM_ARCHITECTURE.md` §7.
- Does `condition_type`'s fixed enum need to be extensible via data
  (a lookup table) rather than a `CHECK` constraint, once real
  qualification conditions from actual manufacturers are recorded? Not
  needed for Phase 2's exit criteria; flagged for Phase 4/5 spec
  approval if it becomes a practical blocker.
