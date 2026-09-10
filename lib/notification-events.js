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

module.exports = {
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