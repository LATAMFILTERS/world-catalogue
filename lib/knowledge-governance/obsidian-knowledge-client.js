'use strict';

// Obsidian-authorized-knowledge adapter (Bloque 2, spec section 2).
//
// Architecture note (see docs/KNOWLEDGE_PIPELINE_OPERATIONS.md for the full
// write-up): this codebase has no literal Obsidian REST/plugin integration.
// What it DOES have is services/knowledge-engine-runtime, a real deployed
// service whose retrieval query is HARD-FILTERED at the SQL level to
// `knowledge_center.knowledge_records` rows where
// `production_eligible = true AND lifecycle_status IN ('APPROVED','CURRENT',
// 'LIMITED_USE')`, and whose citations carry real recordId/versionId/
// sourceId provenance. That is exactly the "metadata de fuente y
// aprobaciÃ³n" this spec requires before something can be treated as
// Obsidian-authorized â€” it is demonstrated, not assumed. This module wraps
// that existing, already-deployed client (lib/bot-protocol-knowledge-
// engine.js's queryKnowledgeEngine, reused as-is â€” not duplicated) and
// normalizes its response into Bloque 1's technical-evidence contract.
//
// Known limitation (documented per spec instruction, not hidden): the
// runtime's public citation shape does not expose authority_level or
// record_type directly, so source_type here is inferred from the citation
// label via a conservative heuristic, and confidence is bucketed from the
// runtime's numeric score. A citation with no source_id is never treated as
// approved (isApprovedTechnicalEvidence requires one) â€” see
// isReadyForObsidianReview-style traceability requirement in
// hermes-research-contract.js for the same principle applied to HERMES.

const { queryKnowledgeEngine } = require('../bot-protocol-knowledge-engine');
const { sanitizeTechnicalEvidence } = require('./technical-evidence-contract');
const { buildCanonicalKnowledgeAnswer } = require('./canonical-knowledge-repository');

const VALID_STATUS = Object.freeze([
  'validated',
  'not_found',
  'insufficient_equipment_data',
  'conflicting_sources',
  'unavailable'
]);

function inferSourceType(label) {
  const text = String(label || '').toLowerCase();
  if (/manual|owner'?s|service\s+manual/.test(text)) return 'oem_manual';
  if (/bolet[iÃ­]n|bulletin|\btsb\b/.test(text)) return 'service_bulletin';
  if (/\biso\b|\bsae\b|\bastm\b|\bnfpa\b|norma|standard|est[aÃ¡]ndar/.test(text)) return 'technical_standard';
  return 'approved_internal_document';
}

function confidenceBand(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 'low';
  if (n >= 0.85) return 'high';
  if (n >= 0.72) return 'medium';
  return 'low';
}

// A citation with no sourceId lacks the traceability isApprovedTechnicalEvidence
// requires, so it can never become approved evidence â€” it is simply dropped,
// never coerced into looking approved.
function citationToEvidence(citation, { equipment, system, confidence, extractedStatement, retrievedAt }) {
  if (!citation || typeof citation.sourceId !== 'string' || !citation.sourceId.trim()) return null;
  return sanitizeTechnicalEvidence({
    technical_source_validated: true,
    source_authority: 'obsidian',
    source_id: citation.sourceId,
    source_title: citation.label || null,
    source_type: inferSourceType(citation.label),
    equipment,
    system: system || null,
    extracted_statement: extractedStatement || null,
    approved_for_bot_use: true,
    approved_at: retrievedAt,
    approved_by: 'knowledge_center_production_eligibility_gate',
    confidence: confidenceBand(confidence),
    conflicts_detected: false,
    retrieved_at: retrievedAt
  });
}

function emptyResult(status, latency_ms) {
  return {
    status,
    answer: null,
    evidence: [],
    oem_maintenance: null,
    general_approved_practices: [],
    source_count: 0,
    conflicts_detected: status === 'conflicting_sources',
    latency_ms
  };
}

// queryApprovedTechnicalKnowledge({ question, equipment, system, component,
//   intent, conversationId, requestId }) -> normalized result (see spec
// section 2 for the exact response shape). Never throws â€” a timeout,
// missing configuration, or upstream error all resolve to status
// 'unavailable' so the orchestrator can register a knowledge gap instead of
// crashing the conversation.
async function queryApprovedTechnicalKnowledge({
  question,
  equipment = {},
  system = null,
  component = null,
  intent = null,
  conversationId = null,
  requestId = null
} = {}) {
  const startedAt = Date.now();
  const trimmedQuestion = String(question || '').trim();
  if (!trimmedQuestion) {
    return emptyResult('insufficient_equipment_data', Date.now() - startedAt);
  }

  const equipmentSpecific = Boolean(equipment && (equipment.brand || equipment.model || equipment.engine || equipment.year));
  const asksApplicationSpecificValue = /\b(intervalo?s?|cada|cambio|kil[oó]metros?|meses?|compatib|equivalen|referencia|medidas?|presi[oó]n|par de apriete|torque|miles?|kilometers?|\bkm\b|months?|psi|part\s*(?:number|no\.?|#)|sku|oem|cross[- ]?reference|fitment)\b/i.test(trimmedQuestion);
  if (!(equipmentSpecific && asksApplicationSpecificValue)) {
    const canonical = buildCanonicalKnowledgeAnswer(trimmedQuestion, equipment);
    if (canonical) {
      const retrievedAt = new Date().toISOString();
      const evidence = sanitizeTechnicalEvidence({
        technical_source_validated: true,
        source_authority: 'obsidian',
        source_id: canonical.sourceId,
        source_title: `ELIMFILTERS Canonical Knowledge — ${canonical.record.title}`,
        source_type: 'approved_internal_document',
        equipment,
        system: system || null,
        extracted_statement: canonical.answer,
        approved_for_bot_use: true,
        approved_at: retrievedAt,
        approved_by: 'nodal_center_canonical_promotion_gate',
        confidence: 'high',
        conflicts_detected: false,
        retrieved_at: retrievedAt
      });
      return {
        status: 'validated',
        answer: canonical.answer,
        evidence: [evidence],
        oem_maintenance: null,
        general_approved_practices: [],
        source_count: 1,
        conflicts_detected: false,
        latency_ms: Date.now() - startedAt,
        canonical_authority: '13-canonical-knowledge'
      };
    }
  }
  const requestBody = {
    conversation_id: conversationId || requestId || null,
    channel: 'knowledge_governance'
  };
  const state = { equipment, intent: intent || null, system, component };

  let raw;
  try {
    raw = await queryKnowledgeEngine(trimmedQuestion, requestBody, state, null);
  } catch (error) {
    console.error('[obsidian-knowledge-client]', error.message);
    return emptyResult('unavailable', Date.now() - startedAt);
  }

  const latency_ms = Date.now() - startedAt;

  if (raw.status === 'not_configured' || raw.status === 'timeout' || raw.status === 'error') {
    return emptyResult('unavailable', latency_ms);
  }

  const retrievedAt = new Date().toISOString();
  const citations = Array.isArray(raw.citations) ? raw.citations : [];
  const evidence = citations
    .map(citation => citationToEvidence(citation, { equipment, system, confidence: raw.confidence, extractedStatement: raw.answer, retrievedAt }))
    .filter(Boolean);

  // ANSWER is a control decision, not a substitute for a valid payload.
  // Reuse the existing medium/high confidence bands (medium starts at 0.72).
  const answer = typeof raw.answer === 'string' ? raw.answer.trim() : '';
  const confidence = raw.confidence;
  const confidenceValid = typeof confidence === 'number' && Number.isFinite(confidence)
    && confidence >= 0 && confidence <= 1 && confidenceBand(confidence) !== 'low';
  // Citations expose provenance but no source equipment/application mapping.
  // A numeric application value cannot inherit applicability from the request.
  const hasApplicationValue = /\b\d+(?:[.,]\d+)?\s*(?:horas?|hours?|hrs?|km|kil[oó]metros?|kilometers?|millas?|miles?|meses?|months?|psi|bar|kpa|mpa|nm|n[·.]m|mm|micras?|microns?|inches?|pulgadas?)\b/i.test(answer);
  if (raw.action === 'ANSWER' && asksApplicationSpecificValue && hasApplicationValue) {
    return { ...emptyResult('not_found', latency_ms), applicability_status: 'not_verified' };
  }
  if (raw.action === 'ANSWER' && answer && confidenceValid && evidence.length) {
    return {
      status: 'validated',
      answer,
      evidence,
      oem_maintenance: null,
      general_approved_practices: [],
      source_count: evidence.length,
      conflicts_detected: false,
      latency_ms
    };
  }

  if (raw.action === 'VERIFY') {
    return {
      status: 'conflicting_sources',
      answer: null,
      evidence,
      oem_maintenance: null,
      general_approved_practices: [],
      source_count: evidence.length,
      conflicts_detected: true,
      latency_ms
    };
  }

  if (raw.action === 'STOP') {
    return emptyResult('unavailable', latency_ms);
  }

  // ESCALATE, or an ANSWER with no traceable citation: no approved,
  // sufficiently-sourced knowledge matched this question.
  return emptyResult('not_found', latency_ms);
}

module.exports = { VALID_STATUS, queryApprovedTechnicalKnowledge };
