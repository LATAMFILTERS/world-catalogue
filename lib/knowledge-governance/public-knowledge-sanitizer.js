'use strict';

const EXTERNAL_SOURCE_TOKENS = Object.freeze([
  'FRAM',
  'fram.com',
  'www.fram.com'
]);

const EXTERNAL_URL_PATTERN = /https?:\/\/[^\s)\]}]+/gi;

function flattenPublicText(value, out = []) {
  if (value == null) return out;
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => flattenPublicText(item, out));
  else if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (['source_evidence','validation_sources','source_hash','source_url','source_publisher','evidence_hash'].includes(key)) continue;
      flattenPublicText(item, out);
    }
  }
  return out;
}

function findExternalSourceLeakage(value) {
  const text = flattenPublicText(value).join('\n');
  const violations = [];
  for (const token of EXTERNAL_SOURCE_TOKENS) {
    if (text.toLowerCase().includes(token.toLowerCase())) violations.push(`external source token present: ${token}`);
  }
  const urls = text.match(EXTERNAL_URL_PATTERN) || [];
  if (urls.length) violations.push(`external URLs present in public text: ${urls.length}`);
  return [...new Set(violations)];
}

function stripPrivateEvidence(record = {}) {
  const {
    source_evidence,
    validation_sources,
    source_claims,
    ...publicRecord
  } = record;
  return {
    ...publicRecord,
    source_evidence_count: Array.isArray(source_evidence) ? source_evidence.length : 0,
    validation_source_count: Array.isArray(validation_sources) ? validation_sources.length : 0
  };
}

function validateSourceNeutralPublicKnowledge(record = {}) {
  const errors = [];
  if (record.public_use_allowed !== true) errors.push('knowledge object is not approved for public use');
  if (record.publication_status !== 'approved' && record.publication_status !== 'published') {
    errors.push('knowledge object is not in an approved public publication state');
  }
  if (record.technology_relation === 'probable') errors.push('probable technology relationship cannot be public');
  if (record.application_relation === 'candidate') errors.push('candidate application relationship cannot be public');
  errors.push(...findExternalSourceLeakage(stripPrivateEvidence(record)));
  return { valid: errors.length === 0, errors };
}

function buildSourceNeutralPublicKnowledge(record = {}) {
  const validation = validateSourceNeutralPublicKnowledge(record);
  if (!validation.valid) {
    const error = new Error(`Public knowledge blocked: ${validation.errors.join('; ')}`);
    error.code = 'PUBLIC_KNOWLEDGE_BLOCKED';
    error.validation = validation;
    throw error;
  }
  return stripPrivateEvidence(record);
}

module.exports = {
  EXTERNAL_SOURCE_TOKENS,
  findExternalSourceLeakage,
  stripPrivateEvidence,
  validateSourceNeutralPublicKnowledge,
  buildSourceNeutralPublicKnowledge
};
