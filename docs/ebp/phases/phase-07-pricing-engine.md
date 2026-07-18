# Phase 07 — Pricing Engine

**Status:** Spec Drafted (revised, second correction round 2026-07-13 —
section references and confidentiality requirement corrected; not
approved; no implementation authorized)
**Depends on:** Phase 06
**Blocks:** Phase 08

**Correction notice (first round):** Cross-references to
`BUSINESS_RULES.md` were updated. This phase's confidentiality obligation
to Phase 8 is also made explicit: this is the module responsible for
stripping manufacturer identity and cost-basis fields before its output
ever reaches Distributor Portal. See ADR-0006 in `DECISIONS.md`.

**Correction notice (second round, this revision):** `BUSINESS_RULES.md`
section numbers are updated again (Pricing Engine Rules is now §10,
Distributor Portal Rules is now §11, Order Management Rules is now
§12 — inserting a new Offer Approval section shifted every section after
§6 by one).

## Objective

Compute channel/region sell price from landed cost plus margin rules, as the
single authoritative source of price data for every downstream module
(`BUSINESS_RULES.md` §10), and produce a confidentiality-safe output for
Distributor Portal that carries no manufacturer identity or cost-basis
fields.

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
  §10 allows for logged exceptions but does not define a promotions system;
  that would be a future, separate decision if pursued.

## Dependencies

- Phase 6 (landed cost is the sole cost input; Pricing does not
  independently estimate cost, per `BUSINESS_RULES.md` §10).

## Key Entities / Data Model (sketch, not final)

- `ebp_margin_rules` — channel/tier, region, currency, margin percentage
  or formula, effective date range.
- `ebp_price_calculations` — `passport_id`, `manufacturer_code` (internal
  reference to the costed Offer, ELIMFILTERS-visible only), `channel`,
  `region`, `currency`, `landed_cost_ref` (FK to the specific
  `ebp_cost_calculations` row used), `margin_applied`, `sell_price`,
  `effective_from`, `effective_to`, `is_below_floor_exception` (boolean),
  `exception_reason`.
- `ebp_price_calculations_distributor_view` — a strict subset/projection of
  the above containing only `passport_id`, `channel`, `region`, `currency`,
  `sell_price`, `effective_from`. This (not the full record) is what Phase
  8 is ever given access to — `manufacturer_code`, `landed_cost_ref`, and
  `margin_applied` are not present in this projection at all, per
  `BUSINESS_RULES.md` §10 and ADR-0006.

## Business Rules Enforced

- `BUSINESS_RULES.md` §10 in full, including the requirement that Pricing
  Engine's output to Phase 8 excludes manufacturer-identifying and
  cost-basis fields at the data-shape level.
- Category Reframing Layer / AI Citation Layer language rules (root
  `CLAUDE.md`) for any generated pricing rationale text.

## Integration Points

- Reads Phase 6 cost output exclusively for cost input.
- Read by: Phase 8 (Distributor Portal reads only the
  `ebp_price_calculations_distributor_view` projection and holds no
  independent pricing logic, per `BUSINESS_RULES.md` §11), Phase 9 (orders
  freeze a reference to the price at order time, per `BUSINESS_RULES.md`
  §12).

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
- **Risk: confidentiality-projection drift.** If a future change adds a
  field to `ebp_price_calculations` and the corresponding
  `ebp_price_calculations_distributor_view` projection isn't updated in
  lockstep, a manufacturer/cost-basis field could reach Phase 8 by
  omission rather than by design. The projection should be built as an
  explicit allow-list (only named fields pass through), not a deny-list of
  excluded fields, so new fields default to hidden.

## Open Questions

- Are margin rules set centrally (a single pricing policy owner) or does
  Phase 7 need a workflow for proposing/approving margin-rule changes?
  Not decided in Phase 0 — likely fine to start centralized and revisit.
