/**
 * pipeline-orchestrator.ts
 * ELIMFILTERS — Data Factory v1.0
 *
 * Coordinates state transitions across the full factory pipeline.
 */

import type { JobAuditRecord, JobState } from './factory-types';
import { IMPORT_QUEUE, VALIDATION_QUEUE, REVIEW_QUEUE, APPROVAL_QUEUE, PUBLICATION_QUEUE } from './factory-queues';
import { REGISTRY_CHECKPOINTS } from './rollback-manager';

export function transitionJob(job: JobAuditRecord, nextState: JobState): void {
  const startTime = Date.now();
  
  // Manage state specific queue shifts
  switch (job.state) {
    case 'QUEUED':
      IMPORT_QUEUE.remove(job.jobId);
      break;
    case 'VALIDATING':
      VALIDATION_QUEUE.remove(job.jobId);
      break;
    case 'REVIEW':
      REVIEW_QUEUE.remove(job.jobId);
      break;
    case 'APPROVED':
      APPROVAL_QUEUE.remove(job.jobId);
      break;
  }

  job.state = nextState;

  switch (nextState) {
    case 'IMPORTING':
      job.recordsProcessed = 100; // Simulated metrics
      break;
    case 'NORMALIZING':
      job.accepted = 95;
      job.rejected = 5;
      job.warnings.push('Column name normalized');
      break;
    case 'VALIDATING':
      VALIDATION_QUEUE.enqueue(job);
      break;
    case 'REVIEW':
      REVIEW_QUEUE.enqueue(job);
      break;
    case 'APPROVED':
      // Capture rollback checkpoint before applying modifications to registries
      REGISTRY_CHECKPOINTS.createCheckpoint(job.jobId);
      job.rollbackAvailable = true;
      APPROVAL_QUEUE.enqueue(job);
      break;
    case 'PUBLISHED':
      PUBLICATION_QUEUE.enqueue(job);
      break;
    case 'FAILED':
      job.errors.push('Fatal ingestion constraint failure.');
      break;
  }

  job.executionTimeMs += (Date.now() - startTime);
}
