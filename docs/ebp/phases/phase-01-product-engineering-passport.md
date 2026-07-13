# Phase 01 — Product Engineering Passport (PEP)

**Status:** Spec Drafted (revised, correction round 2026-07-13 — not
approved; no implementation authorized)
**Depends on:** Phase 00
**Blocks:** Phases 02, 03, 04, 08

**Correction notice:** This revision replaces the original draft's generic
"bill-of-materials category" concept (which implied a Supplier tier) with
the agreed model: the Passport carries **locked, ELIMFILTERS-owned
`required_*` engineering fields** directly. A Manufacturer answers those
fields with its own `offered_*`/`actual_*` values on a **Manufacturer
Product Offer** (Phase 3) — there is no intermediate Supplier or BOM-mapping
entity. See ADR-0005 in `DECISIONS.md`.

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
- Confidential manufacturing notes (ELIMFILTERS-internal; never surfaced to
  Distributor Portal under any circumstance, per `BUSINESS_RULES.md` §10)

A field marked "not applicable" for a given product subtype is recorded
explicitly as `NOT_APPLICABLE`, not left null — Engineering Compliance
Validation (Phase 4) must be able to distinguish "not required" from
"required but unanswered."

### 3. Required Packaging (`ebp_passport_packaging`, one row per Passport version)

Per `BUSINESS_RULES.md` §3.1:

- **Automotive:** individual box (default: yes), protective bag (when
  applicable), master box (always required).
- **Industrial:** individual box (default: no), bag/separator/protection
  (when applicable), master box target quantity (normally 6, 12, or 24).
- Three separate quantity fields, never merged:
  - `elimfilters_target_quantity` — ELIMFILTERS' requirement.
  - `manufacturer_recommended_quantity` — populated later, from the
    Manufacturer's Offer (Phase 3); read-only from Phase 1's perspective.
  - `elimfilters_approved_quantity` — ELIMFILTERS' final decision, set only
    after review of the Manufacturer's recommendation.

## Business Rules Enforced

- `BUSINESS_RULES.md` §2 (SKU rules inherited, no invented/duplicated
  SKUs), §3 (Passport rules and packaging rules in full), and §1
  (vocabulary — Passport is the requirement, not the public catalog
  description, and not a Manufacturer's Offer).
- ADR-0003 (SKU identity reuse; draft/pre-SKU state).
- ADR-0005 (no Supplier/BOM-mapping entity; required fields answered
  directly by a Manufacturer Offer).

## Integration Points

- Reads existing SKU catalog and `technologies` table.
- Written to by: engineering data entry (mechanism TBD at spec-approval
  time — could be admin-key-gated initially, consistent with existing
  `requireAdmin` pattern, pending a decision at approval).
- Read by: Phase 2 (family qualification), Phase 3 (a Manufacturer Offer is
  structured as one `offered_*`/`actual_*` answer per applicable
  `required_*` field here), Phase 4 (compliance validation compares
  `required_*` here against `offered_*` on the Offer), Phase 8 (catalog
  display to distributors, via Pricing Engine's output which references
  Passport identification only — never the confidential manufacturing
  notes).

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
  Passport status. Mitigated by `BUSINESS_RULES.md` §10 (distributor
  visibility requires `VALID` + priced), but worth flagging explicitly here
  since Passport is the root of that chain.
- **Risk: confidential manufacturing notes exposure.** Because this field
  lives on the same Passport record as public-safe identification fields,
  any Phase 8 integration that naively serializes "the Passport" instead of
  a reviewed projection risks leaking it. Phase 7/8 specs must treat this
  as a named field to explicitly exclude, not rely on obscurity.

## Open Questions

- Who is the actual data entry actor for Passports — an internal
  engineering team via an admin tool, or an import from an external PLM/
  spec source? This materially affects the API surface and is not decided
  in Phase 0.
- What is the complete per-`product_subtype` applicability matrix for the
  required engineering fields (which subtypes require bypass/anti-
  drainback fields, etc.)? Needed before Phase 1's spec can be marked
  `Spec Approved`.
