# Phase 05 — Manufacturer Selection

**Status:** Spec Drafted (revised, correction round 2026-07-13 — not
approved; no implementation authorized)
**Depends on:** Phases 02, 04
**Blocks:** Phase 06, 09

**Correction notice:** This revision aligns Selection's inputs with the
corrected model — it ranks `VALID` **Manufacturer Offers** (Phase 3/4), not
a Supplier-inclusive combination, and now explicitly requires a three-tier
recommendation (primary/secondary/backup) with ELIMFILTERS retaining final
approval, per the project owner's correction. See ADR-0005 in
`DECISIONS.md`.

## Objective

Given a demand signal (an order, or a forecast) for a specific Passport,
evaluate all `VALID` Manufacturer Offers for it and recommend a primary,
secondary, and backup Manufacturer, with the basis for each recommendation
recorded. ELIMFILTERS gives final approval — Selection recommends, it does
not auto-commit.

## Scope

**In scope:**
- Selection logic considering, at minimum, per `BUSINESS_RULES.md` §7:
  mandatory technical compliance (the `VALID` gate itself), FOB price,
  packaging, MOQ, lead time, monthly capacity, certifications, evidence,
  and quality history where it exists.
- A three-tier recommendation: **primary**, **secondary**, **backup**
  Manufacturer — not a single winner.
- Recording the full basis: which Offers were considered, their relevant
  attributes at decision time, and why the three tiers were ranked as they
  were.
- An explicit ELIMFILTERS approval step on the recommendation before it is
  treated as final (distinct from the recommendation itself).
- Support for a manual override path that routes through Engineering
  Compliance Validation rather than bypassing it (`BUSINESS_RULES.md` §7).

**Out of scope:**
- Computing landed cost itself (Phase 6) — Selection uses the Offer's FOB
  price directly as a ranking input; it does not compute landed cost.
- Real-time capacity/inventory tracking beyond what Phase 2's
  qualification attributes (capacity ceiling, typical lead time) and Phase
  3's Offer-level capacity figures already capture.
- Any Supplier-tier evaluation — does not exist in this model (ADR-0005).

## Dependencies

- Phase 2 (Manufacturer qualification/status attributes).
- Phase 4 (only `VALID` Offers are eligible candidates).
- Phase 3 transitively (the Offer data — FOB, MOQ, lead time, capacity,
  packaging, certifications, evidence — that Selection ranks on).

## Key Entities / Data Model (sketch, not final)

- `ebp_selection_recommendations` — `passport_id`, `demand_reference`
  (order id or forecast id), `primary_offer_id`, `secondary_offer_id`,
  `backup_offer_id`, `candidates_considered` (structured, includes each
  candidate Offer's validated status and attributes at decision time),
  `basis` (structured rationale per tier), `recommended_at`.
- `ebp_selection_approvals` — `recommendation_id`, `approved_by`
  (ELIMFILTERS actor), `approved_at`, `approved_primary_offer_id` (may
  differ from the recommended primary if ELIMFILTERS overrides the
  recommendation — still must reference a `VALID` Offer), `override_reason`
  (populated only if the approved choice differs from the recommended
  primary).

## Business Rules Enforced

- `BUSINESS_RULES.md` §7 in full, including the primary/secondary/backup
  requirement and the ELIMFILTERS-final-approval requirement.

## Integration Points

- Reads Phase 2 (Manufacturer attributes), Phase 4 (current `VALID`
  results and the Offers they apply to), Phase 3 (Offer commercial/
  packaging/certification data).
- Read by: Phase 6 (cost is computed for the approved Offer), Phase 9
  (orders reference an approved selection, or trigger one at order time
  per `BUSINESS_RULES.md` §11).

## Deliverables

- Approved selection ranking logic across the full criteria set (technical
  compliance, FOB, packaging, MOQ, lead time, capacity, certifications,
  evidence, quality history).
- Approved three-tier recommendation model and ELIMFILTERS approval
  workflow.
- Approved override path (routes through Phase 4, per rules).

## Exit Criteria

- Given three or more `VALID` candidate Offers for the same Passport with
  varying FOB/lead time/capacity/region, Selection deterministically
  produces a ranked primary/secondary/backup recommendation and records
  the basis for each.
- An ELIMFILTERS approval action against the recommendation is recorded,
  including the case where ELIMFILTERS overrides the recommended primary
  with another `VALID` candidate.
- An override attempt against a non-`VALID` candidate is rejected outright,
  per `BUSINESS_RULES.md` §7.

## Risks

- **Risk: single-candidate families make selection logic untested.** Per
  Phase 2's own risk note, early data may have only one qualified
  manufacturer per family, which trivially "selects" without exercising
  real ranking logic, and makes "secondary"/"backup" tiers empty by
  necessity. Recommend an explicit multi-candidate test scenario before
  this phase is considered exit-ready, and an explicit, documented
  behavior for what happens when fewer than three `VALID` candidates
  exist (secondary/backup fields are simply null, not an error state).
- **Risk: ranking-criteria weighting is undefined.** The criteria list
  (FOB, packaging, MOQ, lead time, capacity, certifications, evidence,
  quality history) has no stated relative weighting in
  `BUSINESS_RULES.md` §7. Without an explicit weighting or scoring model
  agreed at spec-approval time, "primary" vs. "secondary" is not
  reproducible or auditable.

## Open Questions

- What counts as a "demand signal" in Phase 5's initial scope — only real
  orders (post-Phase-9), or also forecasts/planning demand ahead of Order
  Management existing? If forecasts are in scope, Phase 5 has a soft
  dependency on demand-planning data that isn't modeled anywhere in
  Phases 00-09 today.
- What is the actual scoring/weighting formula across the ranking
  criteria? Needed before this phase's spec can be marked
  `Spec Approved` — flagged as a risk above, repeated here as the concrete
  open decision.
