/**
 * evidence-builder.ts
 * ELIMFILTERS — Knowledge Acquisition Engine v1.0
 *
 * Ensures every relationship and concept is backed by strict evidence.
 */

import type { DocumentSection, EngineeringConcept, Evidence } from './knowledge-types';

export function buildEvidence(section: DocumentSection, concept: EngineeringConcept, baseConfidence: number): Evidence {
  return {
    sourceDocumentId: section.documentId,
    sectionId: section.id,
    paragraphIndex: section.paragraphIndex,
    extractedText: concept.conceptText,
    extractionDate: new Date().toISOString(),
    reviewerStatus: 'PENDING',
    confidence: baseConfidence,
  };
}
