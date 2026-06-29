/**
 * knowledge-types.ts
 * ELIMFILTERS — Knowledge Acquisition Engine v1.0
 *
 * Core types for transforming engineering documents into structured,
 * versioned, and evidence-backed knowledge.
 */

export type SourceDocumentType = 'STANDARD' | 'OEM_MANUAL' | 'OEM_CATALOG' | 'SERVICE_MANUAL' | 'BULLETIN' | 'WHITE_PAPER' | 'TEST_REPORT' | 'INTERNAL';

export interface SourceDocument {
  id: string;
  title: string;
  type: SourceDocumentType;
  version: string;
  author: string;
  publishedDate: string;
  content: string; // Raw text or markdown
}

export interface DocumentSection {
  id: string;
  documentId: string;
  heading: string;
  content: string;
  paragraphIndex: number;
}

export type EntityType = 
  | 'PROTECTION_SYSTEM' | 'TECHNOLOGY' | 'PRODUCT_FAMILY' 
  | 'PRODUCT' | 'OEM_PART' | 'STANDARD' | 'TEST_METHOD'
  | 'METRIC' | 'CONTAMINATION_MODE' | 'FAILURE_MODE' 
  | 'MATERIAL' | 'APPLICATION' | 'EQUIPMENT' | 'ENGINE' | 'INDUSTRY';

export interface ExtractedEntity {
  id: string;
  type: EntityType;
  value: string;
  confidence: number;
}

export interface EngineeringConcept {
  id: string;
  conceptText: string;
  relatedEntities: string[]; // Entity IDs
  version: number;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'DEPRECATED';
}

export type RelationshipType = 
  | 'TECHNOLOGY_MEETS_STANDARD'
  | 'TECHNOLOGY_POWERS_SYSTEM'
  | 'SYSTEM_USED_IN_INDUSTRY'
  | 'PRODUCT_USES_TECHNOLOGY'
  | 'PRODUCT_MEETS_STANDARD'
  | 'ASSET_USES_APPLICATION'
  | 'OEM_MAKES_PRODUCT'
  | 'CONTAMINATION_CAUSES_FAILURE';

export interface Evidence {
  sourceDocumentId: string;
  sectionId: string;
  paragraphIndex: number;
  extractedText: string;
  extractionDate: string;
  reviewerStatus: 'PENDING' | 'VALIDATED' | 'REJECTED';
  confidence: number;
}

export interface ExtractedRelationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: RelationshipType;
  evidence: Evidence[];
  version: number;
  status: 'ACTIVE' | 'SUPERSEDED' | 'DEPRECATED';
}

export interface ChangeDetectionReport {
  newEntities: ExtractedEntity[];
  modifiedConcepts: EngineeringConcept[];
  newRelationships: ExtractedRelationship[];
  deprecatedRelationships: ExtractedRelationship[];
  reviewQueueSize: number;
}
