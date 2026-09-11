'use strict';

const {
  findExternalSourceLeakage,
  buildSourceNeutralPublicKnowledge
} = require('./public-knowledge-sanitizer');

const PRIVATE_KNOWLEDGE_KEYS = new Set([
  'source_evidence', 'validation_sources', 'source_claims', 'source_url',
  'source_publisher', 'source_id', 'source_hash', 'evidence_hash',
  'raw_source_text', 'source_text', 'article_text', 'provenance_map',
  'private_provenance', 'external_evidence'
]);

const SOURCE_ID_PATTERN = /\bfram_ld_\d+\b/gi;
const SOURCE_TOKEN_PATTERN = /\bFRAM\b|fram\.com/gi;
const SOURCE_URL_PATTERN = /https?:\/\/(?:www\.)?fram\.com\/[^\s)\]}]*/gi;

function sanitizePublicValue(value) {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(sanitizePublicValue);
  if (typeof value !== 'object') return value;

  const out = {};
  for (const [key, item] of Object.entries(value)) {
    if (PRIVATE_KNOWLEDGE_KEYS.has(key)) continue;
    out[key] = sanitizePublicValue(item);
  }
  return out;
}

function scanSourceSignatures(value) {
  const text = JSON.stringify(sanitizePublicValue(value));
  const violations = [];
  if (SOURCE_TOKEN_PATTERN.test(text)) violations.push('external source brand/domain present');
  SOURCE_TOKEN_PATTERN.lastIndex = 0;
  if (SOURCE_ID_PATTERN.test(text)) violations.push('private source identifier present');
  SOURCE_ID_PATTERN.lastIndex = 0;
  if (SOURCE_URL_PATTERN.test(text)) violations.push('private source URL present');
  SOURCE_URL_PATTERN.lastIndex = 0;
  violations.push(...findExternalSourceLeakage(sanitizePublicValue(value)));
  return [...new Set(violations)];
}

function validateUniversalPublicKnowledge(value, { requireCanonicalApproval = false } = {}) {
  const errors = scanSourceSignatures(value);
  if (requireCanonicalApproval && value && typeof value === 'object' && !Array.isArray(value)) {
    try {
      buildSourceNeutralPublicKnowledge(value);
    } catch (error) {
      errors.push(...(error.validation?.errors || [error.message]));
    }
  }
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

function buildUniversalPublicKnowledge(value, options = {}) {
  const canonical = options.requireCanonicalApproval
    ? buildSourceNeutralPublicKnowledge(value)
    : sanitizePublicValue(value);
  const validation = validateUniversalPublicKnowledge(canonical, { requireCanonicalApproval: false });
  if (!validation.valid) {
    const error = new Error(`Universal public knowledge blocked: ${validation.errors.join('; ')}`);
    error.code = 'UNIVERSAL_PUBLIC_KNOWLEDGE_BLOCKED';
    error.validation = validation;
    throw error;
  }
  return sanitizePublicValue(canonical);
}

function redactExternalKnowledgeSignatures(answerText = '') {
  let text = String(answerText || '');
  const violations = [];
  const replace = (pattern, rule) => {
    text = text.replace(pattern, () => {
      violations.push({ rule, reason: 'private external knowledge provenance surfaced in public output' });
      return '[fuente interna]';
    });
  };
  replace(SOURCE_URL_PATTERN, 'rule_10_external_source_must_not_surface_publicly');
  replace(SOURCE_ID_PATTERN, 'rule_10_external_source_must_not_surface_publicly');
  replace(SOURCE_TOKEN_PATTERN, 'rule_10_external_source_must_not_surface_publicly');
  return { text, violations };
}

module.exports = {
  PRIVATE_KNOWLEDGE_KEYS,
  sanitizePublicValue,
  scanSourceSignatures,
  validateUniversalPublicKnowledge,
  buildUniversalPublicKnowledge,
  redactExternalKnowledgeSignatures
};
