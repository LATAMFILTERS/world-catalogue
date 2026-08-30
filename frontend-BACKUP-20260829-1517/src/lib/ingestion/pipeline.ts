/**
 * pipeline.ts
 * ELIMFILTERS — Data Ingestion Framework v1.0
 *
 * Pipeline Orchestrator.
 * Wires all modules together into the complete ingestion pipeline:
 *
 *   Source Records
 *       ↓
 *   Normalization     (normalizer.ts)
 *       ↓
 *   Validation        (validator.ts)
 *       ↓
 *   Relationship Map  (relationship-builder.ts)
 *       ↓
 *   Quality Score     (quality-engine.ts)
 *       ↓
 *   Pipeline Decision (APPROVED / PENDING / REJECTED)
 *       ↓
 *   Audit Log         (audit-logger.ts)
 *       ↓
 *   Import Batch Result
 */

import type {
  SourceRecord,
  PipelineRecord,
  ImportBatch,
  IngestionDomain,
  SourceFormat,
} from './ingestion-types';

import { normalizeRecord }    from './normalizer';
import { validateRecord, DuplicateRegistry } from './validator';
import { buildRelationship }  from './relationship-builder';
import { scoreRecord, decisionFromScore } from './quality-engine';
import { generateAuditEntry, appendAuditEntry, printAuditSummary } from './audit-logger';

// ============================================================================
// PIPELINE CONFIGURATION
// ============================================================================

export interface PipelineConfig {
  /** Minimum quality score to auto-approve (default: 75) */
  approvalThreshold?: number;
  /** Print audit summary to console after processing (default: true) */
  verbose?: boolean;
}

const DEFAULT_CONFIG: Required<PipelineConfig> = {
  approvalThreshold: 75,
  verbose: true,
};

// ============================================================================
// BATCH ID GENERATOR
// ============================================================================

let batchCounter = 0;
function generateBatchId(domain: IngestionDomain, source: string): string {
  batchCounter++;
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').substring(0, 14);
  const slug = source.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20).toUpperCase();
  return `BATCH_${domain}_${ts}_${String(batchCounter).padStart(4, '0')}_${slug}`;
}

// ============================================================================
// CORE PIPELINE — processes a single record end-to-end
// ============================================================================

function processRecord(
  source: SourceRecord,
  duplicates: DuplicateRegistry
): PipelineRecord {
  const processedAt = new Date().toISOString();

  // Stage 1: Normalize
  const normalized = normalizeRecord(source);

  // Stage 2: Validate
  const validation = validateRecord(normalized, duplicates);

  // Stage 3: Build Relationships
  const relationshipMap = buildRelationship(normalized, validation);

  // Stage 4: Score Quality
  const qualityScore = scoreRecord(normalized, validation, relationshipMap);

  // Stage 5: Decide
  const decision = decisionFromScore(qualityScore.score, validation.errorCount);

  return {
    sourceRecord: source,
    normalizedRecord: normalized,
    validationResult: validation,
    relationshipMap,
    qualityScore,
    decision,
    processedAt,
  };
}

// ============================================================================
// MAIN PIPELINE RUNNER
// ============================================================================

export function runPipeline(
  records: SourceRecord[],
  domain: IngestionDomain,
  source: string,
  format: SourceFormat,
  config: PipelineConfig = {}
): ImportBatch {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const startedAt = new Date().toISOString();
  const startMs = Date.now();
  const batchId = generateBatchId(domain, source);
  const duplicates = new DuplicateRegistry();

  if (cfg.verbose) {
    console.log(`\n[PIPELINE] Starting batch ${batchId}`);
    console.log(`[PIPELINE] Domain: ${domain} | Source: ${source} | Format: ${format}`);
    console.log(`[PIPELINE] Processing ${records.length} record(s)...`);
  }

  const processed: PipelineRecord[] = records.map((record) =>
    processRecord(record, duplicates)
  );

  const completedAt = new Date().toISOString();
  const executionMs = Date.now() - startMs;

  const batch: ImportBatch = {
    batchId,
    source,
    format,
    domain,
    startedAt,
    completedAt,
    totalRecords: records.length,
    records: processed,
  };

  // Generate and store audit entry
  const audit = generateAuditEntry(batch, executionMs);
  appendAuditEntry(audit);

  if (cfg.verbose) {
    printAuditSummary(audit);
  }

  return batch;
}

// ============================================================================
// CONVENIENCE: Run from raw JSON array
// ============================================================================

export function runPipelineFromJson(
  rawData: Record<string, unknown>[],
  domain: IngestionDomain,
  source: string,
  config?: PipelineConfig
): ImportBatch {
  const now = new Date().toISOString();
  const records: SourceRecord[] = rawData.map((row, idx) => ({
    sourceId: String(row['id'] ?? row['part_number'] ?? row['oem_id'] ?? idx),
    rawFields: row as Record<string, string | number | null | undefined>,
    domain,
    format: 'JSON',
    source,
    ingestedAt: now,
  }));
  return runPipeline(records, domain, source, 'JSON', config);
}
