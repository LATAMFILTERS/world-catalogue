const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildResponseGovernance,
  validateResponseGovernance,
  determineSafeToPublish,
  redactUnauthorizedClaims,
  assertNoUnauthorizedSku,
  assertNoUnauthorizedOemClaim
} = require('../lib/knowledge-governance/response-governance-contract');
const { buildSkuAuthorityFromCatalogResult } = require('../lib/knowledge-governance/sku-authority-contract');

// Case 6: Groq inventa SKU -> eliminado.
test('a Groq-invented SKU not present in validated_skus is redacted from the answer', () => {
  const governance = buildResponseGovernance({
    skuAuthority: buildSkuAuthorityFromCatalogResult({ products: [], lookupStatus: 'completed' }, {})
  });
  const { text, violations } = redactUnauthorizedClaims('El filtro correcto es EL99999, cámbialo ahora.', governance);
  assert.doesNotMatch(text, /EL99999/);
  assert.match(text, /referencia no confirmada/);
  assert.ok(violations.some(v => v.rule === 'rule_9_sku_requires_postgresql_evidence'));
});

test('a legitimately validated SKU is never redacted', () => {
  const governance = buildResponseGovernance({
    skuAuthority: buildSkuAuthorityFromCatalogResult({ products: [{ sku: 'EL82100', codigo_base: 'P552100' }], lookupStatus: 'completed' }, {})
  });
  const { text, violations } = redactUnauthorizedClaims('La equivalencia confirmada es EL82100.', governance);
  assert.match(text, /EL82100/);
  assert.equal(violations.length, 0);
});

// Case 7: HERMES propone SKU -> eliminado (HERMES output never feeds validated_skus).
test('a SKU suggested only by HERMES findings never enters validated_skus', () => {
  const governance = buildResponseGovernance({
    skuAuthority: buildSkuAuthorityFromCatalogResult({ products: [], lookupStatus: 'completed' }, {})
    // Note: no path exists to pass HERMES findings into skuAuthority — this
    // test documents that absence structurally.
  });
  assert.deepEqual(governance.validated_skus, []);
  assert.equal(governance.sku_validated_in_postgresql, false);
});

test('assertNoUnauthorizedSku flags a tampered governance object', () => {
  const violations = assertNoUnauthorizedSku({
    sku_evidence: { validated_skus: [{ sku: 'EL82100' }] },
    sku_validated_in_postgresql: false
  });
  assert.equal(violations.length, 1);
});

test('assertNoUnauthorizedOemClaim flags an oem_maintenance object without approved evidence', () => {
  const violations = assertNoUnauthorizedOemClaim({ oem_maintenance: { status: 'validated' }, oem_maintenance_found: false });
  assert.equal(violations.length, 1);
});

// Case 18: Respuesta diagnóstica preliminar puede publicarse.
test('a preliminary diagnostic answer with no claims at all is safe to publish', () => {
  const governance = buildResponseGovernance({});
  assert.equal(governance.technical_source_validated, false);
  assert.equal(governance.sku_validated_in_postgresql, false);
  assert.equal(governance.safe_to_publish, true);
});

// Case 20: Toda respuesta final pasa por determineSafeToPublish.
test('safe_to_publish is always exactly what determineSafeToPublish computes', () => {
  const clean = buildResponseGovernance({ skuAuthority: buildSkuAuthorityFromCatalogResult({ products: [{ sku: 'EL82100' }], lookupStatus: 'completed' }, {}) });
  assert.equal(clean.safe_to_publish, determineSafeToPublish(clean));

  const violating = { authority_violations: [{ rule: 'rule_9_sku_requires_postgresql_evidence', reason: 'x' }] };
  assert.equal(determineSafeToPublish(violating), false);
});

test('validateResponseGovernance rejects an internally inconsistent object', () => {
  const result = validateResponseGovernance({ oem_maintenance_found: true, technical_source_validated: false });
  assert.equal(result.valid, false);
});
