# Phase 04 — Engineering Compliance Validation

**Status:** Built (not frozen) — 2026-07-13. The project owner authorized
implementation by resolving all twelve `ENGINEERING_RULE_ENGINE.md` open
questions (Decisions 01-12, ADR-0039 through ADR-0050) plus the Global
Result Model (ADR-0051), then explicitly directed implementation of
Phase 4 only, with Phase 5 not to begin. Real migrations
(`migrations/ebp-phase4/`), a real backend module (`ebp/phase4/`), and a
73-test suite (`tests/ebp-phase4/`) exist and pass against a real local
Postgres instance — see `IMPLEMENTATION_MASTER_INDEX.md` for the full
delivery summary. **Deliberately left `Built`, not frozen — no freeze was
requested this round.**
**Depends on:** Phase 01 (`APPROVED / FROZEN v1.0`), Phase 02
(`APPROVED / FROZEN v1.0`), Phase 03 (`APPROVED / FROZEN v1.0`),
`docs/ebp/ENGINEERING_RULE_ENGINE.md` (normative, ADR-0038 through
ADR-0051), `docs/ebp/PLATFORM_ARCHITECTURE.md` §8 (Observability &
Intelligence Layer, ADR-0037 — Phase 4 is the first phase to actually
implement it, not just document it).
**Blocks:** Phase 05, 06, 07, 08, 09 (transitively — everything
downstream requires an eligible Offer per the Global Result Model).

**Correction notice (first round):** This phase was originally drafted as
a generic "Validation Engine" operating on `Passport × Manufacturer ×
Supplier`. That model is corrected: this phase operates on **Passport
Version × Manufacturer × Manufacturer Offer**. There is no Supplier tier
to evaluate. See ADR-0005.

**Correction notice (second round):** The operating tuple is **Passport
Version × Manufacturer Code × Offer ID × Offer Revision** (ADR-0007);
this phase remains distinct from Offer Approval (Phase 3,
`ebp_manufacturer_offer_approvals`, ADR-0008).

**Correction notice (third round, this revision):** This document is
rewritten as a fully implementable spec, grounded entirely in
`ENGINEERING_RULE_ENGINE.md`'s twelve resolved Decisions (ADR-0039
through ADR-0050) and Global Result Model (ADR-0051). Nothing in this
document may contradict that normative reference; any deviation requires
a new ADR explicitly superseding the relevant section of it.

## Objective

Provide the single gate that determines, for a specific (Passport
Version × Manufacturer Code × Offer ID × Offer Revision) combination,
whether that Offer's engineering specification complies with the
Passport's requirements — and separately, whether ELIMFILTERS engineering
has recorded a human decision that Offer may proceed. Every downstream
phase's core rule ("no non-eligible Offer may be used") depends on this
phase existing and being correct. This is the most structurally
important module in EBP after Phase 1.

## Scope

**In scope:**
- The Rule Engine: executing versioned Rule Catalog entries (§ below)
  against a specific Offer revision's `offered_*`/`actual_*` values and
  the Passport's `required_*` values, per the ten Comparison Types and
  six States defined in `ENGINEERING_RULE_ENGINE.md` §2/§3.
- The Rule Catalog itself: versioned Postgres data (Decision 10,
  ADR-0048) — creation, publication (`DRAFT` → `ACTIVE`), supersession
  (`SUPERSEDED`/`RETIRED`), never silent editing of a published version.
- Validation Runs: one immutable row per evaluation attempt, producing a
  **Mechanical Compliance Result** (never a human decision) per the
  Global Result Model (ADR-0051).
- **Engineering Decisions**: the separate, always-human record
  (`PENDING_REVIEW`/`APPROVED`/`CONDITIONALLY_APPROVED`/`REJECTED`)
  recorded by an `ENGINEERING_APPROVER` (Decision 01, ADR-0039).
- **Engineering Exceptions**: scoped to exactly one Offer ID × Offer
  Revision × Rule ID × Rule Version tuple (Decision 07, ADR-0045),
  governed by each rule version's `exception_policy` (Decision 02,
  ADR-0040).
- **Engineering Conditions**: structured, trackable follow-ups attached
  to a `CONDITIONALLY_APPROVED` decision (Decision 08, ADR-0046).
- **Re-validation**: full coarse invalidation on any of the declared
  triggers (Decision 12, ADR-0050) — a new Validation Run every time,
  the previous one marked `STALE`, never mutated.
- **Activity Events, KPIs, Alerts, Analytics View** for this phase's own
  data, per `ENGINEERING_RULE_ENGINE.md` §11 — this is also the first
  real implementation of the shared `ebp_activity_events` model
  (ADR-0037), which was architecture-only until now.
- Internal-only API surface (`requireAdmin` + functional role check) for
  triggering validation, recording decisions, managing Exceptions/
  Conditions, and administering the Rule Catalog.

**Out of scope:**
- Deciding *which* Manufacturer/Offer to use when multiple are eligible
  (Phase 5).
- Commercial/packaging acceptability — Offer Approval (Phase 3,
  ADR-0008), a separate decision this phase never makes.
- Cost or price implications (Phases 6-7).
- Any Supplier/raw-material tier (does not exist, ADR-0005).
- A numeric technical Score (Decision 05, ADR-0043 — explicitly deferred).
- Class-scoped Exceptions beyond one (Offer Revision × Rule) pair
  (Decision 07 — explicitly deferred, requires its own future ADR).
- A visual Rule Catalog editing UI (Decision 10 — administration via
  internal endpoints/seed data only in v1.0).
- Fine-grained re-validation invalidation (Decision 12 — deferred until
  real evidence of a performance problem).
- Manufacturer/Distributor-facing surfaces of any kind — this phase is
  entirely `requireAdmin`/internal-role-gated, mirroring Phase 1/2's
  internal-only surfaces, not Phase 3's dual internal/factory split.

## Dependencies

- Phase 1: `ebp_engineering_passports` + `ebp_passport_engineering` +
  `ebp_field_applicability_matrix` — read-only. Rule Applicability
  (Decision 11, ADR-0049) may reference `field_applicability` directly
  but never modifies Phase 1's tables.
- Phase 2: `ebp_manufacturers` (qualification status) and the
  effective-certification view (ADR-0019) — read-only.
- Phase 3: `ebp_manufacturer_request_batch_items` (the frozen PEP
  snapshot), `ebp_manufacturer_offers` + `..._technical_fields` +
  `..._packaging`, and `ebp_manufacturer_documents` (for Required
  Evidence rules, via `evidence_document_id`) — read-only.
- `PLATFORM_ARCHITECTURE.md` §8 / ADR-0037 — this phase implements the
  shared `ebp_activity_events` table for the first time; any future
  phase reuses it, never reimplements it.

## Data Model (sketch — final column list/types are implementation
detail, not re-litigated here; table boundaries and their relationships
are fixed by the Decisions above and may not be collapsed)

- **`ebp_rule_versions`** — the Rule Catalog (Decision 10). One row per
  published (or draft) rule version: `id` (UUID PK), `rule_id` (stable
  business key, e.g. `RULE-EFF-001`), `rule_version` (integer, starts at
  1 per `rule_id`), `rule_name`, `description`, `comparison_type` (one of
  the ten in `ENGINEERING_RULE_ENGINE.md` §2), `severity` (one of the
  five in §4), `exception_policy` (`NON_WAIVABLE`/
  `WAIVABLE_WITH_ENGINEERING_APPROVAL`/`WAIVABLE_WITH_CONDITIONS`),
  `category` (one of the fourteen in §9), `applies_to` (JSONB — the exact
  Phase 1/3 `field_name`(s) this rule reads), `rule_applicability`
  (JSONB — the declared precondition, Decision 11), `default_behavior`
  (JSONB or enum — must never be weaker than the fixed Severity floor,
  Decision 03/ADR-0041), `status` (`DRAFT`/`ACTIVE`/`SUPERSEDED`/
  `RETIRED`), `effective_from`, `effective_until`, `created_by`,
  `created_at`. Unique on `(rule_id, rule_version)`. A partial unique
  index ensures at most one `ACTIVE` version per `rule_id` at a time
  (the exact pattern already used for one-active-Offer-per-lineage,
  ADR-0026). A version that was ever referenced by a real Validation Run
  is never deleted, regardless of status.
- **`ebp_validation_runs`** — one immutable row per evaluation: `id`,
  `passport_id`, `engineering_revision`, `manufacturer_id`, `offer_id`,
  `offer_revision`, `mechanical_result`
  (`MECHANICALLY_PASS`/`MECHANICALLY_FAIL`/
  `REQUIRES_ENGINEERING_REVIEW`), `mechanically_eligible_for_approval`
  (boolean, informational only per the Global Result Model), `trigger`
  (which of Decision 12's triggers caused this run), `input_versions`
  (JSONB snapshot: exact Passport revision, Offer revision, and every
  `rule_id`/`rule_version` evaluated — the audit record a later query
  needs to answer "what exactly was checked"), `status`
  (`CURRENT`/`STALE`), `superseded_by` (the later run that made this one
  `STALE`), `created_at`. Never mutated after creation — a re-validation
  always inserts a new row.
- **`ebp_rule_results`** — one row per rule evaluated within one
  Validation Run: `id`, `validation_run_id`, `rule_id`, `rule_version`,
  `state` (one of the six in §3), `severity` (denormalized from the rule
  version at evaluation time, so a later rule-version change never
  silently alters a historical result's displayed severity),
  `observation_code`, `observation_params` (JSONB, Decision 06,
  ADR-0044), `created_at`.
- **`ebp_engineering_decisions`** — one row per human decision: `id`,
  `validation_run_id` (the Mechanical Compliance Result this decision is
  based on — always referenced, never recalculated), `decision`
  (`PENDING_REVIEW`/`APPROVED`/`CONDITIONALLY_APPROVED`/`REJECTED`),
  `decided_by` (the `ENGINEERING_APPROVER` actor), `decided_at`, `notes`.
  A later decision on a later Validation Run is a new row, not an edit —
  the full decision history for an Offer lineage is always reconstructable.
- **`ebp_engineering_exceptions`** — one row per Exception: `id`,
  `offer_id`, `offer_revision`, `rule_id`, `rule_version`,
  `requested_by`, `requested_at`, `status`
  (`REQUESTED`/`APPROVED`/`REJECTED`), `approved_by`, `approved_at`,
  `justification` (required, never optional). Unique on `(offer_id,
  offer_revision, rule_id, rule_version)` — exactly Decision 07's scope,
  enforced structurally, not just by convention.
- **`ebp_engineering_conditions`** — one row per condition linked to a
  `CONDITIONALLY_APPROVED` `ebp_engineering_decisions` row: `id`,
  `engineering_decision_id`, `condition_type`, `description`,
  `requirement`, `responsible_party`, `due_date`, `required_evidence`,
  `status` (`OPEN`/`SATISFIED`/`OVERDUE`/`WAIVED`/`FAILED`/`CANCELLED`),
  `satisfied_at`, `consequence`.
- **`ebp_activity_events`** — the shared, platform-wide Activity Events
  ledger (ADR-0037), implemented here for the first time exactly as
  specified in `PLATFORM_ARCHITECTURE.md` §8.1. Every event this phase
  emits (§ "Dashboard Readiness" below) is a row here — this phase never
  creates its own parallel event table.
- **`ebp_analytics_validation_summary`** — a Postgres `VIEW` (ADR-0037
  §8.3 naming convention), never a materialized copy, aggregating current
  Mechanical Compliance Result + Engineering Decision + open Exception/
  Condition counts per Offer/Manufacturer, for future Dashboard
  consumption. No transactional table is ever read directly by a future
  Dashboard/BI/AI layer — only this view.

## Business Rules Enforced

- `BUSINESS_RULES.md` §6 in full — this phase's entire purpose is
  implementing that section, now precisely via the Rule Engine described
  in `ENGINEERING_RULE_ENGINE.md`.
- `BUSINESS_RULES.md` §13 ("no phase may bypass an earlier phase's gate";
  "no Supplier dependency"; "no single-offer-per-manufacturer
  restriction") — enforced by construction.
- All twelve Decisions in `ENGINEERING_RULE_ENGINE.md`'s "Resolved
  Decisions" section and the Global Result Model (ADR-0039–ADR-0051) are
  binding business rules for this phase, not suggestions.

## API Surface (as built, internal-only — mirrors Phase 1/2's
`requireAdmin`-gated internal surface; there is no Manufacturer- or
Distributor-facing endpoint in this phase)

- `POST /api/ebp/internal/validation/:offer_code/run` — trigger a new
  Validation Run for a specific Offer (code), evaluating every applicable
  `ACTIVE` rule version against its current revision.
- `GET /api/ebp/internal/validation/:offer_code` — the current
  (`CURRENT`, non-`STALE`) Validation Run and its Rule Results for an
  Offer's active revision.
- `GET /api/ebp/internal/validation/:offer_code/history` — every past
  Validation Run for this Offer lineage, `STALE` included, immutable.
- `POST /api/ebp/internal/validation/:offer_code/decisions` — record an
  Engineering Decision (`ENGINEERING_APPROVER` only), referencing the
  current Validation Run; accepts an inline `conditions[]` array when
  `decision` is `CONDITIONALLY_APPROVED` (Decision 08 requires at least
  one; there is no separate "attach a condition to an existing decision"
  endpoint — conditions are only ever created together with the decision
  that requires them).
- `POST /api/ebp/internal/validation/:offer_code/exceptions` — request an
  Exception for a specific Rule ID + Rule Version (`ENGINEERING_REVIEWER`
  or `ENGINEERING_APPROVER`); rejected at the service layer if that rule
  version's `exception_policy` is `NON_WAIVABLE`, or if that rule's result
  in the current run is not `REQUIRES_EXCEPTION`.
- `POST /api/ebp/internal/validation/exceptions/:id/approve` /
  `.../reject` — `ENGINEERING_APPROVER` only; a Manufacturer-submitted
  Offer can never self-approve its own Exception (no such endpoint exists
  on the factory-facing surface at all — this phase has no factory-facing
  surface).
- `POST /api/ebp/internal/validation/conditions/:id/status` — transition
  a condition's status (`SATISFIED`/`OVERDUE`/`FAILED`/`WAIVED`/
  `CANCELLED`), `ENGINEERING_APPROVER` only.
- `POST /api/ebp/internal/rule-catalog/` — create a `DRAFT` rule version,
  `ADMIN_OWNER` only.
- `GET /api/ebp/internal/rule-catalog/:rule_id` — every version of a rule,
  DRAFT through RETIRED.
- `POST /api/ebp/internal/rule-catalog/:rule_id/:rule_version/publish` —
  `DRAFT` → `ACTIVE`, superseding any prior `ACTIVE` version of the same
  `rule_id`; `ADMIN_OWNER` only.
- `POST /api/ebp/internal/rule-catalog/:rule_id/:rule_version/retire` —
  `ADMIN_OWNER` only.
- `POST /api/ebp/internal/roles/` and `.../roles/revoke` — Engineering
  functional role assignment (Decision 01, ADR-0039): `ADMIN_OWNER` only,
  except a one-time bootstrap allowance that lets the very first
  `ADMIN_OWNER` be assigned with no prior role held (otherwise nobody
  could ever satisfy the check to create it) — `requireAdmin`'s shared
  `ADMIN_KEY` remains the real security boundary this sits behind.
- `/api/ebp/internal/analytics/*` (reserved prefix, ADR-0037 §8.6) —
  **not implemented this round.** `ebp_analytics_validation_summary` (the
  view) exists and is queryable directly; a dedicated read endpoint over
  it is deferred.

## Integration Points

- Reads Phase 1, 2, 3 data as inputs (read-only).
- **Consistency-audit finding (2026-07-13):** Phase 3's frozen schema
  already reserves `ebp_manufacturer_offer_technical_fields.
  compliance_status` (`VARCHAR(20) CHECK IN ('PENDING','COMPLIANT',
  'NON_COMPLIANT')`) for this phase, with its own frozen comment stating
  "compliance_status stays NULL until Phase 4 writes it — Phase 3 never
  sets this column." That 3-value enum cannot represent this phase's
  six-state Rule Result model (`PASS`/`FAIL`/`WARNING`/`NOT_APPLICABLE`/
  `REQUIRES_REVIEW`/`REQUIRES_EXCEPTION`) one-to-one, and the `CHECK`
  constraint is part of Phase 3's frozen schema — it may not be widened.
  **Resolution:** this phase's authoritative record is always
  `ebp_rule_results` (rich, six-state, per rule version). Phase 4
  additionally **writes** a coarse, best-effort projection into the
  existing `compliance_status` column via a plain `UPDATE` (never an
  `ALTER TABLE`, never a schema change — the column and its constraint
  already exist, unmodified) so any existing Phase 3-era internal tooling
  that already reads this column via `dto.js`'s
  `toInternalTechnicalFieldDTO` continues to see a meaningful value:
  `PENDING` while no terminal Mechanical Compliance Result exists for the
  current Offer revision; `COMPLIANT` when that field's own Rule Result
  is `PASS` or `NOT_APPLICABLE`; `NON_COMPLIANT` when it is `FAIL` or
  `REQUIRES_EXCEPTION` at a blocking severity. This projection is
  read-only convenience data — never re-derived from itself, and never
  treated as authoritative by this phase's own logic or by any future
  phase.
- Writes no other Phase 1/2/3 column. No Phase 1/2/3 migration, schema,
  or `CHECK` constraint is altered.
- Read by (once each is separately authorized): Phase 5 (candidates must
  have an eligible Engineering Decision, per the Global Result Model and
  Decision 08's Conditional-Approval eligibility rule), Phase 6/7/8/9
  transitively.

## Deliverables

- Real, executable SQL migrations for every table above, idempotent and
  reversible, additive-only against Phase 1/2/3.
- A real backend module (`ebp/phase4/`) implementing: the ten Comparison
  Type evaluators, the state/severity/exception-policy gating logic
  (Decisions 02/03/04), Validation Run orchestration with full coarse
  invalidation (Decision 12), Engineering Decision/Exception/Condition
  workflows enforcing the three functional roles (Decision 01), and
  Activity Event emission for every event in `ENGINEERING_RULE_ENGINE.md`
  §11.
- The Rule Catalog seeded with the illustrative starter entries already
  named in `ENGINEERING_RULE_ENGINE.md` §8 (or a superset), as real
  `ACTIVE` `rule_version` rows.
- `ebp_analytics_validation_summary` and the KPI/Alert queries specified
  in §11 of the normative reference.
- A full unit/integration/regression/security test suite against real
  Postgres, following the exact discipline already applied to Phase 1/2/3
  (no mocks, real migrations, real rollback verification).
- Re-confirmation that Phase 1 (59 tests), Phase 2 (100 tests), and
  Phase 3 (126 tests) all still pass unmodified.

## Exit Criteria

- Given a real Passport, a `QUALIFIED` Manufacturer, and a fully-answered
  Offer meeting every applicable rule, a Validation Run produces
  `MECHANICALLY_PASS` (or `REQUIRES_ENGINEERING_REVIEW` if any
  `Required Evidence` rule's document is unreviewed) and
  `mechanically_eligible_for_approval = true`, but **no Engineering
  Decision exists until an `ENGINEERING_APPROVER` explicitly records
  one** — verified by test that the mechanical result alone never
  produces `APPROVED`.
- Given the same inputs but with one `HIGH`+ severity rule's `offered_*`
  value failing, the run produces `MECHANICALLY_FAIL` (or
  `REQUIRES_ENGINEERING_REVIEW` if `WAIVABLE_*` and an Exception is
  pending) with the specific failing Rule Result(s) identified by
  `rule_id`/`rule_version`/`observation_code`.
- A `NON_WAIVABLE` rule's failure can never be worked around by an
  Exception request — verified by test (service-layer rejection, not
  just UI absence).
- A re-run after any Decision-12 trigger produces a new Validation Run,
  marks the previous `STALE`, and never mutates or deletes it.
- A `CONDITIONALLY_APPROVED` Offer with an `OPEN` mandatory condition is
  provably not eligible for Manufacturer Selection-style "final approved"
  treatment — verified by a test asserting the eligibility check.
- Every event in `ENGINEERING_RULE_ENGINE.md` §11 is emitted into
  `ebp_activity_events` at the correct point in the flow, verified by
  test.
- Migrations run cleanly from scratch, `validate.sql` passes, and a full
  rollback leaves Phase 1/2/3 completely untouched — verified with real
  data present, the same discipline as every prior phase's freeze audit.
- Phase 1 (59), Phase 2 (100), Phase 3 (126) test suites all still pass,
  unmodified.
- Phase 5 was not started.

## Dashboard Readiness

See `ENGINEERING_RULE_ENGINE.md` §11 for the complete, decided event/KPI/
Alert/Analytics View list — reproduced here as this phase's own binding
checklist (not re-derived, not reworded):

- **Events:** `VALIDATION_RUN_CREATED`, `RULE_EVALUATED`, `RULE_PASSED`,
  `RULE_FAILED`, `RULE_WARNING`, `RULE_NOT_APPLICABLE`,
  `VALIDATION_COMPLETED`, `VALIDATION_MARKED_STALE`,
  `ENGINEERING_REVIEW_STARTED`, `ENGINEERING_DECISION_RECORDED`,
  `ENGINEERING_EXCEPTION_REQUESTED`, `ENGINEERING_EXCEPTION_APPROVED`,
  `ENGINEERING_EXCEPTION_REJECTED`, `ENGINEERING_CONDITION_CREATED`,
  `ENGINEERING_CONDITION_SATISFIED`, `ENGINEERING_CONDITION_OVERDUE`,
  `ENGINEERING_CONDITION_FAILED`.
- **KPIs:** validations completed; pass/fail/review-required rate; rules
  failing most frequently; failure rate by Manufacturer; failure rate by
  product Category; exception request rate; exception approval rate;
  average engineering review time; conditions open/overdue/failed; stale
  validations pending re-run.
- **Alerts:** validation pending review; critical rule failure; required
  evidence missing; exception expiring; condition approaching deadline;
  condition overdue; validation stale; active Offer without a current
  validation.
- **Analytics Views:** `ebp_analytics_validation_summary`.
- **APIs:** `/api/ebp/internal/analytics/*` (first real implementation of
  this reserved prefix).
- **Timeline impact:** Offer and Manufacturer Timelines (per ADR-0037
  §8.2) gain every event above, reconstructed from `ebp_activity_events`
  — no separate, duplicated timeline table.
- **Future-AI impact:** every Rule Result being structured (`rule_id`,
  `rule_version`, `state`, `severity`, `category`, `observation_code` +
  params) enables "why did this offer fail," "which manufacturers fail
  most often," "which rule produces the most rejections," and "which
  conditions are most often overdue" without parsing free text — per
  `ENGINEERING_RULE_ENGINE.md` §12.

## Risks

- **Risk: this remains the highest-consequence phase to get wrong.**
  Every downstream module depends on this phase's output. Recommend the
  most scrutiny/testing of the entire roadmap, matching (or exceeding)
  the rigor already applied to Phase 3's correction round.
- **Risk: Rule Catalog seed data correctness.** The illustrative starter
  entries in `ENGINEERING_RULE_ENGINE.md` §8 are a starting point, not a
  guarantee of engineering correctness — real ELIMFILTERS engineering
  review of the actual seeded `ACTIVE` rule versions before they affect
  real Offers is a prerequisite for trusting this phase's output in
  production, independent of whether the code itself is correct.
- **Risk: `ADMIN_KEY_SHARED` remains a shared, undifferentiated
  credential.** Decision 01 explicitly builds functional roles on top of
  it as an MVP measure, not a full fix — the underlying shared-secret
  risk already flagged in Phase 1/2/3's own risk sections persists here
  too, and the architecture must not make a future move to real
  per-user authentication harder.
- **Risk: no background job infrastructure exists in this stack.**
  Validation Runs in v1.0 are triggered synchronously (via the API, e.g.
  on Offer submission or an explicit admin call) — a scheduled/background
  re-validation sweep is not built, matching the same "no cron required,
  compute at read time or on explicit trigger" discipline already used
  for Batch `OVERDUE` (ADR-0031). An `active Offer without a current
  validation` Alert (§ Dashboard Readiness) is how this gap surfaces
  operationally rather than silently.

## Open Questions

All twelve questions originally listed here are resolved — see
`ENGINEERING_RULE_ENGINE.md`, "Resolved Decisions," and ADR-0039 through
ADR-0051. No new open question was identified while converting this
document into an implementable spec.
