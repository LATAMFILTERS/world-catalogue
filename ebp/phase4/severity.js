'use strict';

// EBP Phase 4 — Severity -> gating mapping (Decision 03, ADR-0041) and
// Composite/Conditional severity aggregation (Decision 04, ADR-0042).
//
// Fixed base mapping, never weakened by the Rule Catalog, only hardened
// (a MEDIUM rule may be configured to block; a HIGH rule may never be
// configured to stop blocking without a formal Exception):
//   CRITICAL / HIGH  -> blocking   (FAIL or REQUIRES_EXCEPTION)
//   MEDIUM           -> WARNING, unless default_behavior.hardened_to_block
//   LOW              -> WARNING, never blocking
//   INFO             -> info only, never blocking, never hardened

const SEVERITY_RANK = { CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFO: 1 };

function isBlockingSeverity(severity, hardenedToBlock) {
  if (severity === 'CRITICAL' || severity === 'HIGH') return true;
  if (severity === 'MEDIUM') return Boolean(hardenedToBlock);
  return false;
}

// Given a rule's own declared severity and the severities of the operands
// that produced a negative result, returns the highest-ranked severity
// (Decision 04: "effective severity is the highest among the rule's own
// declared severity and the severities of operands causing the negative
// result").
function highestSeverity(ownSeverity, operandSeverities) {
  let best = ownSeverity;
  for (const s of operandSeverities || []) {
    if (SEVERITY_RANK[s] > SEVERITY_RANK[best]) best = s;
  }
  return best;
}

module.exports = { SEVERITY_RANK, isBlockingSeverity, highestSeverity };
