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

// Test-only seam: inject a fake ioredis-like client (get/set) for e2e tests,
// or `null` to force local-fallback behavior deterministically.
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

// Canonical conversation state (requirement 4). Keys and nesting are fixed —
// this is the single source of truth for what a "conversation" is.
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
    pendingField: null,
    validatedProducts: [],
    conversationHistory: [],
    unresolvedAttempts: 0,
    // Bloque 2 (knowledge governance pipeline) conversational pointers —
    // deliberately compact: never full manual/evidence text, only enough
    // to avoid re-querying Obsidian/HERMES for something already resolved
    // this conversation. The durable record (bot_governance.knowledge_gaps,
    // knowledge_center.candidate_cases) lives in PostgreSQL, not here.
    technicalKnowledge: { status: null, sourceIds: [], lastQuery: null, validatedAt: null },
    oemMaintenance: { status: null, system: null, component: null, evidenceId: null },
    knowledgeGap: { requestId: null, deduplicationKey: null, status: null, hermesResearchId: null },
    productRecommendation: { categories: [], validatedSkus: [] },
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

function normalizeState(value = {}) {
  const empty = createEmptyState();
  return {
    intent: value.intent || empty.intent,
    phase: value.phase || empty.phase,
    equipment: normalizeEquipment(value.equipment),
    symptoms: normalizeSymptoms(value.symptoms),
    duration: value.duration || null,
    operatingContext: value.operatingContext || null,
    impact: value.impact || null,
    installedFilter: normalizeInstalledFilter(value.installedFilter),
    pendingField: value.pendingField || null,
    validatedProducts: Array.isArray(value.validatedProducts) ? value.validatedProducts : [],
    conversationHistory: Array.isArray(value.conversationHistory) ? value.conversationHistory.slice(-MAX_HISTORY) : [],
    unresolvedAttempts: Math.max(0, Number(value.unresolvedAttempts || 0)),
    technicalKnowledge: normalizeTechnicalKnowledge(value.technicalKnowledge),
    oemMaintenance: normalizeOemMaintenance(value.oemMaintenance),
    knowledgeGap: normalizeKnowledgeGap(value.knowledgeGap),
    productRecommendation: normalizeProductRecommendation(value.productRecommendation),
    updatedAt: value.updatedAt || null
  };
}

const GREETING_RESET_PATTERN = /^(?:hola|buenas|buenos\s+d[ií]as|buenas\s+tardes|buenas\s+noches|saludos|hey|hello)(?:[\s!¡,.]+(?:elimfilters|equipo|amigo|amiga))?[\s!¡,.]*$/i;

function isStandaloneGreeting(value) {
  return GREETING_RESET_PATTERN.test(String(value || '').trim());
}

// A new diagnostic problem reported after prior diagnostic content was
// already recorded should clear the old symptoms/equipment context rather
// than silently blending two unrelated complaints together. This is keyed
// off "is there existing symptom data to clear", not the current phase/
// intent label, so an unrelated side question in between (e.g. "does that
// have stock?") doesn't prevent the reset from firing later.
function isNewDiagnosticStart(message, state = {}) {
  const value = String(message || '').trim();
  if (!value || !Array.isArray(state.symptoms) || !state.symptoms.length) return false;

  // No trailing \b: JS's \b only recognizes ASCII \w, so it silently fails
  // right after an accented vowel like the "ó" in "apareció".
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
    pendingField: null,
    validatedProducts: [],
    unresolvedAttempts: 0,
    intent: null,
    phase: 'conversation_start',
    // Clears only the conversational pointers — the durable knowledge_gap
    // row in PostgreSQL (bot_governance.knowledge_gaps) is never deleted
    // by a conversation-level reset.
    technicalKnowledge: empty.technicalKnowledge,
    oemMaintenance: empty.oemMaintenance,
    knowledgeGap: empty.knowledgeGap,
    productRecommendation: empty.productRecommendation
  });
}

async function loadMemory(key) {
  if (!key) return { state: createEmptyState(), source: 'disabled' };
  const client = getRedis();

  if (client) {
    try {
      if (client.status === 'wait' && typeof client.connect === 'function') await client.connect();
      const raw = await client.get(key);
      return { state: normalizeState(raw ? JSON.parse(raw) : {}), source: 'redis' };
    } catch (error) {
      console.error('[bot-protocol-memory] read failed', error.message);
    }
  }

  return { state: normalizeState(localMemory.get(key) || {}), source: 'local_fallback' };
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
