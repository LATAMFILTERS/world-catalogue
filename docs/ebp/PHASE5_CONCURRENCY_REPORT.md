# Phase 5 — Concurrency Report

**Date:** 2026-07-14
**Method:** real concurrent load against a real Postgres instance (`Promise.allSettled` firing
N simultaneous `runSelection()` calls), never reasoned about from code reading alone. Two real
defects were found and fixed; both are now covered by permanent regression tests.

## 1. Finding 1 (critical): self-deadlock under concurrent Selection Runs

**Symptom:** firing 10 concurrent `runSelection()` calls against the same Passport hung
indefinitely. `pg_stat_activity` showed all 10 backend connections sitting "idle in
transaction" / "ClientRead" for 2+ minutes with no forward progress. Had to manually
`pg_terminate_backend()` all 10 connections to recover the test session.

**Root cause:** `runSelection` opened a transaction (`client = await pool.connect(); await
client.query('BEGIN')`) and then continued to issue several reads through `pool.query(...)`
instead of `client.query(...)` — `fetchNextSelectionVersion`, the five bulk-fetch calls, and the
per-candidate call into Phase 4's `computeSelectionEligibility`. Each `pool.query()` call inside
an already-open transaction checks out a **second** connection from the pool while the first is
still held open by `client`. Under concurrent load, once enough simultaneous Selection Runs
each hold one connection via `client` and then block on `pool.query()` for a second, every
connection in the default pool (max 10) is consumed by calls waiting for a connection that will
never free — a full self-deadlock, not a slow query.

**Fix:** every read inside `runSelection`'s transaction now goes through `client`, never `pool`:
`fetchNextSelectionVersion`, all five bulk-fetch calls, and
`evaluateCandidateEligibility(client, ...)` (parameter renamed from `pool` to `db` for clarity
at the call site). A header comment was added to `repository.js:1-14` stating the rule
explicitly for future maintainers: "once a caller has done `client = await pool.connect();
await client.query('BEGIN')`, every subsequent call in that same logical operation MUST pass
`client`, never `pool`."

**Verification:** re-ran the same 10-concurrent-call stress test after the fix. Result: dropped
from an indefinite hang to **93 ms** for all 10 calls to settle.

## 2. Finding 2 (secondary): raw Postgres constraint-violation error surfaced to the caller

**Symptom (after Finding 1 was fixed):** of 10 concurrent `runSelection()` calls, 1 succeeded
and 9 failed — but the 9 failures returned the raw driver error `duplicate key value violates
unique constraint "ebp_selection_runs_passport_id_selection_version_key"` rather than a clean,
expected application error.

**Root cause:** `fetchNextSelectionVersion` (`SELECT COALESCE(MAX(selection_version), 0) + 1`)
is not itself serialized across concurrent transactions — two concurrent runs for the same
Passport can each compute the same "next version" before either commits. This is expected under
Postgres's default isolation level and was never a data-integrity risk: the `UNIQUE(passport_id,
selection_version)` constraint on `ebp_selection_runs` (`001_schema.sql:194`) guarantees only one
of the two competing inserts can ever commit. The defect was purely in how the *loser's* error
was surfaced — a raw driver/constraint error instead of a clean application-level conflict.

**Fix:** `runSelection`'s outer `catch` block now detects Postgres error code `23505`
(unique_violation) with a constraint name containing `selection_version` and re-throws it as
`new ConflictError('a concurrent Selection Run for this Passport already completed — retry')`
before rolling back and releasing the client.

**Verification:** re-ran the same stress test. All 9 losing calls now reject with the clean
`ConflictError` message instead of the raw Postgres error.

## 3. Data-integrity verification (both before and after the fixes)

At every stage of this investigation — before either fix, after Finding 1's fix, and after
Finding 2's fix — the following was independently confirmed against the real database after
each 10-concurrent-call run:

- Exactly one non-STALE `ebp_selection_runs` row exists for the Passport.
- No duplicate `selection_version` value exists for the Passport (the constraint was never
  bypassed at any point in this investigation).

Data integrity was never at risk at any point; only the deadlock (denial of forward progress)
and the leaked raw error message (a poor caller experience, not a correctness defect) were real
issues.

## 4. Permanent regression coverage

`tests/ebp-phase5/correction.test.js`, test 6 ("ten concurrent Selection Runs against the same
Passport never deadlock and never corrupt the Selection Version sequence") fires 10 concurrent
`runSelection()` calls via `Promise.allSettled`, asserts all 10 settle (none hang), asserts every
rejected call's message matches `/concurrent Selection Run/` (never a raw driver error), and
asserts exactly one non-STALE run with no duplicate `selection_version` exists afterward. This
test is now part of `npm run test:ebp-phase5` and passes in **93–106 ms** across repeated runs
(measured 4 times during this review: 93 ms, 106.25 ms, 105.9 ms, 105.9 ms).

## 5. What was explicitly not attempted

Serializing `fetchNextSelectionVersion` itself (e.g. via `SELECT ... FOR UPDATE` on a
per-Passport lock row, or `SERIALIZABLE` isolation) was considered and rejected: the current
design already guarantees correctness via the UNIQUE constraint, and the loser now receives a
clean, retryable error. Adding transaction-level locking would trade a small amount of
throughput for no additional correctness guarantee, since the constraint is the actual source
of truth. Not a defect; documented as a considered-and-rejected alternative.

## 6. Manual Override concurrency

The two-actor guard (`trg_ebp_enforce_selection_override_guard`,
`002_override_guard.sql`) is a `BEFORE INSERT OR UPDATE` row trigger re-deriving both
constraints (different requester/decider, requested offer must be Eligible in the same run)
directly from table state on every write — it cannot be bypassed by a race between two
concurrent override decisions, because Postgres evaluates the trigger against the row being
written under normal MVCC row-level locking, and the `UNIQUE` constraint backing
`ebp_selection_overrides` prevents two decisions from being recorded as the same row. No
concurrency defect found in the override path; not separately stress-tested beyond the schema
guarantee, since the guard is enforced at the database level identically to Phase 4's
`ebp_enforce_engineering_decision_eligibility` pattern (already proven under concurrent load at
Phase 4's freeze).

## 7. Conclusion

One critical concurrency defect (self-deadlock) and one secondary defect (leaked raw error) were
found, fixed, verified, and are now covered by a permanent regression test. No data-integrity
risk was found at any point. Concurrency review is **green**.
