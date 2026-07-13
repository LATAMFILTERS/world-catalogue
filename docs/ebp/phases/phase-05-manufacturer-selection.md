# Phase 05 — Manufacturer Selection

**Status:** Spec Drafted (revised, correction round 2026-07-13 — not
approved; no implementation authorized)
**Depends on:** Phases 02, 04
**Blocks:** Phase 06, 09

**Correction notice (first round):** This revision aligns Selection's
inputs with the corrected model — it ranks `VALID` **Manufacturer Offers**
(Phase 3/4), not a Supplier-inclusive combination, and now explicitly
requires a three-tier recommendation (primary/secondary/backup) with
ELIMFILTERS retaining final approval, per the project owner's correction.
See ADR-0005 in `DECISIONS.md`.

**Correction notice (second round):** Because a Manufacturer may now
submit many versioned Offers for the same Passport Version (ADR-0007),
Selection's candidate pool is narrowed to exactly the Offers that are
**both** the current active revision for their (Passport Version ×
Manufacturer) pair **and** hold a current `VALID` result within its
effectiveness window — never expired, withdrawn, rejected, or superseded.
The recommendation now records the exact `offer_id` and `offer_revision`
evaluated and selected for each tier, not just the Manufacturer. See
ADR-0007.

**Governance decision (2026-07-13, Phase 0 closure, ADR-0010):** The
Offer Approval / Selection ordering question this phase previously left
open is now resolved. An **official** Selection recommendation may only
evaluate Offers that are simultaneously: the current active revision;
`VALID` and within its effectiveness window; `APPROVED` (Phase 3 Offer
Approval, ADR-0011); and from a Manufacturer that is `QUALIFIED` or
`CONDITIONAL`-satisfied for the family. A `VALID`-but-not-yet-`APPROVED`
Offer may be used only in an internal, explicitly labeled
`PRELIMINARY_COMPARISON` — never an official recommendation, and never
promoted into one.

## Objective

Given a demand signal (an order, or a forecast) for a specific Passport,
evaluate all `VALID` Manufacturer Offers for it and recommend a primary,
secondary, and backup Manufacturer, with the basis for each recommendation
recorded. ELIMFILTERS gives final approval — Selection recommends, it does
not auto-commit.

## Scope

**In scope:**
- Candidate filtering for an **official** recommendation: only Offers that
  are (a) the current active revision for their (Passport Version ×
  Manufacturer) pair — not `SUPERSEDED`, `EXPIRED`, `WITHDRAWN`, or
  `REJECTED`; (b) hold a current `VALID` Engineering Compliance Validation
  result bound to that exact `offer_id`/`offer_revision`, within its
  effectiveness window; (c) hold a current `APPROVED` Offer Approval
  result (Phase 3, ADR-0011); and (d) belong to a Manufacturer that is
  `QUALIFIED` or `CONDITIONAL`-satisfied for the family, are eligible
  candidates (`BUSINESS_RULES.md` §8, ADR-0010).
- **`PRELIMINARY_COMPARISON`:** an internal, explicitly labeled comparison
  of `VALID`-but-not-yet-`APPROVED` Offers, for planning visibility only.
  Never creates, converts into, or is reused as an official recommendation
  (ADR-0010).
- Selection logic considering, at minimum, per `BUSINESS_RULES.md` §8:
  mandatory technical compliance (the `VALID` gate itself), FOB price,
  packaging, MOQ, lead time, monthly capacity, certifications, evidence,
  and quality history where it exists.
- A three-tier recommendation: **primary**, **secondary**, **backup**
  Manufacturer — not a single winner.
- Recording the full basis, including the **exact `offer_id` and
  `offer_revision`** evaluated and selected per tier: which Offers were
  considered, their relevant attributes at decision time, and why the
  three tiers were ranked as they were.
- An explicit ELIMFILTERS approval step on the recommendation before it is
  treated as final (distinct from the recommendation itself, and distinct
  from Phase 3's Offer Approval — see Open Questions).
- Support for a manual override path that routes through Engineering
  Compliance Validation rather than bypassing it (`BUSINESS_RULES.md` §8).

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
  (order id or forecast id), `primary_offer_id` + `primary_offer_revision`,
  `secondary_offer_id` + `secondary_offer_revision`, `backup_offer_id` +
  `backup_offer_revision` (the revision fields are redundant with the ids
  under ADR-0007's model, kept for human-readable audit traceability),
  `candidates_considered` (structured, includes each candidate Offer's
  `offer_id`/`offer_revision`, validated status, and attributes at
  decision time), `basis` (structured rationale per tier), `recommended_at`.
- `ebp_selection_approvals` — `recommendation_id`, `approved_by`
  (an `ADMIN_OWNER`, per ADR-0011), `approved_at`, `approved_primary_
  offer_id` (may differ from the recommended primary if `ADMIN_OWNER`
  overrides the recommendation — still must reference a `VALID` **and**
  `APPROVED` Offer; `ADMIN_OWNER` can never promote a technically
  `INVALID` Offer into the decision), `override_reason` (populated only if
  the approved choice differs from the recommended primary).
- `ebp_selection_preliminary_comparisons` — `passport_id`,
  `candidates_considered` (Offers that are `VALID` but not yet
  `APPROVED`), `basis`, `compared_at`, `compared_by`,
  `label` (fixed value `PRELIMINARY_COMPARISON`) — structurally separate
  from `ebp_selection_recommendations` so a preliminary analysis can never
  be mistaken for, or silently promoted into, an official recommendation
  (ADR-0010).

## Business Rules Enforced

- `BUSINESS_RULES.md` §8 in full, including the five-part official-
  candidate gate (current-active-revision, `VALID`-within-window,
  `APPROVED`, `QUALIFIED`/`CONDITIONAL`-satisfied, not expired/withdrawn/
  rejected/superseded — ADR-0010), the `PRELIMINARY_COMPARISON` carve-out,
  the primary/secondary/backup requirement, and the `ADMIN_OWNER`
  final-approval requirement (ADR-0011).

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
- An override attempt against a non-`VALID` candidate, or against an Offer
  that is no longer the current active revision for its (Passport Version
  × Manufacturer) pair, is rejected outright, per `BUSINESS_RULES.md` §8.

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
  `BUSINESS_RULES.md` §8. Without an explicit weighting or scoring model
  agreed at spec-approval time, "primary" vs. "secondary" is not
  reproducible or auditable.
- **Risk: `PRELIMINARY_COMPARISON` / official-recommendation confusion.**
  Because a `PRELIMINARY_COMPARISON` and an official recommendation can
  reference overlapping candidate Offers, an implementation that doesn't
  keep them in structurally separate tables/status spaces (per
  `ebp_selection_preliminary_comparisons` vs. `ebp_selection_
  recommendations`, ADR-0010) risks a preliminary analysis being displayed
  or consumed as if it were official. Should be a release-blocking check
  at spec approval, not left to UI labeling alone.

## Open Questions

- What counts as a "demand signal" in Phase 5's initial scope — only real
  orders (post-Phase-9), or also forecasts/planning demand ahead of Order
  Management existing? If forecasts are in scope, Phase 5 has a soft
  dependency on demand-planning data that isn't modeled anywhere in
  Phases 00-09 today. (Note: a `PRELIMINARY_COMPARISON`, ADR-0010, can
  reasonably run against a forecast signal even before Order Management
  exists, since it never produces an official, actionable outcome.)
- What is the actual scoring/weighting formula across the ranking
  criteria? Needed before this phase's spec can be marked
  `Spec Approved` — flagged as a risk above, repeated here as the concrete
  open decision.
- **Resolved (2026-07-13, ADR-0010):** Selection requires a current
  `APPROVED` Offer Approval result, in addition to `VALID`, before an
  Offer is eligible for an official recommendation. A `VALID`-only Offer
  may appear solely in a `PRELIMINARY_COMPARISON`.
