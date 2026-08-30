/**
 * decision-validator.ts
 * ELIMFILTERS — Engineering Decision Engine v1.0
 *
 * Validates the output tree of the decision engine to ensure no rules were skipped
 * and traces are complete.
 */

import type { EngineeringRecommendation } from './decision-types';

export function validateDecisionTree(rec: EngineeringRecommendation): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!rec.assetId) {
    errors.push('Decision tree missing Asset ID.');
  }

  if (rec.recommendedTechnologies.length === 0) {
    errors.push('Decision tree failed to recommend any technologies.');
  }

  if (rec.protectionStrategy.systems.length === 0) {
    errors.push('Protection strategy has no required systems.');
  }

  if (rec.maintenanceStrategy.criticalSystems.length === 0) {
    errors.push('Maintenance strategy has no critical systems identified.');
  }

  if (rec.trace.length === 0) {
    errors.push('Decision trace is completely empty. Audit trail failed.');
  }

  // Ensure every system required has a trace justification
  for (const sys of rec.protectionStrategy.systems) {
    if (sys.required && !sys.reason) {
      errors.push(`Required system ${sys.systemType} lacks engineering justification.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
