# Phase 02 — Manufacturer Registry

**Status:** Spec Drafted (revised, correction round 2026-07-13 — not
approved; no implementation authorized)
**Depends on:** Phase 01
**Blocks:** Phases 03, 04, 05, 06

**Correction notice:** This revision adds the permanent confidential
`EFM-XXXX` manufacturer code as the functional key (replacing any implicit
use of `legal_name`), adds the `CONDITIONAL` status value, and makes
explicit that a Manufacturer is the factory producing the *finished*
filter — not a raw-material vendor. See ADR-0006 in `DECISIONS.md`.

## Objective

Register and track the physical manufacturing partners qualified to produce
ELIMFILTERS-branded SKUs, and what product families each is qualified for,
under a permanent confidential identity that is never exposed downstream to
a Distributor.

## Scope

**In scope:**
- Manufacturer identity: internal database identifier, permanent
  confidential `manufacturer_code` (`EFM-XXXX`, assigned once at
  registration, never reassigned or reused), legal name, location(s)/
  region(s), contacts, certifications.
- Qualification: which product families (by filter type/duty, referencing
  the Passport taxonomy from Phase 1) a Manufacturer is approved to
  produce, and at what qualification status.
- Status lifecycle: `CANDIDATE` → `QUALIFIED` / `CONDITIONAL` →
  `SUSPENDED`/`RETIRED`, with logged status-change history (who, when,
  why). `CONDITIONAL` means qualified subject to a specific, recorded
  condition (e.g., pending a specific certification renewal) that
  Engineering Compliance Validation (Phase 4) must be able to check per
  SKU.
- Manufacturer capacity/lead-time attributes needed by Phase 5 (Selection)
  and Phase 6 (Cost) — e.g., typical lead time by family, capacity
  ceiling, region served. (Actual per-SKU FOB, MOQ, and capacity figures
  belong to the Manufacturer Product Offer in Phase 3, not here — Phase 2
  holds general/typical attributes only.)

**Out of scope:**
- Raw-material/component sourcing — not a modeled EBP entity in the MVP
  (ADR-0005). A Manufacturer's internal supply chain is its own concern.
- Whether a specific Passport × Manufacturer × Offer combination is
  actually compliant (Phase 4 — Registry only records *category*-level
  qualification, not per-Offer compliance).
- Cost figures (Phase 6) and commercial terms like FOB/MOQ/lead time for a
  specific SKU (Phase 3, Manufacturer Product Offer).

## Dependencies

- Phase 1 Passport product-family taxonomy — Registry's qualified-families
  field must be a subset of that taxonomy (`BUSINESS_RULES.md` §4).

## Key Entities / Data Model (sketch, not final)

- `ebp_manufacturers` — `id` (internal), `manufacturer_code` (`EFM-XXXX`,
  unique, permanent, confidential), `legal_name` (descriptive metadata
  only — never a join key), `country`, `locations`, `contacts`,
  `certifications`, `status`, `status_reason`, `status_changed_at`,
  `created_at`.
- `ebp_manufacturer_qualifications` — join: `manufacturer_code` ↔ product
  family (referencing Phase 1 taxonomy), with its own status (including
  `CONDITIONAL` and its recorded condition), and typical lead-time/
  capacity attributes.
- `ebp_manufacturer_status_history` — append-only log of status
  transitions (auditability, `BUSINESS_RULES.md` §4).

## Business Rules Enforced

- `BUSINESS_RULES.md` §4 in full (qualification status gating including
  `CONDITIONAL`, family taxonomy alignment, `manufacturer_code` as
  functional key, audit logging of status changes).
- ADR-0006 (`EFM-XXXX` as functional key; `legal_name` never used as a
  join key or exposed to Distributor Portal).
- `PLATFORM_ARCHITECTURE.md` §6 (auditability — status never silently
  overwritten).

## Integration Points

- Reads Phase 1 Passport family taxonomy.
- Read by: Phase 3 (Request Batches are sent to Manufacturers identified by
  `manufacturer_code`), Phase 4 (validation checks Manufacturer is
  `QUALIFIED`/`CONDITIONAL`-satisfied for the Passport's family), Phase 5
  (selection candidates must be `QUALIFIED`/`CONDITIONAL`-satisfied), Phase
  6 (cost inputs reference manufacturer region for freight/duties
  estimation).

## Deliverables

- Approved Manufacturer + Qualification data model, including the
  `manufacturer_code` generation/uniqueness mechanism.
- Approved status lifecycle (including `CONDITIONAL`) and audit-log
  mechanism.
- Approved API surface (`/api/ebp/manufacturers`).

## Exit Criteria

- A Manufacturer can be registered with a permanent `EFM-XXXX` code,
  qualified for at least one Phase-1 product family, and have its status
  changed (including to `CONDITIONAL` with a recorded condition) with a
  retained history entry.
- Phase 4's spec can reference "is this Manufacturer QUALIFIED or
  CONDITIONAL-satisfied for this Passport's family" as a concrete,
  answerable query against this model, using `manufacturer_code` only.

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
- **Risk: `manufacturer_code` leakage.** Because the code is confidential
  by design (ADR-0006), any logging, error message, or admin-tool export
  that isn't reviewed for Distributor-facing exposure risks defeating the
  confidentiality guarantee at the source. Flagged here as the root of the
  chain that Phase 7/8 must also defend.

## Open Questions

- Does Manufacturer onboarding require a workflow/approval process of its
  own (e.g., an audit or certification step before `CANDIDATE` →
  `QUALIFIED`), or is that entirely external to EBP and just recorded here
  after the fact? Not decided in Phase 0.
- Exact `EFM-XXXX` code generation scheme (random with collision check vs.
  another mechanism) — carried to `PLATFORM_ARCHITECTURE.md` §7 as an open
  item, to be resolved at this phase's spec approval.
