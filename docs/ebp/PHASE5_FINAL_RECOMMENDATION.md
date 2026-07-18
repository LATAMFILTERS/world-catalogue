# Phase 5 — Final Recommendation

**Date:** 2026-07-14
**Recommendation: APPROVED FOR FREEZE**

## 1. What preceded this review

- **2026-07-13 — manual 12-point correction-round audit** (Selection Policy hardcoding,
  Eligibility Gate bypass, Tie-Break reproducibility, Manual Override safety, Commercial
  Approval separation, Selection Run Lifecycle, Activity Events completeness, Alert Layer
  dedup/resolution, Analytics-views-only consumption, regression, risks). Found and fixed six
  real defects: the Technical Priority Rule's exception penalty was never applied; the tie-break
  path could assign tiers on an unresolved tie ("the engine never guesses" was violated);
  `SELECTION_SUPERSEDED`/`SELECTION_MARKED_STALE` activity events and the Alert Layer's
  resolve/list/acknowledge/dismiss surface did not exist; concentration analytics bypassed the
  required Analytics View (ADR-0037 §8.3); mixed-currency candidate pools were silently ranked
  with incommensurable prices. All six fixed, all covered by new tests.
- **2026-07-14 — this architecture review**, requested explicitly before the Freeze ADR, covering
  Performance, Indexes, Concurrency, Policy Engine, Manual Override, general Architecture, and a
  final Regression pass.

## 2. What this review found and fixed

| # | Finding | Severity | Fixed | Verified |
|---|---|---|---|---|
| 1 | N+1 query pattern: `evaluateCandidateEligibility` issued 5 queries per candidate offer | Performance | Bulk-fetch conversion (5 new `*Bulk` repository functions) | `EXPLAIN ANALYZE` at 1,996-offer scale: full bulk-fetch phase ~13.5 ms |
| 2 | Connection-pool self-deadlock: `pool.query()` mixed with an open `client` transaction inside `runSelection` | Critical (concurrency) | Route every in-transaction read through `client` | 10-concurrent-run stress test: infinite hang → 93 ms |
| 3 | Raw Postgres unique-violation error leaked to the caller on a losing concurrent run | Minor (concurrency) | Translate `23505`/`selection_version` into `ConflictError` | Stress test: 9/10 losers now see the clean message |
| 4 | `GEOGRAPHIC_DIVERSIFICATION` (STRATEGIC-category factor) and tie-break step 6 were both a hardcoded constant (`50`), never real data | Policy-engine correctness | Real, deterministic, pool-derived diversification score | New test: rarer-country candidate scores higher and outranks an otherwise-identical candidate |

Findings 2 and 3 are documented in full in `PHASE5_CONCURRENCY_REPORT.md`; finding 4 in
`PHASE5_POLICY_AUDIT.md`; finding 1 in `PHASE5_PERFORMANCE_REPORT.md` and
`PHASE5_ARCHITECTURE_REVIEW.md`.

## 3. What this review checked and found already sound

- **Indexes** (`PHASE5_INDEX_AUDIT.md`): every JOIN/WHERE/ORDER BY/GROUP BY on the critical path
  is index-backed, confirmed by execution plan. No index added or removed.
- **Manual Override** (`PHASE5_ARCHITECTURE_REVIEW.md` §3): permissions, trigger-enforced
  two-actor guard, eligible-only promotion, and immutable audit trail all re-confirmed against
  current code.
- **Commercial Approval separation**: `ebp_offer_commercial_approvals` remains structurally
  separate from Phase 4's `ebp_engineering_decisions`; zero write access from Phase 5 code into
  Phase 4's table.
- **Dead code / duplicated logic** (`PHASE5_ARCHITECTURE_REVIEW.md` §1): the single-candidate
  repository functions superseded by bulk fetchers are retained deliberately (still used by the
  no-bulk fallback path and by the commercial-approval routes), not dead code.

## 4. Risks (carried forward, not blocking freeze)

1. **No automated enforcement of the pool-vs-client connection discipline.** The rule ("once
   inside a transaction, always pass `client`, never `pool`") that caused Finding 2 is currently
   enforced only by a header comment and code review, not a lint rule. A future change to
   `runSelection` (or a new function following the same transaction pattern) could reintroduce
   the same class of deadlock without an automated check catching it. Recommended for a future
   cross-phase tooling pass, out of Phase 5's individual remit.
2. **`ebp_manufacturer_certifications` and `ebp_engineering_exceptions` sequential scans are
   correct only at current data volume.** Both are small tables today; if certification or
   exception volume grows by orders of magnitude, `PHASE5_PERFORMANCE_REPORT.md` §4's finding
   should be re-measured, not assumed to still hold.
3. **`runSelection` is a single ~230-line transaction function.** Necessary to keep the deadlock
   class closed (splitting it across transaction boundaries would reopen Finding 2's class of
   bug), but it is the largest function in the module and the most expensive to modify safely in
   a future phase. Not an architectural defect; a maintainability note for future readers.
4. **Phase 4's `computeSelectionEligibility` remains called once per offer, by design**
   (ADR-0072, Decision 11) — the one deliberately un-batched call on the hot path. Not a Phase 5
   defect; documented so a future reader does not mistake it for an unnoticed N+1.

None of these four risks represents an open defect, an incorrect result, a data-integrity gap,
or a violation of any ADR. All are either inherent, accepted architectural tradeoffs or
follow-up hardening opportunities appropriate for a later phase.

## 5. Evidence — regression, run to completion after every fix in this review

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ebp_phase1_test

Phase 1: node --test tests/ebp-phase1/*.test.js                          → 59/59 pass
Phase 2: unit + integration + regression                                 → 34+40+26 = 100/100 pass
Phase 3: unit + integration + regression                                 → 34+53+39 = 126/126 pass
Phase 4: npm run test:ebp-phase4 (unit+integration+regression+correction) → 33+27+13+31 = 104/104 pass
Phase 5: npm run test:ebp-phase5 (unit+integration+regression+correction) → 16+15+4+8  = 43/43 pass
```

Zero failures, zero skips, across 432 tests spanning all five phases. No Phase 1–4 file was
modified during this review — Phase 5 fixes only.

## 6. Recommendation

**APPROVED FOR FREEZE.**

Every item in the user's architecture-review checklist (Performance, Indexes, Concurrency,
Policy Engine, Manual Override, general Architecture Review, Regression) has been executed
against real Postgres data, not reasoned about from code alone. Two concurrency defects and one
policy-engine defect were found and fixed after the correction round already closed six other
defects; all nine are now covered by permanent regression tests; the full 432-test suite across
five phases passes cleanly. No open defect remains. Phase 5 is Production Ready.

Per explicit instruction, Phase 6 has not been started under any circumstances and will not
begin until this recommendation and the resulting Freeze ADR are both recorded.
