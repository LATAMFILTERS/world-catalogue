'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ALLOWED_FAMILIES,
  classifyFramLdFamily,
  isAllowedFramLdFamily,
  isEuropeMarket,
  classifyCrossReference,
  MARKET_POLICY
} = require('../lib/knowledge-governance/fram-ld-catalog-scope');

test('FRAM LD permits exactly LUBE AIR CABIN FUEL', () => {
  assert.deepEqual(ALLOWED_FAMILIES, ['LUBE','AIR','CABIN','FUEL']);
  assert.equal(classifyFramLdFamily('engine oil filter PH7317'), 'LUBE');
  assert.equal(classifyFramLdFamily('engine air filter CA12345'), 'AIR');
  assert.equal(classifyFramLdFamily('cabin air filter CF12345'), 'CABIN');
  assert.equal(classifyFramLdFamily('fuel filter G1234'), 'FUEL');
  assert.equal(classifyFramLdFamily('transmission filter FT123'), null);
  assert.equal(isAllowedFramLdFamily('TRANSMISSION'), false);
});

test('Europe cannot be promoted from FRAM LD', () => {
  assert.equal(MARKET_POLICY.europe_promotion_allowed, false);
  assert.equal(MARKET_POLICY.europe_nomenclature_authority, 'MANN_FILTER');
  assert.equal(isEuropeMarket('Germany / EU'), true);
  assert.equal(isEuropeMarket('USA / Japan'), false);
});

test('MANN reference found in non-European FRAM evidence is competitor cross only', () => {
  const cross = classifyCrossReference({manufacturer:'MANN-FILTER',part_number:'W 712/95',source_market_scope:'USA'});
  assert.equal(cross.classification, 'Cross Reference Competitor');
  assert.equal(cross.relation_type, 'competitor_cross_candidate');
  assert.equal(cross.nomenclature_authority, false);
  assert.equal(cross.application_authority, false);
  assert.equal(cross.catalog_auto_write_allowed, false);
});
