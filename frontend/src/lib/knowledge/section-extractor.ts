/**
 * section-extractor.ts
 * ELIMFILTERS — Knowledge Acquisition Engine v1.0
 *
 * Identifies critical engineering sections from parsed documents.
 */

import type { DocumentSection } from './knowledge-types';

export function extractCriticalSections(sections: DocumentSection[]): DocumentSection[] {
  const criticalKeywords = [
    'failure mode',
    'maintenance interval',
    'technical specification',
    'contamination',
    'standard',
    'iso',
    'test method',
    'performance',
    'wear',
    'protection'
  ];

  return sections.filter(sec => {
    const headingLower = sec.heading.toLowerCase();
    return criticalKeywords.some(kw => headingLower.includes(kw));
  });
}
