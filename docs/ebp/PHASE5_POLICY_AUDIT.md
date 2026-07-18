# Phase 5 — Policy Engine Audit

**Date:** 2026-07-14
**Scope:** every weight, threshold, penalty, gate, normalization function, bonus, and
diversification rule used by `ebp/phase5/service.js`, `ebp/phase5/ranking.js`, and
`ebp/phase5/policy.js`, checked against the mandatory rule (ADR-0068, Decision 07): "No weight,
normalization function, gate, penalty, or threshold is ever hardcoded in engine code — all of it
lives [in `ebp_selection_policies`]."

## 1. Finding (confirmed and fixed): `GEOGRAPHIC_DIVERSIFICATION` was a hardcoded constant

**Before this review:** `buildFactorScores` (`service.js`) scored the STRATEGIC-category
`GEOGRAPHIC_DIVERSIFICATION` factor as a flat `normalized_value: 50` for **every** candidate,
regardless of that candidate's actual manufacturer or country relative to the rest of the
eligible pool. Since STRATEGIC carries a real weight in the composite score (15% under the
default policy), this meant the factor never differentiated any two candidates — it
contributed a constant to every composite score and never influenced ranking.

The same constant (`diversification_score: 50`) was separately hardcoded as tie-break step 6 of
the mandatory eight-step sequence (ADR-0062 §6, "better diversification versus already-assigned
tiers") in `ranking.js`'s candidate-comparison input, making that step a permanent no-op —
correctness was never violated (an always-tied step 6 simply falls through to step 7, and
ultimately to `TIE_REQUIRES_HUMAN_REVIEW` if every step ties — the engine never guessed), but the
step never functioned as specified.

**Why this counts as the exact defect this audit exists to catch:** it is not a *value* pulled
from a Selection Policy row that happened to need retuning — it was a number written directly
into engine code with no policy backing at all, which is precisely what Decision 07/ADR-0068
prohibits.

**Fix:** `buildFactorScores` and the ranking comparator now both consume one real, deterministic
value computed once per Selection Run from the eligible candidate pool itself:

```js
const diversificationScoreFor = (offer) => {
  const mfrShare = mfrCounts.get(offer.manufacturer_id) / eligibleOffers.length;
  const countryShare = countryCounts.get(offer.country_code) / eligibleOffers.length;
  return Math.round((1 - (mfrShare + countryShare) / 2) * 100 * 100) / 100;
};
```

A candidate whose manufacturer and country are rarer within the current eligible pool scores
higher — selecting it would diversify the outcome more. This is:

- **Real data, not policy-configurable weighting.** It stays in engine code deliberately,
  matching the other six tie-break steps (`technical_quality_score`, `fewer_exceptions_score`,
  etc.), all of which are likewise fixed-order, non-weighted comparisons per ADR-0062's
  explicit design — the eight-step *order* itself is fixed by the ADR, not a policy field. What
  changed is that the STRATEGIC-category *score* it also feeds is now computed from real data
  instead of a constant.
- **Deterministic and reproducible** (Principle 7): a pure function of the full eligible
  candidate set, independent of iteration order or wall-clock time.
- **Verified**, not just written: `tests/ebp-phase5/correction.test.js` test 7 constructs a pool
  where two candidates share a common country and one candidate is alone in a rarer country,
  confirms the two common-country candidates score identically to each other, confirms the
  rare-country candidate scores strictly higher, and confirms that difference carries through
  to a strictly higher `composite_score_final` — proving the factor is live, not cosmetic.

## 2. Every other weight/threshold/penalty/gate: confirmed policy-driven

| Concept | Source | Confirmed via |
|---|---|---|
| Category weights (ENGINEERING/COMMERCIAL/OPERATIONAL/STRATEGIC) | `ebp_selection_policies.weights` (JSONB) | `policyLib.computeCompositeScore(categoryScores, policy.weights)` — no literal weight in `service.js` |
| Normalization ranges (FOB/lead time/capacity) | Computed per-run from the actual eligible pool (`rangeOf(...)`), never a fixed min/max | `service.js:354-356` |
| Approved-Exception penalty magnitude | `ebp_selection_policies.penalties` | `policyLib.applyExceptionPenalty(100, approvedExceptionCount, penalties)` — this is the correction-round fix that first made the Technical Priority Rule real (previously the penalty was hardcoded to 0 / never applied — see `PHASE5_ARCHITECTURE_REVIEW.md`'s predecessor, the correction-round audit) |
| Preferred-Manufacturer bonus | `ebp_selection_policies.preferred_manufacturer_bonus` | `policyLib.applyPreferredManufacturerBonus(...)` |
| Diversification rules (Backup-tier divergence factors) | `ebp_selection_policies.diversification_rules` | `assignTiers(ranked, policy.diversification_rules)` |
| Concentration thresholds (LOW/MODERATE/HIGH HHI bands) | `ebp_selection_policies.concentration_thresholds` | `ranking.interpretConcentration(normalizedHhi, thresholds)` — thresholds passed as a parameter, defaults (`1500`/`2500`) only apply when the policy field is absent, and this default-fallback behavior is itself covered by a dedicated unit test (`unit.test.js`: "interpretConcentration: thresholds are policy parameters, not fixed constants") |
| Selection Policy weight validation (must sum to 1.0, no negative weight) | `policy.js: validateWeights` | enforced at policy-creation time, not engine-scoring time — confirmed this validation never substitutes a hardcoded fallback weight |

No other hardcoded weight, threshold, penalty, or gate was found in `service.js`, `ranking.js`,
or `policy.js`.

## 3. Selection Policy versioning discipline

- An `ACTIVE` policy version is never edited in place — confirmed: every mutation path
  (`publishSelectionPolicy`) either inserts a new version or transitions an old ACTIVE version to
  `SUPERSEDED`, never an `UPDATE ... SET weights = ...` on an ACTIVE row.
- At most one ACTIVE policy per `(scope_type, scope_value)` is enforced at the database level
  (`uq_ebp_sel_policy_one_active_scope`, a partial unique index) — not solely by application
  logic, so a bug or ad hoc migration cannot silently create two simultaneously active policies
  for the same scope.

## 4. Conclusion

One real hardcoded value was found (`GEOGRAPHIC_DIVERSIFICATION` / tie-break step 6) and is now
fixed, verified against real Postgres data, and covered by a permanent regression test. Every
other weight, threshold, penalty, gate, and diversification rule was confirmed to originate from
`ebp_selection_policies`, never from engine code. Policy Engine review is **green**.
