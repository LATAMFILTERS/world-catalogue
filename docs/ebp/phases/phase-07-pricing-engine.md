# Phase 07 — Pricing Engine

**Status:** Spec Drafted (not approved — no implementation authorized)
**Depends on:** Phase 06
**Blocks:** Phase 08

## Objective

Compute channel/region sell price from landed cost plus margin rules, as the
single authoritative source of price data for every downstream module
(`BUSINESS_RULES.md` §8).

## Scope

**In scope:**
- Price computation: landed cost (from Phase 6) + margin, where margin is
  determined by channel (distributor tier) and region/currency, expressed
  as data (a margin rule set), not per-SKU hardcoded exceptions except
  where explicitly logged.
- Price floor enforcement: no price may be published below landed cost
  without a logged exception.
- Language/positioning compliance: any generated pricing rationale or
  distributor-facing copy must follow the Category Reframing Layer and AI
  Citation Layer language rules in root `CLAUDE.md` — no commodity
  race-to-bottom framing.

**Out of scope:**
- Landed cost computation itself (Phase 6) — Pricing consumes it
  exclusively.
- Actual promotional/clearance pricing policy design — `BUSINESS_RULES.md`
  §8 allows for logged exceptions but does not define a promotions system;
  that would be a future, separate decision if pursued.

## Dependencies

- Phase 6 (landed cost is the sole cost input; Pricing does not
  independently estimate cost, per `BUSINESS_RULES.md` §8).

## Key Entities / Data Model (sketch, not final)

- `ebp_margin_rules` — channel/tier, region, currency, margin percentage
  or formula, effective date range.
- `ebp_price_calculations` — `passport_id`, `manufacturer_id` (references
  the costed combination), `channel`, `region`, `currency`, `landed_cost_ref`
  (FK to the specific `ebp_cost_calculations` row used), `margin_applied`,
  `sell_price`, `effective_from`, `effective_to`, `is_below_floor_exception`
  (boolean), `exception_reason`.

## Business Rules Enforced

- `BUSINESS_RULES.md` §8 in full.
- Category Reframing Layer / AI Citation Layer language rules (root
  `CLAUDE.md`) for any generated pricing rationale text.

## Integration Points

- Reads Phase 6 cost output exclusively for cost input.
- Read by: Phase 8 (Distributor Portal displays this output and holds no
  independent pricing logic, per `BUSINESS_RULES.md` §9), Phase 9 (orders
  freeze a reference to the price at order time, per `BUSINESS_RULES.md`
  §10).

## Deliverables

- Approved margin-rule data model and channel/region/currency dimensions.
- Approved price-floor enforcement mechanism.
- Approved API surface (`/api/ebp/pricing`).

## Exit Criteria

- Given a costed combination and an applicable margin rule, Pricing Engine
  produces a sell price per channel/region/currency with full traceability
  back to the specific cost calculation used.
- An attempt to publish a price below landed cost without a logged
  exception is rejected.

## Risks

- **Risk: margin-rule granularity mismatch with real commercial
  practice.** If real-world distributor pricing has more nuance (volume
  breaks, contract-specific terms) than a flat channel/region/currency
  margin rule can express, the model will need per-distributor overrides —
  which risks becoming the "hardcoded exception" path growing unbounded
  unless explicitly governed. Needs resolution at spec approval.
- **Risk: multi-currency complexity compounds Phase 6's currency risk.**
  If Phase 6 settles landed cost in one currency, Pricing Engine's
  conversion to each channel's currency introduces FX-timing risk (rate at
  cost-calc time vs. rate at price-calc time vs. rate at order time).
  Needs an explicit, documented policy before implementation.

## Open Questions

- Are margin rules set centrally (a single pricing policy owner) or does
  Phase 7 need a workflow for proposing/approving margin-rule changes?
  Not decided in Phase 0 — likely fine to start centralized and revisit.
