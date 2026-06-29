/**
 * audit-logger.ts
 * ELIMFILTERS — Data Ingestion Framework v1.0
 *
 * Audit Logger.
 * Every import batch generates a complete, immutable audit record.
 */

import type {
  ImportBatch,
  AuditLogEntry,
  AuditIssue,
  PipelineRecord,
} from './ingestion-types';

// ============================================================================
// IN-MEMORY AUDIT LOG (append-only)
// ============================================================================

const AUDIT_LOG: AuditLogEntry[] = [];

// ============================================================================
// AUDIT LOG GENERATOR
// ============================================================================

export function generateAuditEntry(batch: ImportBatch, executionMs: number): AuditLogEntry {
  const accepted   = batch.records.filter(r => r.decision === 'APPROVED').length;
  const pending    = batch.records.filter(r => r.decision === 'PENDING_REVIEW').length;
  const rejected   = batch.records.filter(r => r.decision === 'REJECTED').length;

  const allIssues: AuditIssue[] = batch.records.flatMap((r: PipelineRecord) =>
    r.validationResult.issues.map(issue => ({
      sourceId: r.sourceRecord.sourceId,
      severity: issue.severity,
      code: issue.code,
      message: issue.message,
    }))
  );

  const warnings         = allIssues.filter(i => i.severity === 'WARNING').length;
  const errors           = allIssues.filter(i => i.severity === 'ERROR').length;
  const duplicates       = allIssues.filter(i =>
    i.code === 'DUPLICATE_PART_NUMBER' ||
    i.code === 'DUPLICATE_OEM_NUMBER' ||
    i.code === 'DUPLICATE_OEM_ID'
  ).length;
  const relationshipIssues = batch.records.reduce(
    (sum, r) => sum + (r.relationshipMap.unresolved?.length ?? 0), 0
  );

  const avgQuality = batch.records.length > 0
    ? Math.round(batch.records.reduce((sum, r) => sum + r.qualityScore.score, 0) / batch.records.length)
    : 0;

  return {
    batchId:              batch.batchId,
    importDate:           batch.startedAt,
    source:               batch.source,
    format:               batch.format,
    domain:               batch.domain,
    totalProcessed:       batch.totalRecords,
    accepted,
    pendingReview:        pending,
    rejected,
    warnings,
    errors,
    duplicates,
    relationshipIssues,
    averageQualityScore:  avgQuality,
    executionMs,
    issues:               allIssues,
  };
}

export function appendAuditEntry(entry: AuditLogEntry): void {
  AUDIT_LOG.push(entry);
}

export function getAuditLog(): ReadonlyArray<AuditLogEntry> {
  return AUDIT_LOG;
}

export function printAuditSummary(entry: AuditLogEntry): void {
  console.log('\n════════════════════════════════════════════');
  console.log('  ELIMFILTERS — IMPORT AUDIT LOG');
  console.log('════════════════════════════════════════════');
  console.log(`  Batch ID       : ${entry.batchId}`);
  console.log(`  Import Date    : ${entry.importDate}`);
  console.log(`  Source         : ${entry.source}`);
  console.log(`  Format         : ${entry.format}`);
  console.log(`  Domain         : ${entry.domain}`);
  console.log('────────────────────────────────────────────');
  console.log(`  Total Processed: ${entry.totalProcessed}`);
  console.log(`  Accepted       : ${entry.accepted}`);
  console.log(`  Pending Review : ${entry.pendingReview}`);
  console.log(`  Rejected       : ${entry.rejected}`);
  console.log('────────────────────────────────────────────');
  console.log(`  Errors         : ${entry.errors}`);
  console.log(`  Warnings       : ${entry.warnings}`);
  console.log(`  Duplicates     : ${entry.duplicates}`);
  console.log(`  Rel. Issues    : ${entry.relationshipIssues}`);
  console.log(`  Avg Quality    : ${entry.averageQualityScore}/100`);
  console.log(`  Execution      : ${entry.executionMs}ms`);
  console.log('════════════════════════════════════════════\n');
}
