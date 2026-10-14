'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  approvedElimfiltersOemProductReady,
  evaluateCodigoBase,
} = require('../lib/catalog-codigo-base-policy');
const {
  validateCanonicalWrite,
} = require('../lib/catalog-write-gateway');

function row(overrides = {}, governance = {}) {
  return {
    sku: 'ET97784',
    codigo_base: 'ET97784',
    duty: 'HEAVY_DUTY',
    filter_type: 'fuel',
    sub_type: 'Assembly',
    technology: 'TURBOCORE™',
    canonical_source_brand: 'ELIMFILTERS',
    canonical_source_code: 'ET97784',
    canonical_source_status: 'VERIFIED',
    oem_codes: [],
    competitor_codes: [],
    equipment_applications: [],
    vehicle_applications: [],
    enrichment_data: {
      codigo_base_governance: {
        identity_type: 'ELIMFILTERS_OEM_PRODUCT',
        internal_product_identity_verified: true,
        primary_manufacturer_verified: true,
        approved_manufacturer: 'ELIMFILTERS',
        approved_codigo_base: 'ET97784',
        approved_source_column: 'INTERNAL_PRODUCT_IDENTITY',
        ...governance,
      },
    },
    ...overrides,
  };
}

test('ELIMFILTERS proprietary OEM product may use its own SKU as codigo_base', () => {
  const product = row();
  assert.equal(approvedElimfiltersOemProductReady(product), true);

  const verdict = evaluateCodigoBase(product);
  assert.equal(verdict.valid, true);
  assert.equal(verdict.authority, 'VERIFIED_ELIMFILTERS_OEM_PRODUCT');

  const gateway = validateCanonicalWrite(product, { validateApplications: false });
  assert.equal(gateway.valid, true, gateway.reasons.join(','));
});

test('ELIMFILTERS proprietary authority does not require external HD manufacturer absence', () => {
  const result = validateCanonicalWrite(row(), { validateApplications: false });
  assert.equal(result.valid, true);
  assert.equal(result.reasons.includes('DONALDSON_ABSENCE_NOT_VERIFIED'), false);
  assert.equal(result.reasons.includes('FLEETGUARD_ABSENCE_NOT_VERIFIED'), false);
});

test('ELIMFILTERS proprietary authority fails closed if identity fields drift', () => {
  const cases = [
    row({ codigo_base: 'P551434' }),
    row({ canonical_source_brand: 'DONALDSON' }),
    row({ canonical_source_code: 'P551434' }),
    row({ canonical_source_status: 'UNVERIFIED' }),
    row({}, { identity_type: 'OTHER' }),
    row({}, { internal_product_identity_verified: false }),
    row({}, { approved_manufacturer: 'FLEETGUARD' }),
    row({}, { approved_source_column: 'COMPETITOR_CODES' }),
  ];

  for (const product of cases) {
    assert.equal(approvedElimfiltersOemProductReady(product), false);
    assert.equal(
      evaluateCodigoBase(product).authority === 'VERIFIED_ELIMFILTERS_OEM_PRODUCT',
      false
    );
  }
});

test('ELIMFILTERS proprietary authority is general and not hard-coded to ET97784', () => {
  const product = row({
    sku: 'EF91234',
    codigo_base: 'EF91234',
    canonical_source_code: 'EF91234',
    technology: 'SYNTAPORE™',
    sub_type: 'Spin On',
  }, {
    approved_codigo_base: 'EF91234',
  });

  assert.equal(approvedElimfiltersOemProductReady(product), true);
  const verdict = evaluateCodigoBase(product);
  assert.equal(verdict.valid, true);
  assert.equal(verdict.authority, 'VERIFIED_ELIMFILTERS_OEM_PRODUCT');
});
