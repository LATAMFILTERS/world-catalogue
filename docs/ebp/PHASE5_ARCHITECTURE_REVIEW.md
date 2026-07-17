# Phase 5 — Final Architecture Review

**Status:** Complete
**Date:** 2026-07-14
**Scope:** `ebp/phase5/*`, `migrations/ebp-phase5/*`, full regression across Phases 1–5
**Preceded by:** Phase 5 correction round (manual 12-point audit, 2026-07-13) — six confirmed
defects fixed and covered by `tests/ebp-phase5/correction.test.js`. This review is the
architectural pass required before the Freeze ADR, per the explicit instruction: "Do not freeze
Phase 5 yet. If any architectural issue is discovered, fix it first."

This document is the index for the five companion reports. Each ran against a real Postgres
instance, never against code reading alone.

| Report | Verdict |
|---|---|
| `PHASE5_PERFORMANCE_REPORT.md` | Green — no unindexed critical-path query, no query above single-digit milliseconds at the tested scale |
| `PHASE5_INDEX_AUDIT.md` | Green — every JOIN/WHERE/ORDER BY/GROUP BY on the critical path is index-backed; no new index required |
| `PHASE5_CONCURRENCY_REPORT.md` | Green after one critical fix (self-deadlock) and one secondary fix (raw constraint-violation error surfaced to the caller) |
| `PHASE5_POLICY_AUDIT.md` | Green — zero hardcoded weight, threshold, penalty, or diversification rule in engine code |
| `PHASE5_FINAL_RECOMMENDATION.md` | **APPROVED FOR FREEZE** |

## 1. Duplicated logic / dead code

Grepped `ebp/phase5/*.js` for repeated query shapes and unused exports.

- **Found and fixed:** `evaluateCandidateEligibility` was calling five Phase 1/2/4 read queries
  per candidate offer inside the eligibility loop (`fetchLatestCommercialApproval`,
  `fetchManufacturerQualification`, `fetchCertificationGapForManufacturer`,
  `fetchApprovedExceptionCount`, and the Preferred Manufacturer check) — an O(N) round-trip
  pattern repeating the same query shape N times per Selection Run. Replaced with five
  bulk-fetch functions (`*Bulk`, `repository.js:97-152, 254-263`) called once per run, each
  returning a `Map`/`Set` for O(1) in-loop lookup. The single-candidate versions
  (`fetchLatestCommercialApproval`, `fetchManufacturerQualification`,
  `fetchCertificationGapForManufacturer`, `fetchApprovedExceptionCount`) are retained, not dead
  code: `evaluateCandidateEligibility` falls back to them when called without a `bulk` map
  (single-offer paths, e.g. re-evaluating one candidate outside a full run), and
  `fetchLatestCommercialApproval` is also used directly by the commercial-approval routes.
- **Not duplicated:** Phase 4's `computeSelectionEligibility` is called once per offer, not
  batched, by deliberate architectural constraint (ADR-0072, Decision 11) — Phase 5 must reuse
  Phase 4's frozen Global Result Model exactly as written, never re-derive or batch it
  independently. This is the one place an O(N) pattern remains, by design, not oversight; it is
  quantified in `PHASE5_PERFORMANCE_REPORT.md` §3 and is not a defect.
- **No dead exports found:** every function in `service.js`/`repository.js`'s `module.exports`
  is referenced from `internal.routes.js`, a test file, or another service function.
- **No unnecessary abstraction found:** the module boundary (routes → service → repository)
  matches Phases 1–4 exactly; no new abstraction layer was introduced during the correction
  round.

## 2. Maintenance-risk findings

- `runSelection` (`service.js`) is the longest function in the module (~230 lines) — it is a
  single Postgres transaction covering policy resolution, eligibility, scoring, ranking,
  persistence, and observability side effects, and cannot be safely split across transaction
  boundaries without reopening the deadlock class described in
  `PHASE5_CONCURRENCY_REPORT.md`. Splitting it into same-transaction helper functions that each
  take `client` (never `pool`) would improve readability without changing behavior; deferred as
  a non-blocking Phase 6+ readability improvement, not an architectural defect.
- The connection-pool discipline ("once inside a transaction, always pass `client`, never
  `pool`") is enforced only by code review and the header comment now added to
  `repository.js:1-14` — there is no automated lint rule catching a stray `pool.query(...)`
  call inside a `BEGIN`/`COMMIT` block. Flagged as a **risk**, not fixed in this review: adding
  such a lint rule is infrastructure work spanning all phases, out of Phase 5's remit. Recorded
  in `PHASE5_FINAL_RECOMMENDATION.md` §Risks.

## 3. Manual Override — permissions, trigger behavior, eligible-only, immutable trail

Re-confirmed in this review round (originally verified in the 2026-07-13 correction-round audit,
re-checked here against the current code after all fixes):

- **Permissions.** Override request and decision both require `requireAdmin` (the real security
  boundary, per the platform-wide MVP convention); `ebp_selection_role_assignments` narrows
  which already-admin-authenticated declared actor may request vs. decide, but does not by
  itself grant access.
- **Trigger behavior.** `trg_ebp_enforce_selection_override_guard`
  (`002_override_guard.sql:42-44`) fires `BEFORE INSERT OR UPDATE` on every write to
  `ebp_selection_overrides` and re-derives both constraints directly from row/table state —
  independent of `service.js`, so a bug or an ad hoc migration can never insert an invalid
  override:
  1. `requested_by` and `decided_by` must be different declared actors.
  2. An `APPROVED` override's `requested_offer_id` must be an `eligible = TRUE` candidate in the
     same `selection_run_id` (queried live against `ebp_selection_candidates`, backed by
     `uq_ebp_sel_candidates_run_offer`) — an ineligible or excluded Offer can never be promoted
     by override.
- **Only Eligible candidates selectable.** Confirmed by the trigger query above; no application
  code path bypasses it, since the constraint is enforced at the database level, not only in
  `service.js`.
- **Immutable audit trail.** `ebp_selection_overrides` is append-only for the decision fields
  (`decided_by`, `decided_at`, `decision_notes`) — a decision is recorded via `UPDATE ...
  WHERE id = $1`, which changes the *outcome* of a specific override row exactly once (the row's
  `status` moves `REQUESTED → APPROVED|REJECTED`, a one-way transition with no code path
  reverting it), while `requested_offer_id`, `requested_by`, `requested_at`, and `reason` are
  never touched again after creation. The full request-then-decide history is reconstructable
  from this one immutable-after-decision row per override, exactly mirroring Phase 4's
  `ebp_engineering_decisions` audit pattern.

## 4. Regression

Phases 1–5 re-run from a clean state after every fix in this review, all green:

| Phase | Tests | Pass | Fail |
|---|---|---|---|
| 1 | 59 | 59 | 0 |
| 2 | 100 | 100 | 0 |
| 3 | 126 | 126 | 0 |
| 4 | 104 | 104 | 0 |
| 5 | 43 (35 original + 8 correction-round) | 43 | 0 |

No Phase 1–4 file was modified during this review. Full command log in
`PHASE5_FINAL_RECOMMENDATION.md` §Evidence.
