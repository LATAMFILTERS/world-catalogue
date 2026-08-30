/**
 * relationship-detector.ts
 * ELIMFILTERS — Knowledge Acquisition Engine v1.0
 *
 * Deterministically infers engineering relationships based on co-occurring entities
 * within extracted concepts.
 */

import type { EngineeringConcept, ExtractedEntity, RelationshipType } from './knowledge-types';

export function detectRelationships(concept: EngineeringConcept, allEntities: Map<string, ExtractedEntity>): { type: RelationshipType, source: string, target: string }[] {
  const relationships: { type: RelationshipType, source: string, target: string }[] = [];
  
  // Resolve entities from IDs
  const entities = concept.relatedEntities.map(id => allEntities.get(id)).filter(Boolean) as ExtractedEntity[];

  const techs = entities.filter(e => e.type === 'TECHNOLOGY');
  const standards = entities.filter(e => e.type === 'STANDARD');
  const contamModes = entities.filter(e => e.type === 'CONTAMINATION_MODE');
  const failureModes = entities.filter(e => e.type === 'FAILURE_MODE');
  
  // 1. TECHNOLOGY ↔ STANDARD
  if (techs.length > 0 && standards.length > 0) {
    for (const t of techs) {
      for (const s of standards) {
        relationships.push({ type: 'TECHNOLOGY_MEETS_STANDARD', source: t.id, target: s.id });
      }
    }
  }

  // 2. CONTAMINATION ↔ FAILURE MODE
  if (contamModes.length > 0 && failureModes.length > 0) {
    for (const c of contamModes) {
      for (const f of failureModes) {
        relationships.push({ type: 'CONTAMINATION_CAUSES_FAILURE', source: c.id, target: f.id });
      }
    }
  }

  return relationships;
}
