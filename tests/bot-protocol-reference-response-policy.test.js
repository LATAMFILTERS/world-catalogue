const test = require('node:test');
const assert = require('node:assert/strict');
const {
  applyReferenceResponsePolicy,
  identifyReferenceSource,
  selectApplications
} = require('../lib/bot-protocol-reference-response-policy');

test('Fleetguard cross-reference uses manufacturer name, never generic OEM, and publishes at most three applications', () => {
  const payload = applyReferenceResponsePolicy({
    intent: 'cross_reference_lookup',
    evidence: {
      lookup_status: 'validated',
      validated: true,
      count: 1,
      references: ['LF3620'],
      products: [{
        sku: 'EL88616',
        filter_type: 'Oil Filter',
        technology: 'SYNTRAX™',
        competitor_codes: [{ manufacturer: 'Fleetguard', code: 'LF3620' }],
        equipment_applications: [
          { make: 'Caterpillar', engine: 'C15' },
          { make: 'Caterpillar', engine: '3406E' },
          { make: 'Kenworth', model: 'T800', engine: 'ISX' },
          { make: 'Volvo', model: 'VNL' },
          { make: 'Freightliner', model: 'Cascadia', engine: 'DD15' }
        ]
      }]
    }
  }, { message: 'LF3620', language: 'es' });

  assert.match(payload.answer, /Fleetguard LF3620/);
  assert.match(payload.answer, /ELIMFILTERS EL88616/);
  assert.match(payload.answer, /Filtro de lubricación/);
  assert.match(payload.answer, /Aplicaciones registradas:/);
  assert.doesNotMatch(payload.answer, /\bOEM\b/i);
  assert.doesNotMatch(payload.answer, /SYNTRAX/i);
  assert.equal(payload.governance.applications_published, 3);
  assert.equal(payload.governance.source_brand, 'Fleetguard');
  assert.equal(payload.governance.llm_product_claims_disabled, true);
});

test('Donaldson source is preserved instead of being labelled OEM', () => {
  const product = {
    sku: 'EL80001',
    competitor_codes: [{ manufacturer: 'Donaldson', code: 'P552100' }]
  };
  const source = identifyReferenceSource(product, 'P552100');
  assert.equal(source.brand, 'Donaldson');
});

test('WIX source can be resolved from brand_crossrefs keyed by brand', () => {
  const product = {
    sku: 'EF90001',
    brand_crossrefs: { WIX: ['331193'] }
  };
  const source = identifyReferenceSource(product, '331193');
  assert.equal(source.brand, 'WIX');
});

test('not-found reference cannot publish an invented SKU or technical claim', () => {
  const payload = applyReferenceResponsePolicy({
    intent: 'cross_reference_lookup',
    answer: 'P527692 cruza con EL88616 y usa SYNTRAX.',
    evidence: {
      lookup_status: 'not_found',
      validated: false,
      count: 0,
      references: ['P527692'],
      products: []
    }
  }, { message: 'P527692', language: 'es' });

  assert.match(payload.answer, /No encontré una coincidencia verificada para P527692/);
  assert.match(payload.answer, /puede no estar registrada/);
  assert.doesNotMatch(payload.answer, /EL88616/);
  assert.doesNotMatch(payload.answer, /SYNTRAX/);
  assert.equal(payload.evidence.lookup_status, 'not_found');
  assert.equal(payload.evidence.validated, false);
});

test('multiple distinct ELIMFILTERS SKUs become ambiguous instead of selecting the first result', () => {
  const payload = applyReferenceResponsePolicy({
    intent: 'cross_reference_lookup',
    evidence: {
      lookup_status: 'validated',
      validated: true,
      count: 2,
      references: ['331193'],
      products: [
        { sku: 'EF90001', filter_type: 'Oil Filter' },
        { sku: 'EF90002', filter_type: 'Oil Filter' }
      ]
    }
  }, { message: '331193', language: 'es' });

  assert.equal(payload.evidence.lookup_status, 'ambiguous');
  assert.equal(payload.evidence.validated, false);
  assert.doesNotMatch(payload.answer, /EF90001|EF90002/);
  assert.match(payload.answer, /más de una coincidencia/);
});

test('application selector limits output to three specific registered applications', () => {
  const selected = selectApplications([
    { make: 'Toyota', model: 'Hilux', engine: '2.8' },
    { make: 'Toyota', model: 'Land Cruiser', engine: '1HZ' },
    { make: 'Hino', model: '500', engine: 'J08E' },
    { make: 'Isuzu', model: 'NPR', engine: '4HK1' }
  ]);
  assert.equal(selected.length, 3);
  assert.ok(selected.every(Boolean));
});
