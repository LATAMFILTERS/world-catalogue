# Phase 06 — Cost Engine

**Status:** Spec Drafted (not approved — no implementation authorized)
**Depends on:** Phases 02, 03, 05
**Blocks:** Phase 07

## Objective

Compute landed cost for a validated, selected (Passport × Manufacturer)
combination, as the single authoritative source of cost data for every
downstream module (`BUSINESS_RULES.md` §7).

## Scope

**In scope:**
- Landed cost computation: materials/components (from Phase 3 Supplier
  reference costs, or confirmed procurement costs where available),
  conversion/manufacturing cost (from Phase 2 Manufacturer data), freight,
  duties, and overhead allocation.
- Versioned cost records per (Passport, Manufacturer, effective date
  range) — a new calculation supersedes, does not overwrite, the prior one
  (`BUSINESS_RULES.md` §7).
- Cost Engine operates only on `VALID` combinations (hard gate).

**Out of scope:**
- Sell price / margin (Phase 7).
- Real-time freight/duty rate integration with external logistics
  providers — Phase 0 does not assume any such integration exists; initial
  scope likely uses configured/estimated rates unless a later phase
  decision adds a real integration (flag for spec-approval discussion).

## Dependencies

- Phase 2 (Manufacturer conversion cost/region), Phase 3 (Supplier
  reference/confirmed material costs), Phase 5 (the specific selected
  combination being costed), Phase 4 transitively (nothing reaches Cost
  Engine without a current `VALID` result).

## Key Entities / Data Model (sketch, not final)

- `ebp_cost_calculations` — `passport_id`, `manufacturer_id`,
  `materials_cost`, `conversion_cost`, `freight_cost`, `duties_cost`,
  `overhead_allocation`, `landed_cost_total`, `currency`,
  `effective_from`, `effective_to` (null = current), `superseded_by`,
  `basis` (structured — references the Supplier/Manufacturer data used).

## Business Rules Enforced

- `BUSINESS_RULES.md` §7 in full.

## Integration Points

- Reads Phase 2, Phase 3, Phase 5, Phase 4 (gate check).
- Read by: Phase 7 (Pricing derives from this exclusively), Phase 9
  (historical cost may inform order-level reporting, though Order
  Management does not recompute cost per `BUSINESS_RULES.md` §10).

## Deliverables

- Approved landed-cost formula/components.
- Approved versioning/supersession mechanism.
- Approved API surface (`/api/ebp/cost`).

## Exit Criteria

- Given a `VALID`, selected combination with known Supplier and
  Manufacturer cost inputs, Cost Engine produces a landed cost figure with
  a full, traceable breakdown.
- A recalculation (e.g., after a Supplier cost update) produces a new
  versioned record without destroying the prior one.

## Risks

- **Risk: freight/duty estimation accuracy.** Without a real logistics
  integration (out of scope per above), freight and duty figures may need
  to be manually configured/estimated, which risks becoming stale. This
  should be an explicit, named limitation communicated to Phase 7 and
  Phase 8, not silently absorbed as if it were precise.
- **Risk: currency handling.** Materials/conversion/freight costs may
  naturally arise in different currencies (Supplier in one currency,
  Manufacturer in another). The spec at approval time must define a single
  settlement currency (and FX handling) for `landed_cost_total`, or this
  becomes a source of silent errors.

## Open Questions

- Should Cost Engine support cost scenarios/what-if calculations (e.g.,
  "what would this cost from a different qualified Manufacturer") for
  Selection's benefit, or strictly compute cost for an already-selected
  combination? This affects whether Phase 5 and Phase 6 have a circular
  dependency in practice — flagged here for resolution before either
  phase's spec is approved for build.
