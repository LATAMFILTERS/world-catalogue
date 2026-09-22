'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../config/vehicle-platform-closure/isuzu-n-series-us.json');
const {
  buildVehicleClosureWorkOrders,
} = require('../scripts/hermes/vehicle-platform-closure-work-orders');

test('NPR priority wave creates one governed research request per exact model/year', () => {
  const items = buildVehicleClosureWorkOrders({
    waveId: 'NPR_US_PRIORITY',
    requestedAt: '2026-09-22T00:00:00.000Z',
  });
  assert.equal(items.length, 16);
  assert.deepEqual([...new Set(items.map(x => x.gap.equipment.model))], ['NPR-HD', 'NPR-XD']);
  assert.equal(items[0].gap.request_type, 'filter_application');
  assert.equal(items[0].research.research_type, 'VEHICLE_FILTER_APPLICATION_CLOSURE');
  assert.equal(items.every(x => x.research.minimum_independent_sources === 2), true);
});

test('vehicle closure requests explicitly forbid cross-reference inheritance', () => {
  const [item] = buildVehicleClosureWorkOrders({
    waveId: 'NPR_US_PRIORITY',
    requestedAt: '2026-09-22T00:00:00.000Z',
  });
  assert.match(item.gap.question, /Do not inherit fitment from a competitor cross-reference/i);
  assert.equal(item.promotion_policy, 'EXACT_APPLICATION_EVIDENCE_REQUIRED__NO_CROSS_REFERENCE_INHERITANCE');
});

test('known clue-only sources cannot directly promote US fitment', () => {
  const clueSources = manifest.known_sources.filter(source => /CLUE/.test(source.role));
  assert.ok(clueSources.length >= 3);
  assert.equal(clueSources.every(source => source.fitment_promotion_allowed === false), true);
});

test('current Isuzu platform source is identity evidence, not filter fitment evidence', () => {
  const source = manifest.known_sources.find(x => x.authority === 'ISUZU_COMMERCIAL_TRUCK_OF_AMERICA' && x.role === 'PLATFORM_IDENTITY');
  assert.ok(source);
  assert.equal(source.market_scope, 'US');
  assert.equal(source.fitment_promotion_allowed, false);
});


test('vehicle closure is OEM-first and aftermarket begins with Donaldson then Fleetguard', () => {
  const [item] = buildVehicleClosureWorkOrders({
    waveId: 'NPR_US_PRIORITY',
    requestedAt: '2026-09-22T00:00:00.000Z',
  });
  assert.equal(item.source_first_strategy.stage_1_oem.id, 'isuzu_commercial_truck_usa');
  assert.equal(item.source_first_strategy.stage_1_oem.official_domain, 'https://www.isuzucv.com');
  assert.equal(item.research.source_first_strategy.stage_1_oem.id, 'isuzu_commercial_truck_usa');
  assert.equal(item.source_first_strategy.stage_2_aftermarket[0].brand, 'DONALDSON');
  assert.equal(item.source_first_strategy.stage_2_aftermarket[1].brand, 'FLEETGUARD');
  assert.match(item.gap.question, /equipment manufacturer first/i);
  assert.match(item.gap.question, /Donaldson first, Fleetguard second/i);
  assert.match(item.gap.question, /WIX.*must not lead/i);
});
