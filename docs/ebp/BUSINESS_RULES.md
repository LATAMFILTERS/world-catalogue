# BUSINESS RULES — ELIMFILTERS Business Platform (EBP)

**Status:** Phase 0 — Foundation (revised, second correction round, 2026-07-13)
**Authority:** This document is the canonical source for EBP domain rules.
Where it overlaps with root `CLAUDE.md` (SKU architecture, language rules,
positioning rules), root `CLAUDE.md` remains authoritative for the World
Catalogue/catalog domain and is referenced, not restated in full, here.

**Correction notice (first round):** The original draft's
`Passport × Manufacturer × Supplier` model was replaced with
`Passport Version × Manufacturer × Manufacturer Offer`. Raw-material/
component suppliers are not a mandatory MVP entity. See ADR-0005 and
ADR-0006 in `DECISIONS.md`.

**Correction notice (second round, this revision):** The first round still
assumed exactly one Offer per (Manufacturer, Passport Version), described
Manufacturer-proposed and ELIMFILTERS-approved packaging quantities as if
they were Passport fields, and used a single undifferentiated
"confidential manufacturing notes" field. This revision corrects all
three: Offers are now versioned with a full status lifecycle (§5), Offer
Approval is a new, distinct entity/section (§7), packaging data ownership
is split across the PEP, the Offer, and Offer Approval (§3.1), and
Passport notes are split into `manufacturer_instruction_notes` and
`internal_engineering_notes` (§3). See ADR-0007, ADR-0008, and ADR-0009 in
`DECISIONS.md`. Inserting §7 shifted every subsequent section number by
one relative to the first correction round — cross-references throughout
`docs/ebp/` have been re-checked against the numbering below.

## 1. Vocabulary (disambiguation)

EBP introduces terms that are easy to confuse with existing catalog concepts
or with each other. This section is the tie-breaker.

| Term | Meaning in EBP | Not to be confused with |
|---|---|---|
| **OEM** | Vehicle/equipment manufacturer whose part a SKU cross-references (FIAT, VW, Caterpillar, etc.). Already modeled in the existing `oems` table. | An EBP **Manufacturer** (below). |
| **Manufacturer** | The factory engineering-approved to *produce* ELIMFILTERS-branded SKUs. Identified permanently and confidentially by an `EFM-XXXX` code (never by name as a functional key). New concept, defined in Phase 2. | The existing `oems` table. Also not "competitor brand" (Donaldson, Fleetguard, Mann) — reference brands for cross-referencing and SKU generation, not EBP manufacturing partners. |
| **Manufacturer Request Batch** | A set of SKUs/Passports ELIMFILTERS assigns to one or more Manufacturers for a production-capability response. New concept, defined in Phase 3. | A purchase order. It is a request for capability/offer, not a commitment to buy. |
| **Manufacturer Product Offer** | A specific Manufacturer's versioned response to a Passport within a Request Batch: its offered specification (`offered_*`/`actual_*` fields), FOB price, MOQ, lead time, capacity, packaging, and evidence. A Manufacturer may submit **many** Offers (revisions) for the same Passport Version over time, but at most one may be active at a time. New concept, defined in Phase 3. See §5 and ADR-0007. | The Passport itself. The Offer is the Manufacturer's *answer* to the Passport's *question*; they are never merged into one record. Also not the same as **Offer Approval** (§7) — an Offer being valid does not mean it is approved. |
| **Offer Approval** | ELIMFILTERS' decision about whether a specific Manufacturer Offer's packaging and commercial/operational terms are accepted — distinct from Engineering Compliance Validation, which only checks technical compliance. New concept, defined in Phase 3. See §7 and ADR-0008. | Engineering Compliance Validation (§6). Also not Manufacturer Selection's own approval step (§8) — Offer Approval judges one Offer; Selection's approval judges which Offer is sourced from. |
| **Product Engineering Passport (PEP)** | The canonical, ELIMFILTERS-owned technical specification of a SKU or product family: locked identification, required engineering, required packaging. New concept, defined in Phase 1. | The public-facing catalog/marketing description on `frontend/`. Also not a Manufacturer's Offer — the Passport is the requirement; the Offer is the response. The PEP never holds Manufacturer-proposed or ELIMFILTERS-approved-after-review values — see §3.1 and ADR-0008. |
| **Engineering Compliance Validation** | The gate that checks whether a specific Manufacturer Offer revision satisfies a Passport's required fields. Operates on **Passport Version × Manufacturer Code × Offer ID × Offer Revision**. Formerly drafted as "Validation Engine" against a Supplier model — corrected by ADR-0005; bound to a specific Offer revision — corrected by ADR-0007. Defined in Phase 4. | Manufacturer *qualification* (Phase 2, family-level, not offer-specific). Also not Offer Approval (§7) — Validation is technical only. |
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

**Phase 1 implementation addendum (ADR-0014, does not alter the frozen
v1.0 baseline):** where a Passport's required engineering fields are
resolved from Phase 1's field-applicability matrix, a Passport revision
may not activate while it depends on a matrix rule that is still
`PROVISIONAL_REQUIRES_ELIMFILTERS_ENGINEERING_APPROVAL` — see ADR-0014
and `phases/phase-01-product-engineering-passport.md`. Drafting is never
blocked by this; only the `DRAFT` → `ACTIVE` transition is.

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
  valve requirement and material where applicable, required test standards)
  are `required_*` fields: locked, defined by ELIMFILTERS, and never
  editable by a Manufacturer.
- A Passport's engineering data also carries two **separately scoped note
  fields** (ADR-0009), never a single undifferentiated "confidential
  manufacturing notes" field:
  - `manufacturer_instruction_notes` — technical instructions a plant needs
    to quote or produce correctly. Visible only to a Manufacturer that has
    actually been sent this Passport in a Request Batch (Phase 3), and to
    authorized ELIMFILTERS staff. Never visible to Distributors or the
    public.
  - `internal_engineering_notes` — ELIMFILTERS-internal information. Never
    visible to any Manufacturer or Distributor. Only authorized internal
    roles.
  - No API may return a generic serialization of "the Passport" that
    includes either field by default. Every consumer (Manufacturer Intake
    Portal, internal engineering tooling, Distributor/Pricing-facing
    surfaces) is served from its own explicit, reviewed projection/DTO — an
    allow-list per role, not a single shared shape with fields hidden after
    the fact.
- A Passport's **required packaging** fields hold only ELIMFILTERS'
  requirements — see §3.1. Manufacturer-proposed and ELIMFILTERS-approved-
  after-review packaging values are never stored on the Passport (ADR-0008).
- A new `engineering_revision` supersedes the prior one; it does not
  overwrite it (auditability). Every Manufacturer Offer references a
  specific Passport version; a Passport revision does not retroactively
  alter a previously submitted Offer's validity — it triggers
  re-validation per §6.

### 3.1 Packaging Rules (ownership split — ADR-0008)

Packaging-related data is split across three separately owned records.
They are never merged into one field set:

**A. In the PEP (`ebp_passport_packaging`, Phase 1) — ELIMFILTERS
requirements only:**
- `individual_box_required`
- `protective_bag_required`
- `separator_required`
- `master_carton_required`
- `elimfilters_target_quantity`
- target dimensions or restrictions, when they exist
- ELIMFILTERS-required packaging instructions

**B. In the Manufacturer Product Offer (Phase 3) — that Manufacturer's own
proposal, scoped to its specific Offer revision:**
- `manufacturer_recommended_quantity`
- proposed box dimensions
- net weight and gross weight
- proposed units per box
- proposed protection method
- proposed palletization
- observations and deviations

**C. In Offer Approval (`ebp_manufacturer_offer_approvals`, §7) —
ELIMFILTERS' final decision about a specific Offer, made after review:**
- `elimfilters_approved_quantity`
- final approved packaging
- approval or rejection of any proposed deviation
- responsible approver
- date
- reason

Automotive/industrial defaults for the ELIMFILTERS-requirement side (A):

- **Automotive products:** individual box by default; protective bag only
  when applicable to the product; master box always required.
- **Industrial products:** no individual box by default; bag, separator, or
  protective element only when applicable; target quantity per master box
  is normally 6, 12, or 24 units.

`manufacturer_recommended_quantity` and `elimfilters_approved_quantity` are
never stored on the Passport. Each Manufacturer may recommend a different
quantity for the same product, so that value belongs to its individual
Offer (B); ELIMFILTERS' final decision belongs to Offer Approval (C), made
only after review of a specific Offer's proposal.

## 4. Manufacturer Registry Rules

**Note (additive, ADR-0020):** the qualification-status list below
predates Phase 2 implementation and is non-exhaustive — it did not name an
explicit "under review" state. Phase 2 implements a six-state machine
(`CANDIDATE`, `UNDER_REVIEW`, `CONDITIONAL`, `QUALIFIED`, `SUSPENDED`,
`RETIRED`) with `UNDER_REVIEW` as the mandatory re-assessment step every
reactivation out of `SUSPENDED` must pass through. See ADR-0020 in
`DECISIONS.md` for the full transition table. This note is additive only;
no sentence below is altered or removed.

- A Manufacturer record must specify: an internal database identifier, a
  permanent confidential `manufacturer_code` in the format `EFM-XXXX`
  (assigned once, at registration, and never reassigned or reused), legal
  name, country and location(s), contacts, certifications, the product
  families it is qualified to produce (a subset of the Phase 1 Passport
  taxonomy), and a qualification status: `CANDIDATE`, `QUALIFIED`,
  `CONDITIONAL`, `SUSPENDED`, or `RETIRED`.
- **`manufacturer_code` (`EFM-XXXX`), not `legal_name`, is the functional
  key.** Every other EBP module (Manufacturer Intake Portal, Engineering
  Compliance Validation, Offer Approval, Manufacturer Selection, Cost
  Engine) references a Manufacturer by its `EFM-XXXX` code. `legal_name` is
  descriptive metadata only and must never be used as a join key or as a
  Distributor-visible label (see §11). See ADR-0006.
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

**Note (additive, ADR-0023/ADR-0024):** two rules below predate Phase 3
implementation and are non-exhaustive. (1) Every Request Batch carries a
mandatory `purpose` — `CAPABILITY_ASSESSMENT`, `COMMERCIAL_QUOTATION`, or
`PRODUCTION_CANDIDATE` — which determines the eligibility gate applied
before the batch may be sent: only `PRODUCTION_CANDIDATE` requires the
target Manufacturer to be `QUALIFIED`/`CONDITIONAL` for every included
product family; the other two purposes require only that the
Manufacturer not be `SUSPENDED`/`RETIRED`. (2) A Manufacturer Offer may
be submitted by a Manufacturer's own authenticated factory-user account
(resolving ADR-0002 for Manufacturers), never the shared `ADMIN_KEY` —
see ADR-0023 for the full authentication model. See ADR-0023/ADR-0024 in
`DECISIONS.md` for the complete rules. This note is additive only; no
sentence below is altered or removed.

- A **Manufacturer Request Batch** is a set of Passports (SKUs) ELIMFILTERS
  assigns to one or more Manufacturers for a capability/offer response. It
  does not commit ELIMFILTERS to purchase.
- Every Request Batch record carries: `batch_id`, `manufacturer_code`,
  `created_at`, `sent_at`, `response_due_at`, `timezone`, `status`,
  `created_by` (ADR-0012). There is **no fixed global deadline** —
  ELIMFILTERS sets `response_due_at` per batch.
- A Request Batch's status lifecycle has exactly seven states: `DRAFT`,
  `SENT`, `PARTIALLY_RESPONDED`, `RESPONDED`, `OVERDUE`, `CLOSED`,
  `CANCELLED`.
- A Manufacturer Offer submitted after its batch's `response_due_at` may
  still be received. It must be flagged `LATE_SUBMISSION = true`, and its
  real `submitted_at` receipt time is preserved unmodified — lateness is
  never silently normalized away, and a late Offer is never
  system-rejected purely for being late (ADR-0012).
- A Manufacturer may submit **many** Manufacturer Product Offers for the
  same (`passport_version`, `manufacturer_code`) pair over time — a new
  quote, correction, or update is a new **revision**, never an overwrite of
  a prior one (ADR-0007). Multiple Manufacturers may each also submit
  independent Offers for the same Passport — Offers are never merged or
  averaged, across Manufacturers or across revisions.
- Every Offer carries: `offer_id` (unique per revision), `offer_revision`
  (sequence number within that Manufacturer/Passport Version's lineage),
  `status`, `submitted_at`, `effective_from`, `expires_at` (nullable),
  `supersedes_offer_id` (nullable — the prior `offer_id` this revision
  replaces), and `created_by`.
- The Offer status lifecycle has **nine** states: `DRAFT`, `SUBMITTED`,
  `UNDER_REVIEW`, `VALIDATED`, `APPROVED`, `REJECTED`, `SUPERSEDED`,
  `EXPIRED`, `WITHDRAWN` (extended from the original eight-state list in
  ADR-0007 by ADR-0011, which added `APPROVED`). `DRAFT` is
  manufacturer-side work-in-progress and is not visible to ELIMFILTERS as
  a submission. `VALIDATED` reflects a current `VALID` Engineering
  Compliance Validation result (§6) only. `APPROVED` is reached only after
  `VALIDATED` **and** both an `ENGINEERING_APPROVER` and a
  `COMMERCIAL_APPROVER` decision are recorded (§7, ADR-0011) — `VALIDATED`
  alone is never treated as `APPROVED`.
- Every Offer carries a `late_submission` boolean, set when its
  `submitted_at` is after its Request Batch's `response_due_at`
  (ADR-0012).
- **At most one** Offer among all revisions for a given (`passport_version`,
  `manufacturer_code`) pair may hold an active status (`SUBMITTED`,
  `UNDER_REVIEW`, or `VALIDATED`) at any moment. Submitting a new revision
  moves the prior active Offer to `SUPERSEDED` in the same transaction. The
  full revision history is retained — a new Offer never overwrites or
  deletes a prior one.
- Every applicable Passport property that a Manufacturer answers must be
  recorded as a pair, never mixed with the requirement:
  - `required_*` (or `required_<field>`): locked, ELIMFILTERS-defined, from
    the Passport (§3). The Manufacturer cannot edit this.
  - `offered_*` / `actual_*`: the Manufacturer's own value for that
    property, editable only by the Manufacturer, and scoped to a specific
    Offer revision.
  - `compliance_status`: set only by Engineering Compliance Validation
    (Phase 4), never self-declared by the Manufacturer.
  - `manufacturer_note`: free-text context supplied by the Manufacturer.
  - `evidence_attachment`: supporting documentation (test reports,
    certifications) supplied by the Manufacturer for that property.
- A Manufacturer Offer must also carry: FOB price, MOQ, lead time, monthly
  capacity, and its packaging proposal (§3.1.B: `manufacturer_recommended_
  quantity`, proposed box dimensions, net/gross weight, proposed units per
  box, proposed protection method, proposed palletization, observations/
  deviations), plus any certifications/evidence not tied to a specific
  engineering property.
- A Manufacturer only ever sees `manufacturer_instruction_notes` for
  Passports it has actually been sent in a Request Batch — never
  `internal_engineering_notes` (§3, ADR-0009).
- Raw-material or component sourcing internal to how a Manufacturer builds
  its Offer is not modeled by EBP (ADR-0005). If a Manufacturer wants to
  substantiate an `offered_*` value with a component supplier's
  certificate, that certificate is recorded as an `evidence_attachment` on
  the relevant property — it does not create an independent Supplier
  record or relationship in EBP.

## 6. Engineering Compliance Validation Rules

- Engineering Compliance Validation is the **only** module permitted to set
  `compliance_status` on any property of a Manufacturer Offer, or an
  overall `VALID`/`INVALID` result on a combination.
- Validation operates on, and is permanently bound to, the exact tuple
  **Passport Version × Manufacturer Code × Offer ID × Offer Revision**
  (ADR-0007) — never merely "Manufacturer and Passport." A validation
  result names the specific Offer revision it evaluated.
- A combination is `VALID` only if: the Manufacturer is `QUALIFIED` (or
  `CONDITIONAL` with its condition satisfied) for the Passport's product
  family, and every `required_*` property must have a corresponding
  `offered_*`/`actual_*` value on that specific Offer revision that meets
  the requirement — no waivers by default.
- Validation results are versioned and immutable once issued. Any of the
  following invalidates the prior result and requires re-validation,
  without mutating or deleting the historical record:
  - the underlying Passport changes (`engineering_revision` increments);
  - the Offer changes (a new `offer_revision` is submitted);
  - the Manufacturer's qualification status or condition changes;
  - the Offer expires (`expires_at` passes).
  A superseded result is retained and marked `superseded_by` the new
  result's id — it is never edited or removed.
- Manufacturer Selection, Cost Engine, Pricing Engine, and Distributor
  Portal must refuse to operate on a combination without a current `VALID`
  result bound to the specific Offer revision in use. This is a hard gate,
  not a warning.
- Engineering Compliance Validation never references a Supplier record. It
  evaluates the Passport and the Offer only (ADR-0005).

## 7. Manufacturer Offer Approval Rules

- **Offer Approval is not the same as Engineering Compliance Validation
  (§6).** Validation determines whether an Offer complies technically with
  the Passport's `required_*` fields. Approval determines whether
  ELIMFILTERS commercially and operationally accepts that Offer's
  proposal — principally its packaging and any declared deviations. A
  technically `VALID` Offer is **not** automatically an approved Offer, and
  approval of an Offer is not automatically a Manufacturer Selection
  (§8 — Selection's own approval step is a separate, later decision about
  *which* Offer is sourced from).
- **Two independent roles govern approval, and their authority never
  overlaps (ADR-0011):**
  - **`ENGINEERING_APPROVER`** — approves technical compliance only. Never
    approves FOB, margin, or other commercial terms.
  - **`COMMERCIAL_APPROVER`** — approves FOB, MOQ, lead time, capacity,
    final packaging, and other commercial/operational terms. Never
    declares an Offer technically valid.
  - **`ADMIN_OWNER`** — approves the final sourcing decision produced by
    Manufacturer Selection (§8); may reject an Offer or a selection
    outright; **can never convert a technically `INVALID` Offer into
    `VALID` or `APPROVED`.**
- An Offer reaches `APPROVED` (its Offer-status value, §5) only after all
  three of the following hold for that exact `offer_id`/`offer_revision`
  (ADR-0011):
  1. Engineering Compliance Validation result = `VALID` (§6).
  2. An `ENGINEERING_APPROVER` decision is recorded.
  3. A `COMMERCIAL_APPROVER` decision is recorded.
- Offer Approval is recorded in **`ebp_manufacturer_offer_approvals`**
  (ADR-0008), keyed to a specific `offer_id` and `offer_revision`, and
  holds, per decision (engineering and commercial recorded separately):
  the approving user, their role at decision time, the date, the decision,
  the reason, comments, final approved packaging, `elimfilters_approved_
  quantity` (§3.1.C) and whether a proposed deviation was accepted or
  rejected (commercial decision only), and its own append-only history —
  a new approval decision supersedes, never overwrites, a prior one for
  the same Offer revision.
- Offer Approval may only be recorded against an Offer revision that is
  the current active revision for its (Passport Version × Manufacturer)
  pair (§5). An approval is not retroactively valid against a revision
  that has since been superseded, expired, or withdrawn.

## 8. Manufacturer Selection Rules

- An **official** Selection recommendation evaluates, per Passport, only
  Offers that satisfy **all five** of the following (ADR-0010):
  (a) the Offer is the current active revision for its (Passport Version ×
  Manufacturer) pair — not `SUPERSEDED`, `EXPIRED`, `WITHDRAWN`, or
  `REJECTED`; (b) Engineering Compliance Validation = `VALID`, current, and
  bound to that exact `offer_id`/`offer_revision`; (c) that validation
  result is within its effectiveness window (`effective_from` through
  `expires_at`, where applicable); (d) Manufacturer Offer Approval (§7) =
  `APPROVED`; (e) the Manufacturer is `QUALIFIED`, or `CONDITIONAL` with
  its condition satisfied, for the Passport's family. An Offer failing any
  of these is never an official candidate, including for manual
  override — a manual override must instead produce a new `VALID` result
  (§6) or a new Offer Approval decision (§7) rather than bypassing either.
- **`PRELIMINARY_COMPARISON`** — an internal, non-official comparison of
  `VALID`-but-not-yet-`APPROVED` Offers is permitted for planning purposes,
  but any such record must be permanently and explicitly labeled
  `PRELIMINARY_COMPARISON` wherever stored or displayed, and can never be
  promoted, converted, or silently reused as an official recommendation,
  a Manufacturer Selection, or an Order allocation (ADR-0010). Producing
  an official recommendation always re-evaluates the full five-part gate
  above at the time the recommendation is made — it never reuses a
  `PRELIMINARY_COMPARISON` result as-is.
- Selection must consider, at minimum: mandatory technical compliance (the
  `VALID` gate itself), FOB price, packaging, MOQ, lead time, monthly
  capacity, certifications, evidence, and quality history where it exists.
- Selection must recommend three tiers, not a single winner: **primary**,
  **secondary**, and **backup** Manufacturer. Final approval of the
  recommendation always belongs to ELIMFILTERS — Selection recommends, it
  does not auto-commit an order or auto-finalize sourcing.
- Selection decisions must record the **exact `offer_id` and
  `offer_revision`** evaluated and selected for each of the primary,
  secondary, and backup tiers — not just the Manufacturer — along with the
  full set of candidates considered and the basis for ranking.

## 9. Cost Engine Rules

- Cost Engine computes landed cost only from a combination holding a
  current `VALID` Engineering Compliance Validation result for the exact
  Offer revision selected (§8), using that Offer's FOB price as the base
  cost input, plus freight, duties, and overhead allocation. Cost Engine
  does not decompose or re-derive the Manufacturer's internal materials/
  conversion cost breakdown — FOB is the Manufacturer's own commercial
  figure and is treated as such.
- Cost Engine output records the specific `offer_id` and `offer_revision`
  it was costed from, for full traceability, and is versioned per
  (Passport, Manufacturer, effective date range). A new cost calculation
  does not overwrite a prior one; it supersedes it with a new effective
  date, preserving history.
- Cost Engine is the **only** module that computes landed cost. Pricing
  Engine and Distributor Portal consume its output; they do not
  independently estimate cost.

## 10. Pricing Engine Rules

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

## 11. Distributor Portal Rules

- A distributor account may only see priced, `VALID`-backed SKUs.
  Unvalidated or unpriced products are not visible, even in draft form, to
  distributor accounts.
- A distributor account may **never** see: Manufacturer identity or
  `EFM-XXXX` code, FOB price, margin, landed-cost breakdown, Offer
  revision history, or any Passport note field (`manufacturer_instruction_
  notes` or `internal_engineering_notes`), under any navigation path,
  export, or API response. This is enforced by the data Pricing Engine
  sends to Distributor Portal (§10), not by portal-side filtering alone.
- Distributor-specific pricing (tier, region, currency) must come from
  Pricing Engine; the portal itself holds no independent pricing logic.
- Distributor Portal is a distinct, authenticated application surface. It
  does not reuse the public/anonymous access model of `frontend/`.

## 12. Order Management Rules

- An order may only be created against a priced SKU backed by a `VALID`
  Engineering Compliance Validation result for a specific Offer revision,
  with a Manufacturer Selection decision on record (or an equivalent
  decision made at order time using the same Selection rules).
- Order status changes (placed → allocated → in production → shipped →
  delivered → invoiced) must be logged sequentially; status may not skip
  or be set out of order without an explicit, logged correction.
- Order Management does not compute cost or price; it references Cost
  Engine and Pricing Engine output as of order placement time and freezes
  that reference for the life of the order (price protection).
- Order Management surfaces to a Distributor follow the same
  confidentiality rule as §11 — manufacturer identity, `EFM-XXXX`, FOB,
  margin, and Offer/Passport note fields never appear in a
  distributor-visible order record, only in ELIMFILTERS-internal views.

## 13. Cross-Cutting Rules

- **No phase may bypass an earlier phase's gate.** E.g., Cost Engine (06)
  may not compute a cost for a combination that has no `VALID` Engineering
  Compliance Validation result bound to the exact Offer revision used, even
  temporarily, even in a non-production environment.
- **No Supplier dependency in the mandatory MVP chain.** No Phase 01-09
  spec may require a raw-material/component Supplier record to function.
  See ADR-0005.
- **No single-offer-per-manufacturer restriction.** No Phase 01-09 spec may
  assume or enforce "exactly one Offer per Manufacturer and Passport" as a
  historical or storage constraint. Multiple versioned Offers must always
  be representable, with exactly one active at a time (§5, ADR-0007).
- **No invented data.** No Manufacturer, Offer, cost, or price figure may
  be fabricated for demo/testing purposes in a way that could be mistaken
  for real data in shared environments. Test/seed data must be clearly
  flagged as such.
- **Language rules.** Any user-facing text produced by EBP modules
  (Distributor Portal copy, order confirmations, pricing rationale) follows
  the neutral, technical, non-marketing tone rules already codified in root
  `CLAUDE.md` (AI Citation Layer §5, Category Reframing Layer language
  rules).
