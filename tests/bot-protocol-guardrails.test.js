const test = require('node:test');
const assert = require('node:assert/strict');
const {
  applyProtocolGuardrails,
  applyCatalogNotFoundGuard,
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

test('P527692 NOT_FOUND cannot publish an invented SKU or specification', () => {
  const result = applyCatalogNotFoundGuard({
    answer: 'P527692 corresponde al ELIMFILTERS EF99999 con 10 micras.',
    evidence: {
      lookup_status: 'not_found',
      validated: false,
      count: 0,
      products: [],
      references: ['P527692']
    },
    governance: {
      invented_sku_blocked: true
    }
  }, {
    message: 'Cuál es la equivalencia de P527692?',
    language: 'es'
  });

  assert.equal(result.evidence.lookup_status, 'not_found');
  assert.equal(result.evidence.validated, false);
  assert.equal(result.evidence.count, 0);
  assert.deepEqual(result.evidence.products, []);
  assert.equal(result.governance.catalog_not_found_blocked, true);
  assert.equal(result.deterministic_router.source, 'catalog_not_found_guard');
  assert.match(result.answer, /P527692/);
  assert.match(result.answer, /No encontré una coincidencia verificada/);
  assert.match(result.answer, /No asignaré un SKU/);
  assert.doesNotMatch(result.answer, /EF99999/);
  assert.doesNotMatch(result.answer, /10 micras/);
});

test('catalog not-found guard leaves validated catalog responses unchanged', () => {
  const payload = {
    answer: 'Referencia confirmada: EH60950',
    evidence: {
      lookup_status: 'validated',
      validated: true,
      count: 1,
      products: [{ sku: 'EH60950' }],
      references: ['P170950']
    }
  };

  assert.equal(applyCatalogNotFoundGuard(payload, { language: 'es' }), payload);
});

test('catalog not-found guard does not rewrite non-catalog diagnostic responses', () => {
  const payload = {
    answer: '¿Desde cuándo ocurre el problema?',
    intent: 'diagnostic',
    pending_field: 'duration',
    evidence: { validated: false, count: 0, products: [] }
  };

  assert.equal(applyCatalogNotFoundGuard(payload, { language: 'es' }), payload);
});
