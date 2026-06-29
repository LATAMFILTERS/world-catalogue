/**
 * test-ingestion-pipeline.ts
 * ELIMFILTERS — Data Ingestion Framework v1.0
 *
 * Pipeline Integration Tests.
 * Exercises every stage: Normalization, Validation, Relationship Building,
 * Quality Scoring, and the Audit Logger.
 *
 * Test Scenarios:
 *   1. Valid OEM record           → should be APPROVED, score ≥ 75
 *   2. Valid Product record       → should be APPROVED, score ≥ 75
 *   3. Missing required fields    → should be REJECTED
 *   4. Duplicate OEM part number  → should fail duplicate check
 *   5. Invalid product prefix     → should fail prefix check
 *   6. Mismatched duty class      → should fail duty validation
 *   7. Cross reference record     → should build XREF relationship
 *   8. Full batch run via JSON    → should produce audit log
 */

import { runPipelineFromJson, runPipeline } from '../lib/ingestion/pipeline';
import { normalizeRecord }   from '../lib/ingestion/normalizer';
import { DuplicateRegistry, validateRecord } from '../lib/ingestion/validator';
import { getAuditLog }       from '../lib/ingestion/audit-logger';
import type { SourceRecord } from '../lib/ingestion/ingestion-types';

// ============================================================================
// TEST HELPERS
// ============================================================================

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

// ============================================================================
// TEST 1: Valid OEM record
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 1: Valid OEM Record');
console.log('─────────────────────────────────────────────');

const validOemBatch = runPipelineFromJson(
  [{ id: 'donaldson', oem_id: 'donaldson', name: 'Donaldson Company', category: 'Filtration', country: 'USA' }],
  'OEM',
  'test-suite-oem',
  { verbose: false }
);

const oemRecord = validOemBatch.records[0];
assert('OEM record is APPROVED', oemRecord.decision === 'APPROVED', `got: ${oemRecord.decision}`);
assert('OEM quality score ≥ 75', oemRecord.qualityScore.score >= 75, `score: ${oemRecord.qualityScore.score}`);
assert('OEM country normalized to US', oemRecord.normalizedRecord.fields['country'] === 'US', `got: ${oemRecord.normalizedRecord.fields['country']}`);
assert('OEM name normalized', oemRecord.normalizedRecord.fields['name'] === 'Donaldson', `got: ${oemRecord.normalizedRecord.fields['name']}`);

// ============================================================================
// TEST 2: Valid Product Record
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 2: Valid Product Record');
console.log('─────────────────────────────────────────────');

const validProductBatch = runPipelineFromJson(
  [{ id: 'EA10001', part_number: 'EA10001', duty: 'HD', product_family: 'primary-air' }],
  'PRODUCT',
  'test-suite-product',
  { verbose: false }
);

const productRecord = validProductBatch.records[0];
assert('Product decision is APPROVED', productRecord.decision === 'APPROVED', `got: ${productRecord.decision}`);
assert('Product quality score ≥ 75', productRecord.qualityScore.score >= 75, `score: ${productRecord.qualityScore.score}`);
assert('No validation errors', productRecord.validationResult.errorCount === 0, `errors: ${productRecord.validationResult.errorCount}`);

// ============================================================================
// TEST 3: Missing required fields → REJECTED
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 3: Missing Required Fields → REJECTED');
console.log('─────────────────────────────────────────────');

const missingFieldsBatch = runPipelineFromJson(
  [{ id: 'incomplete_oem' }],
  'OEM',
  'test-suite-missing',
  { verbose: false }
);

const missingRecord = missingFieldsBatch.records[0];
assert('Missing-field record is REJECTED', missingRecord.decision === 'REJECTED', `got: ${missingRecord.decision}`);
assert('Validation errors detected', missingRecord.validationResult.errorCount > 0, `errors: ${missingRecord.validationResult.errorCount}`);
assert('Quality score < 50', missingRecord.qualityScore.score < 50, `score: ${missingRecord.qualityScore.score}`);

// ============================================================================
// TEST 4: Duplicate OEM Part Number
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 4: Duplicate OEM Part Number Detection');
console.log('─────────────────────────────────────────────');

const duplicateBatch = runPipelineFromJson(
  [
    { id: 'p1', oem_id: 'donaldson', oem_part_number: 'P550000', category: 'Air' },
    { id: 'p2', oem_id: 'donaldson', oem_part_number: 'P550000', category: 'Air' },
  ],
  'OEM_PART',
  'test-suite-duplicates',
  { verbose: false }
);

const dup1 = duplicateBatch.records[0];
const dup2 = duplicateBatch.records[1];
assert('First record passes (no dup yet)', dup1.validationResult.issues.every(i => i.code !== 'DUPLICATE_OEM_NUMBER'));
assert('Second record flagged as duplicate', dup2.validationResult.issues.some(i => i.code === 'DUPLICATE_OEM_NUMBER'));

// ============================================================================
// TEST 5: Invalid Product Prefix
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 5: Invalid Product Prefix');
console.log('─────────────────────────────────────────────');

const invalidPrefixBatch = runPipelineFromJson(
  [{ id: 'BAD001', part_number: 'XX99999', duty: 'HD', product_family: 'primary-air' }],
  'PRODUCT',
  'test-suite-prefix',
  { verbose: false }
);

const badPrefix = invalidPrefixBatch.records[0];
assert('Invalid prefix flagged', badPrefix.validationResult.issues.some(i => i.code === 'INVALID_PREFIX'));
assert('Invalid prefix record is REJECTED', badPrefix.decision === 'REJECTED', `got: ${badPrefix.decision}`);

// ============================================================================
// TEST 6: Mismatched Duty Class
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 6: Mismatched Duty Class (EA1 vs LD)');
console.log('─────────────────────────────────────────────');

const mismatchBatch = runPipelineFromJson(
  [{ id: 'MISMATCH', part_number: 'EA10002', duty: 'LD', product_family: 'primary-air' }],
  'PRODUCT',
  'test-suite-mismatch',
  { verbose: false }
);

const mismatch = mismatchBatch.records[0];
assert('Duty mismatch flagged', mismatch.validationResult.issues.some(i => i.code === 'INVALID_DUTY_CLASS'));

// ============================================================================
// TEST 7: Cross Reference Record → XREF relationship built
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 7: Cross Reference Relationship Builder');
console.log('─────────────────────────────────────────────');

const xrefBatch = runPipelineFromJson(
  [{ id: 'XREF_1', oem_part_id: 'donaldson_P550000', elimfilters_part_number: 'EA10001' }],
  'CROSS_REFERENCE',
  'test-suite-xref',
  { verbose: false }
);

const xref = xrefBatch.records[0];
assert('Cross reference has crossReferenceId', !!xref.relationshipMap.crossReferenceId);
assert('Cross reference productPartNumber is EA10001', xref.relationshipMap.productPartNumber === 'EA10001', `got: ${xref.relationshipMap.productPartNumber}`);

// ============================================================================
// TEST 8: Audit Log populated
// ============================================================================

console.log('\n─────────────────────────────────────────────');
console.log('TEST 8: Audit Log Populated');
console.log('─────────────────────────────────────────────');

const log = getAuditLog();
assert('Audit log has ≥ 7 entries (one per batch)', log.length >= 7, `entries: ${log.length}`);
assert('All batches have batchId', log.every(e => !!e.batchId));
assert('All batches have importDate', log.every(e => !!e.importDate));

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n═══════════════════════════════════════════════');
console.log(`  PIPELINE TESTS COMPLETE`);
console.log(`  Passed : ${passed}`);
console.log(`  Failed : ${failed}`);
console.log(`  Total  : ${passed + failed}`);
console.log('═══════════════════════════════════════════════\n');

if (failed > 0) {
  console.error(`${failed} test(s) FAILED.`);
  process.exit(1);
} else {
  console.log('All pipeline tests PASSED.');
}
