# Phase 03 — Manufacturer Intake Portal (Factory Portal)

**Status:** Spec Drafted (revised, correction round 2026-07-13 — not
approved; no implementation authorized)
**Depends on:** Phases 01, 02
**Blocks:** Phase 04

**Correction notice:** This phase was originally drafted as "Supplier
Portal" — a raw-material/component vendor management module scoped per
Manufacturer. That is not the agreed MVP architecture. This revision
replaces it entirely with the **Manufacturer Intake Portal**: the mechanism
by which ELIMFILTERS sends assigned products to Manufacturers and collects
each Manufacturer's own offered response. The file name
(`phase-03-supplier-portal.md`) is unchanged to avoid unnecessary
cross-reference churn — the content below, not the file name, is
authoritative. See ADR-0005 in `DECISIONS.md`. Raw-material/component
suppliers are explicitly deferred to a possible future phase, outside the
current 00-09 roadmap, and are not a dependency of this phase or any other
in the current roadmap.

## Objective

Provide the mechanism by which ELIMFILTERS assigns Passports to qualified
Manufacturers (a **Manufacturer Request Batch**) and collects each
Manufacturer's own offered specification and commercial terms in response
(a **Manufacturer Product Offer**), so Engineering Compliance Validation
(Phase 4) has structured, comparable data to evaluate.

## Scope

**In scope:**
- **Manufacturer Request Batch:** a set of Passports (SKUs) ELIMFILTERS
  assigns to one or more `QUALIFIED`/`CONDITIONAL` Manufacturers (Phase 2)
  for a capability/offer response. Does not commit ELIMFILTERS to
  purchase.
- **Manufacturer Product Offer:** exactly one Offer per (Manufacturer,
  Passport version), consisting of:
  - A `required_*` → `offered_*`/`actual_*` answer for every applicable
    engineering field on the Passport (Phase 1's required engineering
    field list), each with its own `compliance_status` (set later, by
    Phase 4, not by the Manufacturer), `manufacturer_note`, and
    `evidence_attachment`.
  - Commercial terms: FOB price, MOQ, lead time, monthly capacity.
  - Packaging: `manufacturer_recommended_quantity` (per
    `BUSINESS_RULES.md` §3.1) plus any packaging-format notes.
  - General certifications/evidence not tied to a specific engineering
    property.
- Multiple Manufacturers may submit different Offers for the same
  Passport — Offers are independent records, never merged or averaged.

**Out of scope:**
- Raw-material/component supplier management of any kind. Not a modeled
  EBP entity in the MVP (ADR-0005). If a Manufacturer wants to
  substantiate an `offered_*` value with a component supplier's
  certificate, that certificate is recorded as an `evidence_attachment` on
  the relevant property — it does not create an independent Supplier
  record or relationship anywhere in EBP.
- Whether an Offer actually complies with the Passport's requirements
  (Phase 4 — this phase collects the Offer; it does not judge it).
- Manufacturer authentication/portal UI design specifics beyond the data
  model and API surface (implementation detail for spec-approval time).

## Dependencies

- Phase 1 Passport required-engineering-field list — an Offer's
  `offered_*` fields must be a strict mirror of Phase 1's `required_*`
  fields, one-to-one.
- Phase 2 Manufacturer identity and qualification — a Request Batch may
  only be sent to a Manufacturer that is at least `CANDIDATE` status (to
  solicit an Offer) but an Offer can only later be validated (Phase 4) if
  the Manufacturer is `QUALIFIED`/`CONDITIONAL`-satisfied for the
  Passport's family at validation time.

## Key Entities / Data Model (sketch, not final)

- `ebp_manufacturer_request_batches` — `id`, `passport_ids` (the assigned
  set), `manufacturer_codes` (the Manufacturers solicited), `created_at`,
  `notes`.
- `ebp_manufacturer_offers` — `id`, `passport_id`, `passport_version`
  (references `engineering_revision`), `manufacturer_code`, `fob_price`,
  `currency`, `moq`, `lead_time`, `monthly_capacity`,
  `manufacturer_recommended_quantity`, `submitted_at`, `status`
  (`SUBMITTED`/`SUPERSEDED`/`WITHDRAWN`).
- `ebp_manufacturer_offer_engineering_responses` — one row per applicable
  Passport engineering field per Offer: `offer_id`, `field_name`,
  `offered_value`/`actual_value`, `compliance_status` (null until Phase 4
  evaluates it), `manufacturer_note`, `evidence_attachment`.

## Business Rules Enforced

- `BUSINESS_RULES.md` §5 in full (Request Batch definition, one-Offer-per-
  version rule, the `required_*`/`offered_*`/`compliance_status`/
  `manufacturer_note`/`evidence_attachment` pattern, no independent
  Supplier entity).

## Integration Points

- Reads Phase 1 (required engineering fields, to build the response
  template an Offer must fill), Phase 2 (Manufacturer identity by
  `manufacturer_code`, qualification status to determine eligible
  recipients of a Request Batch).
- Read by: Phase 4 (compliance validation evaluates each
  `offered_*`/`actual_*` value against the corresponding `required_*`
  value and writes `compliance_status` back), Phase 5 (selection ranks
  `VALID` Offers by their FOB/packaging/MOQ/lead time/capacity), Phase 6
  (cost uses the selected Offer's FOB as its base input).

## Deliverables

- Approved Request Batch and Manufacturer Offer data models.
- Approved mechanism ensuring an Offer's engineering responses are a
  strict, complete mirror of the Passport's applicable required fields
  (no partial Offers silently treated as complete).
- Approved API surface (`/api/ebp/intake/batches`, `/api/ebp/intake/offers`).

## Exit Criteria

- A Request Batch can be created for at least one Passport and sent to at
  least one `QUALIFIED` Manufacturer.
- That Manufacturer can submit a complete Offer: every applicable
  `required_*` field from the Passport has a corresponding
  `offered_*`/`actual_*` entry (or an explicit "cannot meet" response),
  plus FOB/MOQ/lead time/capacity/packaging.
- A second Manufacturer can submit an independent, differing Offer for the
  same Passport version without conflict.
- Phase 4's spec can evaluate an Offer's completeness and per-field values
  directly against this model with no gaps.

## Risks

- **Risk: incomplete Offers.** A Manufacturer might submit an Offer that
  skips required fields rather than explicitly marking them "cannot meet."
  The data model must make "unanswered" and "explicitly cannot meet"
  distinguishable, or Phase 4 cannot correctly compute `compliance_status`.
- **Risk: this phase inherited the highest change from the correction
  round.** Because it was originally scoped around a different entity
  (Supplier) entirely, its data model has the most residual risk of
  reintroducing supplier-shaped thinking (e.g., a "component category"
  field that's really a disguised Supplier concept). Explicit review
  against `BUSINESS_RULES.md` §5 is recommended before this phase's spec
  is approved for build.
- **Risk: no Manufacturer authentication exists yet.** Per
  `PLATFORM_ARCHITECTURE.md` §7 / ADR-0002, there is no decided identity
  provider for Manufacturers to log in and submit Offers. This phase
  cannot reach `Spec Approved` until that is resolved (shared blocker with
  Phase 8's distributor-auth dependency, though the two audiences —
  Manufacturer vs. Distributor — likely need separate auth scopes).

## Open Questions

- Does a Manufacturer see the Passport's `confidential manufacturing
  notes` field, or is that field ELIMFILTERS-internal even from the
  Manufacturer's own view? Not decided in Phase 0 — likely internal-only,
  but needs an explicit answer before spec approval.
- Is there a deadline/expiration on a Request Batch (Manufacturer must
  respond within N days), or is it open-ended? Not decided in Phase 0.
