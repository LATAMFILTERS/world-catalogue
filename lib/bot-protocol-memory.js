const Redis = require('ioredis');

const TTL_SECONDS = 60 * 60 * 24;
const MAX_HISTORY = 20;
const localMemory = new Map();
let redis = null;

function getRedis() {
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

function normalizeMemory(value = {}) {
  return {
    history: Array.isArray(value.history) ? value.history.slice(-MAX_HISTORY) : [],
    equipment_tokens: Array.isArray(value.equipment_tokens) ? value.equipment_tokens : [],
    symptoms: Array.isArray(value.symptoms) ? value.symptoms : [],
    duration: value.duration || null,
    operating_context: value.operating_context || null,
    impact: value.impact || null,
    unresolved_attempts: Math.max(0, Number(value.unresolved_attempts || 0)),
    active_intent: value.active_intent || null,
    updated_at: value.updated_at || null
  };
}

async function readMemory(key) {
  if (!key) return normalizeMemory();
  const client = getRedis();

  if (client) {
    try {
      if (client.status === 'wait') await client.connect();
      const raw = await client.get(key);
      return normalizeMemory(raw ? JSON.parse(raw) : {});
    } catch (error) {
      console.error('[bot-protocol-memory] read failed', error.message);
    }
  }

  return normalizeMemory(localMemory.get(key) || {});
}

async function writeMemory(key, value) {
  if (!key) return;
  const normalized = normalizeMemory({ ...value, updated_at: new Date().toISOString() });
  localMemory.set(key, normalized);

  const client = getRedis();
  if (!client) return;

  try {
    if (client.status === 'wait') await client.connect();
    await client.set(key, JSON.stringify(normalized), 'EX', TTL_SECONDS);
  } catch (error) {
    console.error('[bot-protocol-memory] write failed', error.message);
  }
}

function mergeContext(stored = {}, supplied = {}) {
  const merged = normalizeMemory({ ...stored, ...supplied });
  merged.history = [
    ...(Array.isArray(stored.history) ? stored.history : []),
    ...(Array.isArray(supplied.history) ? supplied.history : [])
  ].slice(-MAX_HISTORY);
  merged.equipment_tokens = supplied.equipment_tokens?.length ? supplied.equipment_tokens : stored.equipment_tokens || [];
  merged.symptoms = supplied.symptoms?.length ? supplied.symptoms : stored.symptoms || [];
  return merged;
}

function memoryFromResponse(previous, body, payload) {
  const message = String(body.message || '').trim();
  const answer = String(payload?.answer || '').trim();
  const diagnostic = payload?.diagnostic || {};
  const unresolved = payload?.governance?.resolution_status === 'unresolved' ||
    payload?.governance?.resolution_status === 'awaiting_customer_data';

  return normalizeMemory({
    ...previous,
    history: [...(previous.history || []), message, answer].filter(Boolean).slice(-MAX_HISTORY),
    equipment_tokens: diagnostic.equipment_tokens?.length
      ? diagnostic.equipment_tokens
      : payload?.entities?.equipment_tokens?.length
        ? payload.entities.equipment_tokens
        : previous.equipment_tokens,
    symptoms: diagnostic.symptoms?.length ? diagnostic.symptoms : previous.symptoms,
    duration: diagnostic.duration || previous.duration,
    operating_context: diagnostic.operating_context || previous.operating_context,
    impact: diagnostic.impact || previous.impact,
    unresolved_attempts: unresolved ? previous.unresolved_attempts + 1 : 0,
    active_intent: payload?.intent || previous.active_intent
  });
}

function installProtocolMemory(app) {
  app.use('/api/bot/protocol', async (req, res, next) => {
    try {
      const key = memoryKey(req.body || {});
      const stored = await readMemory(key);
      const supplied = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {};
      const merged = mergeContext(stored, supplied);

      req.body = { ...(req.body || {}), context: merged };

      const originalJson = res.json.bind(res);
      res.json = payload => {
        void writeMemory(key, memoryFromResponse(merged, req.body || {}, payload));
        return originalJson({
          ...payload,
          memory: {
            enabled: Boolean(key),
            key_scope: key ? 'channel_conversation' : null,
            history_size: merged.history.length
          }
        });
      };

      next();
    } catch (error) {
      console.error('[bot-protocol-memory]', error.message);
      next();
    }
  });
}

module.exports = {
  installProtocolMemory,
  memoryKey,
  mergeContext,
  memoryFromResponse
};
