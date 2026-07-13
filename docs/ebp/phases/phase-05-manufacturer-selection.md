# Phase 05 — Manufacturer Selection

**Status:** Spec Drafted (not approved — no implementation authorized)
**Depends on:** Phases 02, 04
**Blocks:** Phase 06, 09

## Objective

Given a demand signal (an order, or a forecast) for a specific Passport,
choose which `VALID`, `QUALIFIED` Manufacturer should fulfill it, and record
the decision and its basis.

## Scope

**In scope:**
- Selection logic considering, at minimum: validated status (hard
  requirement), landed cost (once Phase 6 exists — see note below on
  sequencing), lead time, and region/proximity to destination
  (`BUSINESS_RULES.md` §6).
- Recording the selection decision: which Manufacturer, for which
  Passport, on what basis, at what time — not just the final assignment.
- Support for a manual override path that routes through Validation Engine
  rather than bypassing it (`BUSINESS_RULES.md` §6).

**Out of scope:**
- Computing landed cost itself (Phase 6) — Selection *consumes* cost data
  where available but does not calculate it.
- Real-time capacity/inventory tracking beyond what Phase 2's
  qualification attributes (capacity ceiling, typical lead time) already
  capture.

## Dependencies

- Phase 2 (candidate Manufacturers and their attributes).
- Phase 4 (only `VALID` combinations are eligible candidates).
- **Sequencing note:** `ROADMAP.md` places Phase 5 before Phase 6 (Cost
  Engine), but Selection's own rules reference "landed cost" as a
  selection input. This is intentional: initial Selection logic can rank
  candidates on lead time/region/qualification alone, with cost weighting
  added once Phase 6 exists. Phase 5's spec at approval time must make
  this two-stage nature explicit rather than assuming Phase 6 data is
  available from day one.

## Key Entities / Data Model (sketch, not final)

- `ebp_selection_decisions` — `passport_id`, `demand_reference` (order id
  or forecast id), `selected_manufacturer_id`, `candidates_considered`
  (structured, includes each candidate's validated status and attributes
  at decision time), `basis` (structured rationale), `decided_at`,
  `overridden` (boolean), `override_reason`.

## Business Rules Enforced

- `BUSINESS_RULES.md` §6 in full.

## Integration Points

- Reads Phase 2 (Manufacturer attributes), Phase 4 (current `VALID`
  results).
- Once Phase 6 exists: reads Cost Engine output as an additional ranking
  input.
- Read by: Phase 6 (cost is computed for the selected combination), Phase 9
  (orders reference a selection decision, or trigger one at order time per
  `BUSINESS_RULES.md` §10).

## Deliverables

- Approved selection ranking logic (initial version: lead time + region +
  qualification; cost-weighted version once Phase 6 exists).
- Approved decision-recording model.
- Approved override workflow (routes through Phase 4, per rules).

## Exit Criteria

- Given two `QUALIFIED`, `VALID` candidate Manufacturers for the same
  Passport with different lead times/regions, Selection deterministically
  picks one and records why.
- An override attempt against a non-`VALID` candidate is rejected outright,
  per `BUSINESS_RULES.md` §6.

## Risks

- **Risk: single-candidate families make selection logic untested.** Per
  Phase 2's own risk note, early data may have only one qualified
  manufacturer per family, which trivially "selects" without exercising
  real ranking logic. Recommend an explicit multi-candidate test scenario
  before this phase is considered exit-ready.
- **Risk: premature cost-weighting.** If Selection is implemented assuming
  Phase 6 output exists before Phase 6 is actually built (see sequencing
  note above), it risks either blocking on Phase 6 unnecessarily or
  shipping with a cost-input stub that never gets properly wired up. This
  should be resolved explicitly at spec-approval time, not discovered
  mid-implementation.

## Open Questions

- What counts as a "demand signal" in Phase 5's initial scope — only real
  orders (post-Phase-9), or also forecasts/planning demand ahead of Order
  Management existing? If forecasts are in scope, Phase 5 has a soft
  dependency on demand-planning data that isn't modeled anywhere in
  Phases 00-09 today.
