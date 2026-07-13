# Phase 01 — Product Engineering Passport (PEP)

**Status:** `In Build` (implementable specification — approved for
implementation 2026-07-13, immediately following Phase 0's approval,
ADR-0013)
**Depends on:** Phase 00 (`APPROVED / FROZEN v1.0`)
**Blocks:** Phases 02, 03, 04, 08

**Correction notice (first round):** This revision replaces the original
draft's generic "bill-of-materials category" concept (which implied a
Supplier tier) with the agreed model: the Passport carries **locked,
ELIMFILTERS-owned `required_*` engineering fields** directly. A
Manufacturer answers those fields with its own `offered_*`/`actual_*`
values on a **Manufacturer Product Offer** (Phase 3) — there is no
intermediate Supplier or BOM-mapping entity. See ADR-0005 in
`DECISIONS.md`.

**Correction notice (second round):** Required packaging (§3 below) no
longer includes `manufacturer_recommended_quantity` or
`elimfilters_approved_quantity` — neither belongs on the Passport. Both
move to Phase 3 (the Manufacturer's proposal) and the new Offer Approval
entity (ELIMFILTERS' final decision), respectively. See ADR-0008. The
single "confidential manufacturing notes" field is replaced with two
separately scoped fields, `manufacturer_instruction_notes` and
`internal_engineering_notes`. See ADR-0009.

**Implementable-spec notice (this revision, 2026-07-13):** Per the project
owner's authorization to begin Phase 1 immediately following Phase 0's
approval, this document is converted from a first-pass draft to a
complete, implementable specification: real SQL schema (grounded in an
audit of the existing `elimfilters_catalog`/`technologies` tables and the
existing migration conventions under `migrations/kg-phase*/`), the
Passport revision-versioning mechanism, a concrete field-applicability
matrix mechanism (with a seed dataset flagged for engineering review, not
asserted as final), the internal API surface, permissions, validation
rules, role-scoped DTOs, the full create/revise/activate/retire lifecycle,
and the initial import strategy. Both prior open questions on data-entry
actor and applicability matrix are resolved below (see "Decisions Made at
Implementation," Deliverables, and Open Questions).

## Objective

Define the canonical, ELIMFILTERS-owned technical specification record for
a SKU or product family — the single source of truth that every later EBP
module (Manufacturer Registry, Manufacturer Intake Portal, Engineering
Compliance Validation, Cost/Pricing Engines, Distributor Portal) reads from
when it needs to know "what must this product be."

## Scope

**In scope:**
- Data model for a Passport, split into three field groups: **locked
  identification**, **required engineering** (`required_*`), and
  **required packaging** — all ELIMFILTERS-owned and never editable by a
  Manufacturer.
- Passport versioning via `engineering_revision` (a Passport changes over
  time; history must be retrievable; a new revision does not overwrite
  the prior one; at most one revision is `ACTIVE` per SKU at a time).
- A field-applicability matrix (`ebp_field_applicability_matrix`) mapping
  `(product_category, product_subtype, field_name)` → `REQUIRED` /
  `NOT_APPLICABLE`, seeded with an initial dataset and editable by
  engineering staff.
- Draft/pre-SKU handling for products in engineering review before a SKU
  exists (see ADR-0003).
- Internal read/write API surface for Passport records
  (`/api/ebp/passports`), gated by the existing `requireAdmin` pattern.
- Role-scoped DTO/projection functions (internal, Manufacturer-facing,
  Distributor-facing) as reusable pure functions — only the internal role
  has live endpoints in Phase 1; Manufacturer/Distributor endpoints belong
  to Phases 3 and 8 respectively, but must be able to reuse these
  projections without redesigning them.

**Out of scope:**
- Who can manufacture it (Phase 2).
- A Manufacturer's response to these requirements — `offered_*`/`actual_*`
  values, FOB, MOQ, lead time, capacity (Phase 3, Manufacturer Product
  Offer).
- Whether a specific Offer complies with these requirements (Phase 4).
- What it costs or sells for (Phases 6-7).
- Public-facing display of Passport data on `frontend/` (not part of the
  EBP roadmap; if ever pursued, it's a separate integration decision, not a
  Phase 1 deliverable).
- Manufacturer/Distributor authentication (ADR-0002, still undecided) — the
  DTO functions this phase defines for those roles are pure functions with
  no live endpoint until Phases 3/8 exist and that auth decision is made.

## Dependencies

- Existing SKU architecture and duty classification (root `CLAUDE.md`).
- Existing `elimfilters_catalog` table (`sku VARCHAR(100) UNIQUE NOT
  NULL`, `duty`, `filter_type`, `sub_type`, per `scripts/migrate-to-
  render.js`) — a non-draft Passport's `elimfilters_code` must correspond
  to an existing `elimfilters_catalog.sku`.
- Existing `technologies` table (`code TEXT UNIQUE NOT NULL`, per
  `database/schema/001_core_taxonomy.sql`) — `technology_code` references
  it, never duplicates it.
- Existing `requireAdmin` middleware in `server.js` (static `ADMIN_KEY`
  bearer token) — reused as the Phase 1 auth mechanism, per the decision
  below.

## Decisions Made at Implementation (resolving this phase's two open
questions)

1. **Data entry actor (was open):** Phase 1 data entry is an **internal
   ELIMFILTERS engineering team, via admin-key-gated API endpoints**,
   consistent with the existing `requireAdmin` pattern used by every other
   write endpoint in `server.js`. No external PLM/spec-source import exists
   yet; if one is added later, it would call the same internal API rather
   than writing to the database directly, so this decision does not need
   to be revisited to add one.
2. **Applicability matrix (was open):** implemented as a real table,
   `ebp_field_applicability_matrix`, keyed on `(product_category,
   product_subtype, field_name)`, seeded with an initial, defensible
   dataset (below) grounded in general filtration engineering practice.
   **This seed data is explicitly flagged as needing ELIMFILTERS
   engineering review before Phase 1 is used for real production data** —
   see Risks. The mechanism (the table, its API, and its use in Passport
   creation) is real and tested; the specific seeded values are a
   starting point, not an asserted final authority.

## Key Entities / Data Model (implemented)

All tables live in the existing Postgres database under the `ebp_`
prefix, added via additive migrations
(`migrations/ebp-phase1/001_schema.sql`), following the same convention as
`migrations/kg-phase1/001_schema.sql` (idempotent `CREATE TABLE IF NOT
EXISTS`, `COMMENT ON TABLE`/`COMMENT ON COLUMN`, explicit indexes). See
`migrations/ebp-phase1/001_schema.sql`, `validate.sql`, and `rollback.sql`
for the exact, executable DDL.

### 1. Locked Identification — `ebp_engineering_passports`

One row **per revision** (not per SKU) — the same versioning pattern
adopted for Manufacturer Offers (ADR-0007), applied here for consistency
and the same auditability guarantee.

| Field | Type | Notes |
|---|---|---|
| `id` | `UUID PK` | `uuid_generate_v4()` (extension already enabled by `001_core_taxonomy.sql`). |
| `elimfilters_code` | `VARCHAR(100) NOT NULL` | The SKU. Not a hard DB foreign key to `elimfilters_catalog.sku` (see Risks — pre-SKU drafts must be representable before a SKU exists); enforced by application-layer check when `is_pre_sku_draft = FALSE`. |
| `is_pre_sku_draft` | `BOOLEAN NOT NULL DEFAULT FALSE` | Per ADR-0003. |
| `base_code` | `VARCHAR(100)` | |
| `base_brand` | `VARCHAR(100)` | |
| `product_category` | `VARCHAR(100) NOT NULL` | |
| `product_subtype` | `VARCHAR(100) NOT NULL` | |
| `duty` | `VARCHAR(20) NOT NULL` | `CHECK (duty IN ('HEAVY_DUTY','LIGHT_DUTY'))`. |
| `technology_code` | `TEXT` | `REFERENCES technologies(code)`. |
| `engineering_revision` | `INTEGER NOT NULL` | Starts at 1; increments per new revision in a lineage. |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'DRAFT'` | `CHECK (status IN ('DRAFT','ACTIVE','SUPERSEDED','RETIRED'))`. |
| `supersedes_passport_id` | `UUID REFERENCES ebp_engineering_passports(id)` | Nullable; the prior revision this one replaces. |
| `created_by` | `TEXT NOT NULL` | |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | |
| `activated_at` | `TIMESTAMPTZ` | |
| `superseded_at` | `TIMESTAMPTZ` | |

Constraints: `UNIQUE (elimfilters_code, engineering_revision)`; a partial
unique index enforces **at most one `ACTIVE` revision per
`elimfilters_code`** at the database level:
`CREATE UNIQUE INDEX ... ON ebp_engineering_passports(elimfilters_code)
WHERE status = 'ACTIVE'`.

### 2. Required Engineering — `ebp_passport_engineering`

One row, 1:1 with a passport revision (`passport_id PRIMARY KEY
REFERENCES ebp_engineering_passports(id) ON DELETE CASCADE`).

| Field | Type |
|---|---|
| `dimensions_tolerances` | `JSONB NOT NULL DEFAULT '{}'` (structured, e.g. `{"outer_diameter_mm": {"nominal": 93, "tolerance": 0.5}}` — dimension sets vary too widely by filter type for fixed columns, same rationale `elimfilters_catalog` already uses JSONB for open-ended fields) |
| `thread_spec` | `VARCHAR(100)` |
| `required_media` | `VARCHAR(200)` |
| `required_media_composition` | `TEXT` |
| `minimum_efficiency` | `NUMERIC(6,3)` |
| `efficiency_particle_size_basis` | `VARCHAR(100)` |
| `beta_ratio` | `VARCHAR(100)` |
| `micron_rating` | `NUMERIC(6,2)` |
| `required_adhesive` | `VARCHAR(200)` |
| `operating_temp_min_c` | `NUMERIC(6,2)` |
| `operating_temp_max_c` | `NUMERIC(6,2)` |
| `collapse_pressure_kpa` | `NUMERIC(8,2)` |
| `burst_pressure_kpa` | `NUMERIC(8,2)` |
| `gasket_material` | `VARCHAR(200)` |
| `center_tube_spec` | `VARCHAR(200)` |
| `end_caps_spec` | `VARCHAR(200)` |
| `bypass_valve_applicability` | `VARCHAR(20) NOT NULL DEFAULT 'NOT_APPLICABLE'` `CHECK (IN ('REQUIRED','NOT_APPLICABLE'))` |
| `bypass_opening_pressure_kpa` | `NUMERIC(8,2)` |
| `bypass_pressure_tolerance_pct` | `NUMERIC(5,2)` |
| `bypass_valve_type` | `VARCHAR(100)` |
| `bypass_valve_material` | `VARCHAR(200)` |
| `antidrainback_valve_applicability` | `VARCHAR(20) NOT NULL DEFAULT 'NOT_APPLICABLE'` `CHECK (IN ('REQUIRED','NOT_APPLICABLE'))` |
| `antidrainback_valve_material` | `VARCHAR(200)` |
| `required_test_standards` | `JSONB NOT NULL DEFAULT '[]'` (array of `{"code": "ISO 16889", "scope": "..."}`) |
| `field_applicability` | `JSONB NOT NULL DEFAULT '{}'` — per-scalar-field `REQUIRED`/`NOT_APPLICABLE` marker, populated from `ebp_field_applicability_matrix` at creation and overridable by engineering (implements the "explicit `NOT_APPLICABLE`, never a silent null" rule) |
| `manufacturer_instruction_notes` | `TEXT` |
| `internal_engineering_notes` | `TEXT` |
| `created_at`, `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` |

### 3. Required Packaging — `ebp_passport_packaging`

One row, 1:1 with a passport revision. Holds **only** ELIMFILTERS'
requirements (ADR-0008; §3.1.A of `BUSINESS_RULES.md`):

| Field | Type |
|---|---|
| `passport_id` | `UUID PRIMARY KEY REFERENCES ebp_engineering_passports(id) ON DELETE CASCADE` |
| `packaging_class` | `VARCHAR(20) NOT NULL` `CHECK (IN ('AUTOMOTIVE','INDUSTRIAL'))` |
| `individual_box_required` | `BOOLEAN NOT NULL` |
| `protective_bag_required` | `BOOLEAN NOT NULL DEFAULT FALSE` |
| `separator_required` | `BOOLEAN NOT NULL DEFAULT FALSE` |
| `master_carton_required` | `BOOLEAN NOT NULL DEFAULT TRUE` |
| `elimfilters_target_quantity` | `INTEGER NOT NULL` `CHECK (> 0)` |
| `target_dimensions` | `JSONB` (nullable) |
| `packaging_instructions` | `TEXT` |
| `created_at`, `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` |

`manufacturer_recommended_quantity` and `elimfilters_approved_quantity`
are never columns here — see ADR-0008.

### 4. Field Applicability Matrix — `ebp_field_applicability_matrix`

Global lookup, not versioned per-passport:

| Field | Type |
|---|---|
| `id` | `SERIAL PK` |
| `product_category` | `VARCHAR(100) NOT NULL` |
| `product_subtype` | `VARCHAR(100) NOT NULL` |
| `field_name` | `VARCHAR(100) NOT NULL` |
| `applicability` | `VARCHAR(20) NOT NULL` `CHECK (IN ('REQUIRED','NOT_APPLICABLE'))` |
| `notes` | `TEXT` |

`UNIQUE (product_category, product_subtype, field_name)`.

### 5. Status History — `ebp_passport_status_history`

Append-only audit log: `id SERIAL PK`, `passport_id UUID NOT NULL
REFERENCES ebp_engineering_passports(id) ON DELETE CASCADE`,
`from_status`, `to_status NOT NULL`, `changed_by NOT NULL`, `changed_at
TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `reason TEXT`.

## Passport Lifecycle

`DRAFT` → `ACTIVE` → (`SUPERSEDED` by a new revision's activation) |
`RETIRED`. Every transition is written to `ebp_passport_status_history` in
the same transaction as the status change.

1. **Create** — `POST /api/ebp/passports` creates revision 1 in `DRAFT`.
2. **Revise** — `POST /api/ebp/passports/:elimfilters_code/revisions`
   creates a new `DRAFT` revision (`engineering_revision` + 1,
   `supersedes_passport_id` = current `ACTIVE` row's id, if any).
3. **Activate** — `POST /api/ebp/passports/:id/activate` moves a `DRAFT`
   revision to `ACTIVE`, and — in the same transaction — moves the prior
   `ACTIVE` revision for that `elimfilters_code` (if any) to `SUPERSEDED`.
   This is the same "atomic supersession" discipline flagged as a risk for
   Offer versioning (Phase 3) and is enforced here via a single SQL
   transaction, not two separate writes.
4. **Retire** — `POST /api/ebp/passports/:id/retire` moves an `ACTIVE` or
   `SUPERSEDED` revision to `RETIRED` (a product being discontinued).

## Internal API Surface (implemented, `requireAdmin`-gated)

- `POST /api/ebp/passports` — create Passport revision 1 (`DRAFT`).
- `GET /api/ebp/passports/:elimfilters_code` — current `ACTIVE` revision
  (falls back to latest `DRAFT` if none is `ACTIVE` yet), internal DTO.
- `GET /api/ebp/passports/:elimfilters_code/revisions` — list all
  revisions (history).
- `GET /api/ebp/passports/:elimfilters_code/revisions/:revision` — a
  specific revision, internal DTO.
- `POST /api/ebp/passports/:elimfilters_code/revisions` — create a new
  `DRAFT` revision.
- `POST /api/ebp/passports/:id/activate` — `DRAFT` → `ACTIVE` (atomic
  supersession).
- `POST /api/ebp/passports/:id/retire` — → `RETIRED`.
- `GET /api/ebp/passports/applicability-matrix` — query the applicability
  matrix by `product_category`/`product_subtype`.

All ten endpoints are internal-only in Phase 1 (`requireAdmin`). No
Manufacturer- or Distributor-facing endpoint is stood up in this phase —
those belong to Phases 3 and 8 and depend on the still-undecided
Manufacturer/Distributor auth (ADR-0002).

## Permissions

- All Phase 1 endpoints require the existing `requireAdmin` bearer-token
  check — the same mechanism already gating every import/admin endpoint
  in `server.js`. No new auth mechanism is introduced.
- Read access to `manufacturer_instruction_notes` and
  `internal_engineering_notes` is not endpoint-differentiated in Phase 1
  (both are internal-only, since no Manufacturer-facing endpoint exists
  yet) — the DTO-level distinction (§ DTOs below) exists so Phase 3 can
  adopt the manufacturer-facing projection without redesigning it, not
  because Phase 1 itself exposes notes externally.

## Validation Rules (implemented as pure functions, unit-tested)

- **Locked identification:** `elimfilters_code` non-empty;
  `product_category`/`product_subtype` non-empty; `duty` ∈
  `{HEAVY_DUTY, LIGHT_DUTY}`; if `is_pre_sku_draft = false`, the SKU must
  exist in `elimfilters_catalog` (checked at the DB layer at create time,
  not merely at the pure-function layer).
- **Required engineering completeness:** for every field the applicability
  matrix marks `REQUIRED` for this Passport's
  `(product_category, product_subtype)`, the corresponding value must be
  present and non-null; for every field marked `NOT_APPLICABLE`, the
  `field_applicability` entry must say so explicitly — a field is never
  silently null. `bypass_valve_applicability` and
  `antidrainback_valve_applicability` are validated directly as columns;
  all other scalar fields are validated via the generic
  `field_applicability` map.
- **Required packaging:** `elimfilters_target_quantity` > 0;
  `packaging_class` ∈ `{AUTOMOTIVE, INDUSTRIAL}`; automotive defaults
  (`individual_box_required = true`, `master_carton_required = true`)
  and industrial defaults (`individual_box_required = false`) applied
  when not explicitly overridden, per `BUSINESS_RULES.md` §3.1.

## Role-Scoped DTOs (pure functions, reusable by later phases)

- `toInternalPassportDTO(row)` — full record, including
  `internal_engineering_notes` and `manufacturer_instruction_notes`. Used
  by all Phase 1 endpoints.
- `toManufacturerPassportDTO(row)` — identification + required engineering
  + required packaging + `manufacturer_instruction_notes`; **excludes**
  `internal_engineering_notes` unconditionally. Not wired to a live
  endpoint in Phase 1 — Phase 3 is responsible for checking that the
  calling Manufacturer was actually sent this Passport before calling this
  projection at all (ADR-0009's visibility rule is an eligibility check
  Phase 3 owns; this DTO only guarantees the *shape* is safe once that
  check has passed).
- `toDistributorPassportDTO(row)` — locked identification fields only
  (`elimfilters_code`, `product_category`, `product_subtype`, `duty`,
  `technology_code`); excludes all engineering detail, both note fields,
  and packaging detail. Not wired to a live endpoint in Phase 1 — Phase 8
  composes distributor-visible data primarily from Pricing Engine's output
  (Phase 7), per `BUSINESS_RULES.md` §11, with this projection available
  for whatever minimal identification passthrough Phase 8 needs.

## Field Applicability Matrix — Seed Dataset (flagged for engineering review)

Seeded via `migrations/ebp-phase1/002_seed_applicability_matrix.sql` for a
representative starting set of `(product_category, product_subtype)`
pairs. **This is a reasonable starting point grounded in general
filtration engineering practice, not an ELIMFILTERS-engineering-reviewed
authority** — see Risks.

| product_category | product_subtype | bypass_valve | antidrainback_valve | beta_ratio | micron_rating |
|---|---|---|---|---|---|
| OIL | SPIN_ON | REQUIRED | REQUIRED | REQUIRED | REQUIRED |
| OIL | CARTRIDGE | REQUIRED | NOT_APPLICABLE | REQUIRED | REQUIRED |
| FUEL | SPIN_ON | NOT_APPLICABLE | NOT_APPLICABLE | REQUIRED | REQUIRED |
| FUEL | WATER_SEPARATOR | NOT_APPLICABLE | NOT_APPLICABLE | REQUIRED | REQUIRED |
| AIR | PANEL | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE |
| AIR | RADIAL_SEAL | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE |
| HYDRAULIC | SPIN_ON | REQUIRED | NOT_APPLICABLE | REQUIRED | REQUIRED |
| HYDRAULIC | CARTRIDGE | REQUIRED | NOT_APPLICABLE | REQUIRED | REQUIRED |
| CABIN | PARTICULATE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE |
| CABIN | COMBINATION | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE |

Any `(product_category, product_subtype)` not in this seed set has no
matrix rows; creating a Passport for such a pair requires an explicit
`field_applicability` override at creation time (the API rejects a
Passport with unresolved applicability for `bypass_valve_applicability`/
`antidrainback_valve_applicability` if neither the matrix nor an explicit
override supplies a value).

## Business Rules Enforced

- `BUSINESS_RULES.md` §2 (SKU rules inherited, no invented/duplicated
  SKUs), §3 (Passport rules and packaging rules in full), and §1
  (vocabulary — Passport is the requirement, not the public catalog
  description, and not a Manufacturer's Offer).
- ADR-0003 (SKU identity reuse; draft/pre-SKU state).
- ADR-0005 (no Supplier/BOM-mapping entity; required fields answered
  directly by a Manufacturer Offer).
- ADR-0008 (packaging data ownership split — the Passport holds only
  ELIMFILTERS' requirement fields).
- ADR-0009 (note-field split — `manufacturer_instruction_notes` vs.
  `internal_engineering_notes`, each behind its own role-specific
  projection).

## Integration Points

- Reads existing SKU catalog (`elimfilters_catalog`) and `technologies`
  table.
- Written to by: internal ELIMFILTERS engineering staff, via
  `requireAdmin`-gated endpoints (see "Decisions Made at Implementation").
- Read by: Phase 2 (family qualification), Phase 3 (a Manufacturer Offer
  is structured as one `offered_*`/`actual_*` answer per applicable
  `required_*` field here, via `toManufacturerPassportDTO`), Phase 4
  (compliance validation compares `required_*` here against `offered_*` on
  a specific Offer revision), Phase 8 (catalog display to distributors,
  via Pricing Engine's output which references Passport identification
  only, via `toDistributorPassportDTO` — never either note field or the
  required-packaging detail).

## Deliverables

- [x] Passport data model across all three field groups (identification,
  engineering, packaging), plus the applicability matrix and status
  history tables — implemented as real, executable SQL migrations.
- [x] Internal API surface — implemented and gated by `requireAdmin`.
- [x] Versioning/history mechanism — implemented (`engineering_revision`,
  atomic activation/supersession, partial unique index).
- [x] Draft/pre-SKU workflow — implemented (`is_pre_sku_draft` flag,
  application-layer SKU-existence check bypassed when true).
- [x] Role-scoped DTOs — implemented as pure functions (internal wired to
  live endpoints; Manufacturer/Distributor projections implemented and
  unit-tested but not yet wired to a live endpoint, per scope).

## Exit Criteria

- [x] A Passport can be created, versioned, and retrieved for at least one
  real existing SKU from each duty class (HD and LD) as a proof of model,
  without contradicting existing catalog data — verified against a real
  local Postgres instance running the actual migration (see the Phase 1
  closing report for the exact SKUs/results).
- [x] Every required engineering field has an explicit value or an
  explicit `NOT_APPLICABLE` marker — no silent nulls — enforced by the
  validation layer and covered by tests.
- [x] Phase 2 and Phase 3 specs can reference this Passport model without
  gaps, and Phase 3's Offer structure can be built as a strict
  `offered_*`-per-`required_*` mirror of this model — the field list in
  `ebp_passport_engineering` is the authoritative mirror target.
- [x] Activation atomically supersedes the prior `ACTIVE` revision — no
  window exists where zero or two revisions are `ACTIVE` for the same SKU
  — enforced by the partial unique index and a single-transaction
  activation endpoint, and covered by a regression test.

## Risks

- **Risk: applicability matrix seed data is not ELIMFILTERS-engineering-
  reviewed.** The seed dataset above is a defensible starting point, not
  an authoritative one. Using Phase 1 for real production Passports before
  ELIMFILTERS engineering reviews and corrects this matrix risks
  incorrect `REQUIRED`/`NOT_APPLICABLE` markers reaching Phase 3/4. The
  matrix is a normal, editable table specifically so this correction can
  happen without a schema change — but the correction itself has not
  happened and must before real sourcing decisions depend on it.
- **Risk: draft/pre-SKU products could accidentally leak into
  distributor-visible surfaces** if Phase 8 doesn't strictly filter by
  Passport status. Mitigated by `BUSINESS_RULES.md` §11 (distributor
  visibility requires `VALID` + priced), but worth flagging explicitly here
  since Passport is the root of that chain.
- **Risk: note-field exposure across roles.** Because
  `manufacturer_instruction_notes` and `internal_engineering_notes` live on
  the same Passport engineering record as public-safe identification
  fields, any integration that naively serializes "the Passport" instead
  of a role-specific, reviewed projection risks leaking `internal_
  engineering_notes` to a Manufacturer, or either field to a Distributor.
  Phase 1 addresses this at the DTO layer (three separate, tested
  projection functions); Phase 3/8 must actually call the correct one —
  this is a discipline risk for those phases, not something Phase 1 alone
  can fully close.
- **Risk: `elimfilters_code` has no hard database foreign key** to
  `elimfilters_catalog.sku`, by design (to allow pre-SKU drafts). This
  trades referential-integrity enforcement at the DB level for draft
  flexibility; the application-layer check is real but is not as strong a
  guarantee as a DB constraint. Acceptable for Phase 1's scope, flagged
  for awareness in any future phase that queries `ebp_engineering_
  passports` directly instead of through the validated API.

## Open Questions

- Both open questions from the original draft (data-entry actor;
  applicability matrix mechanism) are **resolved** — see "Decisions Made
  at Implementation" above.
- **New:** should the applicability matrix support a third value
  (`CONDITIONALLY_REQUIRED`, e.g. "required only above a certain flow
  rate") beyond the current binary `REQUIRED`/`NOT_APPLICABLE`? Not needed
  for Phase 1's exit criteria, but likely relevant once ELIMFILTERS
  engineering reviews the seed data — flagged for Phase 1 follow-up or
  Phase 4's spec approval, whichever comes first.
