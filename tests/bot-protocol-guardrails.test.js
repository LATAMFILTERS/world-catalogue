const test = require('node:test');
const assert = require('node:assert/strict');
const {
  applyProtocolGuardrails,
  MAX_UNRESOLVED_ATTEMPTS,
  SUPPORT_EMAIL
} = require('../lib/bot-protocol-guardrails');

test('blocks unvalidated product evidence', () => {
  const result = applyProtocolGuardrails({
    protocol_version: '1.2.0',
    answer: 'Use EXAMPLE-1',
    evidence: {
      validated: true,
      products: []
    }
  });

  assert.equal(result.evidence.validated, false);
  assert.equal(result.evidence.count, 0);
  assert.equal(result.governance.invented_sku_blocked, true);
  assert.equal(result.governance.resolution_status, 'unresolved');
});

test('deduplicates catalog products', () => {
  const product = { id: 1, sku: 'EH60950', codigo_base: 'P170950' };
  const result = applyProtocolGuardrails({
    answer: 'Referencia confirmada',
    evidence: {
      validated: true,
      products: [product, product]
    }
  });

  assert.equal(result.evidence.validated, true);
  assert.equal(result.evidence.count, 1);
  assert.equal(result.evidence.products[0].sku, 'EH60950');
  assert.equal(result.governance.resolution_status, 'resolved_with_catalog_evidence');
});

test('requires handoff after five unresolved attempts', () => {
  const result = applyProtocolGuardrails({
    answer: 'No encontrado',
    evidence: { validated: false, products: [] }
  }, {
    context: { unresolved_attempts: MAX_UNRESOLVED_ATTEMPTS }
  });

  assert.equal(result.governance.requires_handoff, true);
  assert.equal(result.governance.resolution_status, 'handoff_required');
  assert.equal(result.governance.handoff_email, SUPPORT_EMAIL);
  assert.match(result.answer, new RegExp(SUPPORT_EMAIL.replace('.', '\\.')));
});

test('cleans undefined and null from customer-facing answer', () => {
  const result = applyProtocolGuardrails({
    answer: 'Revisa tu undefined null ahora',
    evidence: { validated: false, products: [] }
  });

  assert.equal(result.answer.includes('undefined'), false);
  assert.equal(result.answer.includes('null'), false);
  assert.match(result.answer, /equipo/);
});
