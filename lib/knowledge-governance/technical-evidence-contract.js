'use strict';

const { canPublishTechnicalFact } = require('./authority-policy');

const VALID_SOURCE_TYPES = Object.freeze([
  'oem_manual',
  'service_bulletin',
  'technical_standard',
  'approved_internal_document'
]);

const VALID_CONFIDENCE = Object.freeze(['high', 'medium', 'low']);

function normalizeEquipment(value = {}) {
  return {
    brand: value.brand || null,
    model: value.model || null,
    engine: value.engine || null,
    year: Number.isFinite(value.year) ? value.year : (value.year ? Number(value.year) || null : null)
  };
}

// Normalizes an arbitrary/untrusted object into the canonical technical
// evidence shape. This performs NO approval logic — it only fills in a safe,
// fully-populated shape so downstream code never has to guard against
// missing keys. Anything not explicitly marked approved stays unapproved.
function sanitizeTechnicalEvidence(raw = {}) {
  return {
    technical_source_validated: raw.technical_source_validated === true,
    source_authority: raw.source_authority === 'obsidian' ? 'obsidian' : null,
    source_id: raw.source_id || null,
    source_title: raw.source_title || null,
    source_type: VALID_SOURCE_TYPES.includes(raw.source_type) ? raw.source_type : null,
    manufacturer: raw.manufacturer || null,
    equipment: normalizeEquipment(raw.equipment),
    system: raw.system || null,
    document_revision: raw.document_revision || null,
    publication_date: raw.publication_date || null,
    section: raw.section || null,
    page: raw.page ?? null,
    extracted_statement: raw.extracted_statement || null,
    approved_for_bot_use: raw.approved_for_bot_use === true,
    approved_at: raw.approved_at || null,
    approved_by: raw.approved_by || null,
    confidence: VALID_CONFIDENCE.includes(raw.confidence) ? raw.confidence : null,
    conflicts_detected: raw.conflicts_detected === true,
    conflicting_sources: Array.isArray(raw.conflicting_sources) ? raw.conflicting_sources : [],
    retrieved_at: raw.retrieved_at || null
  };
}

// The one explicit, safe way to build evidence that is guaranteed to be
// unapproved — used for anything originating from Groq, HERMES raw output,
// unreviewed web search, conversational memory, orchestrator inference, or
// the PostgreSQL catalog. Approval fields are always forced false/null here
// regardless of what the caller passes, so this constructor can never be
// used to accidentally mark something approved.
function buildUnvalidatedEvidence(overrides = {}) {
  return sanitizeTechnicalEvidence({
    ...overrides,
    technical_source_validated: false,
    source_authority: null,
    approved_for_bot_use: false,
    approved_at: null,
    approved_by: null
  });
}

function equipmentSufficientlyIdentified(equipment = {}) {
  return Boolean(equipment && equipment.brand);
}

// Structural validation only — does not decide whether the evidence is
// *approved*, only whether the shape is well-formed enough to reason about.
function validateTechnicalEvidence(evidence = {}) {
  const errors = [];
  if (evidence.source_authority && evidence.source_authority !== 'obsidian') {
    errors.push('source_authority must be "obsidian" or null');
  }
  if (evidence.source_type && !VALID_SOURCE_TYPES.includes(evidence.source_type)) {
    errors.push(`source_type must be one of: ${VALID_SOURCE_TYPES.join(', ')}`);
  }
  if (evidence.confidence && !VALID_CONFIDENCE.includes(evidence.confidence)) {
    errors.push(`confidence must be one of: ${VALID_CONFIDENCE.join(', ')}`);
  }
  if (evidence.approved_for_bot_use === true && !evidence.source_id) {
    errors.push('approved evidence must carry a source_id');
  }
  return { valid: errors.length === 0, errors };
}

// The mandatory gate for citing ANY approved technical fact, per the spec:
// technical_source_validated === true AND source_authority === "obsidian"
// AND approved_for_bot_use === true AND source_type valid AND source_id
// present AND equipment sufficiently identified.
function isApprovedTechnicalEvidence(evidence = {}) {
  if (!validateTechnicalEvidence(evidence).valid) return false;
  if (!VALID_SOURCE_TYPES.includes(evidence.source_type)) return false;
  if (!evidence.source_id) return false;
  if (!equipmentSufficientlyIdentified(evidence.equipment)) return false;
  return canPublishTechnicalFact(evidence);
}

// Same gate, plus: OEM maintenance evidence for a different piece of
// equipment (mismatched year outside the evidence's stated range) is not
// applicable, even if otherwise approved.
function isApprovedOemMaintenanceEvidence(evidence = {}, targetEquipment = {}) {
  if (!isApprovedTechnicalEvidence(evidence)) return false;
  const evidenceYear = evidence.equipment?.year;
  const targetYear = targetEquipment?.year;
  if (evidenceYear && targetYear && Number(evidenceYear) !== Number(targetYear)) return false;
  return true;
}

module.exports = {
  VALID_SOURCE_TYPES,
  VALID_CONFIDENCE,
  sanitizeTechnicalEvidence,
  buildUnvalidatedEvidence,
  validateTechnicalEvidence,
  isApprovedTechnicalEvidence,
  isApprovedOemMaintenanceEvidence
};
