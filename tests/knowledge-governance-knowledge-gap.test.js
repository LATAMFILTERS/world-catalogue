const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createKnowledgeGap,
  validateKnowledgeGap,
  mergeDuplicateKnowledgeGap,
  transitionKnowledgeGapStatus,
  isValidKnowledgeGapTransition,
  buildDeduplicationKey
} = require('../lib/knowledge-governance/knowledge-gap-contract');

function baseInput(overrides = {}) {
  return {
    request_type: 'oem_maintenance_interval',
    origin: 'bot_orchestrator',
    equipment: { brand: 'FREIGHTLINER', model: null, engine: 'SERIES 60', year: 2007 },
    system: 'oil',
    question: '¿Cuál es el intervalo de cambio de aceite recomendado?',
    reason: 'no approved technical evidence found',
    requested_by: 'bot_orchestrator',
    ...overrides
  };
}

// Case 11: Vacío detectado -> solicitud válida.
test('a freshly created knowledge gap is valid and starts in "detected"', () => {
  const gap = createKnowledgeGap(baseInput());
  assert.equal(gap.status, 'detected');
  assert.equal(gap.occurrences, 1);
  assert.equal(validateKnowledgeGap(gap).valid, true);
});

test('validateKnowledgeGap rejects a gap missing required fields', () => {
  assert.equal(validateKnowledgeGap({}).valid, false);
});

// Case 12: Solicitud duplicada -> incrementa occurrences.
test('a duplicate report increments occurrences and preserves first_detected_at', () => {
  const first = createKnowledgeGap(baseInput());
  const merged = mergeDuplicateKnowledgeGap(first, baseInput());
  assert.equal(merged.occurrences, 2);
  assert.equal(merged.first_detected_at, first.first_detected_at);
  assert.equal(merged.request_id, first.request_id);
});

test('buildDeduplicationKey is stable for identical inputs', () => {
  const keyA = buildDeduplicationKey(baseInput());
  const keyB = buildDeduplicationKey(baseInput());
  assert.equal(keyA, keyB);
});

// Case 13: Transición inválida de vacío -> rechazada.
test('a knowledge gap cannot jump straight from detected to published_in_obsidian', () => {
  assert.equal(isValidKnowledgeGapTransition('detected', 'published_in_obsidian'), false);
  const gap = createKnowledgeGap(baseInput());
  assert.throws(() => transitionKnowledgeGapStatus(gap, 'published_in_obsidian'));
});

test('the normal knowledge gap lifecycle transitions in strict order', () => {
  let gap = createKnowledgeGap(baseInput());
  gap = transitionKnowledgeGapStatus(gap, 'queued_for_hermes');
  gap = transitionKnowledgeGapStatus(gap, 'researching');
  gap = transitionKnowledgeGapStatus(gap, 'researched');
  gap = transitionKnowledgeGapStatus(gap, 'awaiting_review');
  gap = transitionKnowledgeGapStatus(gap, 'approved_for_obsidian');
  gap = transitionKnowledgeGapStatus(gap, 'published_in_obsidian');
  gap = transitionKnowledgeGapStatus(gap, 'closed');
  assert.equal(gap.status, 'closed');
  assert.equal(gap.audit_history.length, 8);
});

test('a rejected transition requires an explicit reason', () => {
  let gap = createKnowledgeGap(baseInput());
  gap = transitionKnowledgeGapStatus(gap, 'queued_for_hermes');
  gap = transitionKnowledgeGapStatus(gap, 'researching');
  gap = transitionKnowledgeGapStatus(gap, 'researched');
  gap = transitionKnowledgeGapStatus(gap, 'awaiting_review');
  assert.throws(() => transitionKnowledgeGapStatus(gap, 'rejected'));
  const rejected = transitionKnowledgeGapStatus(gap, 'rejected', { reason: 'evidence conflicts with newer bulletin' });
  assert.equal(rejected.status, 'rejected');
});
