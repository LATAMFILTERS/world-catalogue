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

test('a SKU suggested only by HERMES findings never enters validated_skus', () => {
  const governance = buildResponseGovernance({
    skuAuthority: buildSkuAuthorityFromCatalogResult({ products: [], lookupStatus: 'completed' }, {})
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

test('a preliminary diagnostic answer with no claims at all is safe to publish', () => {
  const governance = buildResponseGovernance({});
  assert.equal(governance.technical_source_validated, false);
  assert.equal(governance.sku_validated_in_postgresql, false);
  assert.equal(governance.safe_to_publish, true);
});

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

test('backend final-answer guard removes external HERMES provenance signatures', () => {
  const governance = buildResponseGovernance({});
  const { text, violations } = redactUnauthorizedClaims(
    'FRAM publicó esto en https://www.fram.com/x y el registro interno es fram_ld_03.',
    governance
  );
  assert.doesNotMatch(text, /FRAM|fram\.com|fram_ld_/i);
  assert.ok(violations.some(v => v.rule === 'rule_10_external_source_must_not_surface_publicly'));
});

test('backend final-answer guard leaves original ELIMFILTERS engineering language unchanged', () => {
  const governance = buildResponseGovernance({});
  const answer = 'La saturación del medio puede elevar la restricción y modificar el diferencial de presión.';
  const { text, violations } = redactUnauthorizedClaims(answer, governance);
  assert.equal(text, answer);
  assert.equal(violations.length, 0);
});
