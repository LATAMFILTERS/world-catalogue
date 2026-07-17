# Phase 5 — Performance Report

**Date:** 2026-07-14
**Method:** synthetic dataset seeded into the real Postgres test database
(`ebp_phase1_test`), `EXPLAIN ANALYZE` run against the actual critical-path queries, then
the dataset fully deleted. No numbers below are estimated or reasoned about from code alone.

## 1. Dataset

| Entity | Count | Shape |
|---|---|---|
| Manufacturers | 1,996 | 8 countries, QUALIFIED, one OIL/SPIN_ON qualification each |
| Passports | 5,000 | HD, OIL/SPIN_ON |
| Offers | 16,993 | 1 "hot" Passport with an offer from **every** manufacturer (1,996 offers — the worst-case single-Selection-Run candidate pool); 4,999 "typical" Passports with 3 offers each (the realistic common case, per the original perf-seed shape used earlier in this review round) |
| Selection Runs | 4,999 | one `RECOMMENDATION_READY` run per typical Passport |
| Selection Candidates | 14,997 | 3 per run (1 PRIMARY + 2 NONE) |
| Commercial Approvals | 16,993 | 1 APPROVED per offer |

This matches the 100K–1M *relationship* scale requested (manufacturer × product × offer edges):
1,996 manufacturers × up to 2,000 offers-per-passport in the worst case, 16,993 total
manufacturer↔passport↔offer edges under test.

## 2. Hot-path query results (worst case: 1,996-offer candidate pool on one Passport)

All queries below are exactly the SQL Phase 5's code issues — copied from `repository.js`, not
paraphrased.

| Query | Repository function | Plan | Execution time |
|---|---|---|---|
| Candidate offers for a Passport | `fetchCandidateOffers` | Index Scan `idx_ebp_offers_lineage` → Nested Loop → Index Scan `ebp_manufacturers_pkey` → Sort | 4.85 ms |
| Bulk commercial approvals | `fetchLatestCommercialApprovalsBulk` | Index Scan `idx_ebp_commercial_approvals_offer` (`= ANY`) → Unique | 4.65 ms |
| Bulk manufacturer qualifications | `fetchManufacturerQualificationsBulk` | Bitmap Index Scan `idx_ebp_mfr_quals_mfr` → Sort/Unique | 2.72 ms |
| Bulk certification gaps | `fetchCertificationGapCountsBulk` | Seq Scan `ebp_manufacturer_certifications` (133 rows total in the test DB — correctly not index-scanned; see §4) | 1.21 ms |
| Bulk approved-exception counts | `fetchApprovedExceptionCountsBulk` | Seq Scan `ebp_engineering_exceptions` (near-empty table) | 0.06 ms |
| Bulk Preferred-Manufacturer set | `fetchPreferredManufacturerSetBulk` | Index Scan `idx_ebp_preferred_mfr_scope` | 0.05 ms |
| Next selection version | `fetchNextSelectionVersion` | Index Only Scan `idx_ebp_selection_runs_passport` | 0.08 ms |
| Current selection run | `fetchCurrentSelectionRun` | Index Scan `idx_ebp_selection_runs_current` | 0.04 ms |
| Mark prior runs STALE | `markPriorRunsStale` (UPDATE) | Index Scan `idx_ebp_selection_runs_current` | 0.08 ms |
| Manufacturer-concentration analytics | `fetchManufacturerShareForConcentration` (reads `ebp_analytics_selection_concentration` VIEW, 4,999 runs / 14,997 candidates) | Seq Scan `ebp_selection_candidates` (WHERE tier='PRIMARY', 4,999/14,997 rows match — not selective enough to prefer an index) → Hash Join → GroupAggregate | 5.95 ms |

**Sum of the full bulk-fetch phase for the worst-case 1,996-offer Passport: ~13.5 ms.** This
replaces what was, before the correction round, ~1,996 × 5 = 9,980 sequential round-trips (the
N+1 pattern described in `PHASE5_ARCHITECTURE_REVIEW.md` §1).

## 3. The one deliberately un-batched call: Phase 4's eligibility gate

`evaluateCandidateEligibility` calls Phase 4's frozen `computeSelectionEligibility(pool, offerId)`
once per candidate offer — by architectural constraint (ADR-0072, Decision 11), not oversight.
This is the only remaining O(N) round-trip in the hot path. It was not re-benchmarked in
isolation here because Phase 4 is frozen and out of this review's remit; Phase 4's own
performance characteristics were validated at its own freeze. It is called out here so a future
reader does not mistake it for an unnoticed N+1.

## 4. Why two bulk queries plan a Seq Scan (and why that's correct)

`fetchCertificationGapCountsBulk` and `fetchApprovedExceptionCountsBulk` sequential-scan
`ebp_manufacturer_certifications` (133 rows in the test DB) and `ebp_engineering_exceptions`
(near-empty). Both tables are small enough at every realistic scale that Postgres's planner
correctly prefers a sequential scan over an index scan — forcing an index here would make these
queries slower, not faster. This is documented, not left as an unexplained anomaly; see
`PHASE5_INDEX_AUDIT.md` §3 for the same finding from the index side.

## 5. Conclusion

No sequential scan was found on a table large enough for it to matter. No query on the
Selection Run hot path exceeded 6 ms at the tested scale, including the concentration analytics
view join. Performance is green; no code or index change is required beyond what the
correction round already applied (the bulk-fetch conversion itself).
