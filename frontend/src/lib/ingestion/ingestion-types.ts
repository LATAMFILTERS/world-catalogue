/**
 * ingestion-types.ts
 * ELIMFILTERS — Data Ingestion Framework v1.0
 *
 * Type definitions for the complete ingestion pipeline.
 * No data enters the Master Data Platform without passing through this contract.
 */

// ============================================================================
// SOURCE FORMAT TYPES
// ============================================================================

export type SourceFormat = 'CSV' | 'JSON' | 'JSONL' | 'XML' | 'XLSX' | 'TSV';

export type IngestionDomain =
  | 'OEM'
  | 'OEM_PART'
  | 'CROSS_REFERENCE'
  | 'EQUIPMENT'
  | 'ENGINE'
  | 'APPLICATION'
  | 'PRODUCT';

// ============================================================================
// RAW SOURCE RECORD — before normalization
// ============================================================================

export interface SourceRecord {
  /** Unique identifier within the source file (row number, original ID, etc.) */
  sourceId: string;
  /** The raw, unprocessed field map from the import file */
  rawFields: Record<string, string | number | null | undefined>;
  /** Which domain this record targets */
  domain: IngestionDomain;
  /** Format of the source file */
  format: SourceFormat;
  /** Original filename or API endpoint */
  source: string;
  /** Timestamp this record entered the pipeline */
  ingestedAt: string;
}

// ============================================================================
// NORMALIZED RECORD — after normalization pass
// ============================================================================

export interface NormalizedRecord {
  sourceId: string;
  domain: IngestionDomain;
  source: string;
  ingestedAt: string;
  /** Cleaned, normalized field map */
  fields: Record<string, string | number | null>;
  /** Fields that were transformed during normalization */
  normalizations: NormalizationNote[];
}

export interface NormalizationNote {
  field: string;
  original: string | number | null | undefined;
  normalized: string | number | null;
  rule: string;
}

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export type ValidationSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface ValidationIssue {
  field: string;
  code: ValidationCode;
  severity: ValidationSeverity;
  message: string;
  value?: string | number | null;
}

export type ValidationCode =
  | 'DUPLICATE_PART_NUMBER'
  | 'DUPLICATE_OEM_NUMBER'
  | 'DUPLICATE_OEM_ID'
  | 'INVALID_PREFIX'
  | 'INVALID_DUTY_CLASS'
  | 'UNKNOWN_TECHNOLOGY'
  | 'UNKNOWN_SYSTEM'
  | 'UNKNOWN_PLATFORM'
  | 'UNKNOWN_FAMILY'
  | 'UNKNOWN_OEM'
  | 'UNKNOWN_ENGINE'
  | 'UNKNOWN_EQUIPMENT'
  | 'UNKNOWN_APPLICATION'
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_UNIT'
  | 'BROKEN_RELATIONSHIP'
  | 'CIRCULAR_REFERENCE'
  | 'INVALID_STANDARD'
  | 'INVALID_COUNTRY'
  | 'MALFORMED_PART_NUMBER'
  | 'CONFLICTING_MAPPING';

export interface ValidationResult {
  sourceId: string;
  valid: boolean;
  issues: ValidationIssue[];
  errorCount: number;
  warningCount: number;
}

// ============================================================================
// RELATIONSHIP MAP — built after validation
// ============================================================================

export interface RelationshipMap {
  sourceId: string;
  oemId?: string;
  oemPartId?: string;
  crossReferenceId?: string;
  equipmentId?: string;
  engineId?: string;
  applicationIds?: string[];
  protectionSystemKey?: string;
  technologyKey?: string;
  platformKey?: string;
  familyKey?: string;
  productPartNumber?: string;
  /** Relationships that could not be resolved */
  unresolved?: UnresolvedRelationship[];
}

export interface UnresolvedRelationship {
  field: string;
  value: string;
  reason: string;
}

// ============================================================================
// QUALITY SCORE
// ============================================================================

export interface QualityScore {
  sourceId: string;
  /** 0–100 composite score */
  score: number;
  /** Component breakdown of the score */
  components: QualityComponent[];
  /** Human-readable assessment */
  assessment: QualityAssessment;
}

export interface QualityComponent {
  dimension: string;
  maxPoints: number;
  earned: number;
  notes?: string;
}

export type QualityAssessment =
  | 'COMPLETE'          // 100
  | 'NEAR_COMPLETE'     // 90–99
  | 'GOOD'              // 75–89
  | 'NEEDS_REVIEW'      // 50–74
  | 'INCOMPLETE'        // 25–49
  | 'REJECTED';         // 0–24

// ============================================================================
// PIPELINE DECISION
// ============================================================================

export type PipelineDecision = 'APPROVED' | 'PENDING_REVIEW' | 'REJECTED';

export interface PipelineRecord {
  sourceRecord: SourceRecord;
  normalizedRecord: NormalizedRecord;
  validationResult: ValidationResult;
  relationshipMap: RelationshipMap;
  qualityScore: QualityScore;
  decision: PipelineDecision;
  processedAt: string;
}

// ============================================================================
// IMPORT BATCH
// ============================================================================

export interface ImportBatch {
  batchId: string;
  source: string;
  format: SourceFormat;
  domain: IngestionDomain;
  startedAt: string;
  completedAt?: string;
  totalRecords: number;
  records: PipelineRecord[];
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export interface AuditLogEntry {
  batchId: string;
  importDate: string;
  source: string;
  format: SourceFormat;
  domain: IngestionDomain;
  totalProcessed: number;
  accepted: number;
  pendingReview: number;
  rejected: number;
  warnings: number;
  errors: number;
  duplicates: number;
  relationshipIssues: number;
  averageQualityScore: number;
  executionMs: number;
  issues: AuditIssue[];
}

export interface AuditIssue {
  sourceId: string;
  severity: ValidationSeverity;
  code: ValidationCode;
  message: string;
}
