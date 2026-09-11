'use strict';

const crypto = require('crypto');
const { jobEvent } = require('./notification-events');

const VALID_TYPES = new Set(['JOB_STARTED','JOB_PROGRESS','JOB_COMPLETED','JOB_BLOCKED','JOB_FAILED']);

function createRunId(prefix = 'job') {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `${prefix}-${stamp}-${crypto.randomBytes(3).toString('hex')}`;
}

function createJobNotifier(options = {}) {
  const jobId = options.jobId || createRunId(options.jobKey || 'job');
  const module = options.module || 'HERMES';
  const baseTitle = options.title || options.jobKey || 'Technical job';
  const entityType = options.entityType || 'technical_job';
  const recipientKey = options.recipientKey || 'CEO';
  const deepLink = options.deepLink || null;
  const baseMetadata = { job_id: jobId, job_key: options.jobKey || null, ...(options.metadata || {}) };
  const emittedProgress = new Set();

  async function publish(type, title, message, context = {}) {
    const normalized = String(type || '').toUpperCase();
    if (!VALID_TYPES.has(normalized)) throw new Error(`Unsupported job notification type: ${normalized}`);
    const marker = context.marker == null ? normalized : `${normalized}:${context.marker}`;
    return jobEvent(normalized, module, title || baseTitle, message, {
      recipientKey,
      entityType,
      entityId: jobId,
      deepLink: context.deepLink || deepLink,
      dedupeKey: `${jobId}:${marker}`,
      metadata: {
        ...baseMetadata,
        ...(context.metadata || {}),
        event_type: normalized,
        emitted_at: new Date().toISOString(),
      },
    });
  }

  return {
    jobId,
    started(message, context) {
      return publish('JOB_STARTED', context?.title || `${baseTitle} iniciado`, message, context);
    },
    progress(percent, message, context = {}) {
      const milestone = Number(percent);
      if (![25, 50, 75].includes(milestone) || emittedProgress.has(milestone)) return Promise.resolve(null);
      emittedProgress.add(milestone);
      return publish('JOB_PROGRESS', context.title || `${baseTitle} ${milestone}%`, message, { ...context, marker: milestone, metadata: { percent: milestone, ...(context.metadata || {}) } });
    },
    completed(message, context) {
      return publish('JOB_COMPLETED', context?.title || `${baseTitle} completado`, message, context);
    },
    blocked(message, context) {
      return publish('JOB_BLOCKED', context?.title || `${baseTitle} bloqueado`, message, context);
    },
    failed(message, context) {
      return publish('JOB_FAILED', context?.title || `${baseTitle} falló`, message, context);
    },
  };
}

module.exports = { createJobNotifier, createRunId };
