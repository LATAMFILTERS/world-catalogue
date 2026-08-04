'use strict';

const { normalizeReference } = require('../bot-protocol-catalog');

const VALID_LOOKUP_STATUS = Object.freeze([
  'validated',
  'not_found',
  'ambiguous',
  'database_unavailable',
  'insufficient_application_data'
]);

const VALID_QUERY_TYPES = Object.freeze(['exact_reference', 'cross_reference', 'application', 'system_category']);

function normalizeEquipment(value = {}) {
  return {
    brand: value.brand || null,
    model: value.model || null,
    engine: value.engine || null,
    year: value.year || null
  };
}

function createSkuAuthorityRecord(overrides = {}) {
  return {
    sku_validated_in_postgresql: overrides.sku_validated_in_postgresql === true,
    source_authority: overrides.source_authority === 'postgresql' ? 'postgresql' : null,
    lookup_status: VALID_LOOKUP_STATUS.includes(overrides.lookup_status) ? overrides.lookup_status : 'insufficient_application_data',
    query_type: VALID_QUERY_TYPES.includes(overrides.query_type) ? overrides.query_type : 'exact_reference',
    input_reference: overrides.input_reference || null,
    normalized_reference: overrides.normalized_reference || (overrides.input_reference ? normalizeReference(overrides.input_reference) : null),
    equipment: normalizeEquipment(overrides.equipment),
    validated_skus: Array.isArray(overrides.validated_skus) ? overrides.validated_skus : [],
    ambiguous_candidates: Array.isArray(overrides.ambiguous_candidates) ? overrides.ambiguous_candidates : [],
    query_timestamp: overrides.query_timestamp || new Date().toISOString(),
    evidence_count: Number.isFinite(overrides.evidence_count) ? overrides.evidence_count : (Array.isArray(overrides.validated_skus) ? overrides.validated_skus.length : 0)
  };
}

function validateSkuAuthorityRecord(record = {}) {
  const errors = [];
  if (!VALID_LOOKUP_STATUS.includes(record.lookup_status)) errors.push(`lookup_status must be one of: ${VALID_LOOKUP_STATUS.join(', ')}`);
  if (record.lookup_status === 'validated' && (!record.validated_skus || record.validated_skus.length === 0)) {
    errors.push('a "validated" record requires at least one entry in validated_skus');
  }
  return { valid: errors.length === 0, errors };
}

// The single authorization gate for citing a SKU: PostgreSQL must have
// validated it, the lookup must have actually completed successfully, and
// there must be at least one piece of evidence. Neither an ambiguous match
// nor a database outage nor a bare user-typed reference satisfies this.
function isValidatedSku(record = {}) {
  return record.sku_validated_in_postgresql === true &&
    record.source_authority === 'postgresql' &&
    record.lookup_status === 'validated' &&
    Number(record.evidence_count) > 0;
}

// A PostgreSQL outage or an unresolved reference still allows recommending
// a product *category* (no specific SKU) — this is what distinguishes
// "I don't know the exact filter" from "I can't help you at all".
function canRecommendCategoryOnly(record = {}) {
  return ['database_unavailable', 'not_found', 'ambiguous', 'insufficient_application_data'].includes(record.lookup_status);
}

// Converts the existing bot-protocol-catalog.js query result
// (`{ products, lookupStatus, matchType, error }`, sourced directly from
// PostgreSQL) into the canonical SKU authority shape. This is the only
// legitimate way validated_skus gets populated — Groq, HERMES and Obsidian
// output never flow through here.
function buildSkuAuthorityFromCatalogResult(catalogResult = {}, meta = {}) {
  const products = Array.isArray(catalogResult.products) ? catalogResult.products : [];
  const queryType = VALID_QUERY_TYPES.includes(meta.queryType) ? meta.queryType : 'exact_reference';

  if (catalogResult.lookupStatus === 'error') {
    return createSkuAuthorityRecord({
      lookup_status: 'database_unavailable',
      query_type: queryType,
      input_reference: meta.inputReference || null,
      equipment: meta.equipment,
      validated_skus: [],
      evidence_count: 0
    });
  }

  if (catalogResult.lookupStatus === 'not_required' || products.length === 0) {
    return createSkuAuthorityRecord({
      lookup_status: 'not_found',
      query_type: queryType,
      input_reference: meta.inputReference || null,
      equipment: meta.equipment,
      validated_skus: [],
      evidence_count: 0
    });
  }

  return createSkuAuthorityRecord({
    sku_validated_in_postgresql: true,
    source_authority: 'postgresql',
    lookup_status: 'validated',
    query_type: queryType,
    input_reference: meta.inputReference || null,
    equipment: meta.equipment,
    validated_skus: products.map(p => ({ sku: p.sku, codigo_base: p.codigo_base || null, filter_type: p.filter_type || null })),
    evidence_count: products.length
  });
}

// A SKU the customer typed in conversation is never validated on its own —
// it must still go through PostgreSQL before it can be cited back to them.
function buildSkuAuthorityFromUserClaim(reference, equipment = {}) {
  return createSkuAuthorityRecord({
    lookup_status: 'insufficient_application_data',
    query_type: 'exact_reference',
    input_reference: reference || null,
    equipment,
    validated_skus: [],
    evidence_count: 0
  });
}

module.exports = {
  VALID_LOOKUP_STATUS,
  VALID_QUERY_TYPES,
  createSkuAuthorityRecord,
  validateSkuAuthorityRecord,
  isValidatedSku,
  canRecommendCategoryOnly,
  buildSkuAuthorityFromCatalogResult,
  buildSkuAuthorityFromUserClaim
};
