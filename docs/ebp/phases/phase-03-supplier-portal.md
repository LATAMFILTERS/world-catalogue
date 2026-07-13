# Phase 03 — Supplier Portal

**Status:** Spec Drafted (not approved — no implementation authorized)
**Depends on:** Phase 01
**Blocks:** Phase 04, 06

## Objective

Register component/material suppliers (filter media, cores, gaskets, cans,
adhesives, etc.) and the specific Manufacturer relationships they are
approved under, so the Validation Engine (Phase 4) can confirm a product's
bill of materials is actually sourceable from approved vendors.

## Scope

**In scope:**
- Supplier identity: legal entity, component/material categories supplied.
- Supplier-to-Manufacturer approval scoping: a Supplier is approved *for* a
  specific Manufacturer, not globally (`BUSINESS_RULES.md` §4).
- Mapping of supplied components/materials to the BOM categories defined
  in Phase 1 Passports (`ebp_passport_bom_categories`).
- Basic supplier attributes needed downstream: typical lead time, minimum
  order quantity, unit cost reference (consumed, not computed, by Phase 6).

**Out of scope:**
- Supplier qualification/audit workflow beyond recording approval status
  (no separate compliance-management system).
- Actual procurement/purchase-order execution (that lives conceptually
  closer to Order Management's manufacturing-side counterpart, which is
  explicitly out of scope for the current 00-09 roadmap — see
  `ROADMAP.md` "Explicitly Out of Scope").

## Dependencies

- Phase 1 Passport BOM categories — a Supplier's supplied
  components/materials must map to categories that exist in that model.
- Phase 2 Manufacturer identity — Supplier approval is scoped per
  Manufacturer, so Manufacturer records must exist first.

## Key Entities / Data Model (sketch, not final)

- `ebp_suppliers` — `legal_name`, `component_categories`, `created_at`.
- `ebp_supplier_manufacturer_approvals` — join: supplier ↔ manufacturer,
  with approval status, lead time, MOQ, reference unit cost.
- `ebp_supplier_bom_mappings` — join: supplier's supplied
  component/material ↔ Phase 1 BOM category.

## Business Rules Enforced

- `BUSINESS_RULES.md` §4 in full (scoped approval, BOM mapping requirement
  before validation eligibility).

## Integration Points

- Reads Phase 1 BOM categories, Phase 2 Manufacturer identities.
- Read by: Phase 4 (validation confirms every required BOM category has an
  approved supplier for the specific candidate Manufacturer), Phase 6
  (reference unit costs feed materials-cost component of landed cost).

## Deliverables

- Approved Supplier + Approval-scoping data model.
- Approved BOM-mapping mechanism.
- Approved API surface (`/api/ebp/suppliers`).

## Exit Criteria

- A Supplier can be registered, scoped to at least one Manufacturer from
  Phase 2, and mapped to at least one BOM category from a Phase 1
  Passport, such that Phase 4's validation query ("does every required BOM
  category for this Passport × Manufacturer have an approved Supplier
  mapping") is answerable.

## Risks

- **Risk: reference unit cost staleness.** Supplier-provided reference
  costs will drift from real negotiated costs over time; if Cost Engine
  (Phase 6) treats them as authoritative rather than a fallback/reference,
  cost accuracy degrades silently. Phase 6's spec should clarify whether
  Supplier reference cost is a default, an input requiring
  confirmation, or purely informational.
- **Risk: many-to-many explosion.** Supplier × Manufacturer × BOM category
  is a three-way relationship; without careful indexing/design this could
  become the most complex join in the Validation Engine's hot path. Worth
  a performance note carried into Phase 4.

## Open Questions

- Is there an existing supplier list (even informal) from current
  ELIMFILTERS manufacturing operations that should seed this registry, or
  does Phase 3 start from zero records? Not established in Phase 0.
