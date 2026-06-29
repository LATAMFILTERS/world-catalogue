/**
 * concept-extractor.ts
 * ELIMFILTERS — Knowledge Acquisition Engine v1.0
 *
 * Deterministically isolates engineering concepts from text based on 
 * co-occurrence of critical entities.
 */

import type { DocumentSection, ExtractedEntity, EngineeringConcept } from './knowledge-types';
import { extractEntities } from './entity-extractor';

export function extractConcepts(section: DocumentSection): EngineeringConcept[] {
  const concepts: EngineeringConcept[] = [];
  
  // Split section content into sentences to find local concepts
  const sentences = section.content.match(/[^.!?]+[.!?]+/g) || [section.content];

  sentences.forEach((sentence, idx) => {
    const sentenceEntities = extractEntities(sentence);
    
    // A concept requires at least 2 entities to form a meaningful engineering statement
    if (sentenceEntities.length >= 2) {
      const entityIds = sentenceEntities.map(e => e.id).sort();
      
      concepts.push({
        id: `concept-${section.id}-${idx}`,
        conceptText: sentence.trim(),
        relatedEntities: entityIds,
        version: 1,
        status: 'DRAFT', // Needs validation
      });
    }
  });

  return concepts;
}
