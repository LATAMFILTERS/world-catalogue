# BUSINESS RULES — ELIMFILTERS Business Platform (EBP)

**Status:** Phase 0 — Foundation (revised, correction round, 2026-07-13)
**Authority:** This document is the canonical source for EBP domain rules.
Where it overlaps with root `CLAUDE.md` (SKU architecture, language rules,
positioning rules), root `CLAUDE.md` remains authoritative for the World
Catalogue/catalog domain and is referenced, not restated in full, here.

**Correction notice:** This revision replaces the original draft's
`Passport × Manufacturer × Supplier` model with the agreed MVP model,
`Passport Version × Manufacturer × Manufacturer Offer`. Raw-material/
component suppliers are not a mandatory MVP entity. See ADR-0005 and
ADR-0006 in `DECISIONS.md` for the full rationale.

## 1. Vocabulary (disambiguation)

EBP introduces terms that are easy to confuse with existing catalog concepts
or with each other. This section is the tie-breaker.

| Term | Meaning in EBP | Not to be confused with |
|---|---|---|
| **OEM** | Vehicle/equipment manufacturer whose part a SKU cross-references (FIAT, VW, Caterpillar, etc.). Already modeled in the existing `oems` table. | An EBP **Manufacturer** (below). |
| **Manufacturer** | The factory engineering-approved to *produce* ELIMFILTERS-branded SKUs. Identified permanently and confidentially by an `EFM-XXXX` code (never by name as a functional key). New concept, defined in Phase 2. | The existing `oems` table. Also not "competitor brand" (Donaldson, Fleetguard, Mann) — reference brands for cross-referencing and SKU generation, not EBP manufacturing partners. |
| **Manufacturer Request Batch** | A set of SKUs/Passports ELIMFILTERS assigns to one or more Manufacturers for a production-capability response. New concept, defined in Phase 3. | A purchase order. It is a request for capability/offer, not a commitment to buy. |
| **Manufacturer Product Offer** | A specific Manufacturer's response to a Passport within a Request Batch: its offered specification (`offered_*`/`actual_*` fields), FOB price, MOQ, lead time, capacity, packaging, and evidence. Exactly one Offer per (Manufacturer, Passport version). New concept, defined in Phase 3. | The Passport itself. The Offer is the Manufacturer's *answer* to the Passport's *question*; they are never merged into one record. |
| **Product Engineering Passport (PEP)** | The canonical, ELIMFILTERS-owned technical specification of a SKU or product family: locked identification, required engineering, required packaging. New concept, defined in Phase 1. | The public-facing catalog/marketing description on `frontend/`. Also not a Manufacturer's Offer — the Passport is the requirement; the Offer is the response. |
| **Engineering Compliance Validation** | The gate that checks whether a Manufacturer Offer satisfies a Passport's required fields. Operates on **Passport Version × Manufacturer × Manufacturer Offer**. Formerly drafted as "Validation Engine" against a Supplier model — corrected by ADR-0005. Defined in Phase 4. | Manufacturer *qualification* (Phase 2, family-level, not offer-specific). |
| **Supplier** (raw material/component vendor) | **Not an MVP entity.** Explicitly out of scope for Phases 00-09. See ADR-0005. If ever modeled, it would be a Manufacturer-internal concern (e.g., evidence attached to an Offer), not an independently validated EBP entity. | Do not design any Phase 01-09 deliverable to depend on a Supplier record. |
| **Distributor** | A B2B account that sees only ELIMFILTERS-approved products at their final approved price. Never sees Manufacturer identity, `EFM-XXXX` code, FOB, margin, or confidential engineering. Defined in Phase 8. | Internal ELIMFILTERS staff, who may see full Manufacturer/Offer/cost detail depending on role (role model itself is a Phase 8 open question, not decided here). |
| **Duty (HD/LD)** | Heavy Duty / Light Duty classification per root `CLAUDE.md`. | Not redefined by EBP; EBP inherits it as-is. |

## 2. SKU and Catalog Rules (inherited, not modified)

EBP does not redefine SKU generation, prefixes, or duty classification. It
inherits, verbatim, the rules in root `CLAUDE.md` under "Product Catalog SKU
Architecture":

- HD prefixes (`EA1`, `EA2`, `ED4`, `EH6`, `EL8`, `EM9`, `ES9`, `EC1`, `EF9`,
  `EW7`, `ET9`) and LD prefixes (`EL3`, `EA3`, `EC3`, `EF3`) are fixed.
- LD SKU generation (last-4-digits rule, collision-rejection rule) is
  unchanged.
- No HD/LD mixing. No invented SKUs. No duplicate SKUs.
- OEM codes vs. competitor codes remain separate fields; EBP does not merge
  them.

**EBP-specific addition:** every EBP Product Engineering Passport (Phase 1)
must reference an *existing* SKU, identified by its permanent, immutable
`elimfilters_code`, or an explicitly flagged *pre-SKU* draft product (a
product in engineering review before a SKU is minted). A Passport may never
invent or duplicate a SKU; SKU minting remains governed by the existing
rules above.

## 3. Product Engineering Passport (PEP) Rules

- A Passport's **locked identification** fields (`elimfilters_code`,
  `base_code`, `base_brand`, `product_category`, `product_subtype`, `duty`,
  `technology_code`, `engineering_revision`, `status`) are set by
  ELIMFILTERS only and are never editable by a Manufacturer.
- A Passport's **required engineering fields** (dimensions/tolerances,
  thread, required media, required composition, minimum efficiency and its
  particle-size basis, Beta Ratio/micron rating where applicable, required
  adhesive, operating temperature, collapse pressure, burst pressure,
  gasket material, center tube, end caps, bypass valve requirement and
  opening pressure/tolerance/type/material where applicable, anti-drainback
  valve requirement and material where applicable, required test standards,
  confidential manufacturing notes) are `required_*` fields: locked,
  defined by ELIMFILTERS, and never editable by a Manufacturer.
- A Passport's **required packaging** fields follow the automotive/
  industrial split in §3.1 below and distinguish ELIMFILTERS' target
  quantity from any Manufacturer-recommended or ELIMFILTERS-final-approved
  quantity — these three quantities are never collapsed into one field.
- A new `engineering_revision` supersedes the prior one; it does not
  overwrite it (auditability). Every Manufacturer Offer references a
  specific Passport version; a Passport revision does not retroactively
  alter a previously submitted Offer's validity — it triggers
  re-validation per §5.

### 3.1 Packaging Rules

- **Automotive products:** individual box by default; protective bag only
  when applicable to the product; master box always required.
- **Industrial products:** no individual box by default; bag, separator, or
  protective element only when applicable; target quantity per master box
  is normally 6, 12, or 24 units.
- Three distinct quantity fields must always be kept separate and never
  merged: `elimfilters_target_quantity` (ELIMFILTERS' requirement),
  `manufacturer_recommended_quantity` (the Manufacturer's proposal in its
  Offer), and `elimfilters_approved_quantity` (ELIMFILTERS' final decision,
  set only after review).

## 4. Manufacturer Registry Rules

- A Manufacturer record must specify: an internal database identifier, a
  permanent confidential `manufacturer_code` in the format `EFM-XXXX`
  (assigned once, at registration, and never reassigned or reused), legal
  name, country and location(s), contacts, certifications, the product
  families it is qualified to produce (a subset of the Phase 1 Passport
  taxonomy), and a qualification status: `CANDIDATE`, `QUALIFIED`,
  `CONDITIONAL`, `SUSPENDED`, or `RETIRED`.
- **`manufacturer_code` (`EFM-XXXX`), not `legal_name`, is the functional
  key.** Every other EBP module (Manufacturer Intake Portal, Engineering
  Compliance Validation, Manufacturer Selection, Cost Engine) references a
  Manufacturer by its `EFM-XXXX` code. `legal_name` is descriptive metadata
  only and must never be used as a join key or as a Distributor-visible
  label (see §9). See ADR-0006.
- A Manufacturer may not be referenced by Manufacturer Selection (Phase 5)
  or Cost Engine (Phase 6) unless its status is `QUALIFIED` or
  `CONDITIONAL` (with the specific condition satisfied for the SKU in
  question — see the Manufacturer's own spec for how a condition is scoped
  and checked).
- Qualification status changes must be logged with a reason and timestamp
  (auditability requirement, `PLATFORM_ARCHITECTURE.md` §6) — status is
  never silently overwritten.
- A Manufacturer's qualified product families must be a subset of families
  defined in the Product Engineering Passport taxonomy (Phase 1); Phase 2
  may not introduce a family taxonomy independent of Phase 1.

## 5. Manufacturer Intake (Manufacturer Request Batch & Offer) Rules

- A **Manufacturer Request Batch** is a set of Passports (SKUs) ELIMFILTERS
  assigns to one or more Manufacturers for a capability/offer response. It
  does not commit ELIMFILTERS to purchase.
- For each Passport in a Request Batch a Manufacturer receives, it may
  respond with exactly one **Manufacturer Product Offer** per Passport
  version. Multiple Manufacturers may each submit a different Offer for
  the same Passport — Offers are never merged or averaged.
- Every applicable Passport property that a Manufacturer answers must be
  recorded as a pair, never mixed with the requirement:
  - `required_*` (or `required_<field>`): locked, ELIMFILTERS-defined, from
    the Passport (§3). The Manufacturer cannot edit this.
  - `offered_*` / `actual_*`: the Manufacturer's own value for that
    property, editable only by the Manufacturer.
  - `compliance_status`: set only by Engineering Compliance Validation
    (Phase 4), never self-declared by the Manufacturer.
  - `manufacturer_note`: free-text context supplied by the Manufacturer.
  - `evidence_attachment`: supporting documentation (test reports,
    certifications) supplied by the Manufacturer for that property.
- A Manufacturer Offer must also carry: FOB price, MOQ, lead time, monthly
  capacity, its recommended packaging quantity (§3.1), and any
  certifications/evidence not tied to a specific engineering property.
- Raw-material or component sourcing internal to how a Manufacturer builds
  its Offer is not modeled by EBP (ADR-0005). If a Manufacturer wants to
  substantiate an `offered_*` value with a component supplier's
  certificate, that certificate is recorded as an `evidence_attachment` on
  the relevant property — it does not create an independent Supplier
  record or relationship in EBP.

## 6. Engineering Compliance Validation Rules

- Engineering Compliance Validation is the **only** module permitted to set
  `compliance_status` on any property of a Manufacturer Offer, or an
  overall `VALID`/`INVALID` result on a (Passport Version × Manufacturer ×
  Manufacturer Offer) combination. No other module writes this status.
- A combination is `VALID` only if: the Manufacturer is `QUALIFIED` (or
  `CONDITIONAL` with its condition satisfied) for the Passport's product
  family, and every `required_*` property on the Passport has a
  corresponding `offered_*`/`actual_*` value on the Offer that meets the
  requirement — no waivers by default.
- Validation results are versioned and immutable once issued. A change to
  the underlying Passport (`engineering_revision`), Manufacturer
  qualification status, or the Offer itself invalidates the prior result
  and requires re-validation; it does not mutate the historical record
  (auditability).
- Manufacturer Selection, Cost Engine, Pricing Engine, and Distributor
  Portal must refuse to operate on a combination without a current `VALID`
  result. This is a hard gate, not a warning.
- Engineering Compliance Validation never references a Supplier record. It
  evaluates the Passport and the Offer only (ADR-0005).

## 7. Manufacturer Selection Rules

- Selection logic evaluates, per SKU, only Offers that hold a current
  `VALID` Engineering Compliance Validation result. An Offer without a
  `VALID` result is never a candidate, including for manual override —
  a manual override must instead go through Engineering Compliance
  Validation to produce a new `VALID` result.
- Selection must consider, at minimum: mandatory technical compliance
  (the `VALID` gate itself), FOB price, packaging, MOQ, lead time, monthly
  capacity, certifications, evidence, and quality history where it exists.
- Selection must recommend three tiers, not a single winner:
  **primary**, **secondary**, and **backup** Manufacturer. Final approval
  of the recommendation always belongs to ELIMFILTERS — Selection
  recommends, it does not auto-commit an order or auto-finalize sourcing.
- Selection decisions (all three tiers, the candidates considered, and the
  basis for ranking) must be recorded, not just the final approved choice.

## 8. Cost Engine Rules

- Cost Engine computes landed cost only from `VALID` (Passport ×
  Manufacturer × Manufacturer Offer) combinations, using the Offer's FOB
  price as the base cost input, plus freight, duties, and overhead
  allocation. Cost Engine does not decompose or re-derive the Manufacturer's
  internal materials/conversion cost breakdown — FOB is the Manufacturer's
  own commercial figure and is treated as such.
- Cost Engine output is versioned per (Passport, Manufacturer, effective
  date range). A new cost calculation does not overwrite a prior one; it
  supersedes it with a new effective date, preserving history.
- Cost Engine is the **only** module that computes landed cost. Pricing
  Engine and Distributor Portal consume its output; they do not
  independently estimate cost.

## 9. Pricing Engine Rules

- Sell price is derived from landed cost (Cost Engine) plus a margin rule
  set by channel (distributor tier) and region/currency. Margin rules are
  data, not hardcoded per-SKU exceptions, except where an explicit override
  is logged (auditability).
- Pricing Engine must enforce a price floor derived from landed cost — no
  price may be published below landed cost without an explicit, logged
  exception.
- Pricing language and positioning must follow the Category Reframing Layer
  and AI Citation Layer language rules in root `CLAUDE.md`: no commodity
  race-to-bottom framing. Price is presented as one input to total cost of
  ownership, not the headline.
- Pricing Engine is the **only** module that computes sell price.
  Distributor Portal and Order Management display and transact on its
  output; they do not recompute price.
- **Pricing Engine's output to Distributor Portal must not carry
  manufacturer-identifying or cost-basis fields at all** — not FOB, not
  `EFM-XXXX`, not margin, not landed-cost breakdown. This is a data-shape
  requirement, not a UI-hiding requirement (ADR-0006).

## 10. Distributor Portal Rules

- A distributor account may only see priced, `VALID`-backed SKUs.
  Unvalidated or unpriced products are not visible, even in draft form, to
  distributor accounts.
- A distributor account may **never** see: Manufacturer identity or
  `EFM-XXXX` code, FOB price, margin, landed-cost breakdown, or
  confidential engineering/manufacturing notes, under any navigation path,
  export, or API response. This is enforced by the data Pricing Engine
  sends to Distributor Portal (§9), not by portal-side filtering alone.
- Distributor-specific pricing (tier, region, currency) must come from
  Pricing Engine; the portal itself holds no independent pricing logic.
- Distributor Portal is a distinct, authenticated application surface. It
  does not reuse the public/anonymous access model of `frontend/`.

## 11. Order Management Rules

- An order may only be created against a priced SKU backed by a `VALID`
  Engineering Compliance Validation result, with a Manufacturer Selection
  decision on record (or an equivalent decision made at order time using
  the same Selection rules).
- Order status changes (placed → allocated → in production → shipped →
  delivered → invoiced) must be logged sequentially; status may not skip
  or be set out of order without an explicit, logged correction.
- Order Management does not compute cost or price; it references Cost
  Engine and Pricing Engine output as of order placement time and freezes
  that reference for the life of the order (price protection).
- Order Management surfaces to a Distributor follow the same
  confidentiality rule as §10 — manufacturer identity, `EFM-XXXX`, FOB, and
  margin never appear in a distributor-visible order record, only in
  ELIMFILTERS-internal views.

## 12. Cross-Cutting Rules

- **No phase may bypass an earlier phase's gate.** E.g., Cost Engine (06)
  may not compute a cost for a combination that has no `VALID` Engineering
  Compliance Validation result, even temporarily, even in a non-production
  environment.
- **No Supplier dependency in the mandatory MVP chain.** No Phase 01-09
  spec may require a raw-material/component Supplier record to function.
  See ADR-0005.
- **No invented data.** No Manufacturer, Offer, cost, or price figure may
  be fabricated for demo/testing purposes in a way that could be mistaken
  for real data in shared environments. Test/seed data must be clearly
  flagged as such.
- **Language rules.** Any user-facing text produced by EBP modules
  (Distributor Portal copy, order confirmations, pricing rationale) follows
  the neutral, technical, non-marketing tone rules already codified in root
  `CLAUDE.md` (AI Citation Layer §5, Category Reframing Layer language
  rules).
