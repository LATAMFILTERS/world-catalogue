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

**Correction notice (second round):** A Manufacturer Product Offer is no
longer "exactly one per (Manufacturer, Passport version)." A Manufacturer
may submit many versioned Offers over time; exactly one stays active at
any moment, and the full history is retained (ADR-0007). This phase also
gains the **Offer Approval** entity (`ebp_manufacturer_offer_approvals`) —
ELIMFILTERS' packaging/commercial decision about a specific Offer,
distinct from technical validation (Phase 4) — and the Offer's packaging
fields are now explicitly scoped as that Manufacturer's own proposal,
never a Passport field (ADR-0008). The Passport's note field is now two
fields; a Manufacturer sees `manufacturer_instruction_notes` only, scoped
to Passports it was actually sent (ADR-0009), which resolves this phase's
prior open question on that point.

**Governance decisions (2026-07-13, Phase 0 closure):** Three prior open
questions in this phase are now resolved. (1) Request Batch deadlines are
per-batch, not global — every batch carries `response_due_at`, a
seven-state lifecycle, and late Offers are flagged `LATE_SUBMISSION`
rather than rejected or silently backdated (ADR-0012). (2) Offer Approval
requires **two independent role decisions** — `ENGINEERING_APPROVER` and
`COMMERCIAL_APPROVER` — before an Offer reaches `APPROVED`; neither role
may exercise the other's authority, and `ADMIN_OWNER` (Phase 5's
sourcing-decision role) can never override a technical `INVALID` into
valid (ADR-0011). (3) Offer Approval must complete — `APPROVED` — before
an Offer is eligible for an *official* Manufacturer Selection
recommendation; a `VALID`-but-not-yet-`APPROVED` Offer may only appear in
an explicitly labeled `PRELIMINARY_COMPARISON`, never an official
recommendation (ADR-0010).

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
  purchase. Every batch carries `batch_id`, `manufacturer_code`,
  `created_at`, `sent_at`, `response_due_at` (set per batch — no global
  deadline), `timezone`, `status`, `created_by` (ADR-0012), with a
  seven-state lifecycle: `DRAFT` → `SENT` → `PARTIALLY_RESPONDED` /
  `RESPONDED` / `OVERDUE` → `CLOSED` / `CANCELLED`.
- **Manufacturer Product Offer, versioned:** a Manufacturer may submit
  many Offers over time for the same (Passport Version × Manufacturer)
  pair — each a new revision, never an overwrite. Every Offer carries:
  - `offer_id` (unique per revision), `offer_revision` (sequence number
    within the lineage), `status`, `submitted_at`, `effective_from`,
    `expires_at` (nullable), `supersedes_offer_id` (nullable), and
    `created_by`.
  - Status lifecycle (nine states, extended from eight by ADR-0011):
    `DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `VALIDATED` (or `REJECTED`) →
    `APPROVED` → eventually `SUPERSEDED`, `EXPIRED`, or `WITHDRAWN`.
    `VALIDATED` reflects a current `VALID` Engineering Compliance
    Validation result only — it is not the same as `APPROVED` (see Offer
    Approval below, ADR-0011).
  - A `late_submission` boolean, set when `submitted_at` is after the
    parent Request Batch's `response_due_at` (ADR-0012); the real
    `submitted_at` is never altered to hide lateness.
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
  specific Offer revision's technical, packaging, and commercial/
  operational acceptability — distinct from, and not automatically granted
  by, Engineering Compliance Validation (Phase 4). Requires **two
  independent role decisions** before the Offer reaches `APPROVED`
  (ADR-0011):
  - An **`ENGINEERING_APPROVER`** decision — technical compliance
    acknowledgment only; never commercial terms.
  - A **`COMMERCIAL_APPROVER`** decision — FOB, MOQ, lead time, capacity,
    final approved packaging (`elimfilters_approved_quantity` and final
    approved packaging spec), and acceptance/rejection of any proposed
    deviation; never a technical-validity declaration.
  Each decision independently holds: the approving user, their role at
  decision time, the date, the decision, the reason, comments, and the
  exact `offer_id`/`offer_revision` evaluated, and its own append-only
  history (a new decision supersedes, never overwrites, a prior one for
  the same role and Offer revision). An Offer's `status` becomes
  `APPROVED` only once Validation = `VALID` **and** both role decisions
  are recorded.
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

- `ebp_manufacturer_request_batches` — `batch_id`, `passport_ids` (the
  assigned set), `manufacturer_code` (one batch targets one Manufacturer;
  a multi-Manufacturer solicitation is multiple batch rows sharing a
  `passport_ids` set, keeping `response_due_at`/status independent per
  Manufacturer), `created_at`, `sent_at`, `response_due_at`, `timezone`,
  `status` (`DRAFT` / `SENT` / `PARTIALLY_RESPONDED` / `RESPONDED` /
  `OVERDUE` / `CLOSED` / `CANCELLED`), `created_by`, `notes`.
- `ebp_manufacturer_offers` — `offer_id` (unique per revision),
  `offer_revision`, `passport_id`, `passport_version` (references
  `engineering_revision`), `manufacturer_code`, `batch_id` (the Request
  Batch this Offer responds to), `status` (`DRAFT` / `SUBMITTED` /
  `UNDER_REVIEW` / `VALIDATED` / `APPROVED` / `REJECTED` / `SUPERSEDED` /
  `EXPIRED` / `WITHDRAWN`), `submitted_at`, `late_submission` (boolean),
  `effective_from`, `expires_at` (nullable), `supersedes_offer_id`
  (nullable), `created_by`, `fob_price`, `currency`, `moq`, `lead_time`,
  `monthly_capacity`.
- `ebp_manufacturer_offer_packaging` — `offer_id`,
  `manufacturer_recommended_quantity`, `proposed_box_dimensions`,
  `net_weight`, `gross_weight`, `proposed_units_per_box`,
  `proposed_protection_method`, `proposed_palletization`,
  `observations_deviations`.
- `ebp_manufacturer_offer_engineering_responses` — one row per applicable
  Passport engineering field per Offer revision: `offer_id`,
  `field_name`, `offered_value`/`actual_value`, `compliance_status` (null
  until Phase 4 evaluates it), `manufacturer_note`, `evidence_attachment`.
- `ebp_manufacturer_offer_approvals` — one row per approval decision (not
  one row per Offer): `id`, `offer_id`, `offer_revision`,
  `approver_role` (`ENGINEERING_APPROVER` / `COMMERCIAL_APPROVER`),
  `approved_by` (user), `decision` (`APPROVED`/`REJECTED`), `reason`,
  `comments`, `decided_at`, `superseded_by` (append-only — a new decision
  for the same role and Offer revision supersedes, never overwrites, the
  prior one). Commercial-role rows additionally carry
  `final_approved_packaging`, `elimfilters_approved_quantity`, and
  `deviation_decision` (accepted/rejected per proposed deviation) —
  engineering-role rows do not. An Offer's `status` is computed/derived to
  `APPROVED` only when a current `VALID` validation result, a current
  `APPROVED` engineering-role row, and a current `APPROVED` commercial-
  role row all exist for the same `offer_id`/`offer_revision` (ADR-0011).

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
- ELIMFILTERS can record both an `ENGINEERING_APPROVER` and a
  `COMMERCIAL_APPROVER` decision against a specific Offer revision —
  including a final approved packaging quantity that differs from the
  Manufacturer's recommended quantity — with reason and responsible
  approver retained per decision, and the Offer's status correctly
  resolves to `APPROVED` only once both exist alongside a current `VALID`
  result.
- A Request Batch's `response_due_at` passing with an outstanding
  Manufacturer transitions it toward `OVERDUE`, and a Manufacturer's Offer
  submitted after that point is correctly flagged `late_submission = true`
  while still being accepted.
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

- **Resolved (2026-07-13, ADR-0012):** Request Batch deadlines are set
  per batch via `response_due_at` — no global deadline. Late Offers are
  flagged `late_submission`, not rejected or backdated.
- **Resolved (2026-07-13, ADR-0010):** Offer Approval must reach
  `APPROVED` before an Offer is eligible for an *official* Manufacturer
  Selection recommendation. A `VALID`-but-not-yet-`APPROVED` Offer may
  only appear in an explicitly labeled `PRELIMINARY_COMPARISON`, which can
  never become an official recommendation.
- **Resolved (2026-07-13, ADR-0011):** Offer Approval requires both an
  `ENGINEERING_APPROVER` and a `COMMERCIAL_APPROVER` decision — two
  distinct functional roles, neither able to exercise the other's
  authority. Which individuals hold these roles, and whether that varies
  by product family or value threshold, remains an implementation detail
  for spec approval, pending the broader auth decision (ADR-0002).
- Is Request Batch `OVERDUE` computed on read or via a scheduled job? Not
  decided — the same open mechanism question already carried for
  Engineering Compliance Validation's triggering (`phases/phase-04-
  validation-engine.md` Open Questions).
