# BUSINESS RULES — ELIMFILTERS Business Platform (EBP)

**Status:** Phase 0 — Foundation
**Authority:** This document is the canonical source for EBP domain rules.
Where it overlaps with root `CLAUDE.md` (SKU architecture, language rules,
positioning rules), root `CLAUDE.md` remains authoritative for the World
Catalogue/catalog domain and is referenced, not restated in full, here.

## 1. Vocabulary (disambiguation)

EBP introduces terms that are easy to confuse with existing catalog concepts.
This section is the tie-breaker.

| Term | Meaning in EBP | Not to be confused with |
|---|---|---|
| **OEM** | Vehicle/equipment manufacturer whose part a SKU cross-references (FIAT, VW, Caterpillar, etc.). Already modeled in the existing `oems` table. | An EBP **Manufacturer** (below). |
| **Manufacturer** (EBP) | A physical factory or manufacturing partner engineering-approved to *produce* ELIMFILTERS-branded SKUs. New concept, defined in Phase 2. | The existing `oems` table. Also not "competitor brand" (Donaldson, Fleetguard, Mann) — those are reference brands for cross-referencing and SKU generation source data, not EBP manufacturing partners. |
| **Supplier** (EBP) | A vendor of raw materials or components (filter media, cores, gaskets, cans, adhesives) consumed by a Manufacturer. New concept, defined in Phase 3. | A Manufacturer. A Supplier does not produce finished SKUs. |
| **Product Engineering Passport (PEP)** | The canonical technical specification of a SKU or product family: dimensions, media spec, performance targets, applicable standards, technology assignment. New concept, defined in Phase 1. | The public-facing catalog/marketing description on `frontend/`. |
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
must reference an *existing* SKU or an explicitly flagged *pre-SKU* draft
product (a product in engineering review before a SKU is minted). A Passport
may never invent or duplicate a SKU; SKU minting remains governed by the
existing rules above.

## 3. Manufacturer Registry Rules

- A Manufacturer record must specify: legal identity, physical
  location(s)/region, the product families it is qualified to produce (by
  filter type, not by individual SKU), and its current qualification status
  (`CANDIDATE`, `QUALIFIED`, `SUSPENDED`, `RETIRED`).
- A Manufacturer may not be referenced by Manufacturer Selection (Phase 5)
  or Cost Engine (Phase 6) unless its status is `QUALIFIED`.
- Qualification status changes must be logged with a reason and timestamp
  (auditability requirement, `PLATFORM_ARCHITECTURE.md` §6) — status is
  never silently overwritten.
- A Manufacturer's qualified product families must be a subset of families
  defined in the Product Engineering Passport taxonomy (Phase 1); Phase 2
  may not introduce a family taxonomy independent of Phase 1.

## 4. Supplier Portal Rules

- A Supplier record must specify: legal identity, the component/material
  categories it supplies, and which Manufacturer(s) it is an approved
  supplier for. A Supplier is not globally "approved" — approval is always
  scoped to a specific Manufacturer relationship.
- A component/material supplied by a Supplier must map to a specification
  referenced by at least one Product Engineering Passport before it can be
  used in Validation (Phase 4). Unmapped/speculative supplier catalog data
  is allowed to exist but cannot pass validation.

## 5. Validation Engine Rules

- Validation Engine is the **only** module permitted to mark a
  (Passport × Manufacturer × Supplier) combination as `VALID`. No other
  module writes this status.
- A combination is valid only if: the Manufacturer is `QUALIFIED` for the
  Passport's product family, every required component/material in the
  Passport's bill of materials is sourced from a Supplier approved for that
  specific Manufacturer, and all Passport-declared standards (ISO/SAE/ASTM)
  are met by the declared specs — no waivers by default.
- Validation results are versioned and immutable once issued. A change to
  the underlying Passport, Manufacturer qualification, or Supplier approval
  invalidates the prior result and requires re-validation; it does not
  mutate the historical record (auditability).
- Cost Engine, Pricing Engine, Manufacturer Selection, and Distributor
  Portal must refuse to operate on a combination without a current `VALID`
  result. This is a hard gate, not a warning.

## 6. Manufacturer Selection Rules

- Selection logic must consider, at minimum: validated status, landed cost
  (from Cost Engine once available), lead time, and region/proximity to
  destination.
- Selection decisions must be recorded (which Manufacturer was chosen, for
  which Passport, on what basis) — not just the final assignment. This
  supports later cost/quality post-mortems.
- Selection may not choose a non-`VALID` combination under any
  circumstance, including manual override — a manual override must instead
  go through Validation Engine to produce a new `VALID` result.

## 7. Cost Engine Rules

- Cost Engine computes landed cost only from `VALID` combinations. Landed
  cost components, at minimum: materials/components (from Supplier data),
  conversion/manufacturing cost (from Manufacturer data), freight, duties,
  and overhead allocation.
- Cost Engine output is versioned per (Passport, Manufacturer, effective
  date range). A new cost calculation does not overwrite a prior one; it
  supersedes it with a new effective date, preserving history.
- Cost Engine is the **only** module that computes landed cost. Pricing
  Engine and Distributor Portal consume its output; they do not
  independently estimate cost.

## 8. Pricing Engine Rules

- Sell price is derived from landed cost (Cost Engine) plus a margin rule
  set by channel (distributor tier) and region/currency. Margin rules are
  data, not hardcoded per-SKU exceptions, except where an explicit override
  is logged (auditability).
- Pricing Engine must enforce a price floor derived from landed cost — no
  price may be published below landed cost without an explicit, logged
  exception (e.g., promotional or clearance policy defined in a later
  phase).
- Pricing language and positioning must follow the Category Reframing Layer
  and AI Citation Layer language rules in root `CLAUDE.md`: no commodity
  race-to-bottom framing ("cheaper than X", "saves money on filters"). Price
  is presented as one input to total cost of ownership, not the headline.
- Pricing Engine is the **only** module that computes sell price.
  Distributor Portal and Order Management display and transact on its
  output; they do not recompute price.

## 9. Distributor Portal Rules

- A distributor account may only see priced, `VALID` SKUs. Unvalidated or
  unpriced products are not visible, even in draft form, to distributor
  accounts.
- Distributor-specific pricing (tier, region, currency) must come from
  Pricing Engine; the portal itself holds no independent pricing logic.
- Distributor Portal is a distinct, authenticated application surface. It
  does not reuse the public/anonymous access model of `frontend/`.

## 10. Order Management Rules

- An order may only be created against a priced, `VALID` SKU with a
  Manufacturer Selection decision on record (or an equivalent decision made
  at order time using the same Selection rules).
- Order status changes (placed → allocated → in production → shipped →
  delivered → invoiced) must be logged sequentially; status may not skip
  or be set out of order without an explicit, logged correction.
- Order Management does not compute cost or price; it references Cost
  Engine and Pricing Engine output as of order placement time and freezes
  that reference for the life of the order (price protection).

## 11. Cross-Cutting Rules

- **No phase may bypass an earlier phase's gate.** E.g., Cost Engine (06)
  may not compute a cost for a combination that has no `VALID` Validation
  Engine result, even temporarily, even in a non-production environment.
- **No invented data.** As with the existing catalog rules, no
  Manufacturer, Supplier, cost, or price figure may be fabricated for
  demo/testing purposes in a way that could be mistaken for real data in
  shared environments. Test/seed data must be clearly flagged as such.
- **Language rules.** Any user-facing text produced by EBP modules
  (Distributor Portal copy, order confirmations, pricing rationale) follows
  the neutral, technical, non-marketing tone rules already codified in root
  `CLAUDE.md` (AI Citation Layer §5, Category Reframing Layer language
  rules).
