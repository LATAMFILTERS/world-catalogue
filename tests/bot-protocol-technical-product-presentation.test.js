'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  applyTechnicalProductPresentation,
  selectEquivalentReferences
} = require('../lib/bot-protocol-technical-product-presentation');

const PRODUCT = {
  sku: 'EF91315',
  codigo_base: null,
  description: 'ELIMFILTERS® EF91315 Fuel filter for diesel injection systems. SYNTAPORE™ media removes particulate and water contamination before fuel reaches high-pressure injectors.',
  filter_type: 'fuel',
  protocol_source_brand: 'DONALDSON',
  protocol_resolved_reference: 'P551315',
  oem_codes: [
    { manufacturer: 'CATERPILLAR', code: '1R0751' },
    { manufacturer: 'VOLVO', code: '85114066' },
    { manufacturer: 'MACK', code: '2191P551315' }
  ],
  competitor_codes: [
    { manufacturer: 'FLEETGUARD', code: 'FF5309' },
    { manufacturer: 'WIX', code: '33377' },
    { manufacturer: 'BALDWIN', code: 'BF7530MPG' }
  ],
  brand_crossrefs: {},
  equipment_applications: [
    { equipment: 'CATERPILLAR 320D', engine: 'CATERPILLAR C6.4 ACERT' },
    { equipment: 'KENWORTH T800', engine: 'CATERPILLAR C9' },
    { equipment: 'PETERBILT 357', engine: 'CATERPILLAR C9' },
    { equipment: 'FREIGHTLINER M2', engine: 'CATERPILLAR C7' }
  ]
};

function basePayload() {
  return {
    intent: 'cross_reference_lookup',
    evidence: {
      lookup_status: 'validated',
      validated: true,
      count: 1,
      references: ['P551315'],
      products: [PRODUCT]
    },
    governance: {
      reference_response_policy: 'validated_deterministic'
    },
    answer: ''
  };
}

test('technical presentation publishes ELIMFILTERS SKU, technical description, applications and up to three cross-references', () => {
  const payload = applyTechnicalProductPresentation(basePayload(), { language: 'es' });
  assert.equal(payload.governance.reference_response_policy, 'validated_technical_deterministic');
  assert.match(payload.answer, /SKU ELIMFILTERS: EF91315/i);
  assert.match(payload.answer, /Tipo de filtro: Filtro de combustible/i);
  assert.match(payload.answer, /Descripción técnica:/i);
  assert.match(payload.answer, /diesel injection systems/i);
  assert.match(payload.answer, /Aplicaciones principales validadas:/i);
  assert.match(payload.answer, /Cross-references principales:/i);
  assert.ok(payload.governance.applications_published <= 3);
  assert.ok(payload.governance.equivalent_references_published <= 3);
});

test('cross-reference selection prioritizes OEM manufacturers and does not repeat searched reference', () => {
  const selected = selectEquivalentReferences(PRODUCT, { brand: 'Donaldson', code: 'P551315' }, 3);
  assert.equal(selected.length, 3);
  assert.deepEqual(selected.map(item => item.manufacturer), ['Caterpillar', 'Volvo', 'Mack']);
  assert.ok(selected.every(item => item.code !== 'P551315'));
});

test('NOT_FOUND response remains fail-closed and is not enriched with product data', () => {
  const payload = applyTechnicalProductPresentation({
    intent: 'exact_reference_lookup',
    evidence: { lookup_status: 'not_found', validated: false, count: 0, references: ['P527692'], products: [] },
    governance: {},
    answer: ''
  }, { language: 'es' });
  assert.match(payload.answer, /No encontr[eé] una coincidencia verificada/i);
  assert.doesNotMatch(payload.answer, /SKU ELIMFILTERS|Cross-references principales|Descripción técnica/i);
});
