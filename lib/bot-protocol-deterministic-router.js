'use strict';

const { extractReferences, searchByReferences } = require('./bot-protocol-catalog');
const { formatForChannel } = require('./bot-protocol-channel-format');

const REFERENCE_INTENT_PATTERN = /\b(?:equivalente|equivalencia|cruce|cross\s*reference|reemplaza|sustituye|reemplazo)\b/i;
const SPECIFICATION_INTENT_PATTERN = /\b(?:especificaci[oó]n|medida|dimensi[oó]n|rosca|altura|di[aá]metro|micra|beta|caudal)\b/i;

function deterministicCatalogIntent(message) {
  const value = String(message || '').trim();
  if (REFERENCE_INTENT_PATTERN.test(value)) return 'cross_reference_lookup';
  if (SPECIFICATION_INTENT_PATTERN.test(value)) return 'specification_lookup';
  return 'exact_reference_lookup';
}

function buildDeterministicPayload(body, references, catalog, intent) {
  const products = Array.isArray(catalog.products) ? catalog.products : [];
  return {
    protocol_version: '3.1.0',
    request_id: body.request_id || null,
    conversation_id: body.conversation_id || body.user_id || body.contact_id || body.context?.conversation_id || null,
    intent,
    phase: 'catalog_resolution',
    answer: products.length
      ? 'Referencia confirmada en la base de datos ELIMFILTERS.'
      : `No encontré una equivalencia confirmada para ${references.join(', ')} en la base de datos ELIMFILTERS.`,
    evidence: {
      products,
      references,
      lookup_status: catalog.lookupStatus,
      match_type: catalog.matchType || null
    },
    state: {
      intent,
      phase: 'catalog_resolution',
      equipment: { brand: null, model: null, engine: null, year: null },
      validatedProducts: products.map(product => product.sku).filter(Boolean),
      conversationHistory: [String(body.message || '')]
    },
    governance: {
      technical_source_validated: false,
      sku_validated_in_postgresql: products.length > 0,
      authority_violation_count: 0,
      safe_to_publish: true
    },
    deterministic_router: {
      matched: true,
      source: 'catalog_reference_entity',
      references
    }
  };
}

async function tryDeterministicCatalogRoute(req, res, next) {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return next();

    // References are catalog entities, not conversational guesses. Resolve
    // them before Groq or prior conversation state can alter the intent.
    const references = extractReferences(message);
    if (!references.length) return next();

    const catalog = await searchByReferences(references);

    // Preserve all existing behavior when PostgreSQL is unavailable. The
    // canonical orchestrator will handle retries, escalation and tickets.
    if (catalog.lookupStatus === 'error') return next();

    const intent = deterministicCatalogIntent(message);
    const payload = buildDeterministicPayload(req.body || {}, references, catalog, intent);
    return res.json(formatForChannel(payload, req.body || {}));
  } catch (error) {
    console.error('[bot-protocol-deterministic-router]', error.message);
    return next();
  }
}

module.exports = {
  tryDeterministicCatalogRoute,
  deterministicCatalogIntent,
  buildDeterministicPayload
};
