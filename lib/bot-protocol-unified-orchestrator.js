'use strict';

const crypto = require('crypto');
const { runBotProtocol } = require('./bot-conversation-orchestrator');
const {
  memoryKey,
  loadMemory,
  saveMemory,
  normalizeState
} = require('./bot-protocol-memory');
const {
  extractReferences,
  searchByReferences,
  searchByApplication,
  searchCompatibleElements,
  isHousing
} = require('./bot-protocol-catalog');
const { applyProtocolGuardrails } = require('./bot-protocol-guardrails');
const { formatForChannel } = require('./bot-protocol-channel-format');

const PROTOCOL_VERSION = '3.3.0';
const ELEMENT_REQUEST_PATTERN = /\b(?:cartucho|elemento|repuesto|replacement\s*element|replacement\s*filter|filtro\s+(?:de\s+)?repuesto|filtro\s+para\s+(?:la\s+)?turbina|qu[eé]\s+(?:cartucho|elemento|filtro)\s+(?:lleva|usa|recomiend|corresponde))\b/i;
const TURBINE_CONTEXT_PATTERN = /\b(?:turbina|racor|parker|fuel\s*water\s*separator|separador\s+(?:de\s+)?agua)\b/i;
const REFERENCE_INTENT_PATTERN = /\b(?:equivalente|equivalencia|cruce|cross\s*reference|reemplaza|sustituye|reemplazo)\b/i;
const SPECIFICATION_INTENT_PATTERN = /\b(?:especificaci[oó]n|medida|dimensi[oó]n|rosca|altura|di[aá]metro|micra|beta|caudal)\b/i;
const EQUIPMENT_BRAND_PATTERN = /\b(?:MACK|VOLVO|FREIGHTLINER|KENWORTH|PETERBILT|INTERNATIONAL|CATERPILLAR|KOMATSU|HITACHI|CASE|NEW\s+HOLLAND|CUMMINS|DETROIT|SCANIA|MAN|MERCEDES-BENZ|ISUZU|HINO|JOHN\s+DEERE)\b/i;
const ENGINE_PATTERN = /\b(?:MP\d{1,2}|D1[136]|DD\d{1,2}|SERIES\s*60|ISX\d*|X15|L9|B6\.7|C\d{1,2}(?:\.\d)?)\b/i;
const YEAR_PATTERN = /\b(19[8-9]\d|20[0-3]\d)\b/;

function isReplacementElementRequest(message) {
  const value = String(message || '');
  return ELEMENT_REQUEST_PATTERN.test(value) && (
    TURBINE_CONTEXT_PATTERN.test(value)
    || /\b(?:500|900|1000|2010|2020|2040)(?:FG|FH|FF|FE|FC|PM|TM|SM)/i.test(value)
    || /\b(?:lleva|usa|recomiend|corresponde)\b/i.test(value)
  );
}

function extractApplicationEntities(message) {
  const value = String(message || '');
  const brand = value.match(EQUIPMENT_BRAND_PATTERN)?.[0]?.toUpperCase().replace(/\s+/g, ' ') || null;
  const engine = value.match(ENGINE_PATTERN)?.[0]?.toUpperCase().replace(/\s+/g, ' ') || null;
  const year = Number(value.match(YEAR_PATTERN)?.[1]) || null;
  return { brand, engine, year, tokens: [brand, engine].filter(Boolean) };
}

function deterministicIntent(message) {
  if (REFERENCE_INTENT_PATTERN.test(message)) return 'cross_reference_lookup';
  if (SPECIFICATION_INTENT_PATTERN.test(message)) return 'specification_lookup';
  return 'exact_reference_lookup';
}

function shouldDeferReferenceToCanonical(message, state, replacementRequest) {
  const activeDiagnostic = state?.intent === 'diagnostic' && (
    Boolean(state.pendingField)
    || state.phase === 'collecting_diagnostic_data'
  );
  if (!activeDiagnostic || replacementRequest) return false;

  const explicitIndependentLookup = REFERENCE_INTENT_PATTERN.test(message)
    || SPECIFICATION_INTENT_PATTERN.test(message);
  return !explicitIndependentLookup;
}

function productLabel(product) {
  return `${product.sku}${product.codigo_base ? ` / ${product.codigo_base}` : ''}${product.filter_type ? ` — ${product.filter_type}` : ''}`;
}

function compatibilityAnswer(result) {
  const housings = result.housingProducts || [];
  const elements = result.products || [];
  const housingLabels = housings.map(productLabel).join(', ');
  const lines = elements.map(product => {
    const micron = product.micron_rating || String(product.description || '').match(/(\d+)\s*µm/i)?.[1] || null;
    return `• ${productLabel(product)}${micron ? ` — ${micron} micras` : ''}`;
  });

  return `La referencia identificada corresponde al housing ${housingLabels}. El housing no es el cartucho. Los elementos compatibles validados en PostgreSQL son:\n\n${lines.join('\n')}\n\nLa selección entre 30, 10 o 2 micras depende de la posición del elemento y de la configuración del sistema; no se asignará automáticamente el elemento más fino sin confirmar esa condición.`;
}

function buildCatalogPayload({ requestId, body, state, intent, catalog, answer, source, references = [] }) {
  return {
    protocol_version: PROTOCOL_VERSION,
    request_id: requestId,
    intent,
    phase: 'catalog_resolution',
    state,
    pending_field: null,
    evidence: {
      source: 'elimfilters_catalog',
      count: catalog.products.length,
      validated: catalog.products.length > 0,
      lookup_status: catalog.lookupStatus,
      match_type: catalog.matchType || null,
      references,
      products: catalog.products,
      housing_products: catalog.housingProducts || [],
      compatible_series: catalog.series || []
    },
    intelligence: {
      classifier: 'deterministic',
      groq_enabled: Boolean(process.env.GROQ_API_KEY),
      knowledge_status: 'skipped',
      knowledge_source_count: 0,
      knowledge_conflicts_detected: false,
      clarification_reason: null
    },
    knowledge_governance: {
      safe_to_publish: true,
      technical_source_validated: false,
      oem_maintenance_found: false,
      knowledge_gap_registered: false,
      hermes_request_created: false,
      sku_validated_in_postgresql: catalog.products.length > 0,
      authority_violation_count: 0
    },
    deterministic_router: {
      matched: true,
      source,
      references
    },
    answer
  };
}

async function finalizeDeterministic({ body, key, state, payload }) {
  const guarded = applyProtocolGuardrails(payload, body);
  const formatted = formatForChannel(guarded, body);
  const memorySource = await saveMemory(key, state);
  formatted.memory = {
    enabled: Boolean(key),
    key_scope: key ? 'channel_conversation' : null,
    memory_source: memorySource,
    pending_field: null,
    reset: !key
  };
  return formatted;
}

async function resolveDeterministically(body) {
  const message = String(body.message || '').trim();
  const requestId = crypto.randomUUID();
  const key = memoryKey(body);
  const { state: loaded } = await loadMemory(key);
  let state = normalizeState(loaded);
  const replacementRequest = isReplacementElementRequest(message);

  // Follow-up such as “¿cuál cartucho lleva?” uses the housing retained by
  // the canonical conversation state instead of forcing the customer to
  // repeat the housing reference.
  if (replacementRequest && state.identifiedHousing?.sku) {
    const housingCatalog = await searchByReferences([state.identifiedHousing.sku]);
    if (housingCatalog.lookupStatus === 'completed' && housingCatalog.products.length) {
      const compatibility = await searchCompatibleElements(housingCatalog.products);
      if (compatibility.products.length) {
        state = normalizeState({
          ...state,
          intent: 'cross_reference_lookup',
          phase: 'catalog_resolution',
          pendingField: null,
          validatedProducts: compatibility.products,
          unresolvedAttempts: 0,
          conversationHistory: [...(state.conversationHistory || []), message],
          identifiedHousing: {
            ...state.identifiedHousing,
            compatibleSeries: compatibility.series
          }
        });
        const payload = buildCatalogPayload({
          requestId, body, state, intent: 'cross_reference_lookup', catalog: compatibility,
          answer: compatibilityAnswer(compatibility), source: 'memory_housing_to_compatible_element'
        });
        return finalizeDeterministic({ body, key, state, payload });
      }
    }
  }

  const references = extractReferences(message);
  if (references.length) {
    // A reference supplied while the canonical diagnostic state machine is
    // still collecting data belongs to that diagnostic turn. Let the
    // canonical orchestrator merge operating context, installed-filter data,
    // symptoms and duration before performing the PostgreSQL lookup.
    if (shouldDeferReferenceToCanonical(message, state, replacementRequest)) return null;

    const catalog = await searchByReferences(references);
    if (catalog.lookupStatus === 'error') return null;

    // A token that merely looks like a reference is not authoritative. When
    // PostgreSQL confirms nothing, return control to the canonical classifier
    // so engines and equipment models are not mislabeled as unknown filters.
    if (!catalog.products.length) return null;

    let resolvedCatalog = catalog;
    let source = 'catalog_reference_entity';
    let answer = `Referencia confirmada en la base de datos ELIMFILTERS:\n\n${catalog.products.map(product => `• ${productLabel(product)}`).join('\n')}`;
    let intent = deterministicIntent(message);

    if (replacementRequest) {
      const compatibility = await searchCompatibleElements(catalog.products);
      if (compatibility.products.length) {
        resolvedCatalog = compatibility;
        source = 'housing_to_compatible_element';
        answer = compatibilityAnswer(compatibility);
        intent = 'cross_reference_lookup';
      }
    }

    const housing = (catalog.products || []).find(isHousing) || null;
    state = normalizeState({
      ...state,
      intent,
      phase: 'catalog_resolution',
      pendingField: null,
      validatedProducts: resolvedCatalog.products,
      unresolvedAttempts: 0,
      conversationHistory: [...(state.conversationHistory || []), message],
      identifiedHousing: housing ? {
        sku: housing.sku,
        externalReference: references[0] || null,
        compatibleSeries: resolvedCatalog.series || []
      } : state.identifiedHousing
    });

    const payload = buildCatalogPayload({ requestId, body, state, intent, catalog: resolvedCatalog, answer, source, references });
    return finalizeDeterministic({ body, key, state, payload });
  }

  if (replacementRequest) {
    const equipment = extractApplicationEntities(message);
    if (equipment.tokens.length) {
      const applicationCatalog = await searchByApplication(equipment.tokens, equipment.year);
      if (applicationCatalog.lookupStatus === 'error') return null;
      if (applicationCatalog.products.length) {
        const compatibility = await searchCompatibleElements(applicationCatalog.products);
        if (compatibility.products.length) {
          const housing = applicationCatalog.products.find(isHousing) || null;
          state = normalizeState({
            ...state,
            intent: 'application_lookup',
            phase: 'catalog_resolution',
            equipment: { ...state.equipment, brand: equipment.brand, engine: equipment.engine, year: equipment.year },
            pendingField: null,
            validatedProducts: compatibility.products,
            unresolvedAttempts: 0,
            conversationHistory: [...(state.conversationHistory || []), message],
            identifiedHousing: housing ? {
              sku: housing.sku,
              externalReference: null,
              compatibleSeries: compatibility.series
            } : state.identifiedHousing
          });
          const payload = buildCatalogPayload({
            requestId, body, state, intent: 'application_lookup', catalog: compatibility,
            answer: compatibilityAnswer(compatibility), source: 'application_housing_to_compatible_element'
          });
          return finalizeDeterministic({ body, key, state, payload });
        }
      }
    }
  }

  return null;
}

async function runUnifiedBotProtocol(body) {
  const deterministic = await resolveDeterministically(body);
  if (deterministic) return deterministic;
  const canonical = await runBotProtocol(body);
  canonical.protocol_version = PROTOCOL_VERSION;
  return canonical;
}

async function handleUnifiedBotProtocolRequest(req, res) {
  const startedAt = Date.now();
  try {
    const payload = await runUnifiedBotProtocol(req.body || {});
    console.info('[bot-protocol-unified-orchestrator]', {
      request_id: payload.request_id,
      intent: payload.intent,
      phase: payload.phase,
      pending_field: payload.pending_field,
      evidence_count: payload.evidence?.count || 0,
      deterministic_source: payload.deterministic_router?.source || null,
      duration_ms: Date.now() - startedAt
    });
    return res.json(payload);
  } catch (error) {
    console.error('[bot-protocol-unified-orchestrator]', { error: error.message, stack: error.stack, duration_ms: Date.now() - startedAt });
    return res.status(503).json({ error: 'protocol_temporarily_unavailable' });
  }
}

module.exports = {
  PROTOCOL_VERSION,
  isReplacementElementRequest,
  extractApplicationEntities,
  shouldDeferReferenceToCanonical,
  resolveDeterministically,
  runUnifiedBotProtocol,
  handleUnifiedBotProtocolRequest
};
