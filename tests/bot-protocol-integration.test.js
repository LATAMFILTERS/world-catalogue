const test = require('node:test');
const assert = require('node:assert/strict');

const { applyProtocolGuardrails } = require('../lib/bot-protocol-guardrails');
const { formatForChannel } = require('../lib/bot-protocol-channel-format');
const { memoryKey, mergeContext, memoryFromResponse } = require('../lib/bot-protocol-memory');

function basePayload(overrides = {}) {
  return {
    protocol_version: '1.2.0',
    intent: 'application_lookup',
    phase: 'catalog_resolution',
    entities: { references: [], equipment_tokens: ['MACK', 'MP8'] },
    evidence: {
      source: 'elimfilters_catalog',
      count: 1,
      validated: true,
      products: [{ id: 1, sku: 'EF90668', codigo_base: 'P550668' }]
    },
    answer: 'Aplicaciones confirmadas en el catálogo ELIMFILTERS:\n\n• EF90668 / P550668',
    ...overrides
  };
}

test('central protocol preserves validated catalog evidence', () => {
  const guarded = applyProtocolGuardrails(basePayload(), { context: { unresolved_attempts: 0 } });
  assert.equal(guarded.evidence.validated, true);
  assert.equal(guarded.evidence.count, 1);
  assert.equal(guarded.governance.invented_sku_blocked, true);
  assert.equal(guarded.governance.resolution_status, 'resolved_with_catalog_evidence');
});

test('central protocol blocks unsupported recommendations and hands off after five attempts', () => {
  const guarded = applyProtocolGuardrails(basePayload({
    evidence: { source: 'elimfilters_catalog', count: 0, validated: false, products: [] },
    answer: 'undefined'
  }), { context: { unresolved_attempts: 5 } });

  assert.equal(guarded.evidence.validated, false);
  assert.equal(guarded.governance.requires_handoff, true);
  assert.equal(guarded.governance.handoff_email, 'support@elimfilters.com');
  assert.match(guarded.answer, /support@elimfilters\.com/);
  assert.doesNotMatch(guarded.answer, /undefined/i);
});

test('channel formatter applies channel metadata and character limits', () => {
  const formatted = formatForChannel(basePayload(), { channel: 'instagram' });
  assert.equal(formatted.delivery.channel, 'instagram');
  assert.equal(formatted.delivery.character_limit, 900);
  assert.equal(formatted.delivery.format, 'plain_text');
  assert.match(formatted.answer, /^Aplicaciones confirmadas:/);
});

test('conversation memory is isolated by channel and conversation id', () => {
  assert.equal(
    memoryKey({ channel: 'whatsapp', conversation_id: 'client-42' }),
    'bot-protocol:whatsapp:client-42'
  );
  assert.equal(memoryKey({ channel: 'whatsapp' }), null);
});

test('conversation memory carries diagnostic state forward', () => {
  const merged = mergeContext(
    { history: ['Tengo un Mack MP8'], equipment_tokens: ['MACK', 'MP8'], symptoms: [], unresolved_attempts: 1 },
    { symptoms: ['power_loss'] }
  );

  const next = memoryFromResponse(merged, { message: 'Desde hace dos semanas' }, {
    intent: 'diagnostic',
    answer: '¿En qué tipo de operación trabaja el equipo?',
    diagnostic: {
      equipment_tokens: ['MACK', 'MP8'],
      symptoms: ['power_loss'],
      duration: 'dos semanas',
      operating_context: null,
      impact: null
    },
    governance: { resolution_status: 'awaiting_customer_data' }
  });

  assert.deepEqual(next.equipment_tokens, ['MACK', 'MP8']);
  assert.deepEqual(next.symptoms, ['power_loss']);
  assert.equal(next.duration, 'dos semanas');
  assert.equal(next.unresolved_attempts, 2);
  assert.equal(next.active_intent, 'diagnostic');
  assert.ok(next.history.length >= 3);
});
