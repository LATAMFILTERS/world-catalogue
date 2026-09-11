'use strict';

const crypto = require('crypto');

const VALID_REVIEW_STATUS = Object.freeze(['pending', 'approved', 'rejected', 'changes_requested']);

// pending -> approved | rejected | changes_requested
// changes_requested -> pending (resubmission)
// approved / rejected are terminal for review (publication itself is a
// separate, still-stubbed step below).
const ALLOWED_REVIEW_TRANSITIONS = Object.freeze({
  pending: Object.freeze(['approved', 'rejected', 'changes_requested']),
  changes_requested: Object.freeze(['pending']),
  approved: Object.freeze([]),
  rejected: Object.freeze([])
});

function normalizeEquipment(value = {}) {
  return {
    brand: value.brand || null,
    model: value.model || null,
    engine: value.engine || null,
    year: value.year || null
  };
}

// Source provenance is retained internally, but public reference is denied by
// default. A later public renderer must explicitly opt a reviewed source in;
// absence of a flag can never leak a publisher/URL into ELIMFILTERS content.
function normalizeApprovedSource(source = {}) {
  return {
    ...source,
    public_reference_allowed: source.public_reference_allowed === true
  };
}

function createPublicationRequest(input = {}) {
  return {
    publication_request_id: input.publication_request_id || crypto.randomUUID(),
    knowledge_gap_request_id: input.knowledge_gap_request_id || null,
    hermes_research_id: input.hermes_research_id || null,
    proposed_title: input.proposed_title || '',
    proposed_path: input.proposed_path || '',
    document_type: input.document_type || null,
    manufacturer: input.manufacturer || null,
    equipment: normalizeEquipment(input.equipment),
    knowledge_domain: input.knowledge_domain || null,
    industry: input.industry || null,
    system: input.system || null,
    technology: input.technology || null,
    component: input.component || null,
    approved_findings: Array.isArray(input.approved_findings) ? input.approved_findings : [],
    rejected_findings: Array.isArray(input.rejected_findings) ? input.rejected_findings : [],
    approved_sources: Array.isArray(input.approved_sources) ? input.approved_sources.map(normalizeApprovedSource) : [],
    public_source_policy: 'explicit_allow_only',
    reviewer: input.reviewer || null,
    review_status: 'pending',
    review_notes: input.review_notes || null,
    approved_at: null,
    published_document_id: null,
    published_at: null
  };
}

function validatePublicationRequest(request = {}) {
  const errors = [];
  if (!request.publication_request_id) errors.push('publication_request_id is required');
  if (!request.proposed_title) errors.push('proposed_title is required');
  if (!request.proposed_path) errors.push('proposed_path is required');
  if (!request.reviewer) errors.push('reviewer is required');
  if (request.public_source_policy !== 'explicit_allow_only') errors.push('public_source_policy must remain explicit_allow_only');
  if (request.review_status === 'approved' && request.approved_sources.length === 0) {
    errors.push('an approved publication request must carry at least one approved source');
  }
  return { valid: errors.length === 0, errors };
}

function buildPublicSourceReferences(request = {}) {
  if (!Array.isArray(request.approved_sources)) return [];
  return request.approved_sources
    .filter((source) => source && source.public_reference_allowed === true)
    .map((source) => ({
      title: source.title || '',
      publisher: source.publisher || '',
      url: source.url || null,
      source_type: source.source_type || null
    }));
}

function isValidReviewTransition(from, to) {
  return Array.isArray(ALLOWED_REVIEW_TRANSITIONS[from]) && ALLOWED_REVIEW_TRANSITIONS[from].includes(to);
}

function transitionReviewStatus(request, nextStatus, { reviewer, notes, at } = {}) {
  if (!isValidReviewTransition(request.review_status, nextStatus)) {
    throw new Error(`invalid obsidian review transition: ${request.review_status} -> ${nextStatus}`);
  }
  if (nextStatus === 'rejected' && !notes) {
    throw new Error('a rejected review requires review_notes explaining why');
  }
  const timestamp = at || new Date().toISOString();
  return {
    ...request,
    review_status: nextStatus,
    reviewer: reviewer || request.reviewer,
    review_notes: notes !== undefined ? notes : request.review_notes,
    approved_at: nextStatus === 'approved' ? timestamp : request.approved_at
  };
}

// Adapter STUB ONLY — no real Obsidian write happens in this phase. This
// function must never claim success; it always reports that nothing was
// actually published, regardless of input. Wiring a real Obsidian writer is
// explicitly out of scope for this block.
function publishToObsidianStub(request) {
  if (!request || request.review_status !== 'approved') {
    return { published: false, reason: 'not_approved', published_document_id: null, published_at: null };
  }
  return {
    published: false,
    reason: 'obsidian_write_not_implemented',
    published_document_id: null,
    published_at: null
  };
}

module.exports = {
  VALID_REVIEW_STATUS,
  ALLOWED_REVIEW_TRANSITIONS,
  createPublicationRequest,
  validatePublicationRequest,
  buildPublicSourceReferences,
  isValidReviewTransition,
  transitionReviewStatus,
  publishToObsidianStub
};
