/**
 * version-manager.ts
 * ELIMFILTERS — Knowledge Acquisition Engine v1.0
 *
 * Tracks deprecation and superseded knowledge relationships.
 */

import type { ExtractedRelationship } from './knowledge-types';

export function handleVersioning(
  existingRelationships: Map<string, ExtractedRelationship>, 
  newRelationships: ExtractedRelationship[]
): ExtractedRelationship[] {
  
  const updatedRelationships: ExtractedRelationship[] = [];

  for (const newRel of newRelationships) {
    const existingKey = Array.from(existingRelationships.values()).find(
      r => r.sourceEntityId === newRel.sourceEntityId && 
           r.targetEntityId === newRel.targetEntityId && 
           r.type === newRel.type
    );

    if (existingKey) {
      // Version bump
      existingKey.status = 'SUPERSEDED';
      newRel.version = existingKey.version + 1;
      
      // Append historical evidence
      newRel.evidence = [...newRel.evidence, ...existingKey.evidence];
    } else {
      newRel.version = 1;
    }

    updatedRelationships.push(newRel);
  }

  return updatedRelationships;
}
