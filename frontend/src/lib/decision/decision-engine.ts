/**
 * decision-engine.ts
 * ELIMFILTERS — Engineering Decision Engine v1.0
 *
 * The central API orchestrator for evaluating assets and generating fully traceable
 * deterministic engineering recommendations.
 */

import type { OperatingEnvironment, EngineeringRecommendation, TraceLink } from './decision-types';
import type { MaintenanceProfile } from '../asset/asset-types';
import { assessContaminationRisk } from './contamination-assessment';
import { evaluateRules } from './engineering-rule-engine';
import { selectTechnologies } from './technology-selector';
import { buildProtectionStrategy } from './protection-strategy';
import { buildMaintenanceStrategy } from './maintenance-strategy';
import { buildRecommendation } from './recommendation-engine';
import { attachExplanation } from './explanation-engine';
import { validateDecisionTree } from './decision-validator';

export function evaluateAssetStrategy(
  assetId: string, 
  env: OperatingEnvironment, 
  assetProfile: MaintenanceProfile | null = null
): EngineeringRecommendation {
  
  const rawTraces: TraceLink[] = [];

  // 1. Assess Contamination Profile
  const profile = assessContaminationRisk(env);
  rawTraces.push({
    step: 'Contamination Risk Assessment',
    reference: 'Operating Environment Analysis',
    justification: `Assessed risks based on Industry: ${env.industry}, Duty: ${env.dutyClass}`,
  });

  // 2. Evaluate Engineering Rules
  const triggeredRules = evaluateRules(env, profile);
  for (const rule of triggeredRules) {
    rawTraces.push({
      step: `Evaluate Rule: ${rule.id}`,
      reference: rule.reference,
      justification: rule.justification,
    });
  }

  // 3. Select Technologies
  const recommendedTechnologies = selectTechnologies(triggeredRules);

  // 4. Build Protection Strategy
  const protectionStrategy = buildProtectionStrategy(triggeredRules);

  // 5. Build Maintenance Strategy
  const maintenanceStrategy = buildMaintenanceStrategy(profile);

  // 6. Build Recommendation
  const rawRec = buildRecommendation({
    assetId,
    recommendedTechnologies,
    protectionStrategy,
    maintenanceStrategy,
    assetProfile,
  });

  // 7. Attach Explanations and Traces
  const finalRec = attachExplanation(rawRec, rawTraces);

  // 8. Validate Decision Tree
  const validation = validateDecisionTree(finalRec);
  if (!validation.valid) {
    throw new Error(`Decision tree validation failed: ${validation.errors.join(' | ')}`);
  }

  return finalRec;
}
