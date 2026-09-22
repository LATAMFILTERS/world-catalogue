'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../config/vehicle-platform-closure/isuzu-us-phase2-oem.json');
const { years, buildPhase2WorkOrders } = require('../scripts/hermes/isuzu-us-phase2-oem-work-orders');

test('phase 2 covers every Isuzu USA model year from 2000 through 2026', () => {
  const range = years();
  assert.equal(range.length, 27);
  assert.equal(range[0], 2000);
  assert.equal(range.at(-1), 2026);
});

test('phase 2 creates 81 OEM-only work orders for 27 years x 3 stages', () => {
  const items = buildPhase2WorkOrders({ requestedAt: '2026-09-22T00:00:00.000Z' });
  assert.equal(items.length, 81);
  assert.equal(items.every(x => x.aftermarket_allowed === false), true);
  assert.equal(items.every(x => x.research.allow_competitor_sources === false), true);
  assert.equal(items.every(x => x.research.preferred_manufacturer_domains.length === 1), true);
  assert.equal(items.every(x => x.research.preferred_manufacturer_domains[0] === 'isuzucv.com'), true);
});

test('2A defines models only from Isuzu primary evidence', () => {
  const [item] = buildPhase2WorkOrders({
    requestedAt: '2026-09-22T00:00:00.000Z',
    stageId: '2A_MODEL_UNIVERSE',
  });
  assert.match(item.gap.question, /only Isuzu Commercial Truck of America primary sources/i);
  assert.match(item.gap.question, /aftermarket source to define the OEM model universe/i);
});

test('2C requires OEN before Donaldson or Fleetguard', () => {
  const [item] = buildPhase2WorkOrders({
    requestedAt: '2026-09-22T00:00:00.000Z',
    stageId: '2C_OEM_FILTER_OEN',
  });
  assert.match(item.gap.question, /genuine OE\/OEN/i);
  assert.match(item.gap.question, /Do not consult Donaldson, Fleetguard/i);
  assert.equal(item.source_policy, 'OEM_ONLY_UNTIL_PHASE2_COMPLETE');
});

test('candidate historical names never become accepted applications by presence in manifest', () => {
  assert.ok(manifest.candidate_model_names.includes('FBR'));
  assert.match(manifest.candidate_policy, /search terms only/i);
  assert.match(manifest.candidate_policy, /not accepted/i);
});

test('downstream order after phase 2 is Donaldson then Fleetguard', () => {
  assert.deepEqual(manifest.downstream_after_phase2.slice(0,2), [
    'DONALDSON_BY_VERIFIED_OEN',
    'FLEETGUARD_BY_VERIFIED_OEN_IF_NEEDED'
  ]);
  assert.equal(manifest.canonical_hd_rule, 'DONALDSON_IF_MANUFACTURED_ELSE_FLEETGUARD');
});
