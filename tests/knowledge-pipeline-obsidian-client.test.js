'use strict';

// Direct unit tests for lib/knowledge-governance/obsidian-knowledge-client.js.
// global.fetch is stubbed so these run fast, free and deterministic — no
// real knowledge-engine-runtime instance is contacted.

const test = require('node:test');
const assert = require('node:assert/strict');

const ORIGINAL_ENV = { ...process.env };
process.env.KNOWLEDGE_ENGINE_RUNTIME_URL = 'https://fake-knowledge-engine.invalid';
process.env.ENGINE_API_KEY = 'fake-engine-key';
delete process.env.KNOWLEDGE_CENTER_API_URL;
delete process.env.KNOWLEDGE_CENTER_API_KEY;

const { queryApprovedTechnicalKnowledge, VALID_STATUS } = require('../lib/knowledge-governance/obsidian-knowledge-client');
const { isApprovedTechnicalEvidence } = require('../lib/knowledge-governance/technical-evidence-contract');

let originalFetch;
test.before(() => { originalFetch = global.fetch; });
test.after(() => {
  global.fetch = originalFetch;
  Object.keys(process.env).forEach(key => { if (!(key in ORIGINAL_ENV)) delete process.env[key]; });
  Object.assign(process.env, ORIGINAL_ENV);
});

function stubReason(responseBody, { ok = true } = {}) {
  global.fetch = async (url) => {
    if (!String(url).includes('/api/knowledge-engine/v1/reason')) throw new Error(`unexpected fetch: ${url}`);
    return { ok, status: ok ? 200 : 500, json: async () => responseBody, text: async () => JSON.stringify(responseBody) };
  };
}

// Case 1: Obsidian devuelve evidencia aprobada -> afirmación técnica permitida.
test('an ANSWER action with a sourced citation becomes validated, approved evidence', async () => {
  stubReason({
    action: 'ANSWER',
    confidence: 0.9,
    answer: 'Cambiar el filtro de combustible cada 500 horas según el manual OEM.',
    citations: [{ recordId: 'rec-1', versionId: 'ver-1', sourceId: 'src-1', label: 'Manual OEM Mack MP8' }]
  });

  const result = await queryApprovedTechnicalKnowledge({
    question: '¿Cada cuánto se cambia el filtro de combustible?',
    equipment: { brand: 'MACK', model: null, engine: 'MP8', year: 2019 },
    system: 'fuel',
    intent: 'diagnostic',
    conversationId: 'conv-1',
    requestId: 'req-1'
  });

  assert.equal(result.status, 'validated');
  assert.equal(result.source_count, 1);
  assert.equal(result.evidence.length, 1);
  assert.ok(isApprovedTechnicalEvidence(result.evidence[0]), 'evidence must pass the Bloque 1 approval gate');
  assert.equal(result.evidence[0].source_authority, 'obsidian');
});

// Case 2: Obsidian devuelve texto sin metadata (no sourceId) -> bloqueado.
test('an ANSWER action whose citation carries no sourceId is never treated as approved', async () => {
  stubReason({
    action: 'ANSWER',
    confidence: 0.9,
    answer: 'Texto sin fuente rastreable.',
    citations: [{ recordId: 'rec-2', versionId: 'ver-2', label: 'Registro sin fuente' }]
  });

  const result = await queryApprovedTechnicalKnowledge({
    question: 'pregunta cualquiera',
    equipment: { brand: 'MACK' },
    requestId: 'req-2'
  });

  assert.equal(result.status, 'not_found');
  assert.equal(result.evidence.length, 0);
});

// Case 3 (client half): Obsidian no encuentra información -> not_found.
test('an ESCALATE action means no approved knowledge matched', async () => {
  stubReason({ action: 'ESCALATE', confidence: 0, answer: null, citations: [], escalationReason: 'No approved knowledge matched the request.' });

  const result = await queryApprovedTechnicalKnowledge({ question: 'pregunta sin evidencia', equipment: { brand: 'VOLVO' }, requestId: 'req-3' });

  assert.equal(result.status, 'not_found');
  assert.equal(result.source_count, 0);
});

// Case 10: Evidencia con conflicto -> no se publica.
test('a VERIFY action (contradiction detected) never resolves to validated', async () => {
  stubReason({
    action: 'VERIFY',
    confidence: 0.4,
    answer: null,
    citations: [{ recordId: 'rec-4', versionId: 'ver-4', sourceId: 'src-4', label: 'Fuente en conflicto' }]
  });

  const result = await queryApprovedTechnicalKnowledge({ question: 'pregunta con conflicto', equipment: { brand: 'MACK' }, requestId: 'req-4' });

  assert.equal(result.status, 'conflicting_sources');
  assert.equal(result.conflicts_detected, true);
  assert.notEqual(result.status, 'validated');
});

// Case 29: Timeout de Obsidian no rompe la llamada — resuelve a 'unavailable'.
test('an upstream failure (simulated timeout) resolves to unavailable, never throws', async () => {
  global.fetch = async () => {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    throw error;
  };

  const result = await queryApprovedTechnicalKnowledge({ question: 'pregunta cualquiera', equipment: { brand: 'MACK' }, requestId: 'req-5' });

  assert.equal(result.status, 'unavailable');
  assert.equal(result.evidence.length, 0);
});

test('VALID_STATUS matches the exact spec enum', () => {
  assert.deepEqual([...VALID_STATUS].sort(), [
    'conflicting_sources', 'insufficient_equipment_data', 'not_found', 'unavailable', 'validated'
  ].sort());
});

test('an empty question never reaches the network and returns insufficient_equipment_data', async () => {
  let called = false;
  global.fetch = async () => { called = true; return { ok: true, json: async () => ({}) }; };
  const result = await queryApprovedTechnicalKnowledge({ question: '   ', equipment: {}, requestId: 'req-6' });
  assert.equal(result.status, 'insufficient_equipment_data');
  assert.equal(called, false);
});
