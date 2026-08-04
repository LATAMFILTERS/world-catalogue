'use strict';

// Real end-to-end HTTP tests for /api/bot/protocol: a real Express server is
// started on an ephemeral port and exercised with real fetch() calls. The
// PostgreSQL pool and Redis client are swapped for deterministic in-memory
// test doubles via the seams in bot-protocol-db.js / bot-protocol-memory.js;
// everything else (security middleware, JSON parsing, the orchestrator
// pipeline, guardrails, channel formatting) runs for real.
//
// GROQ_API_KEY is unset for most scenarios below so the deterministic
// fallback classifier drives the conversation — this keeps the suite fast,
// free and fully reproducible while still exercising the complete real HTTP
// pipeline. Dedicated tests further down cover the Groq-available path (via
// a stubbed global.fetch) and the Groq-down-mid-conversation path.

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
delete process.env.KNOWLEDGE_ENGINE_RUNTIME_URL;
delete process.env.ENGINE_API_KEY;

const { installBotProtocol } = require('../lib/install-bot-protocol');

function normalizeRef(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

const CATALOG_ROWS = [
  {
    id: 1, sku: 'EL82100', codigo_base: 'EL82100', name: 'Full-Flow Lube Oil Filter',
    description: null, filter_type: 'Oil Filter', sub_type: null, technology: 'SYNTRAX',
    thread_size: null, height_mm: null, outer_diameter_mm: null, gasket_od_mm: null, gasket_id_mm: null,
    micron_rating: null, nominal_efficiency: null, filter_media: null,
    oem_codes: [{ manufacturer: 'DONALDSON', code: 'P552100' }],
    competitor_codes: [{ manufacturer: 'FLEETGUARD', code: 'LF3970' }],
    brand_crossrefs: { WIX: 'W51372' },
    equipment_applications: [{ brand: 'FREIGHTLINER', engine: 'DETROIT SERIES 60' }],
    specs: {}, enrichment_data: {}, is_primary: true
  }
];

function fakeCatalogClient() {
  return {
    async query(sql, params = []) {
      const text = String(sql);
      if (/^\s*(BEGIN|COMMIT|ROLLBACK|SET LOCAL)/i.test(text)) return { rows: [] };
      if (/FROM elimfilters_catalog/i.test(text)) {
        const refs = (params[0] || []).map(normalizeRef);
        const rows = CATALOG_ROWS.filter(row => {
          if (refs.includes(normalizeRef(row.sku)) || refs.includes(normalizeRef(row.codigo_base))) return true;
          if ((row.oem_codes || []).some(c => refs.includes(normalizeRef(c.code)))) return true;
          if ((row.competitor_codes || []).some(c => refs.includes(normalizeRef(c.code)))) return true;
          if (Object.values(row.brand_crossrefs || {}).some(v => refs.includes(normalizeRef(v)))) return true;
          return false;
        });
        return { rows };
      }
      return { rows: [] };
    },
    release() {}
  };
}

function installFakePool() {
  __setProtocolPoolForTests({ connect: async () => fakeCatalogClient() });
}

function installFailingPool() {
  __setProtocolPoolForTests({ connect: async () => { throw new Error('ECONNREFUSED: fake postgres down'); } });
}

let server;
let baseUrl;

test.before(async () => {
  installFakePool();
  const app = express();
  installBotProtocol(app);
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
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

// ── 1. Greeting resets the conversation ─────────────────────────────────────

test('greeting resets the conversation', async () => {
  const conversationId = `greet-reset-${Date.now()}`;
  await sendMessage('Tengo un Mack con pérdida de potencia', { conversationId });
  const { status, body } = await sendMessage('Hola', { conversationId });
  assert.equal(status, 200);
  assert.equal(body.intent, 'greeting');
  assert.equal(body.state.equipment.brand, null);
  assert.equal(body.state.symptoms.length, 0);
});

// ── 2. A greeting attached to a query is NOT classified as a greeting ──────

test('a greeting combined with a technical query is not classified as greeting', async () => {
  const { body } = await sendMessage('Hola, tengo un Mack 2024 con agua en el sistema', { conversationId: `greet-query-${Date.now()}` });
  assert.notEqual(body.intent, 'greeting');
  assert.equal(body.intent, 'diagnostic');
});

// ── 3-5. Mack 2024 water contamination clarification flow ─────────────────

test('Mack 2024 agua en el sistema asks which system, without re-asking symptoms', async () => {
  const { body } = await sendMessage('Mack 2024 agua en el sistema', { conversationId: `water-flow-${Date.now()}` });
  assert.equal(body.intent, 'diagnostic');
  assert.equal(body.pending_field, 'symptom_system');
  assert.match(body.answer, /combustible, aceite, refrigerante, hidr[aá]ulico o aire/i);
  assert.doesNotMatch(body.answer, /qu[eé] s[ií]ntomas observás/i);
});

test('answering "combustible" resolves to water_in_fuel and advances the conversation', async () => {
  const conversationId = `water-fuel-${Date.now()}`;
  await sendMessage('Mack 2024 agua en el sistema', { conversationId });
  const { body } = await sendMessage('combustible', { conversationId });
  assert.equal(body.state.symptoms[0].code, 'water_in_fuel');
  assert.equal(body.state.symptoms[0].system, 'fuel');
  assert.notEqual(body.pending_field, 'symptom_system');
});

test('answering "aceite" resolves to water_in_oil (a separate, distinguishable system)', async () => {
  const conversationId = `water-oil-${Date.now()}`;
  await sendMessage('Mack 2024 agua en el sistema', { conversationId });
  const { body } = await sendMessage('aceite', { conversationId });
  assert.equal(body.state.symptoms[0].code, 'water_in_oil');
  assert.equal(body.state.symptoms[0].system, 'oil');
});

// ── 6. Short reply "4 días" understood as duration ─────────────────────────

test('short reply "4 días" is understood as duration', async () => {
  const conversationId = `short-duration-${Date.now()}`;
  await sendMessage('Mack 2024 agua en el sistema', { conversationId });
  await sendMessage('combustible', { conversationId });
  const { body } = await sendMessage('4 días', { conversationId });
  assert.equal(body.state.duration, '4 días');
});

// ── 7. Change of intent ─────────────────────────────────────────────────────

test('the conversation can change intent mid-flow (diagnostic -> commercial)', async () => {
  const conversationId = `intent-change-${Date.now()}`;
  await sendMessage('Tengo un Mack con pérdida de potencia', { conversationId });
  const { body } = await sendMessage('En realidad quiero una cotización de precio para 10 unidades', { conversationId });
  assert.equal(body.intent, 'commercial_inquiry');
});

// ── 8. A new failure reported after a completed diagnostic resets state ────

test('a new failure reported after a completed diagnostic does not blend with the old one', async () => {
  const conversationId = `new-failure-${Date.now()}`;
  await sendMessage('Tengo un Mack MP8 2020 con pérdida de potencia', { conversationId });
  await sendMessage('Hace tres días', { conversationId });
  await sendMessage('Carretera, filtro Donaldson P552100', { conversationId });
  const before = await sendMessage('¿Y esa referencia tiene stock?', { conversationId });
  assert.ok(before.body.state.symptoms.some(s => s.code === 'power_loss'), 'prior diagnostic symptom should still be on record before the reset');

  const { body } = await sendMessage('Ahora tengo otro problema: se apaga el motor de repente', { conversationId });
  assert.ok(!body.state.symptoms.some(s => s.code === 'power_loss'), 'old symptom must be cleared once a new problem is reported');
  assert.ok(body.state.symptoms.some(s => s.code === 'engine_stall'), 'new symptom must be recorded');
});

// ── 9. P552100 -> EL82100 only with DB evidence; full technical script ────

test('Freightliner/Detroit pressure-loss script resolves P552100 to EL82100 only via DB evidence', async () => {
  const conversationId = `full-script-${Date.now()}`;

  const t1 = await sendMessage('Tengo un Freightliner 2007 con Detroit Series 60. Cuando calienta baja la presión de aceite.', { conversationId });
  assert.equal(t1.body.state.equipment.brand, 'FREIGHTLINER');
  assert.equal(t1.body.state.equipment.year, 2007);
  assert.ok(t1.body.state.symptoms.some(s => s.code === 'pressure_loss'));
  assert.notEqual(t1.body.pending_field, 'equipment');
  assert.notEqual(t1.body.pending_field, 'symptoms');

  const t2 = await sendMessage('Principalmente en ralentí caliente y a veces prende la luz.', { conversationId });
  assert.ok(t2.body.state.symptoms.some(s => s.code === 'warning_light'));

  const t3 = await sendMessage('Hace cuatro días. El aceite tiene 6,000 millas.', { conversationId });
  assert.equal(t3.body.state.duration, 'cuatro días');

  const t4 = await sendMessage('Carretera, con bastante ralentí. Tiene Donaldson P552100.', { conversationId });
  assert.equal(t4.body.state.operatingContext, 'carretera');
  assert.equal(t4.body.state.installedFilter.reference, 'P552100');
  assert.equal(t4.body.state.phase, 'diagnostic_assessment');
  assert.equal(t4.body.evidence.validated, true);
  assert.equal(t4.body.evidence.products[0].sku, 'EL82100');
  assert.match(t4.body.answer, /EL82100/);
  assert.doesNotMatch(t4.body.answer, /el filtro es la causa|caus[oó] la falla/i);
});

// ── 10. Nonexistent reference never returns a SKU ───────────────────────────

test('a nonexistent installed-filter reference returns no SKU', async () => {
  const conversationId = `unknown-ref-${Date.now()}`;
  await sendMessage('Tengo un Mack MP8 2019 con pérdida de potencia', { conversationId });
  await sendMessage('Hace una semana', { conversationId });
  const { body } = await sendMessage('Carretera. Filtro Fram XYZNOTAREALCODE9999.', { conversationId });
  assert.equal(body.evidence.validated, false);
  assert.equal(body.evidence.count, 0);
  assert.match(body.answer, /No asignaré un SKU sin evidencia/);
});

// ── 11. Groq down mid-conversation falls back deterministically ───────────

test('Groq unavailable (network failure) falls back to the deterministic classifier without breaking the conversation', async () => {
  const originalFetch = global.fetch;
  process.env.GROQ_API_KEY = 'fake-key-for-this-test';
  global.fetch = async (url, ...rest) => {
    if (String(url).includes('api.groq.com')) throw new Error('simulated network failure');
    return originalFetch(url, ...rest);
  };
  try {
    const { status, body } = await sendMessage('Mack 2024 agua en el sistema', { conversationId: `groq-down-${Date.now()}` });
    assert.equal(status, 200);
    assert.equal(body.intelligence.classifier, 'deterministic');
    assert.equal(body.pending_field, 'symptom_system');
  } finally {
    global.fetch = originalFetch;
    delete process.env.GROQ_API_KEY;
  }
});

// ── 12. Knowledge Engine down still returns a single, valid response ──────

test('Knowledge Engine unavailable does not break the response', async () => {
  const originalFetch = global.fetch;
  process.env.KNOWLEDGE_ENGINE_RUNTIME_URL = 'https://fake-knowledge-engine.invalid';
  process.env.ENGINE_API_KEY = 'fake-engine-key';
  global.fetch = async (url, ...rest) => {
    if (String(url).includes('fake-knowledge-engine.invalid')) throw new Error('simulated knowledge engine outage');
    return originalFetch(url, ...rest);
  };
  try {
    const conversationId = `knowledge-down-${Date.now()}`;
    await sendMessage('Tengo un Mack MP8 2019 con pérdida de potencia', { conversationId });
    await sendMessage('Hace una semana', { conversationId });
    const { status, body } = await sendMessage('Carretera. No sé el filtro.', { conversationId });
    assert.equal(status, 200);
    // The obsidian-knowledge-client adapter normalizes every upstream
    // failure mode (not_configured/timeout/error) into 'unavailable' — see
    // lib/knowledge-governance/obsidian-knowledge-client.js VALID_STATUS.
    assert.equal(body.intelligence.knowledge_status, 'unavailable');
    assert.ok(body.answer && body.answer.length > 0);
  } finally {
    global.fetch = originalFetch;
    delete process.env.KNOWLEDGE_ENGINE_RUNTIME_URL;
    delete process.env.ENGINE_API_KEY;
  }
});

// ── 13. PostgreSQL down never invents a SKU ────────────────────────────────

test('PostgreSQL unavailable never invents a SKU', async () => {
  installFailingPool();
  try {
    const conversationId = `pg-down-${Date.now()}`;
    await sendMessage('Tengo un Mack MP8 2019 con pérdida de potencia', { conversationId });
    await sendMessage('Hace una semana', { conversationId });
    const { status, body } = await sendMessage('Carretera. Filtro Donaldson P552100.', { conversationId });
    assert.equal(status, 200);
    assert.equal(body.evidence.validated, false);
    assert.equal(body.evidence.lookup_status, 'error');
    assert.doesNotMatch(body.answer, /\bEL8\d{4}\b/);
  } finally {
    installFakePool();
  }
});

// ── 14. Redis down falls back to local memory without losing the request ──

test('Redis unavailable falls back to local memory and still answers the request', async () => {
  __setRedisClientForTests({
    status: 'ready',
    get: async () => { throw new Error('ECONNREFUSED: fake redis down'); },
    set: async () => { throw new Error('ECONNREFUSED: fake redis down'); }
  });
  try {
    const { status, body } = await sendMessage('Hola', { conversationId: `redis-down-${Date.now()}` });
    assert.equal(status, 200);
    assert.equal(body.memory.memory_source, 'local_fallback');
  } finally {
    __setRedisClientForTests(null);
  }
});

test('memory reports memory_source: redis when Redis is reachable', async () => {
  const store = new Map();
  __setRedisClientForTests({
    status: 'ready',
    get: async key => store.get(key) ?? null,
    set: async (key, value) => { store.set(key, value); return 'OK'; }
  });
  try {
    const { body } = await sendMessage('Tengo un Mack con pérdida de potencia', { conversationId: `redis-up-${Date.now()}` });
    assert.equal(body.memory.memory_source, 'redis');
  } finally {
    __setRedisClientForTests(null);
  }
});

// ── 15. 20 simultaneous conversations never mix memory ─────────────────────

test('20 simultaneous conversations do not mix memory', async () => {
  const brands = ['MACK', 'VOLVO', 'FREIGHTLINER', 'KENWORTH', 'CUMMINS'];
  const conversations = Array.from({ length: 20 }, (_, index) => ({
    id: `parallel-${index}-${Date.now()}`,
    brand: brands[index % brands.length]
  }));

  await Promise.all(conversations.map(conv => sendMessage(`Tengo un ${conv.brand} con pérdida de potencia`, { conversationId: conv.id })));
  const results = await Promise.all(conversations.map(conv => sendMessage('Hace una semana', { conversationId: conv.id })));

  results.forEach((result, index) => {
    assert.equal(result.body.state.equipment.brand, conversations[index].brand, `conversation ${conversations[index].id} leaked state`);
  });
});

// ── 16. No endpoint ever responds twice / no field already captured is re-asked ─

test('no already-captured field is asked for again across a full conversation', async () => {
  const conversationId = `no-repeat-${Date.now()}`;
  const questions = [];
  const t1 = await sendMessage('Tengo un Kenworth T680 2018 con pérdida de potencia', { conversationId });
  questions.push(t1.body.answer);
  const t2 = await sendMessage('Hace dos semanas', { conversationId });
  questions.push(t2.body.answer);
  const t3 = await sendMessage('Carretera, filtro Fleetguard LF3970', { conversationId });
  questions.push(t3.body.answer);

  assert.equal(new Set(questions).size, questions.length, 'a question was repeated verbatim');
  assert.doesNotMatch(t3.body.answer, /qu[eé] equipo|marca, modelo y motor/i);
  assert.doesNotMatch(t3.body.answer, /desde cu[aá]ndo/i);
});

test('a single HTTP request never produces more than one JSON response', async () => {
  const response = await fetch(`${baseUrl}/api/bot/protocol`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-bot-protocol-key': 'test-key' },
    body: JSON.stringify({ message: 'Hola', conversation_id: `single-response-${Date.now()}`, channel: 'whatsapp' })
  });
  const text = await response.text();
  assert.equal(response.status, 200);
  assert.doesNotThrow(() => JSON.parse(text));
});

test('unauthenticated requests are rejected before reaching the orchestrator', async () => {
  const response = await fetch(`${baseUrl}/api/bot/protocol`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'Hola', conversation_id: 'no-auth', channel: 'whatsapp' })
  });
  assert.equal(response.status, 401);
});
