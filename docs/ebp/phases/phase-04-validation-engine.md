# Phase 04 — Validation Engine

**Status:** Spec Drafted (not approved — no implementation authorized)
**Depends on:** Phases 01, 02, 03
**Blocks:** Phases 05, 06, 07, 08, 09 (transitively — everything downstream
requires a `VALID` result)

## Objective

Provide the single gate that determines whether a (Passport × Manufacturer ×
Supplier) combination is allowed to proceed to Selection, Cost, Pricing, or
Distributor-facing surfaces. This is the most structurally important module
in EBP: every downstream phase's core rule ("no non-`VALID` combination may
be used") depends on this phase existing and being correct.

## Scope

**In scope:**
- Validation logic: given a Passport version, a candidate Manufacturer, and
  a resolved set of Suppliers (one per required BOM category), determine
  `VALID` or `INVALID` with reasons.
- Validation criteria, per `BUSINESS_RULES.md` §5: Manufacturer
  `QUALIFIED` for the Passport's family; every BOM category has an
  approved Supplier for that specific Manufacturer; all Passport-declared
  standards are met.
- Immutable, versioned validation results — a change to any input
  (Passport, Manufacturer qualification, Supplier approval) invalidates
  the prior result and requires re-validation, without mutating history.
- An API/mechanism for downstream modules to query "is this combination
  currently `VALID`."

**Out of scope:**
- Deciding *which* Manufacturer to use (Phase 5) — Validation only answers
  "is this specific combination valid," not "which is best."
- Cost or price implications of validity (Phases 6-7).
- Manual override workflows beyond what `BUSINESS_RULES.md` §5 allows
  (overrides must produce a new validation run, not bypass one).

## Dependencies

- Phase 1 (Passport standards/BOM categories), Phase 2 (Manufacturer
  qualification status), Phase 3 (Supplier approval scoping and BOM
  mapping) — Validation is a pure function over these three phases' data.

## Key Entities / Data Model (sketch, not final)

- `ebp_validation_runs` — one row per validation attempt: `passport_id`,
  `passport_version`, `manufacturer_id`, `resolved_suppliers` (structured,
  one per BOM category), `result` (`VALID`/`INVALID`), `reasons`
  (structured, populated when `INVALID`), `evaluated_at`,
  `superseded_by`.
- No mutation of `ebp_validation_runs` rows after creation — a
  re-evaluation always inserts a new row and marks the prior one
  `superseded_by` the new row's id.

## Business Rules Enforced

- `BUSINESS_RULES.md` §5 in full. This phase's entire purpose is
  implementing that section.
- `BUSINESS_RULES.md` §11 ("no phase may bypass an earlier phase's gate")
  — Validation is the mechanism that makes this rule enforceable for every
  phase after it.

## Integration Points

- Reads Phase 1, 2, 3 data as inputs.
- Read by: Phase 5 (candidates must have a current `VALID` result), Phase 6
  (cost only computed for `VALID` combinations), Phase 7 (pricing only for
  costed, `VALID` combinations), Phase 8 (only `VALID` + priced SKUs are
  distributor-visible), Phase 9 (orders only against `VALID` combinations).

## Deliverables

- Approved validation rule engine design (how criteria in
  `BUSINESS_RULES.md` §5 are actually evaluated — e.g., rule-by-rule
  checklist vs. a more general rules-data-driven approach).
- Approved immutability/versioning mechanism for validation results.
- Approved API surface (`/api/ebp/validate`).

## Exit Criteria

- Given a real Passport, a `QUALIFIED` Manufacturer for its family, and
  fully-mapped Suppliers for every BOM category, the engine returns
  `VALID`.
- Given the same inputs but with one BOM category unmapped, or the
  Manufacturer not `QUALIFIED` for the family, the engine returns
  `INVALID` with a specific, correct reason.
- A re-run after a relevant input change produces a new result and
  preserves the old one, satisfying the immutability requirement.

## Risks

- **Risk: this is the highest-consequence phase to get wrong.** Every
  downstream module trusts its output unconditionally per
  `BUSINESS_RULES.md` §11. A logic bug here (e.g., a criterion silently
  skipped) propagates directly into cost, pricing, and distributor-visible
  data. Recommend this phase gets the most scrutiny/testing of the entire
  roadmap before approval to build.
- **Risk: standards-compliance checking may not be fully mechanizable.**
  Some Passport-declared standards may require evidence (test reports,
  certifications) that isn't naturally a boolean check. The spec at
  approval time needs to decide whether Validation Engine checks
  "standard is declared as met" (attestation-based) vs. actually verifying
  evidence — these are very different scopes.

## Open Questions

- Is validation triggered automatically on every relevant input change
  (event-driven), or run on-demand when a downstream module needs a
  current result? This affects whether `ebp_validation_runs` needs
  background job infrastructure, which doesn't currently exist in the
  stack (`PLATFORM_ARCHITECTURE.md` §1 — no job queue is documented in the
  existing system today beyond `ioredis`, whose EBP role is itself an open
  question).
