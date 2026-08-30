/**
 * EvidenceInventory — Step 3 of the Engineering Decision Engine
 *
 * Assembles and scores the 10 evidence categories from KG entities
 * present in the evaluation input. Does not contact external services —
 * reads entity lists that have already been resolved by the caller.
 *
 * Categories:
 *   1 — Engineering Principles      PRIMARY   15 pts (FAILURE_DIAGNOSIS)
 *   2 — Technology Architecture     PRIMARY   13 pts
 *   3 — Protection Media            SECONDARY  5 pts
 *   4 — Applicable Standards        PRIMARY   13 pts
 *   5 — Failure Modes               PRIMARY   15 pts
 *   6 — Contamination Data          PRIMARY   13 pts
 *   7 — Engineering Memory          SECONDARY  4 pts
 *   8 — Operating Conditions        CRITICAL   15 pts
 *   9 — Equipment Mapping           SECONDARY  5 pts
 *  10 — Symptom Correlation         TERTIARY   2 pts (FAILURE_DIAGNOSIS only)
 */

import type {
  EvaluationInput,
  EvidenceCategory,
  EvidenceInventoryResult,
  IntentClass,
  EvidenceAvailability,
} from './decision-engine-types';

// ─── Scoring tables by intent class ──────────────────────────────────────────

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

// ─── Domain minimum floors ────────────────────────────────────────────────────

// Minimum count of primary evidence categories that must be PRESENT/PARTIAL
// before domain minimum is considered met. Based on EVIDENCE_REQUIREMENTS.md
const DOMAIN_MINIMUMS: Record<string, { minPrimaryCategories: number }> = {
  AIR_INTAKE:       { minPrimaryCategories: 2 },
  FUEL:             { minPrimaryCategories: 2 },
  LUBE_OIL:         { minPrimaryCategories: 2 },
  HYDRAULIC:        { minPrimaryCategories: 3 },
  CABIN_AIR:        { minPrimaryCategories: 2 },
  COMPRESSED_AIR:   { minPrimaryCategories: 2 },
  UNKNOWN:          { minPrimaryCategories: 2 },
};

const PRIMARY_CATEGORY_IDS = new Set([1, 2, 4, 5, 6]);

// ─── Availability scoring ─────────────────────────────────────────────────────

function creditFor(av: EvidenceAvailability, maxPoints: number): number {
  switch (av) {
    case 'PRESENT':
    case 'KNOWN':
    case 'MAPPED':
    case 'CORRELATED':
      return maxPoints;
    case 'PARTIAL':
    case 'INFERABLE':
      return Math.floor(maxPoints / 2);
    default:
      return 0;
  }
}

function isPresent(av: EvidenceAvailability): boolean {
  return av === 'PRESENT' || av === 'KNOWN' || av === 'MAPPED' || av === 'CORRELATED' || av === 'PARTIAL' || av === 'INFERABLE';
}

// ─── Category availability from evaluation input ──────────────────────────────

function assessAvailability(
  categoryId: number,
  input: EvaluationInput,
): { availability: EvidenceAvailability; sources: string[] } {
  switch (categoryId) {
    case 1: {
      // Engineering Principles — principle entity IDs
      const sources = [...input.principleEntityIds];
      if (sources.length >= 2) return { availability: 'PRESENT', sources };
      if (sources.length === 1) return { availability: 'PARTIAL', sources };
      // If contamination and failure modes present, principles can be inferred
      if (input.contaminationEntityIds.length > 0 && input.failureModeEntityIds.length > 0) {
        return { availability: 'INFERABLE', sources: ['inferred from contamination+failure-mode context'] };
      }
      return { availability: 'ABSENT', sources: [] };
    }
    case 2: {
      // Technology Architecture — technology entity IDs
      const sources = [...input.technologyEntityIds];
      if (sources.length >= 2) return { availability: 'PRESENT', sources };
      if (sources.length === 1) return { availability: 'PARTIAL', sources };
      // If contamination known, technology is inferable
      if (input.contaminationEntityIds.length > 0) {
        return { availability: 'INFERABLE', sources: ['inferable from contamination domain'] };
      }
      return { availability: 'ABSENT', sources: [] };
    }
    case 3: {
      // Protection Media — inferred from technology presence
      if (input.technologyEntityIds.length >= 2) {
        return { availability: 'PARTIAL', sources: ['inferred from technology architecture'] };
      }
      if (input.technologyEntityIds.length === 1) {
        return { availability: 'INFERABLE', sources: ['inferred from single technology'] };
      }
      return { availability: 'ABSENT', sources: [] };
    }
    case 4: {
      // Applicable Standards — present if domain is known (KG has standards per domain)
      if (input.domain !== 'UNKNOWN') {
        return { availability: 'PRESENT', sources: [`domain:${input.domain}`] };
      }
      if (input.contaminationEntityIds.length > 0) {
        return { availability: 'PARTIAL', sources: ['inferable from contamination entities'] };
      }
      return { availability: 'ABSENT', sources: [] };
    }
    case 5: {
      // Failure Modes
      const sources = [...input.failureModeEntityIds];
      if (sources.length >= 2) return { availability: 'PRESENT', sources };
      if (sources.length === 1) return { availability: 'PARTIAL', sources };
      // Inferable from symptoms
      if (input.symptomIds.length >= 2) {
        return { availability: 'INFERABLE', sources: ['inferred from symptom selection'] };
      }
      return { availability: 'ABSENT', sources: [] };
    }
    case 6: {
      // Contamination Data
      const sources = [...input.contaminationEntityIds];
      if (sources.length >= 2) return { availability: 'PRESENT', sources };
      if (sources.length === 1) return { availability: 'PARTIAL', sources };
      if (input.domain !== 'UNKNOWN') {
        return { availability: 'INFERABLE', sources: ['inferable from domain'] };
      }
      return { availability: 'ABSENT', sources: [] };
    }
    case 7: {
      // Engineering Memory — present if we have asset+symptom context
      if (input.assetId && input.symptomIds.length > 0) {
        return { availability: 'PRESENT', sources: [`asset:${input.assetId}`] };
      }
      if (input.assetId) {
        return { availability: 'PARTIAL', sources: [`asset:${input.assetId}`] };
      }
      return { availability: 'ABSENT', sources: [] };
    }
    case 8: {
      // Operating Conditions — customer-provided, explicit flag
      if (input.operatingConditionsKnown) {
        const sources = [...input.environmentIds];
        if (input.onsetId) sources.push(`onset:${input.onsetId}`);
        return { availability: 'KNOWN', sources };
      }
      // Partially known if at least environments selected
      if (input.environmentIds.length > 0) {
        return { availability: 'PARTIAL', sources: [...input.environmentIds] };
      }
      return { availability: 'UNKNOWN', sources: [] };
    }
    case 9: {
      // Equipment Mapping
      if (input.assetId && input.assetDescription) {
        return { availability: 'MAPPED', sources: [`asset:${input.assetId}`, input.assetDescription] };
      }
      if (input.assetId) {
        return { availability: 'INFERABLE', sources: [`asset:${input.assetId}`] };
      }
      return { availability: 'ABSENT', sources: [] };
    }
    case 10: {
      // Symptom Correlation (FAILURE_DIAGNOSIS only)
      if (input.symptomIds.length >= 3) {
        return { availability: 'CORRELATED', sources: [...input.symptomIds] };
      }
      if (input.symptomIds.length >= 1) {
        return { availability: 'PARTIAL', sources: [...input.symptomIds] };
      }
      return { availability: 'ABSENT', sources: [] };
    }
    default:
      return { availability: 'ABSENT', sources: [] };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function buildInventory(
  intentClass: IntentClass,
  input: EvaluationInput,
): EvidenceInventoryResult {
  const scoreTable = SCORE_TABLES[intentClass] ?? SCORE_TABLES.UNKNOWN;
  const applicableIds = Object.keys(scoreTable).map(Number);

  const categories: EvidenceCategory[] = [];
  let rawScore = 0;

  for (const id of applicableIds) {
    const maxPoints = scoreTable[id] ?? 0;
    const { availability, sources } = assessAvailability(id, input);
    const credit = creditFor(availability, maxPoints);
    rawScore += credit;

    const names: Record<number, string> = {
      1: 'Engineering Principles',
      2: 'Technology Architecture',
      3: 'Protection Media',
      4: 'Applicable Standards',
      5: 'Failure Modes',
      6: 'Contamination Data',
      7: 'Engineering Memory',
      8: 'Operating Conditions',
      9: 'Equipment Mapping',
      10: 'Symptom Correlation',
    };

    categories.push({
      categoryId: id as EvidenceCategory['categoryId'],
      name: names[id] ?? `Category ${id}`,
      availability,
      sources,
    });
  }

  // Domain minimum check
  const domainMin = DOMAIN_MINIMUMS[input.domain] ?? DOMAIN_MINIMUMS.UNKNOWN;
  const primaryMet = categories.filter(
    c => PRIMARY_CATEGORY_IDS.has(c.categoryId) && isPresent(c.availability),
  ).length;
  const domainMinimumMet = primaryMet >= domainMin.minPrimaryCategories;

  // Conflict detection: contamination entities present but domain is UNKNOWN (mismatch)
  const conflictDetected =
    input.contaminationEntityIds.length > 0 &&
    input.domain === 'UNKNOWN' &&
    input.technologyEntityIds.length > 0 &&
    !input.operatingConditionsKnown;

  return {
    categories,
    rawScore,
    domainMinimumMet,
    conflictDetected,
  };
}
