const test = require('node:test');
const assert = require('node:assert/strict');

const { applyProtocolGuardrails } = require('../lib/bot-protocol-guardrails');
const { formatForChannel } = require('../lib/bot-protocol-channel-format');
const { memoryKey, mergeContext, memoryFromResponse } = require('../lib/bot-protocol-memory');

test('uses channel and conversation for isolated memory', () => {
  assert.equal(
    memoryKey({ channel: 'whatsapp', conversation_id: 'customer-1' }),
    'bot-protocol:whatsapp:customer-1'
  );
});

test('preserves diagnostic context across messages', () => {
  const merged = mergeContext(
    { equipment_tokens: ['MACK', 'MP8'], symptoms: ['power_loss'], history: ['Tengo un Mack MP8'] },
    { duration: 'dos semanas', history: ['Desde hace dos semanas'] }
  );

  assert.deepEqual(merged.equipment_tokens, ['MACK', 'MP8']);
  assert.deepEqual(merged.symptoms, ['power_loss']);
  assert.equal(merged.duration, 'dos semanas');
  assert.equal(merged.history.length, 2);
});

test('blocks unverified recommendations after five unresolved attempts', () => {
  const guarded = applyProtocolGuardrails(
    { answer: 'Referencia tentativa', evidence: { validated: false, products: [] } },
    { context: { unresolved_attempts: 5 } }
  );

  assert.equal(guarded.governance.requires_handoff, true);
  assert.equal(guarded.governance.handoff_email, 'support@elimfilters.com');
  assert.match(guarded.answer, /support@elimfilters\.com/);
});

test('formats final response for each delivery channel', () => {
  const formatted = formatForChannel(
    { answer: 'Referencia confirmada en el catálogo ELIMFILTERS:\nEA50090 / C30090' },
    { channel: 'linkedin' }
  );

  assert.equal(formatted.delivery.channel, 'linkedin');
  assert.equal(formatted.delivery.format, 'plain_text');
  assert.match(formatted.answer, /^Referencia confirmada:/);
});

test('updates unresolved memory state from protocol response', () => {
  const next = memoryFromResponse(
    { history: [], unresolved_attempts: 1 },
    { message: 'No sé el año' },
    {
      answer: 'Confirma el año del equipo.',
      intent: 'diagnostic',
      governance: { resolution_status: 'awaiting_customer_data' },
      diagnostic: { equipment_tokens: ['MACK', 'MP8'], symptoms: ['power_loss'] }
    }
  );

  assert.equal(next.unresolved_attempts, 2);
  assert.equal(next.active_intent, 'diagnostic');
  assert.deepEqual(next.equipment_tokens, ['MACK', 'MP8']);
  assert.equal(next.history.length, 2);
});
