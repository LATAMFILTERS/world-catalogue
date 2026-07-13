# Phase 08 — Distributor Portal

**Status:** Spec Drafted (not approved — no implementation authorized)
**Depends on:** Phases 01, 07
**Blocks:** Phase 09

## Objective

Provide an authenticated application surface where distributors browse the
validated, priced catalog and (in Phase 9) place orders against it.

## Scope

**In scope:**
- Distributor account model: identity, tier, region/currency (drives which
  Pricing Engine output applies).
- Catalog browsing scoped to `VALID` + priced Passports only
  (`BUSINESS_RULES.md` §9) — no draft, unvalidated, or unpriced products
  visible under any circumstance.
- Read-only integration with Pricing Engine output; the portal holds no
  independent pricing logic.
- As a distinct, authenticated surface — not an extension of the public,
  anonymous `frontend/` access model.

**Out of scope:**
- Order placement/lifecycle mechanics themselves (Phase 9) — Phase 8
  provides the browsing/account surface Phase 9 builds ordering on top of.
- Public marketing content, SEO/GEO — that remains `frontend/`'s
  responsibility entirely; Phase 8 is not a Knowledge System page.

## Dependencies

- Phase 1 (Passport data defines what's shown for a product).
- Phase 7 (Pricing Engine output is what's shown as price) —
  transitively depends on Phases 2-6 being built and a `VALID` result
  existing for anything to be visible at all.
- **Hard, named, undecided dependency:** distributor/staff authentication
  provider/design (ADR-0002). This phase cannot begin implementation until
  that decision is made — it is not a Phase 0 output and must be resolved
  before Phase 8's spec can move to `Spec Approved`.

## Key Entities / Data Model (sketch, not final)

- `ebp_distributor_accounts` — identity (shape depends on the auth
  decision in ADR-0002), `tier`, `region`, `currency`, `status`.
- No independent product/price tables — Phase 8 reads Phase 1 and Phase 7
  data directly; it does not cache or duplicate it into portal-owned
  tables (consistent with "single source of truth per concern,"
  `PROJECT_MANIFESTO.md` §4.2).

## Business Rules Enforced

- `BUSINESS_RULES.md` §9 in full.

## Integration Points

- Reads Phase 1 (Passport display data), Phase 7 (price), Phase 4
  (validity, transitively via what Phase 7 will even have priced).
- Read by: Phase 9 (order placement happens from within this portal
  surface).

## Deliverables

- A resolved authentication approach (prerequisite, not itself a Phase 8
  "deliverable" in the engineering sense, but required before this phase's
  spec is approvable).
- Approved distributor account/tier/region data model.
- Approved catalog-browsing surface scoped strictly to `VALID` + priced
  Passports.

## Exit Criteria

- A distributor account in a given tier/region sees only `VALID`, priced
  SKUs, with the correct Pricing Engine output for their tier/region/
  currency, and sees zero draft/unvalidated/unpriced products under any
  navigation path.

## Risks

- **Risk: this phase is blocked on an undecided architectural
  dependency (auth) that Phase 0 explicitly deferred.** This is the
  clearest concrete risk carried out of Phase 0 — see the Phase 0 audit
  report's risk section and ADR-0002. Recommend resolving this during
  Milestone B (Phases 04-07), not at the start of Phase 8 itself, to avoid
  a hard stall at the start of Milestone C.
- **Risk: visibility-leak risk is highest here.** Because this is the
  first customer-facing (distributor-facing) surface in the roadmap, any
  gap in the `VALID`+priced filtering logic is the most consequential
  place in the entire program for it to fail — it would expose
  unvalidated or mispriced products directly to a commercial counterparty.

## Open Questions

- Should Phase 8 share any session/identity infrastructure with a future
  `frontend/` authenticated feature (if one is ever built), or should it be
  fully independent? No such feature currently exists on `frontend/`, so
  this is speculative but worth flagging before the auth decision (ADR-0002)
  is finalized.
