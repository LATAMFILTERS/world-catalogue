/**
 * ConfidenceCalculator — Step 5 of the Engineering Decision Engine
 *
 * Applies only after the PROHIBITED gate (Step 5a) is cleared.
 * Computes weighted evidence score by intent class, applies inference
 * adjustments, enforces hard floor rules, and maps to confidence tier.
 *
 * Confidence tiers:
 *   HIGH    85–100  → RECOMMEND
 *   MEDIUM  65–84   → RECOMMEND WITH DISCLOSURE
 *   LOW     40–64   → DO NOT RECOMMEND
 *   UNKNOWN  0–39   → NO RESPONSE
 */

import type {
  IntentClass,
  EvidenceInventoryResult,
  InferenceAuditResult,
  ConfidenceLevel,
  ConfidenceCalculationResult,
  EvidenceAvailability,
} from './decision-engine-types';

// ─── Score tables (max points per category per intent class) ──────────────────
// Mirrors CONFIDENCE_SCORING_MODEL.md exactly.

const SCORE_TABLES: Record<IntentClass, Partial<Record<number, number>>> = {
  FAILURE_DIAGNOSIS: {
    1: 15, 2: 13, 3: 5, 4: 13, 5: 15, 6: 13, 7: 4, 8: 15, 9: 5, 10: 2,
  },
  PROACTIVE_PROTECTION: {
    1: 17, 2: 15, 3: 5, 4: 15, 5: 15, 6: 14, 7: 3, 8: 14, 9: 2,
  },
  TECHNOLOGY_RESEARCH: {
    1: 22, 2: 22, 3: 5, 4: 22, 5: 14, 6: 10, 8: 5,
  },
  STANDARDS_INTERPRETATION: {
    1: 22, 2: 22, 3: 5, 4: 22, 5: 14, 6: 10, 8: 5,
  },
  EQUIPMENT_REPLACEMENT: {
    1: 4, 2: 20, 3: 12, 4: 20, 6: 8, 8: 18, 9: 18,
  },
  UNKNOWN: {
    1: 15, 2: 13, 3: 5, 4: 13, 5: 15, 6: 13, 7: 4, 8: 15, 9: 5, 10: 2,
  },
};

// ─── Credit assignment ────────────────────────────────────────────────────────

function creditFraction(av: EvidenceAvailability): number {
  switch (av) {
    case 'PRESENT':
    case 'KNOWN':
    case 'MAPPED':
    case 'CORRELATED':
      return 1.0;
    case 'PARTIAL':
    case 'INFERABLE':
      return 0.5;
    default:
      return 0;
  }
}

// ─── Tier mapping ─────────────────────────────────────────────────────────────

function scoreToTier(score: number): ConfidenceLevel {
  if (score >= 85) return 'HIGH';
  if (score >= 65) return 'MEDIUM';
  if (score >= 40) return 'LOW';
  return 'UNKNOWN';
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function calculateConfidence(
  intentClass: IntentClass,
  evidenceInventory: EvidenceInventoryResult,
  inferenceAudit: InferenceAuditResult,
): ConfidenceCalculationResult {
  const table = SCORE_TABLES[intentClass] ?? SCORE_TABLES.UNKNOWN;

  // --- Raw score ---
  const catMap = new Map(evidenceInventory.categories.map(c => [c.categoryId, c]));
  let rawScore = 0;

  for (const [catIdStr, maxPts] of Object.entries(table)) {
    const catId = parseInt(catIdStr, 10);
    const cat = catMap.get(catId as 1);
    if (!cat) continue;
    rawScore += Math.floor(creditFraction(cat.availability) * (maxPts ?? 0));
  }

  // --- Inference adjustment ---
  const inferenceAdjustment = inferenceAudit.inferenceAdjustment;
  const adjustedRaw = rawScore + inferenceAdjustment;

  // --- Initial tier ---
  let tier = scoreToTier(adjustedRaw);
  let hardFloorApplied: string | null = null;

  // --- Hard floor rules (CONFIDENCE_SCORING_MODEL.md) ---

  // Forces UNKNOWN
  if (!evidenceInventory.domainMinimumMet) {
    if (tier !== 'UNKNOWN') {
      tier = 'UNKNOWN';
      hardFloorApplied = 'EVIDENCE_FLOOR_NOT_MET: Domain minimum not met';
    }
  }

  const cat1 = catMap.get(1);
  if (cat1 && (cat1.availability === 'ABSENT' || cat1.availability === 'UNKNOWN')) {
    tier = 'UNKNOWN';
    hardFloorApplied = 'ENGINEERING_PRINCIPLES_ABSENT: Category 1 not available';
  }

  const cat4 = catMap.get(4);
  const cat2 = catMap.get(2);
  if (
    cat4 && (cat4.availability === 'ABSENT' || cat4.availability === 'UNKNOWN') &&
    cat2 && (cat2.availability === 'ABSENT' || cat2.availability === 'UNKNOWN')
  ) {
    tier = 'UNKNOWN';
    hardFloorApplied = 'STANDARDS_AND_TECHNOLOGY_ABSENT: Categories 2 and 4 both absent';
  }

  // Forces LOW
  if (tier === 'MEDIUM' || tier === 'HIGH') {
    const cat8 = catMap.get(8);
    const diagOrPro = intentClass === 'FAILURE_DIAGNOSIS' || intentClass === 'PROACTIVE_PROTECTION';
    if (diagOrPro && cat8 && (cat8.availability === 'UNKNOWN' || cat8.availability === 'ABSENT')) {
      tier = 'LOW';
      hardFloorApplied = 'OPERATING_CONDITIONS_UNKNOWN: Required for this intent class';
    }

    if (intentClass === 'FAILURE_DIAGNOSIS') {
      const cat5 = catMap.get(5);
      if (cat5 && (cat5.availability === 'ABSENT' || cat5.availability === 'UNKNOWN')) {
        tier = 'LOW';
        hardFloorApplied = 'FAILURE_MODES_ABSENT: Required for FAILURE_DIAGNOSIS';
      }
    }

    // Would require ≥3 EXTENDED inferences to reach MEDIUM — force LOW
    if (inferenceAudit.extendedCount >= 3 && tier === 'MEDIUM') {
      tier = 'LOW';
      hardFloorApplied = 'EXCESSIVE_EXTENDED_INFERENCES: ≥3 extended inferences required';
    }
  }

  // Forces MEDIUM (cannot be HIGH)
  if (tier === 'HIGH' && inferenceAudit.hasExtended) {
    tier = 'MEDIUM';
    hardFloorApplied = 'EXTENDED_INFERENCE_PRESENT: Cannot achieve HIGH with extended inference';
  }

  if (tier === 'HIGH' && intentClass === 'EQUIPMENT_REPLACEMENT') {
    const cat3 = catMap.get(3);
    if (cat3 && (cat3.availability === 'ABSENT' || cat3.availability === 'UNKNOWN')) {
      tier = 'MEDIUM';
      hardFloorApplied = 'PROTECTION_MEDIA_ABSENT: Required for HIGH on EQUIPMENT_REPLACEMENT';
    }
  }

  return {
    rawScore,
    adjustedScore: adjustedRaw,
    confidenceLevel: tier,
    hardFloorApplied,
    inferenceAdjustment,
  };
}
