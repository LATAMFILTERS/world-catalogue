/**
 * job-scheduler.ts
 * ELIMFILTERS — Data Factory v1.0
 *
 * Deterministically schedules and matches queues to execute pipelines.
 */

import type { JobAuditRecord, JobType } from './factory-types';
import { IMPORT_QUEUE } from './factory-queues';

export class JobScheduler {
  private scheduledJobs = new Map<string, JobAuditRecord>();

  scheduleJob(type: JobType, operator: string): JobAuditRecord {
    const jobId = `job-${type.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    const job: JobAuditRecord = {
      jobId,
      type,
      state: 'QUEUED',
      timestamp: new Date().toISOString(),
      operator,
      recordsProcessed: 0,
      accepted: 0,
      rejected: 0,
      warnings: [],
      errors: [],
      executionTimeMs: 0,
      rollbackAvailable: false,
    };

    this.scheduledJobs.set(jobId, job);
    IMPORT_QUEUE.enqueue(job); // Initial entry point

    return job;
  }

  getJob(jobId: string): JobAuditRecord | undefined {
    return this.scheduledJobs.get(jobId);
  }

  getAllJobs(): JobAuditRecord[] {
    return Array.from(this.scheduledJobs.values());
  }

  clear(): void {
    this.scheduledJobs.clear();
  }
}

export const JOB_SCHEDULER = new JobScheduler();
