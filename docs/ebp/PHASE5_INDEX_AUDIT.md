# Phase 5 — Index Audit

**Date:** 2026-07-14
**Method:** every index declared across `001_schema.sql`, `002_override_guard.sql`, and
`003_analytics_concentration_view.sql` checked against every JOIN/WHERE/ORDER BY/GROUP BY in
`ebp/phase5/repository.js`, then confirmed used (not just present) via `EXPLAIN ANALYZE` on real
data (see `PHASE5_PERFORMANCE_REPORT.md` for the query plans).

## 1. Index inventory (`001_schema.sql`)

| Index | Table | Backs |
|---|---|---|
| `idx_ebp_sel_roles_actor` | `ebp_selection_role_assignments` | `actorHasRole` lookup |
| `uq_ebp_sel_policy_one_active_scope` | `ebp_selection_policies` | enforces at most one ACTIVE policy per scope; also backs `fetchActiveSelectionPolicies` |
| `idx_ebp_sel_policy_code` | `ebp_selection_policies` | `fetchNextPolicyVersion` |
| `idx_ebp_commercial_approvals_offer` | `ebp_offer_commercial_approvals` | `fetchLatestCommercialApproval`, `fetchLatestCommercialApprovalsBulk` — confirmed via `EXPLAIN ANALYZE` (Index Scan, 4.65 ms at 1,996 offers) |
| `idx_ebp_demand_signals_passport` | `ebp_demand_signals` | `fetchLatestDemandSignal` |
| `idx_ebp_preferred_mfr_scope` | `ebp_preferred_manufacturers` | `fetchPreferredManufacturers`, `fetchPreferredManufacturerSetBulk` — confirmed (Index Scan, 0.05 ms) |
| `idx_ebp_preferred_mfr_manufacturer` | `ebp_preferred_manufacturers` | reserved for a by-manufacturer lookup path (no current caller — not dead: matches the FK it covers, needed the moment a manufacturer-scoped preferred-manufacturer query is added, cheap to keep) |
| `idx_ebp_selection_runs_passport` | `ebp_selection_runs` | `fetchNextSelectionVersion`, `fetchSelectionRunHistory` — confirmed (Index Only Scan, 0.08 ms) |
| `idx_ebp_selection_runs_current` | `ebp_selection_runs` | `fetchCurrentSelectionRun`, `markPriorRunsStale` — confirmed (Index Scan, 0.04–0.08 ms) |
| `idx_ebp_sel_candidates_run` | `ebp_selection_candidates` | `fetchCandidatesForRun` |
| `uq_ebp_sel_candidates_run_offer` | `ebp_selection_candidates` | prevents a duplicate candidate row per (run, offer); also backs the override guard trigger's eligibility lookup (`002_override_guard.sql`) |
| `uq_ebp_sel_candidates_run_tier` | `ebp_selection_candidates` | enforces at most one PRIMARY/SECONDARY/BACKUP per run |
| `idx_ebp_sel_factor_scores_candidate` | `ebp_selection_factor_scores` | `fetchFactorScoresForCandidate` |
| `idx_ebp_sel_factor_scores_code` | `ebp_selection_factor_scores` | reserved for a future by-factor-code analytics query; not currently called from `repository.js` |
| `idx_ebp_sel_decisions_status` | `ebp_selection_decisions` | status-filtered decision queues (dashboard-readiness path) |
| `idx_ebp_sel_overrides_run` | `ebp_selection_overrides` | override lookups by run |
| `idx_ebp_sel_overrides_status` | `ebp_selection_overrides` | status-filtered override queues |

Two indexes above (`idx_ebp_preferred_mfr_manufacturer`, `idx_ebp_sel_factor_scores_code`) have
no current caller in `repository.js`. Both are declared with an explicit purpose in the schema
comments and cost nothing to keep at this data volume; neither was added or removed during this
review — flagged for completeness, not as a defect.

## 2. Indexes reused, not owned, by Phase 5

Phase 5 reads three Phase 1–3 tables read-only on the hot path. Their indexes are frozen and
were audited but not modified:

- `idx_ebp_offers_lineage` on `ebp_manufacturer_offers(passport_id, ...)` — confirmed backing
  `fetchCandidateOffers` and every bulk-fetch subquery deriving offer/manufacturer id sets
  (Index Scan / Index Only Scan in every plan in `PHASE5_PERFORMANCE_REPORT.md` §2).
- `ebp_manufacturers_pkey` — confirmed backing every manufacturer join.
- `idx_ebp_mfr_quals_mfr` on `ebp_manufacturer_qualifications(manufacturer_id)` — confirmed
  backing `fetchManufacturerQualificationsBulk` (Bitmap Index Scan, 2.72 ms at 1,996
  manufacturers).

## 3. No new index added

`ebp_manufacturer_certifications` and `ebp_engineering_exceptions` sequential-scan in
`fetchCertificationGapCountsBulk` / `fetchApprovedExceptionCountsBulk`
(`PHASE5_PERFORMANCE_REPORT.md` §4). Both tables are small (133 rows and near-empty in the test
data) at every scale Phase 5 currently operates at — the planner's own cost model prefers a Seq
Scan over an Index Scan for a filter this unselective on a table this size, and forcing an index
would not improve the measured sub-2ms execution time. **No index was added for either table.**
If certification/exception volume grows by orders of magnitude in a later phase, this should be
re-measured — noted in `PHASE5_FINAL_RECOMMENDATION.md` §Risks, not treated as a blocking gap now.

## 4. New index/view added in this review round

`003_analytics_concentration_view.sql` introduces `ebp_analytics_selection_concentration`, a VIEW
(not a table, no new index) replacing direct joins against `ebp_selection_candidates`/
`ebp_manufacturers` that the original concentration-analytics queries used — fixing the ADR-0037
§8.3 violation found in the correction round (dashboards must read only Analytics Views). The
view's underlying join relies entirely on existing indexes (`ebp_manufacturers_pkey`,
`idx_ebp_selection_runs_current`'s covering columns); no new index was required to make it
performant (5.95 ms at 4,999 runs / 14,997 candidates — see `PHASE5_PERFORMANCE_REPORT.md` §2).

## 5. Conclusion

Every JOIN, WHERE, ORDER BY, and GROUP BY on Phase 5's critical path is backed by an index,
confirmed by execution plan, not assumption. No missing index was found. No index was added
this round beyond the pre-existing schema plus the one new VIEW.
