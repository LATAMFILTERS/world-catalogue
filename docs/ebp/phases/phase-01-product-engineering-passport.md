# Phase 01 — Product Engineering Passport (PEP)

**Status:** Spec Drafted (revised, correction round 2026-07-13 — not
approved; no implementation authorized)
**Depends on:** Phase 00
**Blocks:** Phases 02, 03, 04, 08

**Correction notice (first round):** This revision replaces the original
draft's generic "bill-of-materials category" concept (which implied a
Supplier tier) with the agreed model: the Passport carries **locked,
ELIMFILTERS-owned `required_*` engineering fields** directly. A
Manufacturer answers those fields with its own `offered_*`/`actual_*`
values on a **Manufacturer Product Offer** (Phase 3) — there is no
intermediate Supplier or BOM-mapping entity. See ADR-0005 in
`DECISIONS.md`.

**Correction notice (second round, this revision):** Required packaging
(§3 below) no longer includes `manufacturer_recommended_quantity` or
`elimfilters_approved_quantity` — neither belongs on the Passport. Both
move to Phase 3 (the Manufacturer's proposal) and the new Offer Approval
entity (ELIMFILTERS' final decision), respectively. See ADR-0008. The
single "confidential manufacturing notes" field is replaced with two
separately scoped fields, `manufacturer_instruction_notes` and
`internal_engineering_notes`. See ADR-0009.

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
  the prior one).
- Draft/pre-SKU handling for products in engineering review before a SKU
  exists (see ADR-0003).
- Read/write API surface for Passport records (`/api/ebp/passports`, per
  `PLATFORM_ARCHITECTURE.md` §5 — directional, finalized at spec approval).

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

## Dependencies

- Existing SKU architecture and duty classification (root `CLAUDE.md`).
- Existing `technologies` table (technology assignment must reference it,
  not duplicate it).

## Key Entities / Data Model

### 1. Locked Identification (`ebp_engineering_passports`, immutable/locked fields)

| Field | Description |
|---|---|
| `elimfilters_code` | The SKU. Immutable once set. References the existing SKU architecture (root `CLAUDE.md`) or a flagged pre-SKU draft reference. |
| `base_code` | The underlying base part number the SKU derives from (e.g., the stripped MANN/Donaldson code per the existing SKU generation rules). |
| `base_brand` | The reference brand the `base_code` originates from (e.g., MANN, Donaldson) — informational lineage, not a Manufacturer. |
| `product_category` | Top-level filter category (Oil, Air, Fuel, Hydraulic, Cabin, Coolant, etc.). |
| `product_subtype` | Sub-classification within the category (e.g., spin-on vs. cartridge oil filter). |
| `duty` | `HEAVY_DUTY` / `LIGHT_DUTY`, inherited unchanged from root `CLAUDE.md`. |
| `technology_code` | Reference to the existing `technologies.code` (e.g., SYNTRAX, MACROCORE) — not duplicated, referenced. |
| `engineering_revision` | Monotonically increasing version identifier for this Passport. |
| `status` | `DRAFT` / `ACTIVE` / `SUPERSEDED` / `RETIRED`. |

### 2. Required Engineering (`ebp_passport_engineering`, one row per Passport version, all `required_*`)

All fields below are **locked, ELIMFILTERS-defined, and never editable by a
Manufacturer**. A Manufacturer answers each applicable one with a
corresponding `offered_*`/`actual_*` value on its Offer (Phase 3), never by
editing the Passport.

- Dimensions and tolerances
- Thread specification
- Required filter media
- Required media composition
- Minimum efficiency
- Particle size basis of the stated efficiency
- Beta Ratio and micron rating, when applicable
- Required adhesive
- Operating temperature (range/limits)
- Collapse pressure
- Burst pressure
- Gasket material
- Center tube (spec/material, when applicable)
- End caps (spec/material)
- Bypass valve: required or not applicable
- Bypass valve opening pressure and tolerance, when required
- Bypass valve type and material, when required
- Anti-drainback valve: required or not applicable
- Anti-drainback valve material, when required
- Required test standards (ISO/SAE/ASTM codes)

Two separately scoped note fields (ADR-0009) — never a single
undifferentiated "confidential manufacturing notes" field:

- `manufacturer_instruction_notes` — technical instructions a plant needs
  to quote or produce correctly. Visible only to a Manufacturer that has
  actually been sent this Passport in a Request Batch (Phase 3), and to
  authorized ELIMFILTERS staff. Never surfaced to Distributor Portal or the
  public.
- `internal_engineering_notes` — ELIMFILTERS-internal information. Never
  visible to any Manufacturer or Distributor; authorized internal roles
  only.

No API may return a generic serialization of "the Passport" that includes
either note field by default — each consumer (Manufacturer Intake Portal,
internal engineering tooling, Distributor/Pricing-facing surfaces) must be
served from its own explicit, reviewed projection/DTO.

A field marked "not applicable" for a given product subtype is recorded
explicitly as `NOT_APPLICABLE`, not left null — Engineering Compliance
Validation (Phase 4) must be able to distinguish "not required" from
"required but unanswered."

### 3. Required Packaging (`ebp_passport_packaging`, one row per Passport version)

Per `BUSINESS_RULES.md` §3.1, this table holds **only ELIMFILTERS'
requirements** — never a Manufacturer's proposal or ELIMFILTERS' final
approved decision (ADR-0008):

- `individual_box_required`
- `protective_bag_required`
- `separator_required`
- `master_carton_required`
- `elimfilters_target_quantity`
- target dimensions or restrictions, when they exist
- ELIMFILTERS-required packaging instructions

Automotive/industrial defaults:

- **Automotive:** `individual_box_required` default true, protective bag
  when applicable, master carton always required.
- **Industrial:** `individual_box_required` default false, bag/separator/
  protection when applicable, master box target quantity normally 6, 12,
  or 24.

`manufacturer_recommended_quantity` (a Manufacturer's own proposal,
per-Offer) and `elimfilters_approved_quantity` (ELIMFILTERS' final
decision after review) are **not** Passport fields. They live on the
Manufacturer Product Offer and on the new Offer Approval entity
(`ebp_manufacturer_offer_approvals`), respectively — see Phase 3 and
`BUSINESS_RULES.md` §3.1.B-C.

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

- Reads existing SKU catalog and `technologies` table.
- Written to by: engineering data entry (mechanism TBD at spec-approval
  time — could be admin-key-gated initially, consistent with existing
  `requireAdmin` pattern, pending a decision at approval).
- Read by: Phase 2 (family qualification), Phase 3 (a Manufacturer Offer is
  structured as one `offered_*`/`actual_*` answer per applicable
  `required_*` field here, and a Manufacturer's read access is limited to
  Passports it was actually sent, seeing `manufacturer_instruction_notes`
  but never `internal_engineering_notes`), Phase 4 (compliance validation
  compares `required_*` here against `offered_*` on a specific Offer
  revision), Phase 8 (catalog display to distributors, via Pricing
  Engine's output which references Passport identification only — never
  either note field or the required-packaging detail).

## Deliverables

- Approved Passport data model across all three field groups (identification,
  engineering, packaging).
- Approved API surface.
- Versioning/history mechanism defined (`engineering_revision`).
- Draft/pre-SKU workflow defined (how a product moves from draft to a real
  SKU once minted by the existing SKU rules).

## Exit Criteria

- A Passport can be created, versioned, and retrieved for at least one real
  existing SKU from each duty class (HD and LD) as a proof of model,
  without contradicting existing catalog data.
- Every required engineering field has an explicit value or an explicit
  `NOT_APPLICABLE` marker — no silent nulls.
- Phase 2 and Phase 3 specs can reference this Passport model without
  gaps, and Phase 3's Offer structure can be built as a strict
  `offered_*`-per-`required_*` mirror of this model.

## Risks

- **Risk: required-field applicability varies by filter type** (air vs.
  hydraulic vs. cabin — e.g., bypass valve fields are meaningless for a
  cabin filter). The `NOT_APPLICABLE` convention above addresses this, but
  the actual per-subtype applicability matrix (which fields apply to which
  `product_subtype`) still needs to be defined at spec approval, not left
  implicit.
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
  Phase 3/7/8 specs must treat both as named fields to explicitly exclude
  per role, not rely on obscurity (ADR-0009).

## Open Questions

- Who is the actual data entry actor for Passports — an internal
  engineering team via an admin tool, or an import from an external PLM/
  spec source? This materially affects the API surface and is not decided
  in Phase 0.
- What is the complete per-`product_subtype` applicability matrix for the
  required engineering fields (which subtypes require bypass/anti-
  drainback fields, etc.)? Needed before Phase 1's spec can be marked
  `Spec Approved`.
- **Resolved this round:** whether a Manufacturer sees "confidential
  manufacturing notes" — it now sees `manufacturer_instruction_notes` only,
  scoped to Passports actually sent to it, and never `internal_engineering_
  notes` (ADR-0009). See Phase 3's own open questions list, previously
  carrying this as unresolved.
