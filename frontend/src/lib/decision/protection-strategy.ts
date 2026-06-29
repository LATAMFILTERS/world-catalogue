/**
 * protection-strategy.ts
 * ELIMFILTERS — Engineering Decision Engine v1.0
 *
 * Deterministically generates protection systems and coverage levels.
 */

import type { EngineeringRule, ProtectionStrategy, TraceLink } from './decision-types';

export function buildProtectionStrategy(triggeredRules: EngineeringRule[]): ProtectionStrategy {
  const systemsMap = new Map<string, { required: boolean; reason: string; reference: string }>();
  const trace: TraceLink[] = [];

  for (const rule of triggeredRules) {
    if (rule.action.systemType) {
      // If multiple rules trigger the same system, mark as required if ANY rule requires it
      const existing = systemsMap.get(rule.action.systemType);
      
      systemsMap.set(rule.action.systemType, {
        required: existing ? (existing.required || !!rule.action.required) : !!rule.action.required,
        reason: rule.justification,
        reference: rule.reference,
      });

      trace.push({
        step: `Require System: ${rule.action.systemType}`,
        reference: rule.reference,
        justification: rule.justification,
      });
    }
  }

  // Define Baseline Systems if missing
  const baselines = ['Engine Lube', 'Engine Air Intake', 'Fuel System'];
  for (const base of baselines) {
    if (!systemsMap.has(base)) {
      systemsMap.set(base, {
        required: true,
        reason: 'Fundamental protection required for all internal combustion engines.',
        reference: 'Internal Combustion Engine Baseline Protection',
      });
      trace.push({
        step: `Require Baseline System: ${base}`,
        reference: 'Baseline Engineering Principles',
        justification: `Every engine requires ${base} filtration.`,
      });
    }
  }

  const systems = Array.from(systemsMap.entries()).map(([systemType, data]) => ({
    systemType,
    required: data.required,
    reason: data.reason,
  }));

  const coverageLevel = systems.length > 5 ? 'COMPREHENSIVE' : 'STANDARD';

  return {
    systems,
    coverageLevel,
    justification: `Strategy derived from ${triggeredRules.length} specific engineering rules and baseline requirements.`,
    trace,
  };
}
