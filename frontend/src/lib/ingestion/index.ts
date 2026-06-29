/**
 * index.ts — Ingestion Module Barrel Export
 * ELIMFILTERS — Data Ingestion Framework v1.0
 */

export * from './ingestion-types';
export { normalizeRecord, normalizeRecords }   from './normalizer';
export { validateRecord, validateRecords, DuplicateRegistry } from './validator';
export { buildRelationship, buildRelationships } from './relationship-builder';
export { scoreRecord, scoreRecords, decisionFromScore }  from './quality-engine';
export { generateAuditEntry, appendAuditEntry, getAuditLog, printAuditSummary } from './audit-logger';
export { runPipeline, runPipelineFromJson }     from './pipeline';
