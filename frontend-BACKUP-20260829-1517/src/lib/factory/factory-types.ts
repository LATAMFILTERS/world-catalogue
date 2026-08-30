/**
 * factory-types.ts
 * ELIMFILTERS — Data Factory v1.0
 *
 * Core types for scheduling and orchestrating data factory operations.
 */

export type JobType = 
  | 'OEM_CATALOG_IMPORT'
  | 'OEM_UPDATE'
  | 'XREF_UPDATE'
  | 'STANDARD_UPDATE'
  | 'BULLETIN_UPDATE'
  | 'PRODUCT_SPEC_UPDATE'
  | 'APPLICATION_UPDATE'
  | 'EQUIPMENT_UPDATE'
  | 'ENGINE_UPDATE'
  | 'KNOWLEDGE_REFRESH';

export type JobState = 
  | 'QUEUED'
  | 'IMPORTING'
  | 'NORMALIZING'
  | 'VALIDATING'
  | 'PROCESSING'
  | 'REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'FAILED'
  | 'ROLLED_BACK';

export interface JobAuditRecord {
  jobId: string;
  type: JobType;
  state: JobState;
  timestamp: string;
  operator: string;
  recordsProcessed: number;
  accepted: number;
  rejected: number;
  warnings: string[];
  errors: string[];
  executionTimeMs: number;
  rollbackAvailable: boolean;
}

export interface FactoryMetrics {
  jobsPerHour: number;
  recordsProcessed: number;
  acceptanceRate: number; // Percentage
  duplicateRate: number; // Percentage
  validationFailures: number;
  relationshipFailures: number;
  registryGrowth: number;
}
