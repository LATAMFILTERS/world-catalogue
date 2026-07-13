# Phase 03 — Manufacturer Intake Portal (Factory Portal)

**Status:** Spec Drafted (revised, second correction round 2026-07-13 — not
approved; no implementation authorized)
**Depends on:** Phases 01, 02
**Blocks:** Phase 04

**Correction notice (first round):** This phase was originally drafted as
"Supplier Portal" — a raw-material/component vendor management module
scoped per Manufacturer. That is not the agreed MVP architecture. That
revision replaced it entirely with the **Manufacturer Intake Portal**: the
mechanism by which ELIMFILTERS sends assigned products to Manufacturers
and collects each Manufacturer's own offered response. The file name
(`phase-03-supplier-portal.md`) is unchanged to avoid unnecessary
cross-reference churn — the content below, not the file name, is
authoritative. See ADR-0005 in `DECISIONS.md`. Raw-material/component
suppliers are explicitly deferred to a possible future phase, outside the
current 00-09 roadmap, and are not a dependency of this phase or any other
in the current roadmap.

**Correction notice (second round, this revision):** A Manufacturer Product
Offer is no longer "exactly one per (Manufacturer, Passport version)." A
Manufacturer may submit many versioned Offers over time; exactly one stays
active at any moment, and the full history is retained (ADR-0007). This
phase also gains the **Offer Approval** entity
(`ebp_manufacturer_offer_approvals`) — ELIMFILTERS' packaging/commercial
decision about a specific Offer, distinct from technical validation
(Phase 4) — and the Offer's packaging fields are now explicitly scoped as
that Manufacturer's own proposal, never a Passport field (ADR-0008). The
Passport's note field is now two fields; a Manufacturer sees
`manufacturer_instruction_notes` only, scoped to Passports it was actually
sent (ADR-0009), which resolves this phase's prior open question on that
point.

## Objective

Provide the mechanism by which ELIMFILTERS assigns Passports to qualified
Manufacturers (a **Manufacturer Request Batch**) and collects each
Manufacturer's own offered specification and commercial terms in response
(a **Manufacturer Product Offer**, versioned), plus ELIMFILTERS' own
**Offer Approval** decision about each Offer's packaging and commercial/
operational acceptability, so Engineering Compliance Validation (Phase 4)
and Manufacturer Selection (Phase 5) have structured, comparable, and
fully traceable data to evaluate.

## Scope

**In scope:**
- **Manufacturer Request Batch:** a set of Passports (SKUs) ELIMFILTERS
  assigns to one or more `QUALIFIED`/`CONDITIONAL` Manufacturers (Phase 2)
  for a capability/offer response. Does not commit ELIMFILTERS to
  purchase.
- **Manufacturer Product Offer, versioned:** a Manufacturer may submit
  many Offers over time for the same (Passport Version × Manufacturer)
  pair — each a new revision, never an overwrite. Every Offer carries:
  - `offer_id` (unique per revision), `offer_revision` (sequence number
    within the lineage), `status`, `submitted_at`, `effective_from`,
    `expires_at` (nullable), `supersedes_offer_id` (nullable), and
    `created_by`.
  - Status lifecycle (exactly eight states): `DRAFT` → `SUBMITTED` →
    `UNDER_REVIEW` → `VALIDATED` (or `REJECTED`) → eventually
    `SUPERSEDED`, `EXPIRED`, or `WITHDRAWN`.
  - At most one Offer among all revisions for a given (Passport Version ×
    Manufacturer) pair may be active (`SUBMITTED`, `UNDER_REVIEW`, or
    `VALIDATED`) at a time. Submitting a new revision supersedes the prior
    active one in the same transaction.
  - A `required_*` → `offered_*`/`actual_*` answer for every applicable
    engineering field on the Passport (Phase 1's required engineering
    field list), each with its own `compliance_status` (set later, by
    Phase 4, not by the Manufacturer), `manufacturer_note`, and
    `evidence_attachment`.
  - Commercial terms: FOB price, MOQ, lead time, monthly capacity.
  - **Packaging proposal** (this Manufacturer's own values, per
    `BUSINESS_RULES.md` §3.1.B): `manufacturer_recommended_quantity`,
    proposed box dimensions, net and gross weight, proposed units per box,
    proposed protection method, proposed palletization, and observations/
    deviations.
  - General certifications/evidence not tied to a specific engineering
    property.
- **Offer Approval** (`ebp_manufacturer_offer_approvals`,
  `BUSINESS_RULES.md` §3.1.C and §7): ELIMFILTERS' own decision about a
  specific Offer revision's packaging and commercial/operational
  acceptability — distinct from, and not automatically granted by,
  Engineering Compliance Validation (Phase 4). Holds: `offer_id` +
  `offer_revision`, approval status, final approved packaging,
  `elimfilters_approved_quantity`, acceptance/rejection of any proposed
  deviation, responsible approver, reason, date, and its own append-only
  history.
- Multiple Manufacturers may submit different Offers for the same
  Passport — Offers are independent records, never merged or averaged,
  across Manufacturers or across a single Manufacturer's own revisions.

**Out of scope:**
- Raw-material/component supplier management of any kind. Not a modeled
  EBP entity in the MVP (ADR-0005). If a Manufacturer wants to
  substantiate an `offered_*` value with a component supplier's
  certificate, that certificate is recorded as an `evidence_attachment` on
  the relevant property — it does not create an independent Supplier
  record or relationship anywhere in EBP.
- Whether an Offer actually complies with the Passport's requirements
  (Phase 4 — this phase collects the Offer and records ELIMFILTERS'
  Approval decision; it does not determine technical compliance).
- Manufacturer authentication/portal UI design specifics beyond the data
  model and API surface (implementation detail for spec-approval time).

## Dependencies

- Phase 1 Passport required-engineering-field list — an Offer's
  `offered_*` fields must be a strict mirror of Phase 1's `required_*`
  fields, one-to-one. An Offer's packaging proposal is the Manufacturer-
  owned counterpart to Phase 1's ELIMFILTERS-owned packaging requirement
  (`BUSINESS_RULES.md` §3.1.A vs. §3.1.B).
- Phase 2 Manufacturer identity and qualification — a Request Batch may
  only be sent to a Manufacturer that is at least `CANDIDATE` status (to
  solicit an Offer) but an Offer can only later be validated (Phase 4) if
  the Manufacturer is `QUALIFIED`/`CONDITIONAL`-satisfied for the
  Passport's family at validation time.

## Key Entities / Data Model (sketch, not final)

- `ebp_manufacturer_request_batches` — `id`, `passport_ids` (the assigned
  set), `manufacturer_codes` (the Manufacturers solicited), `created_at`,
  `notes`.
- `ebp_manufacturer_offers` — `offer_id` (unique per revision),
  `offer_revision`, `passport_id`, `passport_version` (references
  `engineering_revision`), `manufacturer_code`, `status` (`DRAFT` /
  `SUBMITTED` / `UNDER_REVIEW` / `VALIDATED` / `REJECTED` / `SUPERSEDED` /
  `EXPIRED` / `WITHDRAWN`), `submitted_at`, `effective_from`, `expires_at`
  (nullable), `supersedes_offer_id` (nullable), `created_by`, `fob_price`,
  `currency`, `moq`, `lead_time`, `monthly_capacity`.
- `ebp_manufacturer_offer_packaging` — `offer_id`,
  `manufacturer_recommended_quantity`, `proposed_box_dimensions`,
  `net_weight`, `gross_weight`, `proposed_units_per_box`,
  `proposed_protection_method`, `proposed_palletization`,
  `observations_deviations`.
- `ebp_manufacturer_offer_engineering_responses` — one row per applicable
  Passport engineering field per Offer revision: `offer_id`,
  `field_name`, `offered_value`/`actual_value`, `compliance_status` (null
  until Phase 4 evaluates it), `manufacturer_note`, `evidence_attachment`.
- `ebp_manufacturer_offer_approvals` — `id`, `offer_id`, `offer_revision`,
  `approval_status`, `final_approved_packaging`,
  `elimfilters_approved_quantity`, `deviation_decision` (accepted/
  rejected per proposed deviation), `approved_by`, `reason`,
  `decided_at`, `superseded_by` (append-only — a new approval decision for
  the same Offer revision supersedes, never overwrites, the prior one).

## Business Rules Enforced

- `BUSINESS_RULES.md` §5 in full (Request Batch definition, versioned-
  Offer rule with the eight-state lifecycle, the single-active-revision
  rule, the `required_*`/`offered_*`/`compliance_status`/
  `manufacturer_note`/`evidence_attachment` pattern, no independent
  Supplier entity).
- `BUSINESS_RULES.md` §3.1 (packaging ownership split — the Offer holds
  the Manufacturer's proposal, never the Passport's requirement or
  ELIMFILTERS' final decision).
- `BUSINESS_RULES.md` §7 (Manufacturer Offer Approval Rules — this phase
  is where `ebp_manufacturer_offer_approvals` is defined and populated).

## Integration Points

- Reads Phase 1 (required engineering fields and packaging requirement, to
  build the response template an Offer must fill; `manufacturer_
  instruction_notes` for Passports actually sent to a given Manufacturer,
  never `internal_engineering_notes`), Phase 2 (Manufacturer identity by
  `manufacturer_code`, qualification status to determine eligible
  recipients of a Request Batch).
- Read by: Phase 4 (compliance validation evaluates each
  `offered_*`/`actual_*` value on a specific Offer revision against the
  corresponding `required_*` value and writes `compliance_status` back),
  Phase 5 (selection ranks, among the current active + `VALID` Offers,
  their FOB/packaging/MOQ/lead time/capacity, and records the exact
  `offer_id`/`offer_revision` selected), Phase 6 (cost uses the selected
  Offer's FOB as its base input, referencing the same `offer_id`/
  `offer_revision`).

## Deliverables

- Approved Request Batch, versioned Manufacturer Offer, and Offer Approval
  data models.
- Approved mechanism ensuring an Offer's engineering responses are a
  strict, complete mirror of the Passport's applicable required fields
  (no partial Offers silently treated as complete), and that submitting a
  new revision correctly supersedes the prior active one in a single
  transaction.
- Approved API surface (`/api/ebp/intake/batches`, `/api/ebp/intake/offers`,
  `/api/ebp/intake/offer-approvals`).

## Exit Criteria

- A Request Batch can be created for at least one Passport and sent to at
  least one `QUALIFIED` Manufacturer.
- That Manufacturer can submit a complete Offer: every applicable
  `required_*` field from the Passport has a corresponding
  `offered_*`/`actual_*` entry (or an explicit "cannot meet" response),
  plus FOB/MOQ/lead time/capacity/packaging proposal.
- That same Manufacturer can submit a second, later revision for the same
  Passport Version, and the system correctly marks the prior revision
  `SUPERSEDED` while preserving it in history.
- A second Manufacturer can submit an independent, differing Offer for the
  same Passport version without conflict.
- ELIMFILTERS can record an Offer Approval decision against a specific
  Offer revision, including a final approved packaging quantity that
  differs from the Manufacturer's recommended quantity, with a reason and
  responsible approver retained.
- Phase 4's spec can evaluate an Offer revision's completeness and
  per-field values directly against this model with no gaps.

## Risks

- **Risk: incomplete Offers.** A Manufacturer might submit an Offer that
  skips required fields rather than explicitly marking them "cannot meet."
  The data model must make "unanswered" and "explicitly cannot meet"
  distinguishable, or Phase 4 cannot correctly compute `compliance_status`.
- **Risk: this phase inherited the highest change from both correction
  rounds.** Its data model has the most residual risk of reintroducing
  supplier-shaped thinking (round one) or of an implementation collapsing
  Offer revisions back into a single mutable row, or conflating Offer
  Approval with technical Validation (round two). Explicit review against
  `BUSINESS_RULES.md` §5 and §7 is recommended before this phase's spec is
  approved for build.
- **Risk: no Manufacturer authentication exists yet.** Per
  `PLATFORM_ARCHITECTURE.md` §7 / ADR-0002, there is no decided identity
  provider for Manufacturers to log in and submit Offers. This phase
  cannot reach `Spec Approved` until that is resolved (shared blocker with
  Phase 8's distributor-auth dependency, though the two audiences —
  Manufacturer vs. Distributor — likely need separate auth scopes).
- **Risk: revision-vs-active-flag race conditions.** Enforcing "at most one
  active Offer per (Passport Version × Manufacturer)" while allowing full
  history requires the supersession write (new Offer → active;
  prior Offer → `SUPERSEDED`) to be atomic. An implementation that performs
  this as two separate writes risks a window where zero or two Offers
  appear active, which would corrupt what Phase 4/5 evaluate. Flagged for
  explicit transaction-design attention at spec approval.

## Open Questions

- Is there a deadline/expiration on a Request Batch (Manufacturer must
  respond within N days), or is it open-ended? Not decided in Phase 0.
- Does Offer Approval (this phase) need to happen before an Offer can even
  be *recommended* by Manufacturer Selection (Phase 5), or only before an
  order is actually fulfilled against it? Not decided in this correction
  round — see the same open question in
  `phases/phase-05-manufacturer-selection.md` and
  `PLATFORM_ARCHITECTURE.md` §7.
- Who is authorized to record an Offer Approval decision, and is it always
  a single ELIMFILTERS role, or does it vary by product family/value
  threshold? Not decided in Phase 0.
