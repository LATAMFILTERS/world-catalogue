'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  PUBLIC_MEDIA_TYPE,
  selectFramAuthority,
  splitCrossReferences,
  buildFramLdEnrichment,
} = require('../lib/knowledge-governance/fram-usa-ld-enrichment');

function attribute(attribute, value) { return { attribute, value, recno: null }; }

const attributes = [
  attribute('Features and Benefits', 'FRAM Extra Guard oil filters deliver advanced engine protection.'),
  attribute('Filter Type', 'Spin-On Canister'),
  attribute('Anti-Drain Back Valve', 'Yes'),
  attribute('Bypass Relief Valve', 'Yes'),
  attribute('Height (Inch)', '2.922'),
  attribute('Outside Diameter (Inch)', '2.688'),
  attribute('Gasket Inside Diameter (Inch)', '2.188'),
  attribute('Gasket Outside Diameter (Inch)', '2.438'),
  attribute('Gasket Thickness (Inch)', '0.188'),
  attribute('Inner Thread Diameter (Inch)', '3/4-16'),
  attribute('Bypass Relief Valve Setting (Pounds per Square Inch)', '12'),
  attribute('Burst Pressure (Pounds per Square Inch)', '350'),
  attribute('Filter Media Material', 'Cellulose/Synthetic Blend'),
  attribute('Item Level GTIN', '00009100382009'),
];
attributes.push(
  attribute('Weight - Each (Gross Pounds)', '0.4170'),
  attribute('Weight - Case (Gross Pounds)', '2.5020'),
  attribute('Height - Each (Inch)', '2.8120'),
  attribute('Length - Each (Inch)', '2.7500'),
  attribute('Width - Each (Inch)', '2.7500'),
  attribute('Height - Case (Inch)', '3.3700'),
  attribute('Length - Case (Inch)', '8.9300'),
  attribute('Width - Case (Inch)', '6.1200'),
);

const bundle = {
  found: true,
  part: { part_number: 'PH4967', part_key: '000990635', part_type: 'Engine Oil Filter' },
  attributes,
  applications: [
    { make: 'TOYOTA', model: 'PRIUS', year: '2018', engine: 'L4-1.8L', quantity: 1 },
    { make: 'ARCTIC CAT', model: 'T660', year: '2005', engine: 'All', quantity: 1 },
  ],
  cross_references: [
    { manufacturer: 'FRAM Tough Guard', part_number: 'TG4967' },
    { manufacturer: 'FRAM Synthetic Endurance', part_number: 'FE4967' },
    { manufacturer: 'Toyota', part_number: '90915-03001' },
    { manufacturer: 'Mann-Filter', part_number: 'W68/80' },
  ],
  totals: { attributes: 48, applications: 1500, cross_references: 298 }
};

test('FRAM same-brand variants become alternatives, not competitor crosses', () => {
  const split = splitCrossReferences(bundle.cross_references, 'PH4967');
  assert.deepEqual(split.alternatives.map(item => item.part_number), ['TG4967', 'FE4967']);
  assert.deepEqual(split.oem_candidates, [{ manufacturer: 'Toyota', part_number: '90915-03001' }]);
  assert.deepEqual(split.competitor_candidates, [{ manufacturer: 'Mann-Filter', part_number: 'W68/80' }]);
});

test('Extra Guard is authority before Tough Guard and Synthetic Endurance', () => {
  const selected = selectFramAuthority([
    { part_number: 'FE4967', manufacturer: 'FRAM Synthetic Endurance' },
    { part_number: 'TG4967', manufacturer: 'FRAM Tough Guard' },
    { part_number: 'PH4967', manufacturer: 'FRAM Extra Guard' },
  ]);
  assert.equal(selected.part_number, 'PH4967');
  const fallback = selectFramAuthority([
    { part_number: 'FE4967', manufacturer: 'FRAM Synthetic Endurance' },
    { part_number: 'TG4967', manufacturer: 'FRAM Tough Guard' },
  ]);
  assert.equal(fallback.part_number, 'TG4967');
});

test('public proposal protects media secret and excludes GTIN/logistics', () => {
  const enriched = buildFramLdEnrichment(bundle, { family: 'LUBE', casePack: 12 });
  assert.equal(enriched.market_scope, 'MULTI_REGION');
  assert.equal(enriched.source_catalog_scope, 'FRAM_LD_MULTI_REGION');
  const specs = enriched.public_catalog_proposal.technical_specifications;
  assert.equal(specs.media_type, PUBLIC_MEDIA_TYPE);
  assert.equal(specs.outer_diameter_in, 2.688);
  assert.equal(specs.gasket_od_in, 2.438);
  assert.equal(specs.gasket_id_in, 2.188);
  assert.equal(specs.bypass_setting_psi, 12);
  assert.equal(specs.burst_pressure_psi, 350);
  assert.equal(JSON.stringify(enriched.public_catalog_proposal).includes('00009100382009'), false);
  assert.equal(Object.hasOwn(enriched.public_catalog_proposal, 'logistics'), false);
  assert.equal(enriched.public_catalog_proposal.vehicle_application_candidates.length, 1);
  assert.equal(enriched.public_catalog_proposal.vehicle_application_candidates[0].make, 'TOYOTA');
});

test('internal logistics infers source 6-pack and proposes ELIMFILTERS 12-pack', () => {
  const enriched = buildFramLdEnrichment(bundle, { family: 'LUBE', casePack: 12 });
  const logistics = enriched.internal_evidence.logistics;
  assert.equal(logistics.visibility, 'INTERNAL_EXECUTIVE_AGENTS_ONLY');
  assert.equal(logistics.source_packaging.inferred_case_qty, 6);
  assert.equal(logistics.elimfilters_packaging.case_pack, 12);
  assert.equal(logistics.elimfilters_packaging.estimated_product_weight_lb, 5.004);
  assert.deepEqual(logistics.elimfilters_packaging.estimated_case_dimensions, {
    length_in: 11.907, width_in: 9.18, height_in: 3.37, layout: '4x3x1',
    status: 'ESTIMATED_FROM_SOURCE_6_PACK__FACTORY_VALIDATION_REQUIRED'
  });
});


test('preferred primary code derives Extra Guard authority by functional style', () => {
  const { preferredPrimaryPartNumber } = require('../lib/knowledge-governance/fram-usa-ld-enrichment');
  assert.equal(preferredPrimaryPartNumber({ part_number: 'TG4967', family: 'LUBE', part_type: 'Engine Oil Filter', attributes }), 'PH4967');
  assert.equal(preferredPrimaryPartNumber({ part_number: 'FE10295', family: 'LUBE', part_type: 'Engine Oil Filter', attributes: [attribute('Filter Type', 'Cartridge')] }), 'CH10295');
  assert.equal(preferredPrimaryPartNumber({ part_number: 'FDA9778', family: 'AIR', part_type: 'Engine Air Filter' }), 'CA9778');
  assert.equal(preferredPrimaryPartNumber({ part_number: 'FDC10138', family: 'CABIN', part_type: 'Cabin Air Filter' }), 'CF10138');
});
