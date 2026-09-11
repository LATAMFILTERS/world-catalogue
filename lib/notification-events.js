'use strict';

const { safeNotify } = require('./native-notifications');

function emit(type, module, priority, title, message, context = {}) {
  return safeNotify({
    notificationType: type,
    module,
    priority,
    title,
    message,
    recipientKey: context.recipientKey || 'CEO',
    entityType: context.entityType || null,
    entityId: context.entityId || null,
    deepLink: context.deepLink || null,
    dedupeKey: context.dedupeKey || null,
    metadata: { category: module, ...(context.metadata || {}) },
  });
}

const JOB_PRIORITIES = {
  JOB_STARTED: 'INFO',
  JOB_PROGRESS: 'INFO',
  JOB_COMPLETED: 'INFO',
  JOB_BLOCKED: 'HIGH',
  JOB_FAILED: 'CRITICAL',
};

module.exports = {
  jobEvent: (type, module, title, message, context) => {
    const normalized = String(type || '').toUpperCase();
    const priority = JOB_PRIORITIES[normalized];
    if (!priority) throw new Error(`Unsupported job event type: ${normalized}`);
    return emit(normalized, module || 'HERMES', priority, title, message, context);
  },
  hermesResearch: (title, message, context) => emit('HERMES_RESEARCH','HERMES','INFO',title,message,context),
  hermesHealth: (title, message, context) => emit('HERMES_HEALTH','HERMES','HIGH',title,message,context),
  catalogGap: (title, message, context) => emit('CATALOG_GAP','CATALOG','HIGH',title,message,context),
  technologyConflict: (title, message, context) => emit('TECHNOLOGY_CONFLICT','CATALOG','HIGH',title,message,context),
  weakCrossReference: (title, message, context) => emit('CROSS_REFERENCE_WEAK','CATALOG','WARNING',title,message,context),
  applicationGap: (title, message, context) => emit('APPLICATION_GAP','CATALOG','WARNING',title,message,context),
  partSearchError: (title, message, context) => emit('PART_SEARCH_ERROR','PART_SEARCH','CRITICAL',title,message,context),
  siteHealth: (title, message, context) => emit('SITE_HEALTH','WEBSITE','CRITICAL',title,message,context),
  knowledgeReview: (title, message, context) => emit('KNOWLEDGE_REVIEW','KNOWLEDGE_CENTER','INFO',title,message,context),
  nodalReview: (title, message, context) => emit('NODAL_REVIEW','NODAL_CENTER','INFO',title,message,context),
  deployFailure: (title, message, context) => emit('DEPLOY_FAILURE','SYSTEM','CRITICAL',title,message,context),
  rollback: (title, message, context) => emit('ROLLBACK','SYSTEM','HIGH',title,message,context),
};
