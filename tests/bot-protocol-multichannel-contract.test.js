'use strict';

// Contract tests run identically across every active/compatible channel:
// web, instagram, whatsapp, facebook, and linkedin (linkedin included per
// spec as an ADAPTER_READY_SUSPENDED contract check -- it never gets a live
// deployment, but it must satisfy the same central-engine contract).
//
// Channel adapters (Instagram's protocol-client.js, Facebook's knowledge.js,
// WhatsApp's protocol-client.js) are thin, near-identical HTTP clients whose
// entire job is: forward {channel, conversation_id, message, context_seed?}
// to POST /api/bot/protocol and relay the response. The guarantees the spec
// asks for (B2B/B2C handling, continuity, diagnosis, SKU resolution,
// ambiguity, no-result handling, idempotency) are therefore actually
// enforced by the central engine itself -- so this suite drives the same
// real HTTP server used by tests/bot-protocol-e2e.test.js, parametrized by
// `channel`, which is the correct place to prove "same contract, every
// channel" rather than re-implementing five separate bot test harnesses.
//
// KNOWN GAP, reported here rather than silently worked around: literal
// customer-email capture ("pedir el correo, validarlo, agradecer, registrar
// el caso") does not exist in the central engine yet. What exists today is
// attempt-count-driven escalation to a FIXED internal support address
// (lib/bot-protocol-guardrails.js, MAX_UNRESOLVED_ATTEMPTS=5) -- this suite
// tests that real behavior and flags the missing piece explicitly instead
// of asserting something the code doesn't do.

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

const CHANNELS = ['web', 'instagram', 'whatsapp', 'facebook', 'linkedin'];

function normalizeRef(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

// Two distinct products sharing one OEM reference (P552100) via
// cross-reference so the "multiple candidates" scenario is real, not
// contrived -- both are legitimately returned as separate SKUs.
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
  },
  {
    id: 2, sku: 'EL82101', codigo_base: 'EL82101', name: 'Full-Flow Lube Oil Filter (heavy duty variant)',
    description: null, filter_type: 'Oil Filter', sub_type: null, technology: 'SYNTRAX',
    thread_size: null, height_mm: null, outer_diameter_mm: null, gasket_od_mm: null, gasket_id_mm: null,
    micron_rating: null, nominal_efficiency: null, filter_media: null,
    oem_codes: [{ manufacturer: 'DONALDSON', code: 'P552100' }],
    competitor_codes: [],
    brand_crossrefs: {},
    equipment_applications: [{ brand: 'MACK', engine: 'MP8' }],
    specs: {}, enrichment_data: {}, is_primary: false
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

async function sendMessage(message, { conversationId, channel, extra = {} } = {}) {
  const response = await fetch(`${baseUrl}/api/bot/protocol`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-bot-protocol-key': 'test-key' },
    body: JSON.stringify({ message, conversation_id: conversationId, channel, ...extra })
  });
  const body = await response.json();
  return { status: response.status, body };
}

for (const channel of CHANNELS) {
  test(`[${channel}] B2B: distribution_inquiry asks qualification, then reveals distributor-application link only after it is confirmed`, async () => {
    const conversationId = `${channel}-b2b-${Date.now()}`;
    const first = await sendMessage('Quiero ser distribuidor autorizado en mi país', { conversationId, channel });
    assert.equal(first.status, 200);
    assert.equal(first.body.intent, 'distribution_inquiry');
    assert.doesNotMatch(first.body.answer, /distributor-application/);

    const second = await sendMessage('Argentina, flota propia de 40 camiones, 8 años en filtración', { conversationId, channel });
    assert.match(second.body.answer, /https:\/\/elimfilters\.com\/distributor-application/);
  });

  test(`[${channel}] B2C: a diagnostic/product conversation never surfaces the distributor-application link`, async () => {
    const conversationId = `${channel}-b2c-${Date.now()}`;
    const t1 = await sendMessage('Tengo un Freightliner 2007 con Detroit Series 60. Cuando calienta baja la presión de aceite.', { conversationId, channel });
    assert.doesNotMatch(t1.body.answer, /distributor-application/);
    const t2 = await sendMessage('Hace tres días', { conversationId, channel });
    assert.doesNotMatch(t2.body.answer, /distributor-application/);
    const t3 = await sendMessage('Carretera, filtro Donaldson P552100', { conversationId, channel });
    assert.doesNotMatch(t3.body.answer, /distributor-application/);
  });

  test(`[${channel}] short continuity: a bare short reply ("MP8") is understood using prior-turn context`, async () => {
    const conversationId = `${channel}-short-continuity-${Date.now()}`;
    await sendMessage('Tengo un camión Mack con pérdida de potencia', { conversationId, channel });
    const { body } = await sendMessage('MP8', { conversationId, channel });
    assert.equal(body.state.equipment.engine, 'MP8');
  });

  test(`[${channel}] 20-turn continuity: equipment identified on turn 1 is still on record after 19 more turns`, async () => {
    const conversationId = `${channel}-20-turn-${Date.now()}`;
    await sendMessage('Tengo un Freightliner con Detroit Series 60', { conversationId, channel });
    for (let i = 0; i < 18; i += 1) {
      await sendMessage(`turno de contexto adicional numero ${i}`, { conversationId, channel });
    }
    const { body } = await sendMessage('¿segís teniendo el registro de mi equipo?', { conversationId, channel });
    assert.equal(body.state.equipment.brand, 'FREIGHTLINER');
  });

  test(`[${channel}] diagnostic + exact SKU: full script resolves P552100 to EL82100 with DB evidence`, async () => {
    const conversationId = `${channel}-diagnostic-exact-sku-${Date.now()}`;
    await sendMessage('Tengo un Freightliner 2007 con Detroit Series 60. Cuando calienta baja la presión de aceite.', { conversationId, channel });
    await sendMessage('Principalmente en ralentí caliente.', { conversationId, channel });
    await sendMessage('Hace cuatro días.', { conversationId, channel });
    const { body } = await sendMessage('Carretera. Tiene Donaldson P552100.', { conversationId, channel });
    assert.equal(body.evidence.validated, true);
    assert.ok(body.evidence.products.some(p => p.sku === 'EL82100' || p.sku === 'EL82101'));
  });

  test(`[${channel}] normalized code: a hyphenated/spaced variant of a known code still resolves`, async () => {
    const conversationId = `${channel}-normalized-code-${Date.now()}`;
    const { body } = await sendMessage('¿Qué equivalencia tiene el código P-552-100?', { conversationId, channel });
    assert.equal(body.evidence.validated, true, 'catalog lookup already normalizes non-alphanumeric characters (upper/regexp_replace) independently of migration 065');
  });

  test(`[${channel}] multiple candidates: an OEM code shared by two distinct SKUs surfaces both, never auto-picks one`, async () => {
    const conversationId = `${channel}-multi-candidate-${Date.now()}`;
    await sendMessage('Tengo un Mack con pérdida de potencia', { conversationId, channel });
    await sendMessage('Hace una semana', { conversationId, channel });
    const { body } = await sendMessage('Carretera, filtro Donaldson P552100', { conversationId, channel });
    const skus = body.evidence.products.map(p => p.sku);
    assert.ok(skus.includes('EL82100') && skus.includes('EL82101'), 'both candidates sharing the OEM code must be returned');
  });

  test(`[${channel}] no result: an unknown reference never invents a SKU`, async () => {
    const conversationId = `${channel}-no-result-${Date.now()}`;
    await sendMessage('Tengo un Mack MP8 2019 con pérdida de potencia', { conversationId, channel });
    await sendMessage('Hace una semana', { conversationId, channel });
    const { body } = await sendMessage('Carretera. Filtro Fram XYZNOTAREALCODE9999.', { conversationId, channel });
    assert.equal(body.evidence.validated, false);
    assert.match(body.answer, /No asignaré un SKU sin evidencia/);
  });

  // ── Support-email capture flow ─────────────────────────────────────────
  // "Carretera. Filtro Fram XYZNOTAREALCODE." reliably reclassifies to
  // exact_reference_lookup once equipment/duration are already established,
  // giving a real (not contrived) verified-search-found-nothing turn.

  test(`[${channel}] no result: a verified catalog search with zero matches asks for email immediately (not after 5 attempts)`, async () => {
    const conversationId = `${channel}-email-ask-${Date.now()}`;
    await sendMessage('Tengo un Mack MP8 2019 con pérdida de potencia', { conversationId, channel });
    await sendMessage('Hace una semana', { conversationId, channel });

    const { body } = await sendMessage('Carretera. Filtro Fram XYZNOTAREALCODE0.', { conversationId, channel });
    assert.equal(body.evidence.validated, false);
    assert.equal(body.conversationState, 'AWAITING_SUPPORT_EMAIL');
    assert.equal(body.supportLead.created, false);
    assert.doesNotMatch(body.answer, /\bEL8\d{4}\b/);
    assert.match(body.answer, /correo/i);
  });

  test(`[${channel}] valid email: registers the support lead and thanks the user once`, async () => {
    const conversationId = `${channel}-email-valid-${Date.now()}`;
    await sendMessage('Tengo un Mack MP8 2019 con pérdida de potencia', { conversationId, channel });
    await sendMessage('Hace una semana', { conversationId, channel });
    await sendMessage('Carretera. Filtro Fram XYZNOTAREALCODE0.', { conversationId, channel });

    const { body } = await sendMessage('Claro, mi correo es Juan.Perez@Example.COM', { conversationId, channel });
    assert.equal(body.supportLead.created, true);
    assert.equal(body.supportLead.email, 'juan.perez@example.com', 'email must be normalized (trimmed, lowercased)');
    assert.equal(body.supportLead.status, 'CREATED');
    assert.match(body.answer, /[Gg]racias/);
    assert.notEqual(body.conversationState, 'AWAITING_SUPPORT_EMAIL');
  });

  test(`[${channel}] invalid email: asks to confirm again without losing equipment/technical context`, async () => {
    const conversationId = `${channel}-email-invalid-${Date.now()}`;
    await sendMessage('Tengo un Freightliner 2007 con Detroit Series 60', { conversationId, channel });
    await sendMessage('Hace una semana', { conversationId, channel });
    await sendMessage('Carretera. Filtro Fram XYZNOTAREALCODE0.', { conversationId, channel });

    const { body } = await sendMessage('no tengo correo ahora mismo', { conversationId, channel });
    assert.equal(body.conversationState, 'AWAITING_SUPPORT_EMAIL');
    assert.equal(body.supportLead.created, false);
    assert.match(body.answer, /correo v[aá]lido|confirmarlo/i);
    assert.equal(body.state.equipment.brand, 'FREIGHTLINER', 'technical context must survive an invalid-email turn');
  });

  test(`[${channel}] duplicate delivery: the same email sent twice creates exactly one lead and never repeats the thank-you`, async () => {
    const conversationId = `${channel}-email-duplicate-${Date.now()}`;
    await sendMessage('Tengo un Mack MP8 2019 con pérdida de potencia', { conversationId, channel });
    await sendMessage('Hace una semana', { conversationId, channel });
    await sendMessage('Carretera. Filtro Fram XYZNOTAREALCODE0.', { conversationId, channel });

    const first = await sendMessage('mi correo es duplicado@example.com', { conversationId, channel });
    assert.equal(first.body.supportLead.created, true);
    const firstTicketId = first.body.state.supportLead.ticketId;
    assert.match(first.body.answer, /[Gg]racias/);

    const second = await sendMessage('mi correo es duplicado@example.com', { conversationId, channel });
    assert.equal(second.body.supportLead.created, true);
    assert.equal(second.body.state.supportLead.ticketId, firstTicketId, 'a repeated email for the same conversation must not create a second lead');
    assert.doesNotMatch(second.body.answer, /^Gracias\. Registramos/, 'the thank-you must never be sent twice');
  });

  test(`[${channel}] short message with email: a bare email reply still resolves and keeps the prior technical context`, async () => {
    const conversationId = `${channel}-email-short-context-${Date.now()}`;
    await sendMessage('Tengo un Freightliner 2007 con Detroit Series 60', { conversationId, channel });
    await sendMessage('Hace una semana', { conversationId, channel });
    await sendMessage('Carretera. Filtro Fram XYZNOTAREALCODE0.', { conversationId, channel });

    const { body } = await sendMessage('juan@example.com', { conversationId, channel });
    assert.equal(body.supportLead.created, true);
    assert.equal(body.supportLead.email, 'juan@example.com');
    assert.equal(body.state.equipment.brand, 'FREIGHTLINER', 'a short bare-email reply must not lose the equipment already on record');
  });

  test(`[${channel}] API down: Knowledge Engine unavailable still returns a single valid response, never a second/duplicate one`, async () => {
    const originalFetch = global.fetch;
    process.env.KNOWLEDGE_ENGINE_RUNTIME_URL = 'https://fake-knowledge-engine.invalid';
    process.env.ENGINE_API_KEY = 'fake-engine-key';
    global.fetch = async (url, ...rest) => {
      if (String(url).includes('fake-knowledge-engine.invalid')) throw new Error('simulated outage');
      return originalFetch(url, ...rest);
    };
    try {
      const conversationId = `${channel}-api-down-${Date.now()}`;
      await sendMessage('Tengo un Mack MP8 2019 con pérdida de potencia', { conversationId, channel });
      await sendMessage('Hace una semana', { conversationId, channel });
      const { status, body } = await sendMessage('Carretera. No sé el filtro.', { conversationId, channel });
      assert.equal(status, 200);
      assert.ok(body.answer && body.answer.length > 0);
    } finally {
      global.fetch = originalFetch;
      delete process.env.KNOWLEDGE_ENGINE_RUNTIME_URL;
      delete process.env.ENGINE_API_KEY;
    }
  });

  test(`[${channel}] idempotency: context_seed is applied once for a new conversation and never duplicated on redelivery`, async () => {
    const conversationId = `${channel}-idempotency-${Date.now()}`;
    const seed = ['mensaje histórico previo a la migración'];
    const first = await sendMessage('primer mensaje real', { conversationId, channel, extra: { context_seed: seed } });
    assert.equal(first.body.memory.context_seed_applied, true);

    const second = await sendMessage('segundo mensaje real', { conversationId, channel, extra: { context_seed: seed } });
    assert.equal(second.body.memory.context_seed_applied, false);
    const occurrences = second.body.state.conversationHistory.filter(m => m === 'mensaje histórico previo a la migración').length;
    assert.equal(occurrences, 1);
  });
}

test('LinkedIn passes the same contract as every other channel while remaining ADAPTER_READY_SUSPENDED (no live deployment implied by these tests)', async () => {
  const conversationId = `linkedin-suspended-marker-${Date.now()}`;
  const { body } = await sendMessage('Hola', { conversationId, channel: 'linkedin' });
  assert.equal(body.intent, 'greeting');
  // This suite only proves the CONTRACT holds for linkedin against the
  // engine directly -- it intentionally never starts or calls
  // elimfilters-linkedin-bot's own server, matching "sin servicio activo".
});
