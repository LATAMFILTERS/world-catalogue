# IMPLEMENTATION MASTER INDEX — ELIMFILTERS Business Platform (EBP)

**Purpose:** single-glance status of every phase. Update this file whenever a
phase's status changes — it is the authoritative status tracker referenced by
`CLAUDE_START_PROMPT.md` at the start of every EBP session.

**Status values:** `Not Started` → `Spec Drafted` → `Spec Approved` → `In
Build` → `Built` → `Blocked` (with reason). A phase's foundation/spec can
additionally be marked `APPROVED / FROZEN vX.Y` once formally approved and
locked against unreviewed architecture changes (see Phase 00 below).

**Phase 0 formally APPROVED / FROZEN v1.0 — 2026-07-13.** Branch
`claude/phase-0-audit-review-wanxa3`. See ADR-0013 in `DECISIONS.md` and
the "Phase 0 approved and frozen — v1.0" entry in `CHANGELOG.md` for the
closing commit hash. Phase 1 — Product Engineering Passport is authorized
to begin immediately; no phase beyond Phase 1 is authorized.

**Correction round 1 (2026-07-13):** Phase 0 was reviewed and **not
approved** — the project owner identified a domain-model error (a
`Supplier` entity had been introduced as a mandatory part of the validation
chain; the agreed MVP has no such entity). See ADR-0005/ADR-0006 in
`DECISIONS.md` and the `CHANGELOG.md` entry for this date.

**Correction round 2 (2026-07-13):** Phase 0 was reviewed again and **still
not approved** — three further gaps were identified: Manufacturer Product
Offer needed to be versioned (many revisions, one active at a time), the
Passport incorrectly held Manufacturer-proposed and ELIMFILTERS-approved
packaging quantities that belong elsewhere, and a single undifferentiated
note field conflated Manufacturer-visible instructions with
ELIMFILTERS-internal information while also conflating technical
Validation with a separate commercial/operational Offer Approval decision.
Phase 0 status remains `In Build` pending re-review of this second
correction. See ADR-0007/ADR-0008/ADR-0009 in `DECISIONS.md` and the
`CHANGELOG.md` entry for this date.

| # | Phase | Doc | Status | Approved by | Approved on |
|---|---|---|---|---|---|
| 00 | Foundation | [phase-00-foundation.md](phases/phase-00-foundation.md) | **APPROVED / FROZEN v1.0** | Project Owner | 2026-07-13 |
| 01 | Product Engineering Passport | [phase-01-product-engineering-passport.md](phases/phase-01-product-engineering-passport.md) | **APPROVED / FROZEN v1.0** | Project Owner | 2026-07-13 |
| 02 | Manufacturer Registry | [phase-02-manufacturer-registry.md](phases/phase-02-manufacturer-registry.md) | **APPROVED / FROZEN v1.0** | Project Owner | 2026-07-13 |
| 03 | Manufacturer Intake Portal (Factory Portal) | [phase-03-supplier-portal.md](phases/phase-03-supplier-portal.md) | **APPROVED / FROZEN v1.0** | Project Owner | 2026-07-13 |
| 04 | Engineering Compliance Validation | [phase-04-validation-engine.md](phases/phase-04-validation-engine.md) | **APPROVED / FROZEN v1.0** | Project Owner | 2026-07-13 |
| 05 | Manufacturer Selection | [phase-05-manufacturer-selection.md](phases/phase-05-manufacturer-selection.md) | **Built** (not frozen) — real migrations (`migrations/ebp-phase5/`), backend module (`ebp/phase5/`), 35-test suite, all decisions closed (ADR-0062–ADR-0074) | — | — |
| 06 | Cost Engine | [phase-06-cost-engine.md](phases/phase-06-cost-engine.md) | Spec Drafted (revised) | — | — |
| 07 | Pricing Engine | [phase-07-pricing-engine.md](phases/phase-07-pricing-engine.md) | Spec Drafted (revised) | — | — |
| 08 | Distributor Portal | [phase-08-distributor-portal.md](phases/phase-08-distributor-portal.md) | Spec Drafted (revised) | — | — |
| 09 | Order Management | [phase-09-order-management.md](phases/phase-09-order-management.md) | Spec Drafted (revised) | — | — |

**Note on Phase 03's file name:** the file is still named
`phase-03-supplier-portal.md` to avoid unnecessary churn in cross-references.
Its title and content are corrected to **Manufacturer Intake Portal (Factory
Portal)** — a raw-material Supplier concept no longer appears in its scope.
See ADR-0005.

## Notes on Current Status

- **Phase 00** is `APPROVED / FROZEN v1.0` as of 2026-07-13, after two
  correction rounds and a final governance-decisions round (ADR-0005
  through ADR-0013). The documentation baseline under `docs/ebp/` may not
  be altered without a new ADR that explicitly supersedes the relevant
  prior entry — see ADR-0013.
- **Phase 01 — Product Engineering Passport** is `APPROVED / FROZEN v1.0`
  as of 2026-07-13: real, executable SQL migrations
  (`migrations/ebp-phase1/`, three files), a real backend module
  (`ebp/phase1/`) mounted in `server.js` at `/api/ebp/passports` (eight
  endpoints) behind `requireAdmin`, and a 59-test suite (unit + integration
  + regression, `tests/ebp-phase1/`) — all passing against a real local
  Postgres instance, re-verified from a from-scratch migration
  immediately before this freeze. Declared-actor semantics (ADR-0011-
  adjacent, not a numbered ADR) and the ADR-0014 applicability-approval
  activation gate were added in a post-implementation audit correction
  before this freeze — see the `CHANGELOG.md` entries for this date.
- **Phase 02 — Manufacturer Registry** is `APPROVED / FROZEN v1.0` as of
  2026-07-13: real, executable SQL migrations (`migrations/ebp-phase2/`,
  `001_schema.sql` + `validate.sql` + `rollback.sql`, 8 tables + 1
  effective-certification view), a real backend module (`ebp/phase2/`)
  mounted in `server.js` at `/api/ebp/manufacturers` (16 endpoints) behind
  `requireAdmin`, and a 100-test suite (unit + integration + regression,
  `tests/ebp-phase2/`) — all passing against a real local Postgres
  instance, including a full rollback-with-real-data verification (154
  manufacturers + children dropped cleanly, Phase 1/catalog/technologies
  unchanged) and re-confirmation that Phase 1's own 59-test suite still
  passes unmodified. Built with ADR-0015 through ADR-0021; four closing
  decisions (`registered_on` semantics, certification-validity design
  approval, `country_code`/`timezone` validation debt, enum-extension
  governance) were resolved and recorded in ADR-0022 at approval time —
  see `DECISIONS.md`. The documentation baseline for Phase 2
  (`phases/phase-02-manufacturer-registry.md` and its cross-referenced
  ADRs) may not be altered without a new ADR that explicitly supersedes
  the relevant prior entry, same discipline as Phase 0/ADR-0013 and Phase
  1.
- **Phase 03 — Manufacturer Intake Portal (Factory Portal)** is
  `APPROVED / FROZEN v1.0` as of 2026-07-13: real, executable SQL
  migrations (`migrations/ebp-phase3/`, 13 tables + 2 effective/computed
  views), a real backend module (`ebp/phase3/`) with a hard-split
  internal (`/api/ebp/internal/manufacturer-batches`, 13 endpoints,
  `requireAdmin`) and factory-facing (`/api/ebp/factory`, 16 endpoints,
  `requireFactorySession`) API surface, real Factory-user authentication
  (scrypt password hashing, opaque hashed session tokens — resolves
  ADR-0002 for Manufacturers only), a Portal-and-Excel dual intake flow
  (Excel via `exceljs`, uploads via `multer` — both new dependencies,
  documented in ADR-0027/ADR-0028), and a Factory Portal frontend
  (`/portal/*`, server-rendered, `noindex/nofollow`) whose Excel flow and
  Offer form are both full UIs (download/upload/review/confirm; one
  fieldset per applicable PEP field) — no Postman/curl/API token ever
  needed. The project owner reviewed Phase 3 as "well underway, but not
  yet approved or frozen" and required a mandatory 9-point correction
  round before any freeze; all 9 items are complete: ADR-0030
  (Postgres-persisted Excel staging), ADR-0031 (centralized effective
  `OVERDUE`, no cron required), ADR-0032 (PEP-driven multi-field Offer
  form, Portal/Excel parity), ADR-0033 (CSRF protection: session-bound
  synchronizer token, a double-submit cookie for the pre-session login
  form, `logout` changed from `GET` to `POST`), ADR-0034 (error-response
  sanitization: known service errors keep their curated message,
  anything unexpected becomes a generic message plus a `request_id`),
  ADR-0035 (cookie/session lifecycle: `Max-Age` aligned with the
  12-hour session, matching attributes on clear, session revocation on
  password reset), and a final audit (item 9) performed against a
  **freshly rolled-back-and-reapplied schema**: all 13 Phase 3 tables +
  2 views dropped and confirmed leaving Phase 1's 8 tables / 1015
  Manufacturer rows / 78 catalog rows byte-identical, then migrations
  001–004 reapplied from scratch with zero errors, `validate.sql`'s 15
  checks all passing, and the full Phase 1 (59) / Phase 2 (100) / Phase 3
  (126) suites all passing, stable across 3 consecutive runs. The test
  suite grew from the original 87 to **126 tests** (counts confirmed by
  the `node --test` runner, `tests/ebp-phase3/`) across the correction
  round. Built with ADR-0023 through ADR-0036 — see `DECISIONS.md`
  (ADR-0036 records the freeze decision itself). **Phase 4 (Engineering
  Compliance Validation) has not been started** (no `ebp/phase4/`, no
  `migrations/ebp-phase4/`, confirmed at freeze) **and is not authorized
  by this freeze — a separate, explicit authorization is required before
  any Phase 4 work begins.**
- **Phases 04-09** remain `Spec Drafted` — first-pass drafts written during
  Phase 0 to prove the roadmap's dependency chain is coherent (see each
  file's own "Status" line). None are `Spec Approved`. **No implementation
  work may start on Phases 04-09 until each is explicitly approved in its
  own turn, per `CLAUDE_WORKFLOW.md`.**
- **EBP Observability & Intelligence Layer (cross-cutting, added
  2026-07-13, ADR-0037) — not a phase, no row in the table above.**
  Before Phase 4 was authorized, the project owner introduced a
  permanent capability present in every current and future phase:
  Activity Events (one canonical model, `ebp_activity_events`), Timeline
  reconstruction, Analytics Views (`ebp_analytics_*`), a KPI Layer, an
  Alert Layer, and a reserved (not implemented) `/api/ebp/internal/
  analytics/*` surface — see `PLATFORM_ARCHITECTURE.md` §8 and ADR-0037.
  **Architecture and contracts only — no migration, table, module, or
  route was created; no Phase 1/2/3 schema, endpoint, test, or behavior
  was changed.** Phases 1, 2, and 3 each gained a new, purely additive
  "Dashboard Readiness" section in their own docs describing future
  readiness. Every phase authorized after Phase 3 must include a
  completed Dashboard Readiness section (`CLAUDE_WORKFLOW.md` §3.1)
  before it can be approved — this is now part of the Phase Gate
  Definition (`ROADMAP.md`). **This layer's own implementation is not
  authorized by ADR-0037 and requires its own separate phase-gate
  approval, same as any other phase. Phase 4 (Engineering Compliance
  Validation) remains not started and not authorized.**
- **`ENGINEERING_RULE_ENGINE.md` (normative reference, added 2026-07-13,
  ADR-0038) — governs Phase 4, is not itself a phase, no row in the table
  above.** Before authorizing Phase 4 implementation, the project owner
  required the rule engine's *behavior* (not its API or schema) to be
  fully defined first: the philosophy (Engineering Compliance,
  Engineering Approval, Commercial Approval, Deviation, Exception,
  Conditional Approval), ten Comparison Types, a six-state model, a
  five-level Severity scale, the Exception model, Scoring philosophy
  (not implemented), the Observation Catalog principle, the Rule Catalog
  shape and fourteen Categories, the full Passport→Offer→Rule
  Evaluation→Compliance Summary→Engineering Decision→Offer Approval
  flow, Dashboard Readiness, and AI-readiness rationale — see
  `ENGINEERING_RULE_ENGINE.md` and ADR-0038. **No table, API, migration,
  or code was created. No frozen phase was touched.** Twelve open
  questions are recorded in that document's own "Open Questions" section
  and **must all be answered before any Phase 4 code is written**. Phase
  4's own spec (`phases/phase-04-validation-engine.md`) is unchanged by
  this ADR and remains `Spec Drafted`, unapproved. **Phase 4 remains not
  started and not authorized (superseded below — 2026-07-13).**
- **Phase 04 — Engineering Compliance Validation is `Built`, not frozen, as
  of 2026-07-13.** The project owner resolved all twelve open questions
  (Decisions 01-12) plus the Global Result Model in a single session;
  `ENGINEERING_RULE_ENGINE.md` and `phases/phase-04-validation-engine.md`
  were updated accordingly and ADR-0039 through ADR-0051 were recorded
  before any code was written, per `CLAUDE_WORKFLOW.md`. Delivered: real,
  executable, idempotent, reversible SQL migrations
  (`migrations/ebp-phase4/`: `001_schema.sql` + `validate.sql` +
  `rollback.sql`) adding 8 tables (`ebp_engineering_role_assignments`,
  `ebp_rule_versions` — the Rule Catalog, `ebp_validation_runs`,
  `ebp_rule_results`, `ebp_engineering_decisions`,
  `ebp_engineering_exceptions`, `ebp_engineering_conditions`, and
  `ebp_activity_events` — the first real implementation of the ADR-0037
  shared event ledger) plus 1 analytics view
  (`ebp_analytics_validation_summary`); a real backend module
  (`ebp/phase4/`: `comparators.js` for the ten Comparison Types,
  `severity.js` and `rule-engine.js` for the Severity/gating mapping and
  Composite/Conditional aggregation, `observations.js` for the Decision-06
  hybrid Observation Catalog, `activity-events.js`, `repository.js`,
  `service.js`, `dto.js`) mounted in `server.js` behind `requireAdmin` at
  `/api/ebp/internal/validation`, `/api/ebp/internal/rule-catalog`, and
  `/api/ebp/internal/roles`; and a 73-test suite (33 unit + 27 integration
  + 13 regression, `tests/ebp-phase4/`) all passing against a real local
  Postgres instance, stable across repeated runs, with a verified
  migrate → rollback → reapply cycle. Re-ran and confirmed unchanged:
  Phase 1 (59), Phase 2 (100), Phase 3 (126) — all still passing. The
  Global Result Model's three-way separation (Mechanical Compliance
  Result / Engineering Decision / Offer Approval, ADR-0051) is enforced
  structurally (separate columns/tables, separate CHECK constraints,
  tested that the engine never self-grants an Engineering Decision — see
  Decision 09, ADR-0047).
- **Phase 04 — Engineering Compliance Validation is `APPROVED / FROZEN
  v1.0` as of 2026-07-13.** After the initial "Built" round above, the
  project owner reviewed the implementation and required a mandatory
  final correction before approval: strict Engineering Decision
  eligibility enforced in **both** `service.js` and a database trigger
  (`migrations/ebp-phase4/003_decision_guard.sql`); a defined effect for
  Exception decisions (the current Validation Run is marked `STALE`,
  `VALIDATION_MARKED_STALE` is emitted, and a new run is automatically
  triggered with `trigger = EXCEPTION_APPROVED`/`EXCEPTION_REJECTED`,
  embedding the full Exception ledger in every run's `input_versions`);
  an explicit `ACCEPTED_BY_EXCEPTION` effective disposition, computed at
  read time only, that never rewrites a Rule Result's historical `state`;
  condition-driven re-evaluation of decision eligibility
  (`ebp_engineering_decisions.status`: `CURRENT`/`NEEDS_REVIEW`, and a
  `computeSelectionEligibility()` gate for the future Phase 5); corrected
  Rule Result Activity Event identity (`entity_id` is the real
  `ebp_rule_results.id`, never `validation_run_id`); a minimal Alert
  Layer (`ebp_alerts`, nine alert types, deduplicated via a partial
  unique index); a minimal Internal Analytics API (5 read-only
  endpoints under `/api/ebp/internal/analytics`); a permanent,
  concurrency-safe `ADMIN_OWNER` bootstrap
  (`ebp_engineering_admin_bootstrap`, a single-row-ever table that never
  reopens even if the bootstrapped `ADMIN_OWNER` is later revoked); and
  Rule Catalog publish-time validation (Composite dependency-cycle
  detection — direct and indirect, `default_behavior` completeness per
  `comparison_type`, gating-integrity checks, and explicit
  CRITICAL-waivable acknowledgement). ADR-0052 through ADR-0060 record
  each correction — see `DECISIONS.md`. Two new migrations were added
  (`migrations/ebp-phase4/002_correction.sql`,
  `003_decision_guard.sql`), both additive and idempotent, verified via
  a full migrate-from-scratch → `validate.sql` (21 checks) → rollback →
  reapply cycle. The test suite grew from 73 to **104 tests** (33 unit +
  27 integration + 13 regression + 31 new correction-round tests in
  `tests/ebp-phase4/correction.test.js`), all passing, stable across
  repeated runs — note that because the Rule Catalog and the
  `ADMIN_OWNER` bootstrap are genuinely global, cross-file shared state
  (unlike Phase 1-3's fully-isolated fixtures), the four Phase 4 test
  files must be run as separate sequential processes, never as a single
  `node --test tests/ebp-phase4/*.test.js` glob invocation — the
  `npm run test:ebp-phase4` script enforces this. Re-ran and confirmed
  unchanged: Phase 1 (59), Phase 2 (100), Phase 3 (126) — all still
  passing. **This documentation baseline may not be altered without a
  new ADR that explicitly supersedes the relevant prior entry, same
  discipline as Phase 0/1/2/3. Phase 5 (Manufacturer Selection) has not
  been started; this freeze does not authorize it.**
- **`MANUFACTURER_SELECTION_ENGINE.md` (normative reference, added
  2026-07-13, ADR-0061) — governs Phase 5, is not itself a phase, no row
  in the table above.** Before authorizing Phase 5 implementation, the
  project owner required the Selection Engine's *philosophy and business
  rules* (not its API or schema) to be fully defined first — the same
  documentation-before-code discipline `ENGINEERING_RULE_ENGINE.md`/
  ADR-0038 established for Phase 4. Covers: ten precisely-defined
  philosophy terms (Manufacturer Recommendation, Primary/Secondary/
  Backup Manufacturer, Eligible/Preferred Manufacturer, Selection
  Policy, Re-selection, Manual Override, Strategic Allocation), seven
  non-negotiable Principles, four Evaluation Factor dimensions
  (Engineering/Commercial/Operational/Strategic, no weights), the
  Eligibility gate (reusing Phase 4's `computeSelectionEligibility()`
  contract, ADR-0055), Exclusion conditions, the Ranking philosophy (no
  algorithm), Primary/Secondary/Backup rules, the Manual Override model,
  the Versioning model, Re-selection triggers, Dashboard Readiness
  candidates, and AI-readiness rationale. **No table, API, migration, or
  code was created. No frozen phase (0/1/2/3/4) was touched.** Twelve
  open questions are recorded in that document's own "Open Questions"
  section — the highest-priority being the ranking weighting/scoring
  formula, entirely undefined by design — and **must all be answered
  before any Phase 5 code is written**. Phase 5's own spec
  (`phases/phase-05-manufacturer-selection.md`) is unchanged by this ADR
  and remains `Spec Drafted (revised)`, unapproved; its predecessor
  content (pre-dating Phase 4's actual frozen Global Result Model) is
  flagged in Open Question 11 as needing re-examination, not assumed
  still current. **Phase 5 remains not started and not authorized** —
  superseded by the entry immediately below.
- **Phase 05 — Manufacturer Selection** is **Built** (2026-07-13, not
  frozen) after the project owner closed all twelve
  `MANUFACTURER_SELECTION_ENGINE.md` Open Questions in a single pass
  (Decisions 01-12, ADR-0062 through ADR-0074) — a Selection-Policy-
  versioned multicriteria ranking (Technical Quality 40% / Commercial
  Competitiveness 25% / Operational Capability 20% / Strategic
  Resilience 15%), the seven-part eligibility gate (superseding the
  predecessor's five-part ADR-0010 gate), a new Offer Commercial
  Approval entity (`ebp_offer_commercial_approvals` — designed under
  ADR-0008/ADR-0011 as "Offer Approval" but never actually built in
  Phase 3's real schema; built here, scoped strictly to the Commercial
  dimension, never merged with Phase 4's `ebp_engineering_decisions`),
  a fixed eight-step tie-break order, an HHI-based Concentration Index,
  structured factor-tagged explainability, Preferred Manufacturer and
  Demand Signal entities, and a two-action Manual Override workflow
  (`SELECTION_APPROVER` requests, `ADMIN_OWNER` approves/rejects, same
  actor can never do both). `phases/phase-05-manufacturer-selection.md`
  was rewritten as an implementable spec deriving from these decisions.
  Real, executable, idempotent, reversible SQL migrations
  (`migrations/ebp-phase5/`, 3 files: `001_schema.sql` — 11 tables + 1
  analytics view; `002_override_guard.sql` — the two-actor/eligible-
  candidate database trigger; `rollback.sql`/`validate.sql`), a real
  backend module (`ebp/phase5/`: `policy.js`, `ranking.js`,
  `repository.js`, `service.js`, `dto.js`, `internal.routes.js`), and a
  35-test suite (16 unit + 15 integration + 4 regression,
  `tests/ebp-phase5/`) all pass against a real local Postgres instance,
  verified via a full migrate-from-scratch → `validate.sql` → rollback →
  reapply cycle. Phase 5 reuses the shared `ebp_activity_events` and
  `ebp_alerts` tables introduced by Phase 4 — it creates neither table
  again, per ADR-0037. Phase 1 (59), Phase 2 (100), Phase 3 (126), and
  Phase 4 (104) test suites were all re-run immediately after and still
  pass, unmodified. **Phase 5 is Built but deliberately not frozen** —
  per the project owner's explicit instruction, freezing requires its
  own separate future review/approval act, exactly as every prior
  phase's freeze was a distinct, later decision from "Built." **Phase 6
  was not started.**

## How to Use This File

1. At the start of any EBP work session, read this file first (see
   `CLAUDE_START_PROMPT.md`) to determine the current phase and its status.
2. Never begin implementation on a phase whose status is not
   `Spec Approved` or later.
3. When a phase's status changes, update its row here **and** add an entry
   to `CHANGELOG.md` in the same commit.
4. If a phase becomes blocked, set status to `Blocked` and add a one-line
   reason in this table (extend the table with a Reason column if needed)
   plus detail in the phase's own doc under "Risks."
