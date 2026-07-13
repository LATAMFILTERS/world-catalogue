# Phase 09 — Order Management

**Status:** Spec Drafted (revised, second correction round 2026-07-13 —
section references, confidentiality requirement, and Offer traceability
corrected; not approved; no implementation authorized)
**Depends on:** Phase 08
**Blocks:** Nothing (final phase in the current roadmap)

**Correction notice (first round):** Cross-references to
`BUSINESS_RULES.md` were updated to its revised section numbering.
Manufacturer allocation is referenced by `manufacturer_code` (`EFM-XXXX`),
and the distributor-visible order record must exclude manufacturer
identity, FOB, and margin, per the same confidentiality boundary as Phase
8. See ADR-0006 in `DECISIONS.md`.

**Correction notice (second round, this revision):** `BUSINESS_RULES.md`
section numbers are updated again (Order Management Rules is now §12 —
inserting a new Offer Approval section shifted every section after §6 by
one; see `BUSINESS_RULES.md`'s correction notice). Order allocation now
references the specific `offer_id`/`offer_revision` selected (ADR-0007),
and the distributor-visible order projection also excludes any Passport
note field, mirroring `BUSINESS_RULES.md` §11.

## Objective

Turn a distributor's selection in the Distributor Portal into a tracked
order: manufacturer allocation, production/shipment status, and invoicing
status, from placement through delivery — while keeping manufacturer
identity and cost basis out of any distributor-visible order record.

## Scope

**In scope:**
- Order creation against a `VALID`, priced SKU (or rejection if the
  underlying combination is not `VALID` and priced at order time,
  `BUSINESS_RULES.md` §12).
- Manufacturer allocation: either referencing an existing Phase 5 Selection
  decision, or triggering one at order time using the same Selection rules
  (`BUSINESS_RULES.md` §12). The allocated `manufacturer_code` **and** the
  specific `offer_id`/`offer_revision` selected are ELIMFILTERS-internal
  fields on the order record.
- Order status lifecycle: `placed` → `allocated` → `in production` →
  `shipped` → `delivered` → `invoiced`, logged sequentially; no
  out-of-order or skipped transitions without an explicit, logged
  correction.
- Price protection: the order freezes a reference to the Pricing Engine
  output as of placement time; it does not re-price on later Pricing
  Engine changes (`BUSINESS_RULES.md` §12).
- A distributor-visible order projection that carries status, quantity, and
  frozen sell price only — never `manufacturer_code`, `offer_id`/
  `offer_revision`, FOB, margin, or any Passport note field, per
  `BUSINESS_RULES.md` §12 and the same confidentiality boundary as Phase 8.

**Out of scope:**
- Computing cost or price (Phases 6-7) — Order Management only references
  and freezes existing output.
- Payment gateway / financial settlement (explicitly excluded from the
  00-09 roadmap per `ROADMAP.md` "Explicitly Out of Scope"). Phase 9 tracks
  invoicing *status*, not payment processing.

## Dependencies

- Phase 8 (orders are placed from within the Distributor Portal surface;
  no separate order-entry channel is in scope).
- Phase 5 (allocation logic/decisions), Phase 7 (frozen price reference),
  Phase 4 transitively (nothing orderable without a current `VALID`
  result at the moment of placement).

## Key Entities / Data Model (sketch, not final)

- `ebp_orders` — `distributor_account_id`, `passport_id`,
  `manufacturer_code` + `offer_id` + `offer_revision` (allocated,
  ELIMFILTERS-internal only — the specific Offer revision fulfillment is
  sourced from), `price_ref` (frozen FK to the specific
  `ebp_price_calculations` row — internal; distributor views resolve this
  to the frozen `sell_price` only, never the full record), `quantity`,
  `status`, `placed_at`.
- `ebp_orders_distributor_view` — a strict projection of the above:
  `passport_id`, `quantity`, `status`, `frozen_sell_price`, `placed_at`.
  `manufacturer_code` and `price_ref` are not present in this projection,
  mirroring Phase 7's `ebp_price_calculations_distributor_view` pattern.
- `ebp_order_status_history` — append-only log of status transitions
  (mirrors the auditability pattern used in Phase 2's status history and
  Phase 4's validation-run versioning).

## Business Rules Enforced

- `BUSINESS_RULES.md` §12 in full, including the distributor-visible
  confidentiality projection.

## Integration Points

- Reads Phase 8 (the portal context an order is placed from), Phase 5
  (allocation), Phase 7 (frozen price reference), Phase 4 (validity gate
  at placement time).
- Nothing downstream in the current roadmap reads Phase 9 output — it is
  the terminal phase of the 00-09 program.

## Deliverables

- Approved order data model and status-lifecycle state machine.
- Approved price-protection/freezing mechanism.
- Approved manufacturer-allocation-at-order-time logic (for cases without a
  pre-existing Phase 5 decision).
- Approved API surface (`/api/ebp/orders`).

## Exit Criteria

- An order can be placed against a `VALID`, priced SKU, allocated to a
  qualified Manufacturer, and progressed through the full status lifecycle
  with a retained history.
- An order attempt against a non-`VALID` or unpriced combination is
  rejected outright.
- The order's price reference does not change even if Pricing Engine later
  recalculates price for the same Passport/Manufacturer/channel.

## Risks

- **Risk: this phase inherits every upstream risk.** Because Order
  Management is the terminal phase, any unresolved risk in Phases 1-8
  (family-taxonomy granularity, validation correctness, currency handling,
  auth) surfaces here as a real transactional failure mode, not just a
  documentation gap. Recommend a dedicated end-to-end review across all
  nine phases before Phase 9 is approved to build, not just a review of
  Phase 9's own spec in isolation.
- **Risk: status-transition correction workflow is under-specified.**
  `BUSINESS_RULES.md` §12 requires "explicit, logged correction" for
  out-of-order transitions but Phase 0 does not define who is authorized to
  issue one or through what interface. Needs resolution at spec approval.
- **Risk: confidentiality-projection drift (same pattern as Phase 7).** If
  `ebp_orders` gains a new field and `ebp_orders_distributor_view` isn't
  updated in lockstep, manufacturer or cost data could reach a distributor
  by omission. Should be built as an explicit allow-list, per the same
  recommendation made in `phases/phase-07-pricing-engine.md`.

## Open Questions

- Does invoicing-status tracking need to integrate with an external
  accounting system, or is it purely an internal status field with no
  external system of record? This affects whether Phase 9 has an
  undocumented external dependency similar to Phase 8's auth dependency.
- Must an order's allocated Offer have a recorded Offer Approval
  (`ebp_manufacturer_offer_approvals`, Phase 3) with finalized packaging
  before production can begin, or can `in production` start against a
  `VALID`-but-not-yet-approved Offer with packaging finalized later? Not
  decided — the same ordering question flagged in
  `phases/phase-05-manufacturer-selection.md`'s Open Questions, but here
  it materially affects the `allocated` → `in production` transition
  specifically.
