const test = require('node:test');
const assert = require('node:assert/strict');

const {
  memoryKey,
  createEmptyState,
  normalizeState,
  isStandaloneGreeting,
  isNewDiagnosticStart,
  resetDiagnosticState,
  loadMemory,
  saveMemory,
  __setRedisClientForTests
} = require('../lib/bot-protocol-memory');

test('memory is isolated by channel and conversation id', () => {
  assert.equal(memoryKey({ channel: 'whatsapp', conversation_id: 'client-42' }), 'bot-protocol:whatsapp:client-42');
  assert.equal(memoryKey({ channel: 'whatsapp' }), null);
});

test('greeting detection ignores a greeting attached to a technical query', () => {
  assert.equal(isStandaloneGreeting('Hola'), true);
  assert.equal(isStandaloneGreeting('Hola, tengo un Mack con caída de presión'), false);
});

test('createEmptyState matches the canonical conversation-state shape', () => {
  const state = createEmptyState();
  assert.deepEqual(Object.keys(state).sort(), [
    'conversationHistory', 'duration', 'equipment', 'identifiedHousing', 'impact', 'installedFilter',
    'intent', 'knowledgeGap', 'oemMaintenance', 'operatingContext', 'pendingField',
    'phase', 'productRecommendation', 'symptoms', 'technicalKnowledge',
    'unresolvedAttempts', 'updatedAt', 'validatedProducts'
  ].sort());
  assert.deepEqual(state.equipment, { brand: null, model: null, engine: null, year: null });
  assert.deepEqual(state.installedFilter, { type: null, brand: null, reference: null, status: null });
  assert.deepEqual(state.identifiedHousing, { sku: null, externalReference: null, compatibleSeries: [] });
  // Bloque 2 (knowledge governance pipeline) pointers — see spec section 9.
  assert.deepEqual(state.technicalKnowledge, { status: null, sourceIds: [], lastQuery: null, validatedAt: null });
  assert.deepEqual(state.oemMaintenance, { status: null, system: null, component: null, evidenceId: null });
  assert.deepEqual(state.knowledgeGap, { requestId: null, deduplicationKey: null, status: null, hermesResearchId: null });
  assert.deepEqual(state.productRecommendation, { categories: [], validatedSkus: [] });
});

test('normalizeState dedupes symptoms by code+system', () => {
  const state = normalizeState({
    symptoms: [
      { code: 'water_contamination', raw: 'agua en el sistema', system: 'unknown' },
      { code: 'water_contamination', raw: 'agua en el sistema', system: 'unknown' }
    ]
  });
  assert.equal(state.symptoms.length, 1);
});

test('a completed diagnostic followed by a new reported problem resets diagnostic fields', () => {
  const state = {
    intent: 'diagnostic',
    phase: 'diagnostic_assessment',
    equipment: { brand: 'MACK', model: null, engine: 'MP8', year: 2020 },
    symptoms: [{ code: 'pressure_loss', raw: 'pierde presión', system: null }]
  };
  assert.equal(isNewDiagnosticStart('Ahora tengo otro problema: se apaga el motor', state), true);
  assert.equal(isNewDiagnosticStart('¿Y ese filtro tiene stock?', state), false);

  const reset = resetDiagnosticState(state);
  assert.deepEqual(reset.equipment, { brand: null, model: null, engine: null, year: null });
  assert.deepEqual(reset.symptoms, []);
  assert.deepEqual(reset.identifiedHousing, { sku: null, externalReference: null, compatibleSeries: [] });
  assert.equal(reset.intent, null);
});

test('memory persists via injected fake redis client and reports memory_source: redis', async () => {
  const store = new Map();
  __setRedisClientForTests({
    status: 'ready',
    get: async key => store.get(key) ?? null,
    set: async (key, value) => { store.set(key, value); return 'OK'; }
  });
  try {
    const key = 'bot-protocol:whatsapp:test-conv';
    const source = await saveMemory(key, { ...createEmptyState(), intent: 'diagnostic' });
    assert.equal(source, 'redis');
    const { state, source: readSource } = await loadMemory(key);
    assert.equal(readSource, 'redis');
    assert.equal(state.intent, 'diagnostic');
  } finally {
    __setRedisClientForTests(null);
  }
});

test('a failing redis client falls back to local memory and reports memory_source: local_fallback', async () => {
  __setRedisClientForTests({
    status: 'ready',
    get: async () => { throw new Error('ECONNREFUSED'); },
    set: async () => { throw new Error('ECONNREFUSED'); }
  });
  try {
    const key = 'bot-protocol:whatsapp:test-conv-2';
    const source = await saveMemory(key, { ...createEmptyState(), intent: 'diagnostic' });
    assert.equal(source, 'local_fallback');
    const { state, source: readSource } = await loadMemory(key);
    assert.equal(readSource, 'local_fallback');
    assert.equal(state.intent, 'diagnostic');
  } finally {
    __setRedisClientForTests(null);
  }
});
