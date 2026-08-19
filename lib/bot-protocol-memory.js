'use strict';

const Redis = require('ioredis');

const TTL_SECONDS = 60 * 60 * 24;
const MAX_HISTORY = 20;
const localMemory = new Map();
let redis = null;
let redisOverride = null;

function getRedis() {
  if (redisOverride) return redisOverride;
  if (!process.env.REDIS_URL) return null;
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true
    });
    redis.on('error', error => console.error('[bot-protocol-memory]', error.message));
  }
  return redis;
}

function __setRedisClientForTests(client) {
  redisOverride = client;
}

function memoryKey(body = {}) {
  const channel = String(body.channel || body.context?.channel || 'unknown').trim().toLowerCase();
  const conversationId = String(
    body.conversation_id ||
    body.user_id ||
    body.contact_id ||
    body.context?.conversation_id ||
    body.context?.user_id ||
    ''
  ).trim();

  return conversationId ? `bot-protocol:${channel}:${conversationId}` : null;
}

function createEmptyState() {
  return {
    intent: null,
    phase: 'conversation_start',
    equipment: { brand: null, model: null, engine: null, year: null },
    symptoms: [],
    duration: null,
    operatingContext: null,
    impact: null,
    installedFilter: { type: null, brand: null, reference: null, status: null },
    identifiedHousing: { sku: null, externalReference: null, compatibleSeries: [] },
    pendingField: null,
    validatedProducts: [],
    conversationHistory: [],
    unresolvedAttempts: 0,
    technicalKnowledge: { status: null, sourceIds: [], lastQuery: null, validatedAt: null },
    oemMaintenance: { status: null, system: null, component: null, evidenceId: null },
    knowledgeGap: { requestId: null, deduplicationKey: null, status: null, hermesResearchId: null },
    productRecommendation: { categories: [], validatedSkus: [] },
    // B2B distribution qualification -- see directAnswer()/mergeEntitiesIntoState()
    // in bot-conversation-orchestrator.js. distributor-application is only ever
    // revealed once Confirmed is true; Pending marks "we asked, awaiting their
    // qualification reply" so the next turn's reply is not misclassified.
    distributionQualificationPending: false,
    distributionQualificationConfirmed: false,
    // Support lead: set when phase becomes 'AWAITING_SUPPORT_EMAIL' (a
    // verified catalog search found nothing -- see runBotProtocol's
    // exact_reference_lookup/cross_reference_lookup/specification_lookup/
    // application_lookup branch) and populated once a valid email is
    // captured. `created` is the idempotency guard: once true, a repeated
    // email delivery for this conversation never registers a second lead
    // or repeats the thank-you.
    supportLead: { status: null, email: null, created: false, ticketId: null, createdAt: null },
    updatedAt: null
  };
}

function normalizeEquipment(value = {}) {
  return {
    brand: value.brand || null,
    model: value.model || null,
    engine: value.engine || null,
    year: value.year || null
  };
}

function normalizeInstalledFilter(value = {}) {
  return {
    type: value.type || null,
    brand: value.brand || null,
    reference: value.reference || null,
    status: value.status || null
  };
}

function normalizeIdentifiedHousing(value = {}) {
  return {
    sku: value.sku || null,
    externalReference: value.externalReference || null,
    compatibleSeries: Array.isArray(value.compatibleSeries) ? value.compatibleSeries.filter(Boolean).map(String) : []
  };
}

function normalizeSymptoms(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const out = [];
  for (const item of value) {
    if (!item) continue;
    const symptom = typeof item === 'string' ? { code: item, raw: item, system: null } : item;
    const code = String(symptom.code || '').trim();
    if (!code) continue;
    const dedupeKey = `${code}:${symptom.system || ''}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push({ code, raw: symptom.raw || code, system: symptom.system || null });
  }
  return out;
}

function normalizeTechnicalKnowledge(value = {}) {
  return {
    status: value.status || null,
    sourceIds: Array.isArray(value.sourceIds) ? value.sourceIds.filter(Boolean) : [],
    lastQuery: value.lastQuery || null,
    validatedAt: value.validatedAt || null
  };
}

function normalizeOemMaintenance(value = {}) {
  return {
    status: value.status || null,
    system: value.system || null,
    component: value.component || null,
    evidenceId: value.evidenceId || null
  };
}

function normalizeKnowledgeGap(value = {}) {
  return {
    requestId: value.requestId || null,
    deduplicationKey: value.deduplicationKey || null,
    status: value.status || null,
    hermesResearchId: value.hermesResearchId || null
  };
}

function normalizeProductRecommendation(value = {}) {
  return {
    categories: Array.isArray(value.categories) ? value.categories : [],
    validatedSkus: Array.isArray(value.validatedSkus) ? value.validatedSkus : []
  };
}

function normalizeSupportLead(value = {}) {
  return {
    status: value.status || null,
    email: value.email || null,
    created: Boolean(value.created),
    ticketId: value.ticketId || null,
    createdAt: value.createdAt || null
  };
}

function normalizeState(value = {}) {
  const empty = createEmptyState();
  // commercial_inquiry ("where do I buy") is always a single-shot exchange --
  // resets immediately, same as before. distribution_inquiry ("I want to
  // become a distributor") now stays open across the ask -> confirm exchange
  // (see bot-conversation-orchestrator.js) and only becomes terminal once the
  // qualification reply has been received and the distributor-application
  // link has actually been delivered (distributionQualificationConfirmed).
  const terminalCommercialInquiry = value.intent === 'commercial_inquiry' &&
    !value.pendingField && value.phase === 'catalog_resolution';
  const terminalDistributionInquiry = value.intent === 'distribution_inquiry' &&
    value.distributionQualificationConfirmed === true;
  const terminalCommercialIntent = terminalCommercialInquiry || terminalDistributionInquiry;
  const pendingField = value.pendingField || null;

  return {
    intent: terminalCommercialIntent ? null : (value.intent || empty.intent),
    phase: terminalCommercialIntent ? 'conversation_start' : (value.phase || empty.phase),
    equipment: normalizeEquipment(value.equipment),
    symptoms: normalizeSymptoms(value.symptoms),
    duration: value.duration || null,
    operatingContext: value.operatingContext || null,
    impact: value.impact || null,
    installedFilter: normalizeInstalledFilter(value.installedFilter),
    identifiedHousing: normalizeIdentifiedHousing(value.identifiedHousing),
    pendingField,
    validatedProducts: Array.isArray(value.validatedProducts) ? value.validatedProducts : [],
    conversationHistory: terminalCommercialIntent ? [] : (Array.isArray(value.conversationHistory) ? value.conversationHistory.slice(-MAX_HISTORY) : []),
    // An active clarification is not a failed lookup. Old counters must never
    // leak into a new collection step and trigger an immediate escalation.
    unresolvedAttempts: pendingField ? 0 : Math.max(0, Number(value.unresolvedAttempts || 0)),
    technicalKnowledge: normalizeTechnicalKnowledge(value.technicalKnowledge),
    oemMaintenance: normalizeOemMaintenance(value.oemMaintenance),
    knowledgeGap: normalizeKnowledgeGap(value.knowledgeGap),
    productRecommendation: normalizeProductRecommendation(value.productRecommendation),
    distributionQualificationPending: terminalCommercialIntent ? false : Boolean(value.distributionQualificationPending),
    distributionQualificationConfirmed: terminalCommercialIntent ? false : Boolean(value.distributionQualificationConfirmed),
    // supportLead persists through terminalCommercialIntent resets on
    // purpose (a support lead is unrelated to the commercial/distribution
    // one-shot exchanges) -- it is only ever cleared by resetDiagnosticState,
    // same as the rest of the diagnostic-episode fields it's tied to.
    supportLead: normalizeSupportLead(value.supportLead),
    updatedAt: value.updatedAt || null
  };
}

const GREETING_RESET_PATTERN = /^(?:hola(?:\s+(?:buen|buenos)\s+d[ií]a(?:s)?)?|buen\s+d[ií]a|buenos\s+d[ií]as|buenas|buenas\s+tardes|buenas\s+noches|saludos|hey|hello)(?:[\s!¡,.]+(?:elimfilters|equipo|amigo|amiga))?[\s!¡,.]*$/i;

function isStandaloneGreeting(value) {
  return GREETING_RESET_PATTERN.test(String(value || '').trim());
}

function isNewDiagnosticStart(message, state = {}) {
  const value = String(message || '').trim();
  if (!value || !Array.isArray(state.symptoms) || !state.symptoms.length) return false;

  const reportsNewProblem = /\b(?:tengo|tenemos|presenta|est[aá]\s+presentando|me\s+aparece|apareci[oó]|ocurre|hay|nuevo\s+problema)/i.test(value);
  const diagnosticProblem = /ca[ií]da\s+de\s+presi[oó]n|baja\s+presi[oó]n|pierde\s+presi[oó]n|presi[oó]n\s+(?:de\s+)?aceite\s+baja|luz\s+(?:roja\s+)?de\s+aceite|pierde\s+potencia|p[eé]rdida\s+de\s+potencia|sin\s+fuerza|humo|se\s+apaga|no\s+arranca|restricci[oó]n|obstrucci[oó]n|agua\s+en/i.test(value);

  return reportsNewProblem && diagnosticProblem;
}

function resetDiagnosticState(state = {}) {
  const empty = createEmptyState();
  return normalizeState({
    ...state,
    equipment: empty.equipment,
    symptoms: [],
    duration: null,
    operatingContext: null,
    impact: null,
    installedFilter: empty.installedFilter,
    identifiedHousing: empty.identifiedHousing,
    pendingField: null,
    validatedProducts: [],
    unresolvedAttempts: 0,
    intent: null,
    phase: 'conversation_start',
    technicalKnowledge: empty.technicalKnowledge,
    oemMaintenance: empty.oemMaintenance,
    knowledgeGap: empty.knowledgeGap,
    productRecommendation: empty.productRecommendation,
    distributionQualificationPending: false,
    distributionQualificationConfirmed: false,
    supportLead: { status: null, email: null, created: false, ticketId: null, createdAt: null }
  });
}

async function loadMemory(key) {
  // `found` tells callers whether a conversation ALREADY existed for this key
  // -- distinct from `source` (which backend served the read). This is what
  // makes context_seed idempotent: a seed is only ever applied when found is
  // false (nothing existed yet for this conversationId), never on a repeat
  // delivery or an already-active conversation.
  if (!key) return { state: createEmptyState(), source: 'disabled', found: false };
  const client = getRedis();

  if (client) {
    try {
      if (client.status === 'wait' && typeof client.connect === 'function') await client.connect();
      const raw = await client.get(key);
      return { state: normalizeState(raw ? JSON.parse(raw) : {}), source: 'redis', found: Boolean(raw) };
    } catch (error) {
      console.error('[bot-protocol-memory] read failed', error.message);
    }
  }

  const existing = localMemory.get(key);
  return { state: normalizeState(existing || {}), source: 'local_fallback', found: Boolean(existing) };
}

async function saveMemory(key, state) {
  if (!key) return 'disabled';
  const normalized = normalizeState({ ...state, updatedAt: new Date().toISOString() });
  localMemory.set(key, normalized);

  const client = getRedis();
  if (!client) return 'local_fallback';

  try {
    if (client.status === 'wait' && typeof client.connect === 'function') await client.connect();
    await client.set(key, JSON.stringify(normalized), 'EX', TTL_SECONDS);
    return 'redis';
  } catch (error) {
    console.error('[bot-protocol-memory] write failed', error.message);
    return 'local_fallback';
  }
}

module.exports = {
  MAX_HISTORY,
  memoryKey,
  createEmptyState,
  normalizeState,
  normalizeEquipment,
  normalizeInstalledFilter,
  normalizeIdentifiedHousing,
  normalizeSymptoms,
  normalizeTechnicalKnowledge,
  normalizeOemMaintenance,
  normalizeKnowledgeGap,
  normalizeProductRecommendation,
  isStandaloneGreeting,
  isNewDiagnosticStart,
  resetDiagnosticState,
  loadMemory,
  saveMemory,
  __setRedisClientForTests
};
