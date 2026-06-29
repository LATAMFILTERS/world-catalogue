/**
 * knowledge-engine.ts
 * ELIMFILTERS — Knowledge Acquisition Engine v1.0
 *
 * The central API orchestrator for transforming raw engineering documents 
 * into validated, structured knowledge registries.
 */

import type { SourceDocument, ExtractedEntity, EngineeringConcept, ExtractedRelationship, ChangeDetectionReport } from './knowledge-types';
import { parseDocument } from './document-parser';
import { extractCriticalSections } from './section-extractor';
import { extractEntities } from './entity-extractor';
import { extractConcepts } from './concept-extractor';
import { detectRelationships } from './relationship-detector';
import { buildEvidence } from './evidence-builder';
import { validateExtraction } from './knowledge-validator';
import { KNOWLEDGE_REGISTRY } from './knowledge-registry';

export function processDocument(doc: SourceDocument): ChangeDetectionReport {
  // 1. Parse Document
  const allSections = parseDocument(doc);
  
  // 2. Extract Critical Sections
  const sections = extractCriticalSections(allSections);
  
  const docEntities = new Map<string, ExtractedEntity>();
  const docConcepts: EngineeringConcept[] = [];
  const docRelationships: ExtractedRelationship[] = [];

  let relCounter = 0;

  for (const section of sections) {
    // 3. Extract Concepts from Section
    const concepts = extractConcepts(section);
    docConcepts.push(...concepts);

    // 4. Extract Entities globally across section
    const entities = extractEntities(section.content);
    for (const e of entities) {
      docEntities.set(e.id, e);
    }

    // 5. Detect Relationships inside concepts
    for (const concept of concepts) {
      const detected = detectRelationships(concept, docEntities);
      
      for (const rel of detected) {
        // 6. Build Evidence for each relationship
        const evidence = buildEvidence(section, concept, 90);
        
        docRelationships.push({
          id: `rel-${doc.id}-${Date.now()}-${relCounter++}`,
          sourceEntityId: rel.source,
          targetEntityId: rel.target,
          type: rel.type,
          evidence: [evidence],
          version: 1,
          status: 'ACTIVE',
        });
      }
    }
  }

  // 7. Validate Knowledge Extraction
  const validation = validateExtraction(docConcepts, docRelationships);
  if (!validation.valid) {
    throw new Error(`Extraction validation failed: ${validation.errors.join(' | ')}`);
  }

  // 8. Register and Version
  const newEntities = KNOWLEDGE_REGISTRY.registerEntities(Array.from(docEntities.values()));
  const newConcepts = KNOWLEDGE_REGISTRY.registerConcepts(docConcepts);
  const report = KNOWLEDGE_REGISTRY.registerRelationships(docRelationships);

  // Hydrate report
  report.newEntities = newEntities;
  report.modifiedConcepts = newConcepts;

  return report;
}

export { KNOWLEDGE_REGISTRY };
