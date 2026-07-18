'use strict';

// EBP Phase 5 — pure ranking mechanics: the fixed eight-step tie-break
// order (Decision 01, ADR-0062 §6) and the Herfindahl-Hirschman-style
// Concentration Index (Decision 08, ADR-0069). Deliberately side-effect
// free — no DB, no I/O — for reproducibility (Principle 7) and unit
// testability.

// Each step returns a comparator delta; the first non-zero delta decides
// the order. All comparisons are "higher wins" after normalization by the
// caller (e.g. FOB and lead time are pre-inverted into "higher is better"
// fields before being passed in here) — this module never re-derives
// domain meaning, only order.
const TIE_BREAK_STEPS = [
  { name: 'technical_quality_score', higherWins: true },
  { name: 'fewer_exceptions_score', higherWins: true }, // pre-inverted: higher = fewer/lower-severity exceptions
  { name: 'normalized_fob_score', higherWins: true },
  { name: 'lead_time_score', higherWins: true }, // pre-inverted: higher = shorter lead time
  { name: 'capacity_score', higherWins: true },
  { name: 'diversification_score', higherWins: true },
  { name: 'remaining_validity_score', higherWins: true },
];

// compareCandidates: returns -1 if a ranks strictly higher than b, 1 if b
// ranks strictly higher, 0 if every one of the eight steps is exhausted
// with no distinguishing difference (TIE_REQUIRES_HUMAN_REVIEW territory
// — the caller decides that, this function only reports "still tied").
function compareCandidates(a, b) {
  for (const step of TIE_BREAK_STEPS) {
    const av = Number(a[step.name]);
    const bv = Number(b[step.name]);
    if (Number.isNaN(av) || Number.isNaN(bv) || av === bv) continue;
    return step.higherWins ? (av > bv ? -1 : 1) : (av < bv ? -1 : 1);
  }
  return 0;
}

// rankCandidates: sorts primarily by composite_score_final (descending),
// then by the tie-break steps for candidates with an identical score.
// Returns { ranked, tied } where `tied` lists candidate-id pairs that
// remained indistinguishable after all eight steps.
function rankCandidates(candidates) {
  const sorted = [...candidates].sort((a, b) => {
    const scoreDelta = Number(b.composite_score_final) - Number(a.composite_score_final);
    if (Math.abs(scoreDelta) > 0.0001) return scoreDelta;
    return compareCandidates(a, b);
  });

  const tied = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const scoreDelta = Math.abs(Number(sorted[i].composite_score_final) - Number(sorted[i + 1].composite_score_final));
    if (scoreDelta <= 0.0001 && compareCandidates(sorted[i], sorted[i + 1]) === 0) {
      tied.push([sorted[i].offer_id, sorted[i + 1].offer_id]);
    }
  }

  return { ranked: sorted, tied };
}

// computeHHI: Herfindahl-Hirschman-style index — HHI = sum(share_i^2),
// `shares` given as fractions (0-1) of a pool (SKU count or volume) held
// by each Manufacturer. Returns the raw HHI (0-1) and the normalized
// 0-10,000 scale (Decision 08, ADR-0069).
function computeHHI(shares) {
  const hhi = shares.reduce((acc, s) => acc + Math.pow(Number(s) || 0, 2), 0);
  return { hhi, normalized_hhi: Math.round(hhi * 10000 * 100) / 100 };
}

function interpretConcentration(normalizedHhi, thresholds) {
  const lowMax = Number(thresholds?.low_max) || 1500;
  const moderateMax = Number(thresholds?.moderate_max) || 2500;
  if (normalizedHhi < lowMax) return 'LOW';
  if (normalizedHhi <= moderateMax) return 'MODERATE';
  return 'HIGH';
}

module.exports = {
  TIE_BREAK_STEPS,
  compareCandidates,
  rankCandidates,
  computeHHI,
  interpretConcentration,
};
