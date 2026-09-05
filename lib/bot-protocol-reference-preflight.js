'use strict';

const crypto = require('crypto');
const { extractReferences, searchByReferences } = require('./bot-protocol-catalog');
const { memoryKey, loadMemory, normalizeState } = require('./bot-protocol-memory');

const EXPLICIT_LOOKUP_PATTERN = /\b(?:equivalente|equivalencia|cruce|cross\s*reference|crossref|buscar|busca|busco|consulta|consultar|lookup|referencia|reemplaza|sustituye|reemplazo)\b/i;
const SPEC_PATTERN = /\b(?:especificaci[oó]n|medida|dimensi[oó]n|rosca|altura|di[aá]metro|micra|beta|caudal)\b/i;

function inferIntent(message) {
  if (SPEC_PATTERN.test(message)) return 'specification_lookup';
  if (EXPLICIT_LOOKUP_PATTERN.test(message)) return 'cross_reference_lookup';
  return 'exact_reference_lookup';
}

function activeDiagnostic(state) {
  return state?.intent === 'diagnostic' && (
    Boolean(state?.pendingField)
    || state?.phase === 'collecting_diagnostic_data'
    || state?.phase === 'diagnostic_assessment'
  );
}

function shouldPreflight(message, state, references) {
  if (!references.length) return false;
  if (!activeDiagnostic(state)) return true;
  return EXPLICIT_LOOKUP_PATTERN.test(message) || SPEC_PATTERN.test(message);
}

function basePayload({ body, state, references, lookupStatus, products = [], matchType = null }) {
  const intent = inferIntent(String(body.message || ''));
  return {
    protocol_version: '3.5.0',
    request_id: crypto.randomUUID(),
    intent,
    phase: 'catalog_resolution',
    state,
    pending_field: null,
    evidence: {
      source: 'elimfilters_catalog',
      count: products.length,
      validated: false,
      lookup_status: lookupStatus,
      match_type: matchType,
      references,
      products
    },
    intelligence: {
      classifier: 'deterministic_reference_preflight',
      groq_enabled: false,
      knowledge_status: 'skipped',
      knowledge_source_count: 0,
      knowledge_conflicts_detected: false,
      clarification_reason: null
    },
    knowledge_governance: {
      safe_to_publish: lookupStatus === 'not_found' || lookupStatus === 'ambiguous' || lookupStatus === 'database_unavailable',
      technical_source_validated: false,
      oem_maintenance_found: false,
      knowledge_gap_registered: false,
      hermes_request_created: false,
      sku_validated_in_postgresql: false,
      authority_violation_count: 0
    },
    deterministic_router: {
      matched: true,
      source: 'reference_preflight_fail_closed',
      references
    },
    governance: {
      reference_preflight: true,
      llm_bypassed: true
    },
    answer: ''
  };
}

async function preflightReferenceLookup(body = {}) {
  const message = String(body.message || '').trim();
  const references = extractReferences(message);
  if (!references.length) return null;

  const key = memoryKey(body);
  const { state: loaded } = await loadMemory(key);
  const state = normalizeState(loaded);
  if (!shouldPreflight(message, state, references)) return null;

  const catalog = await searchByReferences(references);
  if (catalog.lookupStatus === 'error') {
    return basePayload({
      body,
      state,
      references,
      lookupStatus: 'database_unavailable'
    });
  }

  const uniqueSkus = [...new Set((catalog.products || []).map(product => String(product?.sku || '').trim()).filter(Boolean))];
  if (!catalog.products?.length) {
    return basePayload({
      body,
      state,
      references,
      lookupStatus: 'not_found'
    });
  }

  if (uniqueSkus.length > 1) {
    return basePayload({
      body,
      state,
      references,
      lookupStatus: 'ambiguous',
      products: catalog.products,
      matchType: catalog.matchType || null
    });
  }

  return null;
}

module.exports = {
  preflightReferenceLookup,
  inferIntent,
  shouldPreflight
};
