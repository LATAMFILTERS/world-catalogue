# Phase 04 — Engineering Compliance Validation

**Status:** Spec Drafted (revised, correction round 2026-07-13 — not
approved; no implementation authorized)
**Depends on:** Phases 01, 02, 03
**Blocks:** Phases 05, 06, 07, 08, 09 (transitively — everything downstream
requires a `VALID` result)

**Correction notice (first round):** This phase was originally drafted as a
generic "Validation Engine" operating on `Passport × Manufacturer ×
Supplier`. That model is corrected: this phase operates on **Passport
Version × Manufacturer × Manufacturer Offer**, comparing the Offer's
`offered_*` values directly against the Passport's `required_*` values.
There is no Supplier tier to evaluate. See ADR-0005 in `DECISIONS.md`. The
phase is renamed **Engineering Compliance Validation** to reflect this
precisely; the file name (`phase-04-validation-engine.md`) is unchanged.

**Correction notice (second round, this revision):** Because a
Manufacturer may now submit many versioned Offers for the same Passport
Version (ADR-0007), this phase's operating tuple is made explicit:
**Passport Version × Manufacturer Code × Offer ID × Offer Revision** — a
validation result is permanently bound to one specific Offer revision, not
just "the Manufacturer's Offer." A new Offer revision, an Offer expiring,
or a Manufacturer status change all independently invalidate a prior
result, in addition to a Passport revision change. This phase remains
distinct from the new **Offer Approval** entity (Phase 3,
`ebp_manufacturer_offer_approvals`) — Validation is technical-compliance
only; it does not judge commercial/packaging acceptability. See ADR-0007
and ADR-0008.

## Objective

Provide the single gate that determines whether a specific Manufacturer
Product Offer, against a specific Passport version, is allowed to proceed
to Selection, Cost, Pricing, or Distributor-facing surfaces. This is the
most structurally important module in EBP: every downstream phase's core
rule ("no non-`VALID` Offer may be used") depends on this phase existing
and being correct.

## Scope

**In scope:**
- Validation logic: given a Passport version and a Manufacturer's
  submitted Offer against it, evaluate each applicable `required_*`
  engineering field against the Offer's corresponding `offered_*`/
  `actual_*` value and set a per-field `compliance_status`.
- Overall combination validity, per `BUSINESS_RULES.md` §6: the
  Manufacturer must be `QUALIFIED` (or `CONDITIONAL` with its condition
  satisfied) for the Passport's family, **and** every `required_*`
  property must have a compliant `offered_*`/`actual_*` value on the
  specific Offer revision evaluated — no waivers by default.
- Immutable, versioned validation results — any of a Passport
  `engineering_revision` change, a new Offer revision, a Manufacturer
  qualification status change, or the Offer's own `expires_at` passing
  invalidates the prior result and requires re-validation, without
  mutating history.
- An API/mechanism for downstream modules to query "is this (Passport
  Version, Manufacturer Code, Offer ID, Offer Revision) combination
  currently `VALID`."

**Out of scope:**
- Deciding *which* Manufacturer/Offer to use when multiple are `VALID`
  (Phase 5) — this phase only answers "is this specific Offer revision
  valid," not "which is best."
- Whether ELIMFILTERS commercially/operationally accepts a `VALID` Offer's
  packaging and terms — that is Offer Approval (Phase 3,
  `ebp_manufacturer_offer_approvals`), a separate decision this phase does
  not make (ADR-0008).
- Cost or price implications of validity (Phases 6-7).
- Any evaluation of a Supplier or raw-material tier — this does not exist
  in the model (ADR-0005).
- Manual override workflows beyond what `BUSINESS_RULES.md` §6 allows
  (overrides must produce a new validation run, not bypass one).

## Dependencies

- Phase 1 (Passport `required_*` fields), Phase 2 (Manufacturer
  qualification/`CONDITIONAL` status), Phase 3 (the specific Offer being
  evaluated, with its `offered_*`/`actual_*` values) — this phase is a pure
  function over these three phases' data.

## Key Entities / Data Model (sketch, not final)

- `ebp_compliance_validations` — one row per validation attempt:
  `passport_id`, `passport_version` (`engineering_revision`),
  `manufacturer_code`, `offer_id`, `offer_revision` (both stored
  explicitly, per ADR-0007, for human-readable audit traceability even
  though `offer_id` alone already pins the exact revision), `result`
  (`VALID`/`INVALID`), `field_results` (structured — one
  compliance_status per evaluated `required_*`/`offered_*` pair),
  `evaluated_at`, `superseded_by`.
- Writing a `field_results` entry here is also how
  `ebp_manufacturer_offer_engineering_responses.compliance_status` (Phase
  3's table) gets populated — this phase is the only writer of that
  column, per `BUSINESS_RULES.md` §6.
- No mutation of `ebp_compliance_validations` rows after creation — a
  re-evaluation always inserts a new row and marks the prior one
  `superseded_by` the new row's id.

## Business Rules Enforced

- `BUSINESS_RULES.md` §6 in full. This phase's entire purpose is
  implementing that section.
- `BUSINESS_RULES.md` §13 ("no phase may bypass an earlier phase's gate";
  "no Supplier dependency in the mandatory MVP chain"; "no single-offer-
  per-manufacturer restriction") — this phase is the mechanism that makes
  the first rule enforceable for every phase after it, and by
  construction cannot reintroduce the second or third.

## Integration Points

- Reads Phase 1, 2, 3 data as inputs.
- Writes back to Phase 3's Offer records (`compliance_status` per field).
- Read by: Phase 5 (candidates must have a current `VALID` result), Phase 6
  (cost only computed for `VALID` Offers), Phase 7 (pricing only for
  costed, `VALID` Offers), Phase 8 (only `VALID` + priced SKUs are
  distributor-visible), Phase 9 (orders only against `VALID` Offers).

## Deliverables

- Approved validation rule engine design: how each `required_*` ↔
  `offered_*` pair is compared (exact match, tolerance range, threshold
  comparison, etc. — likely varies by field type and needs a per-field-type
  comparison rule set, not one generic comparator).
- Approved immutability/versioning mechanism for validation results.
- Approved API surface (`/api/ebp/compliance`).

## Exit Criteria

- Given a real Passport, a `QUALIFIED` Manufacturer for its family, and a
  fully-answered, compliant Offer, the engine returns `VALID` and marks
  every field `compliance_status = COMPLIANT`.
- Given the same inputs but with one `required_*` field's `offered_*`
  value out of tolerance, or the Manufacturer not `QUALIFIED`/
  `CONDITIONAL`-satisfied, the engine returns `INVALID` with the specific
  non-compliant field(s) identified.
- A re-run after a relevant input change (new `engineering_revision`,
  amended Offer, changed Manufacturer status) produces a new result and
  preserves the old one, satisfying the immutability requirement.

## Risks

- **Risk: this is the highest-consequence phase to get wrong.** Every
  downstream module trusts its output unconditionally per
  `BUSINESS_RULES.md` §13. A logic bug here (e.g., a required field
  silently skipped, or a Supplier-shaped shortcut reintroduced) propagates
  directly into cost, pricing, and distributor-visible data. Recommend this
  phase gets the most scrutiny/testing of the entire roadmap before
  approval to build.
- **Risk: comparison semantics per field type.** Some `required_*` fields
  are exact-match (e.g., thread spec), others are threshold/tolerance-based
  (e.g., minimum efficiency, dimensional tolerances), and some are
  evidence-based attestations (e.g., "required test standards met," which
  may require a human/administrative review of an `evidence_attachment`
  rather than a pure automatic comparison). The spec at approval time must
  define, per field, which comparison mode applies — a single generic
  "equals" comparator is not sufficient.
- **Risk: standards-compliance checking may not be fully mechanizable.**
  As above — evidence-backed attestation vs. automatic verification is an
  open design question that materially affects whether this phase can be
  fully automated or needs an administrative-review step built in.

## Open Questions

- Is validation triggered automatically on every relevant input change
  (event-driven), or run on-demand when a downstream module needs a
  current result? This affects whether `ebp_compliance_validations` needs
  background job infrastructure, which doesn't currently exist in the
  stack (`PLATFORM_ARCHITECTURE.md` §1 — no job queue is documented in the
  existing system today beyond `ioredis`, whose EBP role is itself an open
  question).
- Who reviews evidence-based attestation fields (test-standard compliance)
  when they cannot be auto-compared — is this a manual ELIMFILTERS
  engineering review step within this phase, and if so, what does that
  workflow look like? Not decided in Phase 0.
