/**
 * knowledge-registry.ts
 * ELIMFILTERS — Knowledge Acquisition Engine v1.0
 *
 * In-memory persistence of extracted entities, concepts, and relationships.
 */

import type { ExtractedEntity, EngineeringConcept, ExtractedRelationship, ChangeDetectionReport } from './knowledge-types';
import { handleVersioning } from './version-manager';

class KnowledgeRegistry {
  private entities = new Map<string, ExtractedEntity>();
  private concepts = new Map<string, EngineeringConcept>();
  private relationships = new Map<string, ExtractedRelationship>();

  registerEntities(newEntities: ExtractedEntity[]): ExtractedEntity[] {
    const added: ExtractedEntity[] = [];
    for (const ent of newEntities) {
      if (!this.entities.has(ent.id)) {
        this.entities.set(ent.id, ent);
        added.push(ent);
      }
    }
    return added;
  }

  registerConcepts(newConcepts: EngineeringConcept[]): EngineeringConcept[] {
    const added: EngineeringConcept[] = [];
    for (const conc of newConcepts) {
      if (!this.concepts.has(conc.id)) {
        this.concepts.set(conc.id, conc);
        added.push(conc);
      }
    }
    return added;
  }

  registerRelationships(newRelationships: ExtractedRelationship[]): ChangeDetectionReport {
    const versioned = handleVersioning(this.relationships, newRelationships);
    
    const added: ExtractedRelationship[] = [];
    const deprecated: ExtractedRelationship[] = [];

    for (const rel of versioned) {
      this.relationships.set(rel.id, rel);
      if (rel.status === 'SUPERSEDED' || rel.status === 'DEPRECATED') {
        deprecated.push(rel);
      } else {
        added.push(rel);
      }
    }

    // Identify superseded items in registry
    for (const [id, rel] of Array.from(this.relationships.entries())) {
      if (rel.status === 'SUPERSEDED') {
        deprecated.push(rel);
      }
    }

    return {
      newEntities: [], // Populated by engine orchestrator
      modifiedConcepts: [], // Populated by engine orchestrator
      newRelationships: added,
      deprecatedRelationships: deprecated,
      reviewQueueSize: added.length + deprecated.length,
    };
  }

  getAllEntities(): ExtractedEntity[] {
    return Array.from(this.entities.values());
  }

  getAllRelationships(): ExtractedRelationship[] {
    return Array.from(this.relationships.values());
  }
  
  clear(): void {
    this.entities.clear();
    this.concepts.clear();
    this.relationships.clear();
  }
}

export const KNOWLEDGE_REGISTRY = new KnowledgeRegistry();
