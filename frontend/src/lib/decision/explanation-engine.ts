/**
 * explanation-engine.ts
 * ELIMFILTERS — Engineering Decision Engine v1.0
 *
 * Ensures every recommendation is fully explainable and combines the decision traces.
 */

import type { EngineeringRecommendation, TraceLink } from './decision-types';

export function attachExplanation(recommendation: Omit<EngineeringRecommendation, 'trace'>, rawTraces: TraceLink[]): EngineeringRecommendation {
  const combinedTrace: TraceLink[] = [
    ...rawTraces,
    ...recommendation.protectionStrategy.trace,
    ...recommendation.maintenanceStrategy.trace
  ];

  // De-duplicate trace links by step
  const uniqueTraces = new Map<string, TraceLink>();
  for (const t of combinedTrace) {
    if (!uniqueTraces.has(t.step)) {
      uniqueTraces.set(t.step, t);
    }
  }

  return {
    ...recommendation,
    trace: Array.from(uniqueTraces.values()),
  };
}
