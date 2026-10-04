'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ALLOWED_FAMILIES,
  classifyFramLdFamily,
  isAllowedFramLdFamily,
  isEuropeMarket,
  classifyCrossReference,
  classifyNonEuropeanApplicationOverlap,
  NON_EUROPEAN_OVERLAP_DECISIONS,
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


test('Toyota C-HR non-European FRAM fitment is not blocked by overlapping MANN application alone', () => {
  const result = classifyNonEuropeanApplicationOverlap({
    origin_group: 'NON_EUROPEAN',
    canonical_brand: 'FRAM',
    peer_manufacturer: 'MANN-FILTER',
    overlap_proven: true,
    technical_conflict_reasons: []
  });

  assert.equal(result.applies, true);
  assert.equal(result.decision, NON_EUROPEAN_OVERLAP_DECISIONS.SECONDARY_APPLICATION_EVIDENCE);
  assert.equal(result.hold_required, false);
  assert.equal(result.canonical_application_authority, true);
  assert.equal(result.peer_application_authority, false);
  assert.equal(result.application_overlap, true);
  assert.equal(result.technical_contradiction, false);
});

test('Toyota Prius non-European FRAM fitment keeps MANN as secondary application evidence', () => {
  const result = classifyNonEuropeanApplicationOverlap({
    origin_group: 'NON_EUROPEAN',
    canonical_brand: 'FRAM',
    peer_manufacturer: 'MANN',
    overlap_proven: true
  });

  assert.equal(result.decision, NON_EUROPEAN_OVERLAP_DECISIONS.SECONDARY_APPLICATION_EVIDENCE);
  assert.equal(result.hold_required, false);
});

test('non-European FRAM overlap stays on hold only with an independent technical contradiction', () => {
  const result = classifyNonEuropeanApplicationOverlap({
    origin_group: 'NON_EUROPEAN',
    canonical_brand: 'FRAM',
    peer_manufacturer: 'MANN-FILTER',
    overlap_proven: true,
    technical_conflict_reasons: ['INCOMPATIBLE_THREAD']
  });

  assert.equal(result.decision, NON_EUROPEAN_OVERLAP_DECISIONS.TECHNICAL_CONTRADICTION);
  assert.equal(result.hold_required, true);
  assert.equal(result.technical_contradiction, true);
  assert.deepEqual(result.technical_conflict_reasons, ['INCOMPATIBLE_THREAD']);
});

test('unsupported hold reasons fail closed instead of creating arbitrary collisions', () => {
  assert.throws(
    () => classifyNonEuropeanApplicationOverlap({
      origin_group: 'NON_EUROPEAN',
      canonical_brand: 'FRAM',
      peer_manufacturer: 'MANN-FILTER',
      overlap_proven: true,
      technical_conflict_reasons: ['MANN_OVERLAP_EXISTS']
    }),
    /UNSUPPORTED_TECHNICAL_CONTRADICTION_REASON/
  );
});
