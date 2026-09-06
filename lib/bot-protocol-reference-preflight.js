'use strict';

const crypto = require('crypto');
const { extractReferences } = require('./bot-protocol-catalog');
const { resolveReferenceAuthority } = require('./bot-protocol-reference-authority');
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

function basePayload({ body, state, references, lookupStatus, products = [], matchType = null, source = 'v_api_resolver_v7' }) {
  const intent = inferIntent(String(body.message || ''));
  const validated = lookupStatus === 'validated' && products.length === 1;
  return {
    protocol_version: '3.6.0',
    request_id: crypto.randomUUID(),
    intent,
    phase: 'catalog_resolution',
    state,
    pending_field: null,
    evidence: {
      source,
      count: validated ? 1 : products.length,
      validated,
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
      safe_to_publish: validated || lookupStatus === 'not_found' || lookupStatus === 'ambiguous' || lookupStatus === 'database_unavailable',
      technical_source_validated: false,
      oem_maintenance_found: false,
      knowledge_gap_registered: false,
      hermes_request_created: false,
      sku_validated_in_postgresql: validated,
      authority_violation_count: 0
    },
    deterministic_router: {
      matched: true,
      source: validated ? 'reference_preflight_resolver_v7' : 'reference_preflight_fail_closed',
      references
    },
    governance: {
      reference_preflight: true,
      llm_bypassed: true,
      reference_authority: source
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

  const authority = await resolveReferenceAuthority(references);

  if (authority.lookupStatus === 'database_unavailable') {
    return basePayload({
      body,
      state,
      references,
      lookupStatus: 'database_unavailable',
      source: authority.authoritySource || 'v_api_resolver_v7'
    });
  }

  if (authority.lookupStatus === 'not_found') {
    return basePayload({
      body,
      state,
      references,
      lookupStatus: 'not_found',
      source: authority.authoritySource || 'v_api_resolver_v7'
    });
  }

  if (authority.lookupStatus === 'ambiguous') {
    return basePayload({
      body,
      state,
      references,
      lookupStatus: 'ambiguous',
      source: authority.authoritySource || 'v_api_resolver_v7'
    });
  }

  if (authority.lookupStatus === 'validated' && authority.products?.length === 1) {
    return basePayload({
      body,
      state,
      references,
      lookupStatus: 'validated',
      products: authority.products,
      matchType: 'resolver_v7',
      source: authority.authoritySource || 'v_api_resolver_v7'
    });
  }

  return basePayload({
    body,
    state,
    references,
    lookupStatus: 'database_unavailable',
    source: authority.authoritySource || 'v_api_resolver_v7'
  });
}

module.exports = {
  preflightReferenceLookup,
  inferIntent,
  shouldPreflight
};
