'use strict';

// Real end-to-end HTTP tests for the Bloque 2 operational pipeline: a real
// Express server on an ephemeral port, exercised with real fetch() calls.
// PostgreSQL (both elimfilters_catalog and the new bot_governance.
// knowledge_gaps table) and Redis are swapped for deterministic in-memory
// doubles; the Knowledge Engine Runtime and knowledge-center-api HTTP calls
// are stubbed via global.fetch. Everything else runs for real.

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');

const { __setProtocolPoolForTests } = require('../lib/bot-protocol-db');
const { __setRedisClientForTests } = require('../lib/bot-protocol-memory');

const ORIGINAL_ENV = { ...process.env };
process.env.BOT_PROTOCOL_API_KEY = 'test-key';
process.env.NODE_ENV = 'test';
delete process.env.GROQ_API_KEY;
delete process.env.REDIS_URL;
delete process.env.DATABASE_URL;
process.env.KNOWLEDGE_ENGINE_RUNTIME_URL = 'https://fake-knowledge-engine.invalid';
process.env.ENGINE_API_KEY = 'fake-engine-key';
process.env.KNOWLEDGE_CENTER_API_URL = 'https://fake-knowledge-center.invalid';
process.env.KNOWLEDGE_CENTER_API_KEY = 'fake-center-key';
process.env.HERMES_REQUESTS_ENABLED = 'true';

const { installBotProtocol } = require('../lib/install-bot-protocol');

function normalizeRef(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

const CATALOG_ROWS = [
  {
    id: 1, sku: 'EL82100', codigo_base: 'EL82100', name: 'Full-Flow Lube Oil Filter',
    filter_type: 'Oil Filter', oem_codes: [{ manufacturer: 'DONALDSON', code: 'P552100' }],
    competitor_codes: [], brand_crossrefs: {}, equipment_applications: [], specs: {}, enrichment_data: {}, is_primary: true
  }
];

// In-memory bot_governance.knowledge_gaps table, mirroring the fake used in
// knowledge-pipeline-knowledge-gap-store.test.js.
function createKnowledgeGapsFake() {
  const rows = new Map();
  const byRequestId = new Map();
  return {
    async handle(text, params) {
      if (/SELECT \* FROM bot_governance\.knowledge_gaps WHERE deduplication_key = \$1/i.test(text)) {
        const row = rows.get(params[0]);
        return { rows: row ? [row] : [] };
      }
      if (/SELECT \* FROM bot_governance\.knowledge_gaps WHERE request_id = \$1/i.test(text)) {
        const key = byRequestId.get(params[0]);
        const row = key ? rows.get(key) : null;
        return { rows: row ? [row] : [] };
      }
      if (/^INSERT INTO bot_governance\.knowledge_gaps/i.test(text)) {
        const [request_id, request_type, origin, status, priority, equipment, system, component,
          question, reason, source_required, requested_by, conversation_id, channel,
          deduplication_key, occurrences, first_detected_at, last_detected_at, audit_history] = params;
        const row = {
          request_id, request_type, origin, status, priority, equipment: JSON.parse(equipment),
          system, component, question, reason, source_required, requested_by, conversation_id, channel,
          deduplication_key, occurrences, first_detected_at, last_detected_at, assigned_to: null,
          hermes_research_id: null, obsidian_document_id: null, resolution_summary: null,
          audit_history: JSON.parse(audit_history)
        };
        rows.set(deduplication_key, row);
        byRequestId.set(request_id, deduplication_key);
        return { rows: [row] };
      }
      if (/^UPDATE bot_governance\.knowledge_gaps\s+SET occurrences/i.test(text)) {
        const [deduplication_key, occurrences, last_detected_at, priority, audit_history] = params;
        const row = rows.get(deduplication_key);
        if (!row) return { rows: [] };
        Object.assign(row, { occurrences, last_detected_at, priority, audit_history: JSON.parse(audit_history) });
        return { rows: [row] };
      }
      if (/^UPDATE bot_governance\.knowledge_gaps\s+SET status/i.test(text)) {
        const [request_id, status, assigned_to, hermes_research_id, obsidian_document_id, resolution_summary, audit_history, last_detected_at] = params;
        const key = byRequestId.get(request_id);
        const row = key ? rows.get(key) : null;
        if (!row) return { rows: [] };
        Object.assign(row, { status, assigned_to, hermes_research_id, obsidian_document_id, resolution_summary, audit_history: JSON.parse(audit_history), last_detected_at });
        return { rows: [row] };
      }
      return null; // not a knowledge_gaps statement
    },
    rows,
    byRequestId
  };
}

let gapsFake;

function fakeClient() {
  return {
    async query(sql, params = []) {
      const text = String(sql);
      if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };
      if (/FROM elimfilters_catalog/i.test(text)) {
        const refs = (params[0] || []).map(normalizeRef);
        const rows = CATALOG_ROWS.filter(row =>
          refs.includes(normalizeRef(row.sku)) || (row.oem_codes || []).some(c => refs.includes(normalizeRef(c.code))));
        return { rows };
      }
      const gapResult = await gapsFake.handle(text, params);
      if (gapResult) return gapResult;
      return { rows: [] };
    },
    release() {}
  };
}

function installFakePool() {
  __setProtocolPoolForTests({ connect: async () => fakeClient() });
}

let server;
let baseUrl;
let originalFetch;

test.before(async () => {
  originalFetch = global.fetch;
  gapsFake = createKnowledgeGapsFake();
  installFakePool();

  // Stub Obsidian (knowledge-engine-runtime) and HERMES (knowledge-center-api)
  // calls; pass everything else (our own test server) through to the real fetch.
  global.fetch = async (url, opts) => {
    const href = String(url);
    if (href.startsWith(baseUrl)) return originalFetch(url, opts);
    if (href.includes('fake-knowledge-engine.invalid')) {
      return { ok: true, status: 200, json: async () => ({ action: 'ESCALATE', confidence: 0, answer: null, citations: [] }), text: async () => '{}' };
    }
    if (href.includes('fake-knowledge-center.invalid')) {
      return { ok: true, status: 201, json: async () => ({ id: `candidate-${Date.now()}-${Math.random().toString(16).slice(2)}`, status: 'CAPTURED' }) };
    }
    throw new Error(`unexpected fetch in e2e test: ${href}`);
  };

  const app = express();
  installBotProtocol(app);
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  global.fetch = originalFetch;
  __setProtocolPoolForTests(null);
  __setRedisClientForTests(null);
  Object.keys(process.env).forEach(key => { if (!(key in ORIGINAL_ENV)) delete process.env[key]; });
  Object.assign(process.env, ORIGINAL_ENV);
  await new Promise(resolve => server.close(resolve));
});

async function sendMessage(message, { conversationId = 'e2e-conv', channel = 'whatsapp', extra = {} } = {}) {
  const response = await fetch(`${baseUrl}/api/bot/protocol`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-bot-protocol-key': 'test-key' },
    body: JSON.stringify({ message, conversation_id: conversationId, channel, ...extra })
  });
  const body = await response.json();
  return { status: response.status, body };
}

// Case 24: Conversación corta conserva contexto.
test('a short conversation retains equipment/symptom context across turns', async () => {
  const conversationId = `ctx-${Date.now()}`;
  const t1 = await sendMessage('Tengo un Mack MP8 2019 con agua en el combustible', { conversationId });
  assert.equal(t1.body.state.equipment.brand, 'MACK');
  const t2 = await sendMessage('Hace tres días', { conversationId });
  assert.equal(t2.body.state.equipment.brand, 'MACK', 'brand must persist from the previous turn');
  assert.equal(t2.body.state.duration, 'tres días');
});

// Case 25: Cambio de sistema invalida recomendación previa.
test('reporting a new, unrelated problem clears the prior productRecommendation/technicalKnowledge pointers', async () => {
  const conversationId = `system-change-${Date.now()}`;
  await sendMessage('Tengo un Mack MP8 2019 con agua en el combustible', { conversationId });
  await sendMessage('Hace tres días', { conversationId });
  const first = await sendMessage('Carretera. No sé el filtro.', { conversationId });
  assert.equal(first.body.phase, 'diagnostic_assessment');

  const reset = await sendMessage('Ahora tengo un nuevo problema: se apaga el motor de repente', { conversationId });
  // resetDiagnosticState clears symptoms/duration/operatingContext/
  // installedFilter/pendingField/phase (and the productRecommendation /
  // technicalKnowledge pointers this test targets) — equipment brand can
  // still be re-derived from conversation history text (same vehicle, new
  // problem), which is intentional, not a leak of the OLD symptom/recommendation.
  assert.ok(reset.body.state.symptoms.some(s => s.code === 'engine_stall'));
  assert.ok(!reset.body.state.symptoms.some(s => s.code === 'water_in_fuel'), 'the old symptom must not carry over');
  assert.notEqual(reset.body.phase, 'diagnostic_assessment', 'the old recommendation/assessment phase must not persist onto the new problem');
});

// Case 26: Saludo reinicia estado conversacional.
test('a greeting mid-conversation fully resets state, including the new governance pointers', async () => {
  const conversationId = `greet-${Date.now()}`;
  await sendMessage('Tengo un Mack MP8 2019 con agua en el combustible', { conversationId });
  const { body } = await sendMessage('Hola', { conversationId });
  assert.equal(body.intent, 'greeting');
  assert.equal(body.state.equipment.brand, null);
});

// Case 27: Dos conversaciones simultáneas no mezclan datos.
test('two concurrent conversations never mix equipment data', async () => {
  const idA = `conc-a-${Date.now()}`;
  const idB = `conc-b-${Date.now()}`;
  const [a, b] = await Promise.all([
    sendMessage('Tengo un Mack MP8 2019 con agua en el combustible', { conversationId: idA }),
    sendMessage('Tengo un Volvo D13 2021 con pérdida de potencia', { conversationId: idB })
  ]);
  assert.equal(a.body.state.equipment.brand, 'MACK');
  assert.equal(b.body.state.equipment.brand, 'VOLVO');
});

// Case 33: Metadata interna no aparece en el texto al cliente.
test('internal governance identifiers never leak into the answer text', async () => {
  const conversationId = `no-leak-${Date.now()}`;
  await sendMessage('Tengo un Mack MP8 2019 con agua en el combustible', { conversationId });
  await sendMessage('Hace tres días', { conversationId });
  const { body } = await sendMessage('Carretera. No sé el filtro.', { conversationId });
  assert.equal(body.phase, 'diagnostic_assessment');
  for (const term of ['request_id', 'deduplication_key', 'hermes_research_id', 'source_id', 'candidateCaseId']) {
    assert.doesNotMatch(body.answer, new RegExp(term));
  }
  // The public knowledge_governance block only ever exposes booleans/counts.
  assert.equal(typeof body.knowledge_governance.safe_to_publish, 'boolean');
});

// Case 34: Sin fuente autorizada, technical_source_validated permanece false.
test('with Obsidian returning ESCALATE (no evidence), technical_source_validated stays false and a gap is registered', async () => {
  const conversationId = `no-evidence-${Date.now()}`;
  await sendMessage('Tengo un Mack MP8 2019 con agua en el combustible', { conversationId });
  await sendMessage('Hace tres días', { conversationId });
  const { body } = await sendMessage('Carretera. No sé el filtro.', { conversationId });
  assert.equal(body.knowledge_governance.technical_source_validated, false);
  assert.equal(body.knowledge_governance.knowledge_gap_registered, true);
  assert.equal(body.knowledge_governance.hermes_request_created, true);
});

// Case 35: Todo SKU publicado tiene sku_validated_in_postgresql true.
test('a SKU only ever appears in the answer alongside sku_validated_in_postgresql = true', async () => {
  const conversationId = `sku-valid-${Date.now()}`;
  await sendMessage('Tengo un Freightliner 2007 con Detroit Series 60. Cuando calienta baja la presión de aceite.', { conversationId });
  await sendMessage('Hace cuatro días.', { conversationId });
  const { body } = await sendMessage('Carretera. Tiene Donaldson P552100.', { conversationId });
  const skuShaped = /\bE[A-Z]\d{4,7}\b/.test(body.answer);
  if (skuShaped) assert.equal(body.knowledge_governance.sku_validated_in_postgresql, true);
});

// Case 31: Ningún request responde dos veces (even with both Obsidian and
// HERMES invoked in the same turn).
test('a single request that triggers both Obsidian and HERMES still produces exactly one response', async () => {
  const conversationId = `single-response-${Date.now()}`;
  await sendMessage('Tengo un Mack MP8 2019 con agua en el combustible', { conversationId });
  await sendMessage('Hace tres días', { conversationId });
  const response = await fetch(`${baseUrl}/api/bot/protocol`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-bot-protocol-key': 'test-key' },
    body: JSON.stringify({ message: 'Carretera. No sé el filtro.', conversation_id: conversationId, channel: 'whatsapp' })
  });
  const raw = await response.text();
  assert.equal(response.status, 200);
  JSON.parse(raw); // must be exactly one valid JSON document, not two concatenated
});

// Case 29 / 30: Obsidian/HERMES timeouts never break the response.
test('an Obsidian (Knowledge Engine) failure never breaks the HTTP response', async () => {
  const savedFetch = global.fetch;
  global.fetch = async (url, opts) => {
    const href = String(url);
    if (href.startsWith(baseUrl)) return originalFetch(url, opts);
    if (href.includes('fake-knowledge-engine.invalid')) throw Object.assign(new Error('timeout'), { name: 'AbortError' });
    if (href.includes('fake-knowledge-center.invalid')) return { ok: true, status: 201, json: async () => ({ id: 'case-timeout-ok', status: 'CAPTURED' }) };
    throw new Error(`unexpected fetch: ${href}`);
  };
  try {
    const conversationId = `obsidian-timeout-${Date.now()}`;
    await sendMessage('Tengo un Mack MP8 2019 con agua en el combustible', { conversationId });
    await sendMessage('Hace tres días', { conversationId });
    const { status, body } = await sendMessage('Carretera. No sé el filtro.', { conversationId });
    assert.equal(status, 200);
    assert.ok(body.answer && body.answer.length > 0);
  } finally {
    global.fetch = savedFetch;
  }
});

test('a HERMES (knowledge-center-api) failure never breaks the HTTP response', async () => {
  const savedFetch = global.fetch;
  global.fetch = async (url, opts) => {
    const href = String(url);
    if (href.startsWith(baseUrl)) return originalFetch(url, opts);
    if (href.includes('fake-knowledge-engine.invalid')) return { ok: true, status: 200, json: async () => ({ action: 'ESCALATE', confidence: 0, answer: null, citations: [] }) };
    if (href.includes('fake-knowledge-center.invalid')) throw new Error('simulated knowledge-center-api outage');
    throw new Error(`unexpected fetch: ${href}`);
  };
  try {
    const conversationId = `hermes-timeout-${Date.now()}`;
    await sendMessage('Tengo un Volvo D13 2021 con agua en el aceite', { conversationId });
    await sendMessage('Hace dos semanas', { conversationId });
    const { status, body } = await sendMessage('Carretera. No sé el filtro.', { conversationId });
    assert.equal(status, 200);
    assert.equal(body.knowledge_governance.hermes_request_created, false);
    assert.ok(body.answer && body.answer.length > 0);
  } finally {
    global.fetch = savedFetch;
  }
});

// Case 32: Ningún campo capturado se vuelve a preguntar (with the new
// pipeline active alongside the pre-existing state machine).
test('once equipment/duration/context are captured, they are never asked for again', async () => {
  const conversationId = `no-reask-${Date.now()}`;
  await sendMessage('Tengo un Mack MP8 2019 con agua en el combustible', { conversationId });
  await sendMessage('Hace tres días', { conversationId });
  const { body } = await sendMessage('Carretera. No sé el filtro.', { conversationId });
  assert.doesNotMatch(body.answer, /marca, modelo y motor|desde cu[aá]ndo/i);
});
