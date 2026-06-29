/**
 * knowledge-validator.ts
 * ELIMFILTERS — Knowledge Acquisition Engine v1.0
 *
 * Audits extracted relationships and concepts for completeness and validity.
 */

import type { ExtractedRelationship, EngineeringConcept } from './knowledge-types';

export function validateExtraction(
  concepts: EngineeringConcept[], 
  relationships: ExtractedRelationship[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check concepts
  for (const c of concepts) {
    if (c.relatedEntities.length < 2) {
      errors.push(`Concept ${c.id} has less than 2 entities. It cannot form a relationship.`);
    }
    if (!c.conceptText || c.conceptText.trim() === '') {
      errors.push(`Concept ${c.id} has empty text.`);
    }
  }

  // Check relationships
  for (const r of relationships) {
    if (r.evidence.length === 0) {
      errors.push(`Relationship ${r.id} (${r.type}) lacks evidence.`);
    }
    if (r.sourceEntityId === r.targetEntityId) {
      errors.push(`Relationship ${r.id} is circular (source === target).`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
