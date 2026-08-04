'use strict';

const crypto = require('crypto');

const VALID_RESPONSE_STATUS = Object.freeze(['completed', 'partial', 'not_found', 'conflicting_sources', 'failed']);
const VALID_AUTHORITY_LEVEL = Object.freeze(['primary', 'secondary', 'tertiary']);
const VALID_CONFIDENCE = Object.freeze(['high', 'medium', 'low']);

function normalizeEquipment(value = {}) {
  return {
    brand: value.brand || null,
    model: value.model || null,
    engine: value.engine || null,
    year: value.year || null
  };
}

// A request TO HERMES — HERMES only ever researches, per the authority
// policy, so this shape carries no field capable of expressing approval.
function createHermesResearchRequest(input = {}) {
  return {
    research_request_id: input.research_request_id || crypto.randomUUID(),
    knowledge_gap_request_id: input.knowledge_gap_request_id || null,
    research_type: input.research_type || null,
    equipment: normalizeEquipment(input.equipment),
    system: input.system || null,
    component: input.component || null,
    research_question: input.research_question || '',
    required_source_types: Array.isArray(input.required_source_types) ? input.required_source_types : [],
    preferred_manufacturer_domains: Array.isArray(input.preferred_manufacturer_domains) ? input.preferred_manufacturer_domains : [],
    minimum_independent_sources: Number.isFinite(input.minimum_independent_sources) ? input.minimum_independent_sources : 1,
    allow_competitor_sources: input.allow_competitor_sources === true,
    allow_industry_sources: input.allow_industry_sources !== false,
    deadline: input.deadline || null,
    priority: input.priority || 'medium',
    requested_at: input.requested_at || new Date().toISOString()
  };
}

function validateHermesResearchRequest(request = {}) {
  const errors = [];
  if (!request.research_request_id) errors.push('research_request_id is required');
  if (!request.knowledge_gap_request_id) errors.push('knowledge_gap_request_id is required');
  if (!request.research_question) errors.push('research_question is required');
  return { valid: errors.length === 0, errors };
}

function normalizeSource(source = {}) {
  return {
    title: source.title || '',
    publisher: source.publisher || '',
    source_type: source.source_type || null,
    url: source.url || null,
    document_identifier: source.document_identifier || null,
    revision: source.revision || null,
    publication_date: source.publication_date || null,
    section: source.section || null,
    page: source.page ?? null,
    retrieved_at: source.retrieved_at || new Date().toISOString(),
    authority_level: VALID_AUTHORITY_LEVEL.includes(source.authority_level) ? source.authority_level : 'tertiary',
    confidence: VALID_CONFIDENCE.includes(source.confidence) ? source.confidence : 'low'
  };
}

// A response FROM HERMES. Deliberately has no `approved_for_bot_use` field
// anywhere in this shape — that authorization can only ever be granted by
// Obsidian, in a separate, later contract (obsidian-publication-contract).
function createHermesResearchResponse(input = {}) {
  const sources = Array.isArray(input.sources) ? input.sources.map(normalizeSource) : [];
  const status = VALID_RESPONSE_STATUS.includes(input.status) ? input.status : 'failed';
  const conflicts_detected = input.conflicts_detected === true;
  return {
    research_request_id: input.research_request_id || null,
    status,
    findings: Array.isArray(input.findings) ? input.findings : [],
    sources,
    conflicts_detected,
    conflicts: Array.isArray(input.conflicts) ? input.conflicts : [],
    confidence: VALID_CONFIDENCE.includes(input.confidence) ? input.confidence : 'low',
    answer_draft: input.answer_draft || null,
    // Always computed, never trusted from the caller.
    ready_for_obsidian_review: isReadyForObsidianReview({ sources, status, conflicts_detected }),
    completed_at: input.completed_at || new Date().toISOString()
  };
}

// Rule: a response without sources can never be ready for review.
// Rule: a response with detected conflicts can never auto-publish.
function isReadyForObsidianReview(response = {}) {
  if (!Array.isArray(response.sources) || response.sources.length === 0) return false;
  if (response.conflicts_detected) return false;
  return ['completed', 'partial'].includes(response.status);
}

// Intentionally hardcoded to false, always. HERMES output is never
// presented to the user directly and is never auto-published — the only
// legitimate next step for HERMES output is Obsidian review.
function canAutoPublish() {
  return false;
}

function validateHermesResearchResponse(response = {}) {
  const errors = [];
  if (!response.research_request_id) errors.push('research_request_id is required');
  if (!VALID_RESPONSE_STATUS.includes(response.status)) errors.push(`status must be one of: ${VALID_RESPONSE_STATUS.join(', ')}`);
  if (Object.prototype.hasOwnProperty.call(response, 'approved_for_bot_use')) {
    errors.push('a HERMES response must never carry approved_for_bot_use');
  }
  return { valid: errors.length === 0, errors };
}

module.exports = {
  VALID_RESPONSE_STATUS,
  VALID_AUTHORITY_LEVEL,
  VALID_CONFIDENCE,
  createHermesResearchRequest,
  validateHermesResearchRequest,
  createHermesResearchResponse,
  validateHermesResearchResponse,
  isReadyForObsidianReview,
  canAutoPublish
};
