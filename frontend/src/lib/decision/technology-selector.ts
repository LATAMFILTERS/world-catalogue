/**
 * technology-selector.ts
 * ELIMFILTERS — Engineering Decision Engine v1.0
 *
 * Deterministically maps engineering rules and contamination risks
 * to specific ELIMFILTERS technologies.
 */

import type { EngineeringRule } from './decision-types';

export function selectTechnologies(triggeredRules: EngineeringRule[]): string[] {
  const technologies = new Set<string>();

  for (const rule of triggeredRules) {
    if (rule.action.technology) {
      technologies.add(rule.action.technology);
    }
  }

  // Ensure baseline technologies are selected if nothing extreme is triggered
  if (technologies.size === 0) {
    technologies.add('INTEKCORE™'); // Default high-efficiency cellulose baseline
  }

  return Array.from(technologies);
}
