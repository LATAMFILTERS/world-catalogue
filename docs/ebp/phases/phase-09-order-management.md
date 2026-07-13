# Phase 09 — Order Management

**Status:** Spec Drafted (not approved — no implementation authorized)
**Depends on:** Phase 08
**Blocks:** Nothing (final phase in the current roadmap)

## Objective

Turn a distributor's selection in the Distributor Portal into a tracked
order: manufacturer allocation, production/shipment status, and invoicing
status, from placement through delivery.

## Scope

**In scope:**
- Order creation against a `VALID`, priced SKU (or rejection if the
  underlying combination is not `VALID` and priced at order time,
  `BUSINESS_RULES.md` §10).
- Manufacturer allocation: either referencing an existing Phase 5 Selection
  decision, or triggering one at order time using the same Selection rules
  (`BUSINESS_RULES.md` §10).
- Order status lifecycle: `placed` → `allocated` → `in production` →
  `shipped` → `delivered` → `invoiced`, logged sequentially; no
  out-of-order or skipped transitions without an explicit, logged
  correction.
- Price protection: the order freezes a reference to the Pricing Engine
  output as of placement time; it does not re-price on later Pricing
  Engine changes (`BUSINESS_RULES.md` §10).

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
  `manufacturer_id` (allocated), `price_ref` (frozen FK to the specific
  `ebp_price_calculations` row), `quantity`, `status`, `placed_at`.
- `ebp_order_status_history` — append-only log of status transitions
  (mirrors the auditability pattern used in Phase 2's status history and
  Phase 4's validation-run versioning).

## Business Rules Enforced

- `BUSINESS_RULES.md` §10 in full.

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
  `BUSINESS_RULES.md` §10 requires "explicit, logged correction" for
  out-of-order transitions but Phase 0 does not define who is authorized to
  issue one or through what interface. Needs resolution at spec approval.

## Open Questions

- Does invoicing-status tracking need to integrate with an external
  accounting system, or is it purely an internal status field with no
  external system of record? This affects whether Phase 9 has an
  undocumented external dependency similar to Phase 8's auth dependency.
