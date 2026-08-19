'use strict';

const crypto = require('crypto');

const VALID_REQUEST_TYPES = Object.freeze([
  'oem_maintenance_interval',
  'oem_service_procedure',
  'technical_specification',
  'filter_application',
  'industry_standard',
  'competitor_intelligence',
  'technical_conflict',
  'missing_manual',
  'other'
]);

const VALID_ORIGINS = Object.freeze(['bot_orchestrator', 'obsidian', 'human', 'coverage_audit']);

const VALID_STATUSES = Object.freeze([
  'detected',
  'queued_for_hermes',
  'researching',
  'researched',
  'awaiting_review',
  'approved_for_obsidian',
  'published_in_obsidian',
  'rejected',
  'closed'
]);

const VALID_PRIORITIES = Object.freeze(['critical', 'high', 'medium', 'low']);

// Strict forward path: detected -> ... -> closed, with a single reviewed
// escape hatch (awaiting_review -> rejected) that can be re-queued.
const ALLOWED_TRANSITIONS = Object.freeze({
  detected: Object.freeze(['queued_for_hermes']),
  queued_for_hermes: Object.freeze(['researching']),
  researching: Object.freeze(['researched']),
  researched: Object.freeze(['awaiting_review']),
  awaiting_review: Object.freeze(['approved_for_obsidian', 'rejected']),
  approved_for_obsidian: Object.freeze(['published_in_obsidian']),
  published_in_obsidian: Object.freeze(['closed']),
  rejected: Object.freeze(['queued_for_hermes', 'closed']),
  closed: Object.freeze([])
});

function normalizeEquipment(value = {}) {
  return {
    brand: value.brand || null,
    model: value.model || null,
    engine: value.engine || null,
    year: value.year || null
  };
}

function buildDeduplicationKey({ request_type, equipment = {}, system, component, question } = {}) {
  const eq = normalizeEquipment(equipment);
  const questionKey = String(question || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 80);
  return [
    request_type || 'na',
    eq.brand || 'na',
    eq.model || 'na',
    eq.engine || 'na',
    eq.year || 'na',
    system || 'na',
    component || 'na',
    questionKey || 'na'
  ].join(':').toLowerCase();
}

function isValidKnowledgeGapTransition(from, to) {
  return Array.isArray(ALLOWED_TRANSITIONS[from]) && ALLOWED_TRANSITIONS[from].includes(to);
}

function createKnowledgeGap(input = {}) {
  const now = input.now || new Date().toISOString();
  const equipment = normalizeEquipment(input.equipment);
  const gap = {
    request_id: input.request_id || crypto.randomUUID(),
    request_type: VALID_REQUEST_TYPES.includes(input.request_type) ? input.request_type : 'other',
    origin: VALID_ORIGINS.includes(input.origin) ? input.origin : 'bot_orchestrator',
    status: 'detected',
    priority: VALID_PRIORITIES.includes(input.priority) ? input.priority : 'medium',
    equipment,
    system: input.system || null,
    component: input.component || null,
    question: input.question || '',
    reason: input.reason || '',
    source_required: input.source_required !== false,
    requested_by: input.requested_by || 'bot_orchestrator',
    conversation_id: input.conversation_id || null,
    channel: input.channel || null,
    deduplication_key: input.deduplication_key || buildDeduplicationKey({ request_type: input.request_type, equipment, system: input.system, component: input.component, question: input.question }),
    occurrences: 1,
    first_detected_at: now,
    last_detected_at: now,
    assigned_to: null,
    hermes_research_id: null,
    obsidian_document_id: null,
    resolution_summary: null,
    audit_history: [{ status: 'detected', at: now }]
  };
  return gap;
}

function validateKnowledgeGap(gap = {}) {
  const errors = [];
  if (!gap.request_id) errors.push('request_id is required');
  if (!VALID_REQUEST_TYPES.includes(gap.request_type)) errors.push(`request_type must be one of: ${VALID_REQUEST_TYPES.join(', ')}`);
  if (!VALID_ORIGINS.includes(gap.origin)) errors.push(`origin must be one of: ${VALID_ORIGINS.join(', ')}`);
  if (!VALID_STATUSES.includes(gap.status)) errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  if (!VALID_PRIORITIES.includes(gap.priority)) errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  if (!gap.question) errors.push('question is required');
  if (!gap.reason) errors.push('reason is required');
  if (!gap.requested_by) errors.push('requested_by is required');
  if (!gap.deduplication_key) errors.push('deduplication_key is required');
  return { valid: errors.length === 0, errors };
}

// Merges an incoming duplicate report into the existing gap: bumps
// occurrences, extends last_detected_at, preserves first_detected_at and
// history — never regresses status.
function mergeDuplicateKnowledgeGap(existing, incoming = {}) {
  if (!existing) return createKnowledgeGap(incoming);
  const now = incoming.now || new Date().toISOString();
  return {
    ...existing,
    occurrences: (existing.occurrences || 1) + 1,
    last_detected_at: now,
    priority: VALID_PRIORITIES.indexOf(incoming.priority) >= 0 && VALID_PRIORITIES.indexOf(incoming.priority) < VALID_PRIORITIES.indexOf(existing.priority)
      ? incoming.priority
      : existing.priority,
    audit_history: [...existing.audit_history, { status: existing.status, at: now, note: 'duplicate_occurrence' }]
  };
}

// Throws on an invalid transition (a status jump like detected ->
// published_in_obsidian is a programming error, not a recoverable one).
// `rejected` requires an explicit reason.
function transitionKnowledgeGapStatus(gap, nextStatus, { reason, at, assigned_to, hermes_research_id, obsidian_document_id, resolution_summary } = {}) {
  if (!isValidKnowledgeGapTransition(gap.status, nextStatus)) {
    throw new Error(`invalid knowledge gap transition: ${gap.status} -> ${nextStatus}`);
  }
  if (nextStatus === 'rejected' && !reason) {
    throw new Error('a rejected transition requires an explicit reason');
  }
  const timestamp = at || new Date().toISOString();
  return {
    ...gap,
    status: nextStatus,
    last_detected_at: timestamp,
    assigned_to: assigned_to !== undefined ? assigned_to : gap.assigned_to,
    hermes_research_id: hermes_research_id !== undefined ? hermes_research_id : gap.hermes_research_id,
    obsidian_document_id: obsidian_document_id !== undefined ? obsidian_document_id : gap.obsidian_document_id,
    resolution_summary: resolution_summary !== undefined ? resolution_summary : gap.resolution_summary,
    audit_history: [...gap.audit_history, { status: nextStatus, at: timestamp, reason: reason || null }]
  };
}

module.exports = {
  VALID_REQUEST_TYPES,
  VALID_ORIGINS,
  VALID_STATUSES,
  VALID_PRIORITIES,
  ALLOWED_TRANSITIONS,
  buildDeduplicationKey,
  isValidKnowledgeGapTransition,
  createKnowledgeGap,
  validateKnowledgeGap,
  mergeDuplicateKnowledgeGap,
  transitionKnowledgeGapStatus
};
