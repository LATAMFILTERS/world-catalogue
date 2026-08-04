'use strict';

// Direct unit tests for lib/knowledge-governance/hermes-client.js.
// global.fetch is stubbed for the knowledge-center-api candidate-cases
// endpoint — no real service is contacted.

const test = require('node:test');
const assert = require('node:assert/strict');

const ORIGINAL_ENV = { ...process.env };

const { createHermesResearchRequest, VALID_STATUS } = require('../lib/knowledge-governance/hermes-client');

let originalFetch;
test.before(() => { originalFetch = global.fetch; });
test.afterEach(() => {
  global.fetch = originalFetch;
  Object.keys(process.env).forEach(key => { if (!(key in ORIGINAL_ENV)) delete process.env[key]; });
  Object.assign(process.env, ORIGINAL_ENV);
});

const KNOWLEDGE_GAP = {
  request_id: 'gap-req-1',
  deduplication_key: 'oem_maintenance_interval:mack:na:mp8:2019:fuel:na:pregunta',
  request_type: 'oem_maintenance_interval',
  equipment: { brand: 'MACK', model: null, engine: 'MP8', year: 2019 },
  system: 'fuel',
  question: '¿Cada cuánto se cambia el filtro de combustible?',
  reason: 'technical knowledge query returned not_found',
  priority: 'medium',
  hermes_research_id: null
};

test('VALID_STATUS matches the exact spec enum', () => {
  assert.deepEqual([...VALID_STATUS].sort(), ['accepted', 'duplicate', 'rejected', 'unavailable'].sort());
});

// Case 6: HERMES desactivado -> vacío persiste, conversación continúa (no network call).
test('HERMES_REQUESTS_ENABLED unset means no network call is ever made', async () => {
  delete process.env.HERMES_REQUESTS_ENABLED;
  let called = false;
  global.fetch = async () => { called = true; return { ok: true, json: async () => ({ id: 'should-not-happen' }) }; };

  const result = await createHermesResearchRequest({ knowledgeGap: KNOWLEDGE_GAP, requestId: 'req-1', conversationId: 'conv-1' });

  assert.equal(result.status, 'unavailable');
  assert.equal(result.error_code, 'hermes_requests_disabled');
  assert.equal(result.hermes_research_id, null);
  assert.equal(called, false);
});

// Case 7: HERMES no disponible (habilitado pero falla la red) -> conversación continúa.
test('a network failure while enabled resolves to unavailable without throwing', async () => {
  process.env.HERMES_REQUESTS_ENABLED = 'true';
  process.env.KNOWLEDGE_CENTER_API_URL = 'https://fake-knowledge-center.invalid';
  process.env.KNOWLEDGE_CENTER_API_KEY = 'fake-key';
  global.fetch = async () => { throw new Error('simulated network outage'); };

  const result = await createHermesResearchRequest({ knowledgeGap: KNOWLEDGE_GAP, requestId: 'req-2', conversationId: 'conv-2' });

  assert.equal(result.status, 'unavailable');
  assert.equal(result.hermes_research_id, null);
});

// Case 8: HERMES acepta solicitud -> ID persistido.
test('a successful submission returns status accepted with a real hermes_research_id', async () => {
  process.env.HERMES_REQUESTS_ENABLED = 'true';
  process.env.KNOWLEDGE_CENTER_API_URL = 'https://fake-knowledge-center.invalid';
  process.env.KNOWLEDGE_CENTER_API_KEY = 'fake-key';
  global.fetch = async (url, opts) => {
    assert.ok(String(url).includes('/api/knowledge-center/v1/candidate-cases'));
    assert.equal(opts.headers['x-actor-role'], 'BOT_PROTOCOL');
    const body = JSON.parse(opts.body);
    assert.equal(body.sourceChannel, 'KNOWLEDGE_GOVERNANCE_BOT');
    assert.equal(body.priority, 'NORMAL');
    // Only equipment/system/component/question/priority/source-type data —
    // never full conversation history or secrets.
    assert.ok(!('conversationHistory' in body.structuredIntake));
    return { ok: true, status: 201, json: async () => ({ id: 'candidate-case-123', status: 'CAPTURED' }) };
  };

  const result = await createHermesResearchRequest({
    knowledgeGap: KNOWLEDGE_GAP,
    researchRequest: { research_question: KNOWLEDGE_GAP.question, required_source_types: ['oem_manual'] },
    requestId: 'req-3',
    conversationId: 'conv-3'
  });

  assert.equal(result.status, 'accepted');
  assert.equal(result.hermes_research_id, 'candidate-case-123');
  assert.ok(result.submitted_at);
});

// Case 5: vacío existente con solicitud HERMES activa -> no crea otra.
test('a knowledge gap that already has a hermes_research_id is never resent', async () => {
  let called = false;
  process.env.HERMES_REQUESTS_ENABLED = 'true';
  process.env.KNOWLEDGE_CENTER_API_URL = 'https://fake-knowledge-center.invalid';
  process.env.KNOWLEDGE_CENTER_API_KEY = 'fake-key';
  global.fetch = async () => { called = true; return { ok: true, json: async () => ({ id: 'new-id' }) }; };

  const result = await createHermesResearchRequest({
    knowledgeGap: { ...KNOWLEDGE_GAP, hermes_research_id: 'already-existing-case-id' },
    requestId: 'req-4',
    conversationId: 'conv-4'
  });

  assert.equal(result.status, 'duplicate');
  assert.equal(result.hermes_research_id, 'already-existing-case-id');
  assert.equal(called, false);
});

test('an invalid knowledge gap (no question) is rejected before any network call', async () => {
  let called = false;
  process.env.HERMES_REQUESTS_ENABLED = 'true';
  global.fetch = async () => { called = true; return { ok: true, json: async () => ({}) }; };

  const result = await createHermesResearchRequest({ knowledgeGap: { ...KNOWLEDGE_GAP, question: '' }, requestId: 'req-5' });

  assert.equal(result.status, 'rejected');
  assert.equal(called, false);
});

// Case 9: HERMES devuelve investigación -> nunca se muestra al usuario. This
// is verified structurally: the accepted-response shape carries only a
// submission acknowledgement (status/id/queue_status/submitted_at), never
// an "answer", "findings", or "sources" field a caller could mistakenly
// forward to the customer.
test('the response shape never carries findings/answer/sources fields', async () => {
  process.env.HERMES_REQUESTS_ENABLED = 'true';
  process.env.KNOWLEDGE_CENTER_API_URL = 'https://fake-knowledge-center.invalid';
  process.env.KNOWLEDGE_CENTER_API_KEY = 'fake-key';
  global.fetch = async () => ({ ok: true, status: 201, json: async () => ({ id: 'case-999', status: 'CAPTURED' }) });

  const result = await createHermesResearchRequest({ knowledgeGap: KNOWLEDGE_GAP, requestId: 'req-6', conversationId: 'conv-6' });

  assert.deepEqual(Object.keys(result).sort(), ['error_code', 'hermes_research_id', 'queue_status', 'status', 'submitted_at'].sort());
  assert.ok(!('answer' in result));
  assert.ok(!('findings' in result));
  assert.ok(!('sources' in result));
});
