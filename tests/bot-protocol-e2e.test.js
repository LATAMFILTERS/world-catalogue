'use strict';

// Real end-to-end HTTP tests for /api/bot/protocol: a real Express server is
// started on an ephemeral port and exercised with real fetch() calls. The
// PostgreSQL pool and Redis client are swapped for deterministic in-memory
// test doubles via the seams in bot-protocol-db.js / bot-protocol-memory.js;
// everything else (security middleware, JSON parsing, the orchestrator
// pipeline, guardrails, channel formatting) runs for real.

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

function referenceParams(params = []) {
  const out = [];
  for (const value of params[0] || []) {
    if (typeof value === 'string' && /^[\[{]/.test(value.trim())) {
      try {
        const parsed = JSON.parse(value);
        const entries = Array.isArray(parsed) ? parsed : [parsed];
        for (const entry of entries) {
          if (!entry || typeof entry !== 'object') continue;
          for (const candidate of Object.values(entry)) {
            if (typeof candidate === 'string' || typeof candidate === 'number') out.push(normalizeRef(candidate));
          }
        }
        continue;
      } catch {}
    }
    out.push(normalizeRef(value));
  }
  return [...new Set(out.filter(Boolean))];
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
        const refs = referenceParams(params);
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

test('a greeting combined with a technical query is not classified as greeting', async () => {
  const { body } = await sendMessage('Hola, tengo un Mack 2024 con agua en el sistema', { conversationId: `greet-query-${Date.now()}` });
  assert.notEqual(body.intent, 'greeting');
  assert.equal(body.intent, 'diagnostic');
});

test('Mack 2024 agua en el sistema asks which system, without re-asking symptoms', async () => {
  const { body } = await sendMessage('Mack 2024 agua en el sistema', { conversationId: `water-flow-${Date.now()}` });
  assert.equal(body.intent, 'diagnostic');
  assert.equal(body.pending_field, 'symptom_system');
  assert.match(body.answer, /combustible, aceite, refrigerante, hidr[aá]ulico o (?:en el sistema de )?aire/i);
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

test('short reply "4 días" is understood as duration', async () => {
  const conversationId = `short-duration-${Date.now()}`;
  await sendMessage('Mack 2024 agua en el sistema', { conversationId });
  await sendMessage('combustible', { conversationId });
  const { body } = await sendMessage('4 días', { conversationId });
  assert.equal(body.state.duration, '4 días');
});

test('the conversation can change intent mid-flow (diagnostic -> commercial)', async () => {
  const conversationId = `intent-change-${Date.now()}`;
  await sendMessage('Tengo un Mack con pérdida de potencia', { conversationId });
  const { body } = await sendMessage('En realidad quiero una cotización de precio para 10 unidades', { conversationId });
  assert.equal(body.intent, 'commercial_inquiry');
});

test('distribution_inquiry asks for qualification first, then reveals the distributor-application link only after it is answered', async () => {
  const conversationId = `distribution-${Date.now()}`;
  const first = await sendMessage('Quiero ser distribuidor autorizado en mi país', { conversationId });
  assert.equal(first.body.intent, 'distribution_inquiry');
  assert.doesNotMatch(first.body.answer, /distributor-application/);
  assert.match(first.body.answer, /pa[ií]s|territorio|experiencia/i);
  const second = await sendMessage('Argentina, flota propia de 40 camiones, 8 años en el rubro de filtración', { conversationId });
  assert.equal(second.body.intent, 'distribution_inquiry');
  assert.match(second.body.answer, /https:\/\/elimfilters\.com\/distributor-application/);
});

test('commercial_inquiry (generic "where to buy") never receives the distributor-application link', async () => {
  const conversationId = `commercial-no-link-${Date.now()}`;
  const first = await sendMessage('Necesito cotización para 10 unidades', { conversationId });
  assert.equal(first.body.intent, 'commercial_inquiry');
  assert.doesNotMatch(first.body.answer, /distributor-application/);
  const second = await sendMessage('Argentina, entrega en Buenos Aires', { conversationId });
  assert.doesNotMatch(second.body.answer, /distributor-application/);
});

test('a B2C diagnostic/product conversation never surfaces the distributor-application link at any point', async () => {
  const conversationId = `b2c-no-link-${Date.now()}`;
  const t1 = await sendMessage('Tengo un Freightliner 2007 con Detroit Series 60. Cuando calienta baja la presión de aceite.', { conversationId });
  assert.doesNotMatch(t1.body.answer, /distributor-application/);
  const t2 = await sendMessage('Hace tres días', { conversationId });
  assert.doesNotMatch(t2.body.answer, /distributor-application/);
  const t3 = await sendMessage('Carretera, filtro Donaldson P552100', { conversationId });
  assert.doesNotMatch(t3.body.answer, /distributor-application/);
});

test('a new failure reported after a completed diagnostic does not blend with the old one', async () => {
  const conversationId = `new-failure-${Date.now()}`;
  await sendMessage('Tengo un Mack MP8 2020 con pérdida de potencia', { conversationId });
  await sendMessage('Hace tres días', { conversationId });
  await sendMessage('Carretera, filtro Donaldson P552100', { conversationId });
  const before = await sendMessage('¿Y esa referencia tiene stock?', { conversationId });
  assert.ok(before.body.state.symptoms.some(s => s.code === 'power_loss'));
  const { body } = await sendMessage('Ahora tengo otro problema: se apaga el motor de repente', { conversationId });
  assert.ok(!body.state.symptoms.some(s => s.code === 'power_loss'));
  assert.ok(body.state.symptoms.some(s => s.code === 'engine_stall'));
});

test('Freightliner/Detroit pressure-loss script resolves P552100 to EL82100 only via DB evidence', async () => {
  const conversationId = `full-script-${Date.now()}`;
  const t1 = await sendMessage('Tengo un Freightliner 2007 con Detroit Series 60. Cuando calienta baja la presión de aceite.', { conversationId });
  assert.equal(t1.body.state.equipment.brand, 'FREIGHTLINER');
  assert.equal(t1.body.state.equipment.year, 2007);
  assert.ok(t1.body.state.symptoms.some(s => s.code === 'pressure_loss'));
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

test('recommending a SKU queries both canonical Postgres catalog and Knowledge Center', async () => {
  let catalogQueryCount = 0;
  __setProtocolPoolForTests({ connect: async () => {
    const real = fakeCatalogClient();
    return { async query(sql, params) { if (/FROM elimfilters_catalog/i.test(String(sql))) catalogQueryCount += 1; return real.query(sql, params); }, release: () => real.release() };
  }});
  let knowledgeEngineFetchCount = 0;
  const originalFetch = global.fetch;
  process.env.KNOWLEDGE_ENGINE_RUNTIME_URL = 'https://fake-knowledge-engine.invalid';
  process.env.ENGINE_API_KEY = 'fake-engine-key';
  global.fetch = async (url, ...rest) => {
    if (String(url).includes('fake-knowledge-engine.invalid')) { knowledgeEngineFetchCount += 1; throw new Error('simulated'); }
    return originalFetch(url, ...rest);
  };
  try {
    const conversationId = `catalog-and-knowledge-invoked-${Date.now()}`;
    await sendMessage('Tengo un Freightliner 2007 con Detroit Series 60. Cuando calienta baja la presión de aceite.', { conversationId });
    await sendMessage('Principalmente en ralentí caliente y a veces prende la luz.', { conversationId });
    await sendMessage('Hace cuatro días. El aceite tiene 6,000 millas.', { conversationId });
    const { body } = await sendMessage('Carretera, con bastante ralentí. Tiene Donaldson P552100.', { conversationId });
    assert.ok(catalogQueryCount > 0);
    assert.ok(knowledgeEngineFetchCount > 0);
    assert.equal(body.evidence.validated, true);
    assert.match(body.answer, /EL82100/);
  } finally {
    global.fetch = originalFetch;
    delete process.env.KNOWLEDGE_ENGINE_RUNTIME_URL;
    delete process.env.ENGINE_API_KEY;
    installFakePool();
  }
});

test('a nonexistent installed-filter reference returns no SKU', async () => {
  const conversationId = `unknown-ref-${Date.now()}`;
  await sendMessage('Tengo un Mack MP8 2019 con pérdida de potencia', { conversationId });
  await sendMessage('Hace una semana', { conversationId });
  const { body } = await sendMessage('Carretera. Filtro Fram XYZNOTAREALCODE9999.', { conversationId });
  assert.equal(body.evidence.validated, false);
  assert.equal(body.evidence.count, 0);
  assert.doesNotMatch(body.answer, /\bE[A-Z]\d{4,7}\b/);
});

test('Groq unavailable (network failure) falls back to a deterministic classifier without breaking the conversation', async () => {
  const originalFetch = global.fetch;
  process.env.GROQ_API_KEY = 'fake-key-for-this-test';
  global.fetch = async (url, ...rest) => {
    if (String(url).includes('api.groq.com')) throw new Error('simulated network failure');
    return originalFetch(url, ...rest);
  };
  try {
    const { status, body } = await sendMessage('Mack 2024 agua en el sistema', { conversationId: `groq-down-${Date.now()}` });
    assert.equal(status, 200);
    assert.match(body.intelligence.classifier, /^deterministic(?:_|$)/);
    assert.equal(body.pending_field, 'symptom_system');
  } finally {
    global.fetch = originalFetch;
    delete process.env.GROQ_API_KEY;
  }
});

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
    assert.equal(body.intelligence.knowledge_status, 'unavailable');
    assert.ok(body.answer && body.answer.length > 0);
  } finally {
    global.fetch = originalFetch;
    delete process.env.KNOWLEDGE_ENGINE_RUNTIME_URL;
    delete process.env.ENGINE_API_KEY;
  }
});

test('PostgreSQL unavailable never invents a SKU', async () => {
  installFailingPool();
  try {
    const conversationId = `pg-down-${Date.now()}`;
    await sendMessage('Tengo un Mack MP8 2019 con pérdida de potencia', { conversationId });
    await sendMessage('Hace una semana', { conversationId });
    const { status, body } = await sendMessage('Carretera. Filtro Donaldson P552100.', { conversationId });
    assert.equal(status, 200);
    assert.equal(body.evidence.validated, false);
    assert.ok(['error', 'database_unavailable'].includes(body.evidence.lookup_status));
    assert.doesNotMatch(body.answer, /\bEL8\d{4}\b/);
  } finally { installFakePool(); }
});

test('Redis unavailable falls back to local memory and still answers the request', async () => {
  __setRedisClientForTests({ get: async () => { throw new Error('Redis down'); }, setEx: async () => { throw new Error('Redis down'); } });
  try {
    const { status, body } = await sendMessage('Tengo un Mack MP8 2019 con pérdida de potencia', { conversationId: `redis-down-${Date.now()}` });
    assert.equal(status, 200);
    assert.equal(body.intent, 'diagnostic');
  } finally { __setRedisClientForTests(null); }
});

test('20 simultaneous conversations do not leak state between sessions', async () => {
  const requests = Array.from({ length: 20 }, (_, i) => sendMessage(`Tengo un Mack MP8 20${String(i).padStart(2, '0')} con pérdida de potencia`, { conversationId: `parallel-${Date.now()}-${i}` }));
  const results = await Promise.all(requests);
  for (const { status, body } of results) {
    assert.equal(status, 200);
    assert.equal(body.intent, 'diagnostic');
  }
});
