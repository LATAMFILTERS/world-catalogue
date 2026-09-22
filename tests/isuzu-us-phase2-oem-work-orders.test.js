'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../config/vehicle-platform-closure/isuzu-us-phase2-oem.json');
const { years, buildPhase2WorkOrders } = require('../scripts/hermes/isuzu-us-phase2-oem-work-orders');

test('diesel closure covers every Isuzu USA model year from 2000 through 2026', () => {
  const range = years();
  assert.equal(range.length, 27);
  assert.equal(range[0], 2000);
  assert.equal(range.at(-1), 2026);
  assert.equal(manifest.fuel_scope, 'DIESEL_ONLY');
});

test('workflow is exactly three phases', () => {
  assert.deepEqual(manifest.stages.map(x => x.id), [
    'PHASE_1_DIESEL_VEHICLE_UNIVERSE',
    'PHASE_2_DIESEL_OEM_FILTER_OEN',
    'PHASE_3_AFTERMARKET_RESOLUTION'
  ]);
});

test('phase 1 is Isuzu-only and excludes gasoline', () => {
  const [item] = buildPhase2WorkOrders({
    requestedAt: '2026-09-22T00:00:00.000Z',
    stageId: 'PHASE_1_DIESEL_VEHICLE_UNIVERSE',
  });
  assert.equal(item.aftermarket_allowed, false);
  assert.equal(item.research.allow_competitor_sources, false);
  assert.deepEqual(item.research.preferred_manufacturer_domains, ['isuzucv.com']);
  assert.match(item.gap.question, /DIESEL/i);
  assert.match(item.gap.question, /Exclude gasoline vehicles completely/i);
});

test('phase 2 captures Isuzu OEN before aftermarket', () => {
  const [item] = buildPhase2WorkOrders({
    requestedAt: '2026-09-22T00:00:00.000Z',
    stageId: 'PHASE_2_DIESEL_OEM_FILTER_OEN',
  });
  assert.equal(item.aftermarket_allowed, false);
  assert.match(item.gap.question, /genuine OE\/OEN/i);
  assert.match(item.gap.question, /Do not consult Donaldson, Fleetguard/i);
});

test('phase 3 resolves Donaldson before Fleetguard', () => {
  const [item] = buildPhase2WorkOrders({
    requestedAt: '2026-09-22T00:00:00.000Z',
    stageId: 'PHASE_3_AFTERMARKET_RESOLUTION',
  });
  assert.equal(item.aftermarket_allowed, true);
  assert.equal(item.research.allow_competitor_sources, true);
  assert.equal(item.research.minimum_independent_sources, 2);
  assert.equal(item.research.preferred_manufacturer_domains[0], 'donaldson.com');
  assert.equal(item.research.preferred_manufacturer_domains[1], 'fleetguard.com');
  assert.match(item.gap.question, /Donaldson first, Fleetguard second/i);
  assert.match(item.gap.question, /cross-reference alone must never establish vehicle fitment/i);
});

test('gasoline sources are removed from authoritative source registry', () => {
  assert.equal(manifest.authoritative_sources.some(x => /GAS/.test(x.id)), false);
});

test('HD canonical base rule remains Donaldson then Fleetguard', () => {
  assert.equal(manifest.canonical_hd_rule, 'DONALDSON_IF_MANUFACTURED_ELSE_FLEETGUARD');
});
