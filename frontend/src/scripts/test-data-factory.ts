/**
 * test-data-factory.ts
 * ELIMFILTERS — Data Factory v1.0
 *
 * Synthetic test suite verifying pipeline transitions, queues, audits, and rollback logic.
 */

import { 
  JOB_SCHEDULER, 
  transitionJob, 
  calculateFactoryMetrics, 
  REGISTRY_CHECKPOINTS,
  IMPORT_QUEUE,
  VALIDATION_QUEUE,
  REVIEW_QUEUE,
  APPROVAL_QUEUE,
  PUBLICATION_QUEUE
} from '../lib/factory';

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
// SETUP & INITIAL QUEUE TEST
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 1: Ingestion Scheduling & Initial Queuing');
console.log('─────────────────────────────────────────────');

JOB_SCHEDULER.clear();
IMPORT_QUEUE.clear();
VALIDATION_QUEUE.clear();
REVIEW_QUEUE.clear();
APPROVAL_QUEUE.clear();
PUBLICATION_QUEUE.clear();
REGISTRY_CHECKPOINTS.clear();

const job = JOB_SCHEDULER.scheduleJob('OEM_CATALOG_IMPORT', 'Operator-A');

assert('Job scheduler registers new job', !!job.jobId);
assert('Initial job state is QUEUED', job.state === 'QUEUED');
assert('Import queue size is 1', IMPORT_QUEUE.size === 1);
assert('Auditable metadata fields initialized', !!job.timestamp && job.operator === 'Operator-A');

// ============================================================================
// TEST 2: State Transitions & Ingestion Stage Processing
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 2: Ingestion Stage Processing & Queue Shifts');
console.log('─────────────────────────────────────────────');

transitionJob(job, 'IMPORTING');
assert('State transitioned to IMPORTING', job.state === 'IMPORTING');
assert('Import queue size decreased to 0', IMPORT_QUEUE.size === 0);
assert('Records processed calculated', job.recordsProcessed === 100);

transitionJob(job, 'NORMALIZING');
assert('State transitioned to NORMALIZING', job.state === 'NORMALIZING');
assert('Simulated acceptance metrics calculated', job.accepted === 95 && job.rejected === 5);
assert('Audit warnings appended', job.warnings.length > 0);

transitionJob(job, 'VALIDATING');
assert('State transitioned to VALIDATING', job.state === 'VALIDATING');
assert('Job entered Validation queue', VALIDATION_QUEUE.size === 1);

// ============================================================================
// TEST 3: Review & Manual Approval Checklist
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 3: Review & Manual Approval Checkpoint');
console.log('─────────────────────────────────────────────');

transitionJob(job, 'REVIEW');
assert('State transitioned to REVIEW', job.state === 'REVIEW');
assert('Validation queue size is 0', VALIDATION_QUEUE.size === 0);
assert('Job entered Review queue', REVIEW_QUEUE.size === 1);

transitionJob(job, 'APPROVED');
assert('State transitioned to APPROVED', job.state === 'APPROVED');
assert('Review queue size is 0', REVIEW_QUEUE.size === 0);
assert('Job entered Approval queue', APPROVAL_QUEUE.size === 1);
assert('Rollback checkpoint generated', job.rollbackAvailable === true);

// ============================================================================
// TEST 4: Publication & Rollback Mechanics
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 4: Publication & Rollback Checkpoint');
console.log('─────────────────────────────────────────────');

transitionJob(job, 'PUBLISHED');
assert('State transitioned to PUBLISHED', job.state === 'PUBLISHED');
assert('Approval queue size is 0', APPROVAL_QUEUE.size === 0);
assert('Job entered Publication queue', PUBLICATION_QUEUE.size === 1);

// Perform manual rollback recovery
const rolledBack = REGISTRY_CHECKPOINTS.rollback(job);
assert('Rollback executed successfully', rolledBack === true);
assert('State reverted to ROLLED_BACK', job.state === 'ROLLED_BACK');
assert('Rollback flag disabled post-recovery', job.rollbackAvailable === false);

// ============================================================================
// TEST 5: Monitoring Metrics Calculation
// ============================================================================
console.log('\n─────────────────────────────────────────────');
console.log('TEST 5: Factory Monitoring & Dashboard Metrics');
console.log('─────────────────────────────────────────────');

const metrics = calculateFactoryMetrics();
assert('Monitoring aggregates processed records', metrics.recordsProcessed === 100);
assert('Monitoring computes overall acceptance rate', metrics.acceptanceRate === 95);
assert('Registry growth calculated', metrics.registryGrowth === 95);


// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n═══════════════════════════════════════════════');
console.log('      DATA FACTORY ENGINE TESTS COMPLETE');
console.log(`      Passed : ${passed}`);
console.log(`      Failed : ${failed}`);
console.log(`      Total  : ${passed + failed}`);
console.log('═══════════════════════════════════════════════\n');

if (failed > 0) {
  console.error(`${failed} test(s) FAILED.`);
  process.exit(1);
} else {
  console.log('All Data Factory Engine tests PASSED.');
}
