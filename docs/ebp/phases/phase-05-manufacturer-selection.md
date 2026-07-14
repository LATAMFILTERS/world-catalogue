# Phase 05 — Manufacturer Selection

**Status:** Spec Rewritten (implementable) — 2026-07-13, second pass. The
project owner closed all twelve `MANUFACTURER_SELECTION_ENGINE.md` Open
Questions (Decisions 01-12, ADR-0062 through ADR-0074) and authorized
implementation, following the exact methodology used for Phase 4.
**Depends on:** Phase 01 (`APPROVED / FROZEN v1.0`), Phase 02
(`APPROVED / FROZEN v1.0`), Phase 03 (`APPROVED / FROZEN v1.0`), Phase 04
(`APPROVED / FROZEN v1.0`), `docs/ebp/MANUFACTURER_SELECTION_ENGINE.md`
(normative, ADR-0062 through ADR-0074).
**Blocks:** Phase 06, 07, 08, 09 (transitively).

**Correction notice (superseded by this rewrite):** Every prior revision
of this document (aligned to `VALID`-result terminology and the old
five-part ADR-0010/ADR-0011 gate) predates Phase 4's actual frozen Global
Result Model. This document is rewritten from
`MANUFACTURER_SELECTION_ENGINE.md` and its Resolved Decisions; nothing
below may contradict that normative reference — any deviation requires a
new ADR explicitly superseding the relevant section.

## Objective

Given a Passport with one or more eligible Manufacturer Offers (per the
seven-part gate below), compute a versioned, reproducible, fully
auditable ranking across Technical Quality (40%), Commercial
Competitiveness (25%), Operational Capability (20%), and Strategic
Resilience (15%), and recommend Primary/Secondary/Backup Manufacturer
Offers — with ELIMFILTERS retaining final approval via an explicit
Selection Decision. The Selection Engine never decides whether a
Manufacturer *can* build a Passport's specification (Phase 4's job); it
decides which of the Manufacturers who can is the best choice **for
ELIMFILTERS**.

## Scope

**In scope:**
- The seven-part eligibility gate (`MANUFACTURER_SELECTION_ENGINE.md`
  §4): current Offer revision; `CURRENT` Validation Run; Engineering
  Decision `APPROVED`/`CONDITIONALLY_APPROVED` with `status = CURRENT`;
  no open/overdue/failed mandatory Conditions; **Offer Commercial
  Approval `APPROVED`** (new entity, this phase); Manufacturer/location
  qualified; certifications current.
- The **Offer Commercial Approval** entity
  (`ebp_offer_commercial_approvals`) — designed under ADR-0008/ADR-0011
  but never implemented in Phase 3's real schema; built here, scoped
  strictly to the `COMMERCIAL_APPROVER` decision, structurally distinct
  from Phase 4's `ebp_engineering_decisions` at all times (ADR-0072).
- `PRELIMINARY_COMPARISON`: an internal, permanently labeled comparison
  of technically-eligible-but-not-yet-Commercial-Approved Offers, for
  planning visibility only. Never promotable to an official
  recommendation.
- The versioned **Selection Policy** entity (weights, normalization,
  gates, penalties, diversification rules, concentration thresholds,
  scope) — `ADMIN_OWNER`-governed, never a code constant (ADR-0068).
- The optional, declared **Demand Signal** entity (ADR-0063).
- The optional, declared **Preferred Manufacturer** entity (ADR-0071).
- The ranking pipeline: eligibility gate → per-candidate factor scoring
  (normalized 0-100, structured and factor-tagged, ADR-0070) → weighted
  composite score → Preferred Manufacturer bonus (applied after the
  composite score, never hidden) → tie-break (fixed 8-step order,
  ADR-0062) → Primary/Secondary/Backup tier assignment, with Backup
  divergence governed by the Selection Policy (ADR-0065).
- The three-part Result Model (ADR-0074): Selection Run Result
  (`RECOMMENDATION_READY`/`NO_ELIGIBLE_CANDIDATE`/
  `TIE_REQUIRES_HUMAN_REVIEW`/`INSUFFICIENT_DATA`/`POLICY_CONFLICT`/
  `STALE`), Manufacturer Recommendation (the ranked candidate list),
  Selection Decision (`PENDING_REVIEW`/`APPROVED`/`OVERRIDDEN`/
  `REJECTED`/`SUPERSEDED`).
- Manual Override: two-action (`SELECTION_APPROVER` request →
  `ADMIN_OWNER` approve/reject), scoped to one Selection Version, never
  automatically inherited by a later Re-selection (ADR-0066).
- Concentration Index (SKU + volume HHI, ADR-0069), computed separately
  from geographic concentration.
- Full Re-selection trigger set (`MANUFACTURER_SELECTION_ENGINE.md` §10).
- Activity Events into the shared `ebp_activity_events` ledger; Alerts
  into the shared `ebp_alerts` table (both Phase-4-introduced, reused,
  never reimplemented).
- `ebp_analytics_selection_summary` view.
- Internal-only API surface (`requireAdmin` + functional role check),
  mirroring Phase 4's internal-only pattern.

**Out of scope:**
- Computing landed cost (Phase 6) — Selection ranks on FOB directly.
- Real orders, order allocation, production scheduling, shipments
  (Phase 9) — Phase 5 may emit `suggested_allocation_percentage` /
  `recommended_capacity_reserve`, both `ADVISORY_ONLY` (ADR-0073).
- Any Supplier-tier evaluation (does not exist, ADR-0005).
- Machine-learned or automatic weight adjustment from override history
  (ADR-0067) — explicitly deferred to a future ADR if ever pursued.
- Real per-user authentication (same shared-secret + declared-actor MVP
  convention as every prior phase).
- A scheduled/background Re-selection sweep — Re-selection in v1.0 is
  triggered synchronously by the same "no cron required, compute at read
  time or on explicit trigger" discipline already used platform-wide
  (ADR-0031/Phase 4's own background-job risk note).

## Dependencies

- Phase 1: `ebp_engineering_passports` + `ebp_passport_engineering`
  (`product_category`, `product_subtype`, `duty`, `technology_code`) —
  read-only.
- Phase 2: `ebp_manufacturers`, `ebp_manufacturer_qualifications`,
  `ebp_manufacturer_certifications`, `ebp_manufacturer_locations`,
  `ebp_manufacturer_capabilities` — read-only.
- Phase 3: `ebp_manufacturer_offers` (FOB, MOQ, tooling/sample cost, lead
  time, monthly capacity, `offer_validity_until`, `expires_at`) —
  read-only.
- Phase 4: `ebp_validation_runs`, `ebp_engineering_decisions`,
  `ebp_engineering_exceptions`, `ebp_engineering_conditions`, and its
  exported `computeSelectionEligibility(pool, offerId)`
  (`ebp/phase4/service.js`) — read-only; Phase 5 calls this function
  directly rather than re-deriving eligibility from raw Rule Results.
- `PLATFORM_ARCHITECTURE.md` §8 / ADR-0037 — reuses
  `ebp_activity_events` and `ebp_alerts` (both introduced by Phase 4);
  Phase 5 creates neither table again.

## Data Model (implementable — final column list is authoritative here;
table boundaries are fixed by `MANUFACTURER_SELECTION_ENGINE.md` and the
Resolved Decisions and may not be collapsed)

- **`ebp_selection_role_assignments`** — functional roles for this phase
  (`SELECTION_REVIEWER`/`SELECTION_APPROVER`/`COMMERCIAL_APPROVER`/
  `ADMIN_OWNER`), same shape and same one-time bootstrap-allowance
  pattern as Phase 4's `ebp_engineering_role_assignments`
  (Decision 01/ADR-0039) and its permanent bootstrap fix
  (ADR-0059) — scoped to this phase's own roles; never reuses Phase 4's
  role table (frozen, different `CHECK` constraint).
- **`ebp_selection_admin_bootstrap`** — the same concurrency-safe,
  one-time `ADMIN_OWNER` bootstrap mechanism as Phase 4's
  `ebp_engineering_admin_bootstrap` (ADR-0059), scoped to Phase 5.
- **`ebp_selection_policies`** — `id`, `policy_code` (business key,
  e.g. `SELPOL-0001`), `policy_version`, `name`, `description`,
  `scope_type` (`PLATFORM`/`CATEGORY`/`SUBTYPE`/`DUTY`/`TECHNOLOGY`/
  `REGION`), `scope_value` (nullable for `PLATFORM`), `weights` (JSONB:
  the four category weights), `criteria` (JSONB: per-factor
  configuration), `normalization` (JSONB: per-factor normalization
  function + limits), `gates` (JSONB), `penalties` (JSONB: e.g. the
  Exception penalty magnitude), `diversification_rules` (JSONB:
  Backup-divergence required/preferred factors + exceptions),
  `concentration_thresholds` (JSONB), `preferred_manufacturer_bonus`
  (JSONB), `effective_from`, `status`
  (`DRAFT`/`UNDER_REVIEW`/`ACTIVE`/`SUPERSEDED`/`RETIRED`), `created_by`,
  `created_at`, `updated_at`. Unique on `(policy_code, policy_version)`.
  A partial unique index ensures at most one `ACTIVE` policy per
  `(scope_type, scope_value)` (mirrors the one-`ACTIVE`-rule-version
  pattern, Phase 4 Decision 10/ADR-0048).
- **`ebp_offer_commercial_approvals`** — `id`, `offer_id`,
  `offer_revision`, `status` (`PENDING`/`APPROVED`/`REJECTED`),
  `decided_by` (a `COMMERCIAL_APPROVER`), `decided_at`, `reason`,
  `notes`, `created_at`. One row per decision event (append-only); the
  most recent row per `(offer_id, offer_revision)` is the current
  status — exactly Phase 4's `ebp_engineering_decisions` history
  discipline, applied to the Commercial dimension, never merged with
  it.
- **`ebp_demand_signals`** — `id`, `passport_id`, `signal_type`
  (`FORECAST`/`TARGET_VOLUME`/`SCENARIO`/`UNKNOWN`),
  `estimated_quantity`, `period`, `unit`, `source`, `confidence`,
  `declared_by`, `declared_at`, `created_at`. Optional; a Selection Run
  may reference zero or one.
- **`ebp_preferred_manufacturers`** — `id`, `manufacturer_id`,
  `scope_type` (`SKU`/`FAMILY`/`CATEGORY`/`TECHNOLOGY`/`REGION`),
  `scope_value`, `reason`, `valid_from`, `valid_until`, `created_by`,
  `approved_by`, `status` (`ACTIVE`/`EXPIRED`/`REVOKED`), `created_at`,
  `updated_at`.
- **`ebp_selection_runs`** — `id`, `passport_id`, `engineering_revision`,
  `selection_version` (integer, sequential per `passport_id`, never
  reused), `selection_policy_id` (FK), `demand_signal_id` (nullable FK),
  `run_result`
  (`RECOMMENDATION_READY`/`NO_ELIGIBLE_CANDIDATE`/
  `TIE_REQUIRES_HUMAN_REVIEW`/`INSUFFICIENT_DATA`/`POLICY_CONFLICT`/
  `STALE`), `superseded_by` (nullable, later run that made this one
  `STALE`), `trigger` (which Re-selection trigger caused this run —
  `INITIAL`/`NEW_OFFER`/`NEW_VALIDATION`/`DECISION_CHANGE`/
  `EXCEPTION_CHANGE`/`COMMERCIAL_APPROVAL_CHANGE`/
  `MANUFACTURER_STATUS_CHANGE`/`CERTIFICATION_CHANGE`/`EXPIRATION`/
  `POLICY_CHANGE`/`PREFERRED_MANUFACTURER_CHANGE`/`DEMAND_CHANGE`/
  `CONCENTRATION_THRESHOLD_CROSSED`/`MANUAL_TRIGGER`), `triggered_by`,
  `input_versions` (JSONB — snapshot of every candidate's exact
  `offer_id`/`offer_revision`/Validation Run id/Engineering Decision
  id/Commercial Approval id considered, the audit record for "what
  exactly was evaluated"), `demand_not_provided` (boolean), `created_at`.
  Unique on `(passport_id, selection_version)`. Never mutated except the
  `run_result → STALE` + `superseded_by` transition when a later run
  supersedes it — exactly Phase 4's `ebp_validation_runs.status`
  pattern (Decision 12/ADR-0050).
- **`ebp_selection_candidates`** — one row per Offer considered
  (eligible or excluded) within one run: `id`, `selection_run_id`,
  `offer_id`, `offer_revision`, `manufacturer_id`, `eligible` (boolean),
  `exclusion_reason` (text, null when eligible — one of §5's five
  Exclusions, or "not evaluated: gate point N failed"),
  `composite_score_pre_bonus` (numeric, null when excluded),
  `preferred_bonus_applied` (numeric, default 0),
  `composite_score_final` (numeric, null when excluded), `rank_position`
  (integer, null when excluded — full ranking, not only named tiers),
  `tier` (`PRIMARY`/`SECONDARY`/`BACKUP`/`NONE`),
  `backup_diversification_limited` (boolean, default false), `created_at`.
  This table **is** the Manufacturer Recommendation's full basis — no
  separate "recommendation" table duplicates it.
- **`ebp_selection_factor_scores`** — one row per factor per candidate
  per run (ADR-0070): `id`, `selection_candidate_id`, `factor_code`,
  `factor_category`
  (`ENGINEERING`/`COMMERCIAL`/`OPERATIONAL`/`STRATEGIC`),
  `original_value` (JSONB), `unit`, `source`, `source_version`,
  `normalized_value` (numeric 0-100), `weight` (numeric), `weighted_
  contribution` (numeric), `penalty` (numeric, default 0), `gate_applied`
  (text, nullable), `status`, `reason_code`, `explanation_params`
  (JSONB), `evidence_reference`, `created_at`. Never optional for an
  eligible candidate — a candidate's composite score may not be recorded
  without its full set of factor rows.
- **`ebp_selection_decisions`** — one row per `ebp_selection_runs` row
  that reached `RECOMMENDATION_READY` or `TIE_REQUIRES_HUMAN_REVIEW`:
  `id`, `selection_run_id` (unique FK), `status`
  (`PENDING_REVIEW`/`APPROVED`/`OVERRIDDEN`/`REJECTED`/`SUPERSEDED`),
  `decided_by`, `decided_at`, `notes`,
  `approved_primary_offer_id`/`approved_secondary_offer_id`/
  `approved_backup_offer_id` (may differ from the engine's own tiers
  only via a recorded, approved `ebp_selection_overrides` row),
  `created_at`, `updated_at`. Created automatically at `PENDING_REVIEW`
  when the run completes; transitions to `APPROVED`/`REJECTED` by
  `SELECTION_APPROVER`, or to `OVERRIDDEN` only once a linked
  `ebp_selection_overrides` row is `APPROVED`. The prior version's row
  is set to `SUPERSEDED` the moment a new `ebp_selection_runs` row for
  the same Passport is created.
- **`ebp_selection_overrides`** — `id`, `selection_run_id` (FK),
  `selection_decision_id` (FK), `tier` (`PRIMARY`/`SECONDARY`/`BACKUP`),
  `engine_recommended_offer_id`, `engine_recommended_score`,
  `requested_offer_id`, `requested_by` (a `SELECTION_APPROVER`),
  `requested_at`, `reason`, `status`
  (`REQUESTED`/`APPROVED`/`REJECTED`), `decided_by` (an `ADMIN_OWNER`),
  `decided_at`, `decision_notes`, `created_at`. A `BEFORE UPDATE` trigger
  (mirroring Phase 4's decision-guard pattern, ADR-0052) rejects any
  attempt to set `decided_by = requested_by`, and rejects approving an
  override whose `requested_offer_id` is not, itself, an Eligible
  candidate (`ebp_selection_candidates.eligible = true`) in the same
  run — enforced both in `service.js` and at the database layer.
- **`ebp_activity_events`** — reused unchanged from Phase 4 (ADR-0037).
  Every event in the Dashboard Readiness list below is a row here.
- **`ebp_alerts`** — reused unchanged from Phase 4 (ADR-0057). Every
  alert below is a row here, deduplicated by the existing
  `(alert_type, entity_type, entity_id)` unique index.
- **`ebp_analytics_selection_summary`** — a Postgres `VIEW`, never a
  materialized copy, aggregating current Selection Run Result +
  Selection Decision status + tier coverage + concentration per Passport/
  Manufacturer, mirroring `ebp_analytics_validation_summary`'s role.

## Business Rules Enforced

- `MANUFACTURER_SELECTION_ENGINE.md` in full, as closed by Decisions
  01-12 (ADR-0062 through ADR-0074), is binding — not a suggestion.
- `BUSINESS_RULES.md` §7 (rewritten: "Offer Commercial Approval Rules")
  and §8 (rewritten: "Manufacturer Selection Rules") implement this
  phase's rules precisely.

## API Surface (internal-only, mirrors Phase 4's `requireAdmin`-gated pattern)

- `POST /api/ebp/internal/selection/:passport_code/run` — trigger a new
  Selection Run for a Passport's current `engineering_revision`,
  evaluating every Offer against the seven-part gate and, for Eligible
  candidates, the current `ACTIVE` Selection Policy for the most
  specific applicable scope.
- `GET /api/ebp/internal/selection/:passport_code` — the current
  (non-`STALE`) Selection Run, its full candidate ranking, factor
  scores, and Selection Decision.
- `GET /api/ebp/internal/selection/:passport_code/history` — every past
  Selection Run for this Passport, `STALE` included, immutable.
- `POST /api/ebp/internal/selection/:passport_code/decision` — record a
  `SELECTION_APPROVER` decision (`APPROVED`/`REJECTED`) against the
  current run's `PENDING_REVIEW` Selection Decision.
- `POST /api/ebp/internal/selection/:passport_code/override` — request a
  Manual Override (`SELECTION_APPROVER`).
- `POST /api/ebp/internal/selection/overrides/:id/approve` / `.../reject`
  — `ADMIN_OWNER` only; rejects if `decided_by` would equal
  `requested_by`, or if `requested_offer_id` is not Eligible in the run.
- `POST /api/ebp/internal/commercial-approval/:offer_code` — record a
  `COMMERCIAL_APPROVER` decision (`APPROVED`/`REJECTED`) for an Offer
  revision.
- `POST /api/ebp/internal/selection-policy/` — create a `DRAFT` policy,
  `ADMIN_OWNER` only.
- `GET /api/ebp/internal/selection-policy/:policy_code` — every version.
- `POST /api/ebp/internal/selection-policy/:policy_code/:version/publish`
  — `DRAFT` → `ACTIVE`, superseding any prior `ACTIVE` policy for the
  same scope; `ADMIN_OWNER` only.
- `POST /api/ebp/internal/preferred-manufacturers/` — create a Preferred
  Manufacturer designation, `ADMIN_OWNER` only.
- `POST /api/ebp/internal/demand-signals/` — declare a Demand Signal for
  a Passport.
- `POST /api/ebp/internal/selection-roles/` / `.../revoke` — functional
  role assignment, `ADMIN_OWNER` only, with the same one-time bootstrap
  allowance as Phase 4.
- `GET /api/ebp/internal/analytics/selection/overview` — aggregate
  Selection Run Result / tier coverage counts.
- `GET /api/ebp/internal/analytics/selection/concentration` — SKU/volume
  HHI and geographic concentration.
- `GET /api/ebp/internal/analytics/selection/alerts` — open Phase-5
  alerts.
- `GET /api/ebp/internal/analytics/timeline/:entity_type/:entity_id` —
  reuses Phase 4's existing endpoint (shared `ebp_activity_events`).

## Integration Points

- Reads Phase 1/2/3/4 data as inputs (read-only); calls Phase 4's
  `computeSelectionEligibility()` directly rather than re-deriving it.
- Writes no Phase 1/2/3/4 column, table, or `CHECK` constraint. All
  Phase 5 tables are new and additive.
- Read by (once each is separately authorized): Phase 6 (cost is
  computed for the Selection Decision's approved Primary Offer), Phase 9
  (orders reference an approved Selection Decision; allocation itself
  remains Phase 9's own decision, per ADR-0073).

## Deliverables

- Real, executable, idempotent, reversible SQL migrations for every
  table above, additive-only against Phase 1/2/3/4.
- A real backend module (`ebp/phase5/`) implementing: Selection Policy
  CRUD/publish, Offer Commercial Approval workflow, Demand Signal and
  Preferred Manufacturer entities, the eligibility gate (reusing Phase
  4's `computeSelectionEligibility`), the scoring/ranking pipeline
  (normalization, weighting, Technical Priority Rule, tie-break, HHI),
  Primary/Secondary/Backup assignment with Backup divergence, the
  Result Model (Selection Run/Recommendation/Decision), Manual Override
  two-step workflow, Re-selection trigger handling, and Activity Event/
  Alert emission for every event/alert in the Dashboard Readiness
  section below.
- `ebp_analytics_selection_summary` and the KPI/Alert queries.
- A full unit/integration/regression/concurrency test suite against real
  Postgres, following the exact no-mocks discipline already applied to
  Phases 1-4.
- Re-confirmation that Phase 1 (59+), Phase 2 (100+), Phase 3 (126+
  base), and Phase 4 (104+) test suites all still pass unmodified.

## Exit Criteria

- Given three or more Eligible Offers for the same Passport with varying
  FOB/lead time/capacity/country, Selection deterministically produces a
  ranked Primary/Secondary/Backup recommendation, records every factor
  score, and the ranking is reproducible (re-running against identical
  inputs and the identical Selection Policy version produces an
  identical ranking) — verified by test.
- Given zero Eligible Offers, Selection produces `NO_ELIGIBLE_CANDIDATE`,
  no tiers, `SELECTION_REVIEW_REQUIRED`, and the
  `PRODUCT_WITHOUT_ELIGIBLE_MANUFACTURER` alert — verified by test.
- Given two candidates with an identical composite score, the fixed
  eight-step tie-break resolves deterministically, or produces
  `TIE_REQUIRES_HUMAN_REVIEW` if all eight steps are exhausted —
  verified by test.
- An Offer with an `APPROVED` Exception can compete but its composite
  score is provably lower than an identical Offer with zero Exceptions,
  by exactly the declared penalty — verified by test.
- A `CONDITIONALLY_APPROVED` Offer with an `OPEN` mandatory Condition is
  provably excluded from official Selection (§4), and appears only in a
  `PRELIMINARY_COMPARISON` if evaluated there — verified by test.
- An Offer without an `APPROVED` Offer Commercial Approval is provably
  excluded from an official recommendation, regardless of technical
  eligibility — verified by test.
- A Manual Override requires two distinct actors (request, approval);
  the same declared actor performing both is rejected at both the
  service layer and the database trigger — verified by test.
- An Override attempt naming an ineligible Offer is rejected outright —
  verified by test.
- A Re-selection triggered by any of the declared trigger events
  produces a new Selection Version, marks the previous `STALE`, and
  never mutates or deletes it — verified by test.
- Every event in the Dashboard Readiness section is emitted at the
  correct point in the flow, verified by test.
- Migrations run cleanly from scratch, `validate.sql` passes, and a full
  rollback leaves Phases 1-4 completely untouched — verified with real
  data present.
- Phase 1, 2, 3, 4 test suites all still pass, unmodified.
- Phase 6 was not started.

## Dashboard Readiness

See `MANUFACTURER_SELECTION_ENGINE.md` §11 for the complete, decided
event/KPI/Alert/Analytics View list — reproduced here as this phase's own
binding checklist:

- **Events:** `MANUFACTURER_SELECTION_STARTED`,
  `MANUFACTURER_CANDIDATE_EVALUATED`, `MANUFACTURER_EXCLUDED`,
  `MANUFACTURER_RECOMMENDED`, `PRIMARY_SELECTED`, `SECONDARY_SELECTED`,
  `BACKUP_SELECTED`, `SELECTION_DECISION_RECORDED`,
  `SELECTION_SUPERSEDED`, `SELECTION_MARKED_STALE`,
  `SELECTION_REVIEW_REQUIRED`, `MANUAL_SELECTION_OVERRIDE_REQUESTED`,
  `MANUAL_SELECTION_OVERRIDE_APPROVED`,
  `MANUAL_SELECTION_OVERRIDE_REJECTED`, `PREFERRED_MANUFACTURER_APPLIED`.
- **KPIs:** products with Primary; products with Secondary; products
  with Backup; single-source products; products without eligible
  manufacturer; average selection time; override rate; algorithmic
  recommendation acceptance rate; manufacturer distribution; country
  distribution; SKU Concentration HHI; volume Concentration HHI;
  limited-diversification backup count.
- **Alerts:** `PRODUCT_WITHOUT_PRIMARY`, `PRODUCT_WITHOUT_BACKUP`,
  `NO_ELIGIBLE_MANUFACTURER`, `TIE_REQUIRES_REVIEW`,
  `HIGH_MANUFACTURER_CONCENTRATION`, `HIGH_COUNTRY_CONCENTRATION`,
  `BACKUP_DIVERSIFICATION_LIMITED`, `SELECTION_STALE`,
  `PRIMARY_MANUFACTURER_SUSPENDED`, `PRIMARY_OFFER_EXPIRING`,
  `POLICY_CONFLICT`.
- **Analytics Views:** `ebp_analytics_selection_summary`.
- **APIs:** `/api/ebp/internal/analytics/selection/*`.
- **Timeline impact:** Passport and Manufacturer Timelines gain every
  event above, reconstructed from the shared `ebp_activity_events` —
  no separate, duplicated timeline table.
- **Future-AI impact:** every factor score being structured and
  `reason_code`-tagged enables "why was this manufacturer selected,"
  "what changed versus the previous selection," "what would be the best
  replacement," "what products are at supply risk," "what manufacturers
  dominate a family," and "was this change commercial or technical"
  without parsing free text — per `MANUFACTURER_SELECTION_ENGINE.md`
  §12.

## Risks

- **Risk: Selection Policy v1.0's initial weights/thresholds are a
  starting point, not a guarantee of correctness.** Real ELIMFILTERS
  commercial/engineering review of the actual published policy before it
  affects real recommendations is a prerequisite for trusting this
  phase's output in production, independent of code correctness.
- **Risk: single-candidate families remain untested by construction.**
  As in Phase 2's own risk note, early data may have only one Eligible
  Manufacturer per family, trivially "selecting" without exercising real
  ranking logic. An explicit multi-candidate test scenario is required
  before this phase's output is trusted operationally.
- **Risk: `ADMIN_KEY_SHARED` remains a shared, undifferentiated
  credential**, exactly the same standing risk already flagged in every
  prior phase.
- **Risk: no background job infrastructure exists.** Re-selection in
  v1.0 is triggered synchronously/on-demand, not via a scheduled sweep —
  a Passport whose Offer silently expires without any new event
  triggering Re-selection surfaces only via the `SELECTION_STALE`/
  `PRIMARY_OFFER_EXPIRING` alerts, not automatically.

## Open Questions

All twelve questions originally listed here are resolved — see
`MANUFACTURER_SELECTION_ENGINE.md`, "Resolved Decisions," and ADR-0062
through ADR-0074. No new open question was identified while converting
this document into an implementable spec.
