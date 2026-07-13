# Phase 02 — Manufacturer Registry

**Status:** Spec Drafted (not approved — no implementation authorized)
**Depends on:** Phase 01
**Blocks:** Phases 04, 05, 06

## Objective

Register and track the physical manufacturing partners qualified to produce
ELIMFILTERS-branded SKUs, and what product families each is qualified for.

## Scope

**In scope:**
- Manufacturer identity: legal entity, location(s)/region(s), contact of
  record.
- Qualification: which product families (by filter type/duty, referencing
  the Passport taxonomy from Phase 1) a Manufacturer is approved to
  produce, and at what qualification status.
- Status lifecycle: `CANDIDATE` → `QUALIFIED` → `SUSPENDED`/`RETIRED`, with
  logged status-change history (who, when, why).
- Manufacturer capacity/lead-time attributes needed by Phase 5 (Selection)
  and Phase 6 (Cost) — e.g., typical lead time by family, capacity
  ceiling, region served.

**Out of scope:**
- What raw materials/components the Manufacturer sources and from whom
  (Phase 3).
- Whether a specific Passport × Manufacturer combination is actually valid
  (Phase 4 — Registry only records *category*-level qualification, not
  per-SKU validation).
- Cost figures (Phase 6).

## Dependencies

- Phase 1 Passport product-family taxonomy — Registry's qualified-families
  field must be a subset of that taxonomy (`BUSINESS_RULES.md` §3).

## Key Entities / Data Model (sketch, not final)

- `ebp_manufacturers` — `legal_name`, `regions`, `status`, `status_reason`,
  `status_changed_at`, `created_at`.
- `ebp_manufacturer_qualifications` — join: manufacturer ↔ product family
  (referencing Phase 1 taxonomy), with its own status and lead-time/
  capacity attributes.
- `ebp_manufacturer_status_history` — append-only log of status
  transitions (auditability, `BUSINESS_RULES.md` §3).

## Business Rules Enforced

- `BUSINESS_RULES.md` §3 in full (qualification status gating, family
  taxonomy alignment, audit logging of status changes).
- `PLATFORM_ARCHITECTURE.md` §6 (auditability — status never silently
  overwritten).

## Integration Points

- Reads Phase 1 Passport family taxonomy.
- Read by: Phase 4 (validation checks manufacturer is `QUALIFIED` for the
  Passport's family), Phase 5 (selection candidates must be `QUALIFIED`),
  Phase 6 (cost inputs reference manufacturer conversion cost/region).

## Deliverables

- Approved Manufacturer + Qualification data model.
- Approved status lifecycle and audit-log mechanism.
- Approved API surface (`/api/ebp/manufacturers`).

## Exit Criteria

- A Manufacturer can be registered, qualified for at least one Phase-1
  product family, and have its status changed with a retained history
  entry.
- Phase 4's spec can reference "is this Manufacturer QUALIFIED for this
  Passport's family" as a concrete, answerable query against this model.

## Risks

- **Risk: family taxonomy mismatch.** If Phase 1's product-family
  granularity doesn't match how manufacturers actually specialize (e.g., a
  manufacturer qualified for "HD Air" broadly vs. only specific
  dimensional ranges within it), qualification records could be
  misleadingly coarse. Needs explicit resolution at spec approval —
  possibly qualifications need a dimensional/spec sub-scope, not just a
  family code.
- **Risk: single-manufacturer families.** Early on, some families may have
  exactly one qualified manufacturer, which makes Phase 5 (Selection)
  trivial for those families but risks masking Selection logic bugs until
  a second manufacturer is onboarded. Worth a deliberate test case in
  Phase 5.

## Open Questions

- Does Manufacturer onboarding require a workflow/approval process of its
  own (e.g., an audit or certification step before `CANDIDATE` →
  `QUALIFIED`), or is that entirely external to EBP and just recorded here
  after the fact? Not decided in Phase 0.
