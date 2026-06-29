/**
 * factory-queues.ts
 * ELIMFILTERS — Data Factory v1.0
 *
 * Implements queues for the various stages of the ingestion and processing flow.
 */

import type { JobAuditRecord } from './factory-types';

export class FactoryQueue {
  private queue: JobAuditRecord[] = [];

  enqueue(job: JobAuditRecord): void {
    this.queue.push(job);
  }

  dequeue(): JobAuditRecord | undefined {
    return this.queue.shift();
  }

  peek(): JobAuditRecord | undefined {
    return this.queue[0];
  }

  remove(jobId: string): boolean {
    const initialLen = this.queue.length;
    this.queue = this.queue.filter(j => j.jobId !== jobId);
    return this.queue.length < initialLen;
  }

  getAll(): JobAuditRecord[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
  }

  get size(): number {
    return this.queue.length;
  }
}

// Global factory queue instances
export const IMPORT_QUEUE = new FactoryQueue();
export const VALIDATION_QUEUE = new FactoryQueue();
export const REVIEW_QUEUE = new FactoryQueue();
export const APPROVAL_QUEUE = new FactoryQueue();
export const PUBLICATION_QUEUE = new FactoryQueue();
