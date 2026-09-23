'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  resolveBrandSearchEngines,
  buildBrandResearchStrategy,
  findOfficialOemSource,
  buildEquipmentResearchStrategy,
} = require('../lib/hermes-brand-search-router');

test('routes WIX to its official vehicle application engine first', () => {
  const result = resolveBrandSearchEngines('WIX', { market: 'US', capability: 'vehicle_to_filter' });
  assert.equal(result.matched, true);
  assert.equal(result.engines[0].id, 'wix_vehicle_lookup');
  assert.equal(result.engines[0].type, 'official_vehicle_application_api');
});

test('routes Isuzu US research to official Isuzu vehicle authority', () => {
  const result = resolveBrandSearchEngines('ISUZU TRUCKS', { market: 'US', capability: 'engine_identity' });
  assert.equal(result.matched, true);
  assert.equal(result.brand, 'isuzu_usa');
  assert.equal(result.engines[0].base_url, 'https://www.isuzucv.com');
});

test('routes manufacturer-specific product searches to their own catalogs', () => {
  assert.equal(resolveBrandSearchEngines('Donaldson', { capability: 'product_lookup' }).engines[0].id, 'donaldson_product_search');
  assert.equal(resolveBrandSearchEngines('Fleetguard', { capability: 'application_lookup' }).engines[0].id, 'fleetguard_product_search');
  assert.equal(resolveBrandSearchEngines('MANN-FILTER', { capability: 'vehicle_to_filter' }).engines[0].id, 'mann_online_catalog');
});

test('unknown brands do not silently inherit another brand engine', () => {
  const result = resolveBrandSearchEngines('UNKNOWN BRAND', { market: 'US' });
  assert.equal(result.matched, false);
  assert.deepEqual(result.engines, []);
});

test('research strategy preserves specialized-first and generic-web discovery-only policy', () => {
  const strategy = buildBrandResearchStrategy({
    brands: ['ISUZU', 'WIX', 'DONALDSON'],
    market: 'US',
  });
  assert.equal(strategy.specialized_engine_first, true);
  assert.equal(strategy.generic_web_is_discovery_only, true);
  assert.equal(strategy.routes.length, 3);
});


test('equipment research starts with the OEM source and only then enters aftermarket', () => {
  const strategy = buildEquipmentResearchStrategy({ equipmentBrand: 'ISUZU', market: 'US' });
  assert.equal(strategy.stage_1_oem.id, 'isuzu');
  assert.equal(strategy.stage_1_oem.official_domain, 'https://www.isuzu.com');
  assert.deepEqual(strategy.phase_order, [
    'OEM_EQUIPMENT_SOURCE',
    'OEM_PART_NUMBERS',
    'DONALDSON',
    'FLEETGUARD',
    'OTHER_AFTERMARKET'
  ]);
  assert.equal(strategy.stage_2_aftermarket[0].brand, 'DONALDSON');
  assert.equal(strategy.stage_2_aftermarket[1].brand, 'FLEETGUARD');
  assert.equal(strategy.stage_2_aftermarket.find(x => x.brand === 'WIX').rank > 2, true);
  assert.equal(strategy.rules.oem_part_numbers_required_before_aftermarket, true);
});

test('OEM source resolver handles Mack, Caterpillar and Volvo from existing source registry', () => {
  assert.match(findOfficialOemSource('MACK', { market: 'US' }).official_domain, /macktrucks\.com/);
  assert.match(findOfficialOemSource('CATERPILLAR', { market: 'US' }).official_domain, /caterpillar\.com/);
  assert.match(findOfficialOemSource('VOLVO TRUCKS', { market: 'US' }).official_domain, /volvotrucks\.com/);
});
