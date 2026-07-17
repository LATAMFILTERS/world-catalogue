# Phase 08 — Distributor Portal

**Status:** Spec Drafted (revised, second correction round 2026-07-13 —
not approved; no implementation authorized)
**Depends on:** Phases 01, 07
**Blocks:** Phase 09

**Correction notice (first round):** This revision makes explicit, as a
first-class requirement (not an implied consequence), that a Distributor
account must never receive Manufacturer identity, `EFM-XXXX` code, FOB
price, margin, or confidential engineering data — under any field, export,
or API response. This is enforced at the data Pricing Engine (Phase 7)
produces for this phase, not by portal-side filtering alone. See ADR-0006
in `DECISIONS.md`.

**Correction notice (second round, this revision):** `BUSINESS_RULES.md`
section numbers are updated (Distributor Portal Rules is now §11, Order
Management Rules is now §12). The Passport's single "confidential
manufacturing notes" field is now two fields,
`manufacturer_instruction_notes` and `internal_engineering_notes`
(ADR-0009) — a Distributor must never see either, and neither field is
ever part of the identification-only projection Phase 1 exposes to
Pricing Engine's output.

## Objective

Provide an authenticated application surface where distributors browse the
ELIMFILTERS-approved, priced catalog — and only that — and (in Phase 9)
place orders against it, with zero visibility into which Manufacturer
produced a SKU or what it costs ELIMFILTERS.

## Scope

**In scope:**
- Distributor account model: identity, tier, region/currency (drives which
  Pricing Engine output applies).
- Catalog browsing scoped to `VALID` + priced Passports only
  (`BUSINESS_RULES.md` §11) — no draft, unvalidated, or unpriced products
  visible under any circumstance.
- **Confidentiality enforcement as a first-class requirement:** no
  Distributor-facing view, export, or API response may ever contain
  Manufacturer identity (name or `EFM-XXXX` code), FOB price, margin,
  landed-cost breakdown, Offer/Offer-revision identifiers, or either
  Passport note field (`manufacturer_instruction_notes` or
  `internal_engineering_notes`). A Distributor sees the product (per its
  public-safe Passport identification fields), its packaging as
  ELIMFILTERS-approved (`elimfilters_approved_quantity` and final
  packaging from Offer Approval, Phase 3), and its final sell price —
  nothing else from the internal chain.
- Read-only integration with Pricing Engine output; the portal holds no
  independent pricing logic.
- As a distinct, authenticated surface — not an extension of the public,
  anonymous `frontend/` access model.

**Out of scope:**
- Order placement/lifecycle mechanics themselves (Phase 9) — Phase 8
  provides the browsing/account surface Phase 9 builds ordering on top of.
- Public marketing content, SEO/GEO — that remains `frontend/`'s
  responsibility entirely; Phase 8 is not a Knowledge System page.
- Any Manufacturer-facing functionality — Manufacturers interact with the
  Manufacturer Intake Portal (Phase 3), a separate surface with a
  separate, non-overlapping audience.

## Dependencies

- Phase 1 (Passport identification data defines what's shown for a
  product — not its required engineering or confidential notes).
- Phase 7 (Pricing Engine output is what's shown as price, and is
  responsible for stripping manufacturer/cost-basis fields before this
  phase ever receives the data) — transitively depends on Phases 2-6 being
  built and a `VALID` result existing for anything to be visible at all.
- **Hard, named, undecided dependency:** Distributor authentication
  provider/design (ADR-0002). This phase cannot begin implementation until
  that decision is made — it is not a Phase 0 output and must be resolved
  before Phase 8's spec can move to `Spec Approved`.

## Key Entities / Data Model (sketch, not final)

- `ebp_distributor_accounts` — identity (shape depends on the auth
  decision in ADR-0002), `tier`, `region`, `currency`, `status`.
- No independent product/price tables — Phase 8 reads Phase 1
  (identification fields only) and Phase 7 (priced, confidentiality-
  stripped) data directly; it does not cache or duplicate it into
  portal-owned tables (consistent with "single source of truth per
  concern," `PROJECT_MANIFESTO.md` §4.2).
- Phase 8 must never hold a foreign key, cached field, or join path back
  to `ebp_manufacturers`, `ebp_manufacturer_offers`, or
  `ebp_cost_calculations` — the confidentiality boundary is structural,
  not a permissions check on otherwise-present data.

## Business Rules Enforced

- `BUSINESS_RULES.md` §11 in full, including the explicit confidentiality
  list (manufacturer identity, `EFM-XXXX`, FOB, margin, landed-cost
  breakdown, Offer/revision identifiers, both Passport note fields).
- ADR-0006 (confidentiality enforced at the Pricing Engine → Distributor
  Portal data boundary) and ADR-0009 (note-field split; neither note field
  is ever Distributor-visible).

## Integration Points

- Reads Phase 1 (Passport display data — identification fields only, never
  either note field), Phase 7 (price, already stripped of confidential
  fields), Phase 4 (validity, transitively via what Phase 7 will even have
  priced).
- Read by: Phase 9 (order placement happens from within this portal
  surface, and the same confidentiality boundary applies to any
  distributor-visible order record, per `BUSINESS_RULES.md` §12).

## Deliverables

- A resolved authentication approach (prerequisite, not itself a Phase 8
  "deliverable" in the engineering sense, but required before this phase's
  spec is approvable).
- Approved distributor account/tier/region data model.
- Approved catalog-browsing surface scoped strictly to `VALID` + priced
  Passports, with a data-shape audit confirming no manufacturer/cost-basis
  field is reachable from any Phase 8 endpoint.

## Exit Criteria

- A distributor account in a given tier/region sees only `VALID`, priced
  SKUs, with the correct Pricing Engine output for their tier/region/
  currency, and sees zero draft/unvalidated/unpriced products under any
  navigation path.
- An audit of every Phase 8 API response and exported view confirms zero
  fields carrying manufacturer identity, `EFM-XXXX`, FOB, margin, Offer/
  revision identifiers, or either Passport note field
  (`manufacturer_instruction_notes`, `internal_engineering_notes`) —
  checked at the data-shape level, not only the rendered UI.

## Risks

- **Risk: this phase is blocked on an undecided architectural
  dependency (auth) that Phase 0 explicitly deferred.** This is the
  clearest concrete risk carried out of Phase 0 — see the Phase 0 audit
  report's risk section and ADR-0002. Recommend resolving this during
  Milestone B (Phases 04-07), not at the start of Phase 8 itself, to avoid
  a hard stall at the start of Milestone C.
- **Risk: confidentiality-leak risk is the highest-consequence risk in
  the entire program.** Because this is the first customer-facing
  (distributor-facing) surface in the roadmap, any gap in either the
  `VALID`+priced filtering logic or the manufacturer/cost-basis stripping
  logic is the most consequential place in the entire program for it to
  fail — it would expose either unvalidated/mispriced products or
  commercially sensitive sourcing data directly to a commercial
  counterparty. This risk was elevated explicitly in this correction round
  and should be treated as a release-blocking check, not a nice-to-have.

## Open Questions

- Should Phase 8 share any session/identity infrastructure with a future
  `frontend/` authenticated feature (if one is ever built), or should it be
  fully independent? No such feature currently exists on `frontend/`, so
  this is speculative but worth flagging before the auth decision (ADR-0002)
  is finalized.
- Do internal ELIMFILTERS staff need a privileged view within the same
  portal (seeing manufacturer/cost detail), or is that entirely a separate,
  internal-only tool outside the Distributor Portal's scope? Not decided in
  Phase 0 — if staff access is ever added to this same surface, the
  confidentiality boundary above must be re-verified per role, not assumed
  to hold by default.
