# Phase 01 — Product Engineering Passport (PEP)

**Status:** Spec Drafted (not approved — no implementation authorized)
**Depends on:** Phase 00
**Blocks:** Phases 02, 03, 04, 08

## Objective

Define the canonical technical specification record for a SKU or product
family — the single source of truth every later EBP module (Manufacturer
Registry, Supplier Portal, Validation Engine, Cost/Pricing Engines,
Distributor Portal) reads from when it needs to know "what is this product."

## Scope

**In scope:**
- Data model for a Passport: identity (SKU or draft pre-SKU reference),
  duty classification (HD/LD, inherited), filter type, dimensions and
  tolerances, media specification, performance targets (e.g., Beta ratio,
  efficiency at micron rating, dirt-holding capacity), applicable standards
  (ISO/SAE/ASTM codes), assigned ELIMFILTERS technology (MACROCORE,
  SYNTRAX, etc., per `techPagesData.ts` as the authoritative technology
  source), bill-of-materials category list (what component/material
  categories this product requires — not specific suppliers, that's Phase
  3's concern).
- Passport versioning (a Passport changes over time; history must be
  retrievable).
- Draft/pre-SKU handling for products in engineering review before a SKU
  exists (see ADR-0003).
- Read/write API surface for Passport records (`/api/ebp/passports`, per
  `PLATFORM_ARCHITECTURE.md` §5 — directional, finalized at spec approval).

**Out of scope:**
- Who can manufacture it (Phase 2).
- What it costs or sells for (Phases 6-7).
- Public-facing display of Passport data on `frontend/` (not part of the
  EBP roadmap; if ever pursued, it's a separate integration decision, not a
  Phase 1 deliverable).

## Dependencies

- Existing SKU architecture and duty classification (root `CLAUDE.md`).
- Existing `technologies` table (technology assignment must reference it,
  not duplicate it).

## Key Entities / Data Model (sketch, not final)

- `ebp_engineering_passports` — one row per Passport version:
  `sku_or_draft_ref`, `duty`, `filter_type`, `version`, `status`
  (`DRAFT`/`ACTIVE`/`SUPERSEDED`/`RETIRED`), `dimensions` (structured),
  `media_spec`, `performance_targets` (structured), `technology_code`
  (FK-equivalent reference to existing `technologies.code`), `created_at`,
  `superseded_by`.
- `ebp_passport_standards` — join table: Passport version ↔ standard code
  (ISO/SAE/ASTM).
- `ebp_passport_bom_categories` — join table: Passport version ↔ required
  component/material category (consumed by Phase 3/4).

## Business Rules Enforced

- `BUSINESS_RULES.md` §2 (SKU rules inherited, no invented/duplicated
  SKUs) and §1 (vocabulary — Passport is not the public catalog
  description).
- ADR-0003 (SKU identity reuse; draft/pre-SKU state).

## Integration Points

- Reads existing SKU catalog and `technologies` table.
- Written to by: engineering data entry (mechanism TBD at spec-approval
  time — could be admin-key-gated initially, consistent with existing
  `requireAdmin` pattern, pending a decision at approval).
- Read by: Phase 2 (family qualification), Phase 3 (BOM categories), Phase
  4 (validation), Phase 8 (catalog display to distributors, via Pricing
  Engine's output which references Passport).

## Deliverables

- Approved Passport data model.
- Approved API surface.
- Versioning/history mechanism defined.
- Draft/pre-SKU workflow defined (how a product moves from draft to a real
  SKU once minted by the existing SKU rules).

## Exit Criteria

- A Passport can be created, versioned, and retrieved for at least one real
  existing SKU from each duty class (HD and LD) as a proof of model,
  without contradicting existing catalog data.
- Phase 2 and Phase 3 specs can reference this Passport model without
  gaps.

## Risks

- **Risk: performance target structure varies significantly by filter
  type** (air vs. hydraulic vs. cabin), which could force an
  overly-generic or overly-fragmented schema. Needs resolution at spec
  approval, likely via a structured JSON field with per-filter-type
  validation rather than fully normalized columns.
- **Risk: draft/pre-SKU products could accidentally leak into
  distributor-visible surfaces** if Phase 8 doesn't strictly filter by
  Passport status. Mitigated by `BUSINESS_RULES.md` §9 (distributor
  visibility requires `VALID` + priced), but worth flagging explicitly here
  since Passport is the root of that chain.

## Open Questions

- Who is the actual data entry actor for Passports — an internal
  engineering team via an admin tool, or an import from an external PLM/
  spec source? This materially affects the API surface and is not decided
  in Phase 0.
