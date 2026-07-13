# Phase 06 — Cost Engine

**Status:** Spec Drafted (revised, correction round 2026-07-13 — not
approved; no implementation authorized)
**Depends on:** Phases 02, 05
**Blocks:** Phase 07

**Correction notice:** This revision replaces the original "materials cost
from Supplier data + conversion cost from Manufacturer data" breakdown with
a single, simpler input: the **approved Manufacturer Offer's FOB price**
(Phase 5) plus freight, duties, and overhead. Cost Engine does not
decompose or re-derive a Manufacturer's internal cost structure — FOB is
the Manufacturer's own commercial figure. See ADR-0005 in `DECISIONS.md`.

## Objective

Compute landed cost for an approved (Passport × Manufacturer × Manufacturer
Offer) selection, as the single authoritative source of cost data for every
downstream module (`BUSINESS_RULES.md` §8).

## Scope

**In scope:**
- Landed cost computation: the approved Offer's FOB price (from Phase 5's
  ELIMFILTERS-approved selection) plus freight, duties, and overhead
  allocation.
- Versioned cost records per (Passport, Manufacturer, effective date
  range) — a new calculation supersedes, does not overwrite, the prior one
  (`BUSINESS_RULES.md` §8).
- Cost Engine operates only on `VALID`, ELIMFILTERS-approved selections
  (hard gate, transitively via Phase 5's approval step).

**Out of scope:**
- Sell price / margin (Phase 7).
- Any decomposition of the Manufacturer's internal materials/conversion
  cost structure — FOB is treated as a single commercial input, not a
  breakdown to re-derive (ADR-0005).
- Real-time freight/duty rate integration with external logistics
  providers — Phase 0 does not assume any such integration exists; initial
  scope likely uses configured/estimated rates unless a later phase
  decision adds a real integration (flag for spec-approval discussion).

## Dependencies

- Phase 2 (Manufacturer region, for freight/duties estimation), Phase 5
  (the specific ELIMFILTERS-approved Offer being costed, including its FOB
  price), Phase 4 transitively (nothing reaches Cost Engine without the
  underlying Offer holding a current `VALID` result).

## Key Entities / Data Model (sketch, not final)

- `ebp_cost_calculations` — `passport_id`, `manufacturer_code`,
  `offer_id` (the specific approved Offer this cost is based on),
  `fob_price` (copied from the Offer at calculation time, for
  traceability even if the Offer later changes), `freight_cost`,
  `duties_cost`, `overhead_allocation`, `landed_cost_total`, `currency`,
  `effective_from`, `effective_to` (null = current), `superseded_by`.

## Business Rules Enforced

- `BUSINESS_RULES.md` §8 in full.

## Integration Points

- Reads Phase 2, Phase 5 (approved Offer and its FOB), Phase 4 (gate check,
  transitively via Phase 5).
- Read by: Phase 7 (Pricing derives from this exclusively), Phase 9
  (historical cost may inform order-level reporting, though Order
  Management does not recompute cost per `BUSINESS_RULES.md` §11).

## Deliverables

- Approved landed-cost formula (FOB + freight + duties + overhead).
- Approved versioning/supersession mechanism.
- Approved API surface (`/api/ebp/cost`).

## Exit Criteria

- Given an ELIMFILTERS-approved, `VALID` selection with a known FOB price,
  Cost Engine produces a landed cost figure with a full, traceable
  breakdown back to the specific Offer used.
- A recalculation (e.g., after a freight-rate update) produces a new
  versioned record without destroying the prior one.

## Risks

- **Risk: freight/duty estimation accuracy.** Without a real logistics
  integration (out of scope per above), freight and duty figures may need
  to be manually configured/estimated, which risks becoming stale. This
  should be an explicit, named limitation communicated to Phase 7 and
  Phase 8, not silently absorbed as if it were precise.
- **Risk: currency handling.** FOB price, freight, and duties may
  naturally arise in different currencies. The spec at approval time must
  define a single settlement currency (and FX handling) for
  `landed_cost_total`, or this becomes a source of silent errors.
- **Risk: FOB volatility vs. cost-record staleness.** Because FOB is now
  the single cost input (rather than a decomposed breakdown), any change a
  Manufacturer makes to its Offer's FOB price must reliably trigger cost
  recalculation — otherwise `landed_cost_total` silently drifts from the
  actual current commercial terms. This wasn't a risk in the original
  multi-component draft in the same way and is a direct consequence of
  this correction; it should be called out explicitly at spec approval.

## Open Questions

- Should Cost Engine support cost scenarios/what-if calculations (e.g.,
  "what would this cost from a different `VALID` Offer") for Selection's
  benefit, or strictly compute cost for an already-approved selection?
  This affects whether Phase 5 and Phase 6 have a circular dependency in
  practice — flagged here for resolution before either phase's spec is
  approved for build.
