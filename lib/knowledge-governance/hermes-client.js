'use strict';

// Real HERMES research client (Bloque 2, spec section 4).
//
// There is no separate "HERMES" HTTP service in this repository — the
// scripts/hermes/*.mjs pipeline found during the architecture audit is an
// unrelated, offline content pipeline for the marketing Knowledge System
// pages (writes Markdown into elimfilters-vault/, reviewed by weekly
// email); it has no request/response API surface a chatbot could call.
// The REAL, already-deployed research/case-tracking backend for bot
// diagnostics is services/knowledge-center-api's candidate_cases workflow,
// already called from lib/bot-protocol-knowledge-engine.js's
// createCandidateCase. This module reuses that exact call (no duplicated
// HTTP client) and adds what was missing: an explicit enable/disable gate,
// an idempotency key derived from the knowledge gap's own deduplication
// key, and a short limited retry.

const crypto = require('crypto');
const { createCandidateCase } = require('../bot-protocol-knowledge-engine');

const VALID_STATUS = Object.freeze(['accepted', 'duplicate', 'unavailable', 'rejected']);

const PRIORITY_MAP = Object.freeze({ critical: 'CRITICAL', high: 'HIGH', medium: 'NORMAL', low: 'LOW' });

function mapPriority(priority) {
  return PRIORITY_MAP[priority] || 'NORMAL';
}

function buildIdempotencyKey(knowledgeGap, requestId) {
  const seed = knowledgeGap?.deduplication_key || requestId || crypto.randomUUID();
  return `BOT-GAP-${crypto.createHash('sha1').update(String(seed)).digest('hex').slice(0, 20)}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// createHermesResearchRequest({ knowledgeGap, researchRequest, requestId,
//   conversationId }) -> { status, hermes_research_id, queue_status,
//   submitted_at, error_code }
//
// Rules enforced here (see spec section 4):
// - HERMES_REQUESTS_ENABLED must be exactly 'true', or no network call is
//   made at all — default is "do not send".
// - A knowledge gap that already carries a hermes_research_id is treated
//   as an existing request, not resent (defense-in-depth: the orchestrator
//   is expected to check lib/knowledge-governance/knowledge-gap-store.js
//   for this first, but this function never trusts that alone).
// - Only equipment, system, component, question, priority and required
//   source types are sent — never full conversation history, never
//   secrets/credentials.
// - A single limited retry on a failed attempt (the call is idempotent by
//   externalId, so retrying is safe).
// - HERMES never replies to this call with anything resembling an
//   approved answer — the response is a submission acknowledgement only.
async function createHermesResearchRequest({ knowledgeGap, researchRequest, requestId, conversationId } = {}) {
  if (!knowledgeGap || !knowledgeGap.question) {
    return { status: 'rejected', hermes_research_id: null, queue_status: null, submitted_at: null, error_code: 'invalid_knowledge_gap' };
  }

  if (knowledgeGap.hermes_research_id) {
    return { status: 'duplicate', hermes_research_id: knowledgeGap.hermes_research_id, queue_status: 'existing', submitted_at: null, error_code: null };
  }

  if (process.env.HERMES_REQUESTS_ENABLED !== 'true') {
    return { status: 'unavailable', hermes_research_id: null, queue_status: null, submitted_at: null, error_code: 'hermes_requests_disabled' };
  }

  if (!process.env.KNOWLEDGE_CENTER_API_URL || !process.env.KNOWLEDGE_CENTER_API_KEY) {
    return { status: 'unavailable', hermes_research_id: null, queue_status: null, submitted_at: null, error_code: 'hermes_not_configured' };
  }

  const externalId = buildIdempotencyKey(knowledgeGap, requestId);
  const sessionId = String(conversationId || requestId || 'bot-orchestrator');
  const message = String(researchRequest?.research_question || knowledgeGap.question || '').slice(0, 500);
  const state = { equipment: knowledgeGap.equipment || {}, intent: knowledgeGap.request_type || null };
  const structuredIntake = {
    request_type: knowledgeGap.request_type,
    system: knowledgeGap.system || null,
    component: knowledgeGap.component || null,
    reason: knowledgeGap.reason,
    deduplication_key: knowledgeGap.deduplication_key,
    required_source_types: Array.isArray(researchRequest?.required_source_types) ? researchRequest.required_source_types : [],
    minimum_independent_sources: Number.isFinite(researchRequest?.minimum_independent_sources) ? researchRequest.minimum_independent_sources : 1
  };

  const attempt = () => createCandidateCase(message, sessionId, 'knowledge_governance', state, {
    priority: mapPriority(knowledgeGap.priority),
    externalId,
    structuredIntake
  });

  let result = await attempt();
  if (!result) {
    await sleep(300);
    result = await attempt();
  }

  if (!result || !result.id) {
    return { status: 'unavailable', hermes_research_id: null, queue_status: null, submitted_at: null, error_code: 'hermes_request_failed' };
  }

  return {
    status: 'accepted',
    hermes_research_id: result.id,
    queue_status: result.status || 'CAPTURED',
    submitted_at: new Date().toISOString(),
    error_code: null
  };
}

module.exports = { VALID_STATUS, createHermesResearchRequest };
