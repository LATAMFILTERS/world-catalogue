'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { publicFilterType, publicSubType } = require('../lib/public-filter-type');

test('maps stored rows to the public Type', () => {
  const t = (sku, filter_type, technology) => publicFilterType({ sku, filter_type, technology });
  assert.equal(t('EL82016', 'oil'), 'Lube');
  assert.equal(t('ES91855', 'water', 'HYDROCORE™'), 'Fuel Separator');
  assert.equal(t('ET99030', 'separator', 'HYDROCORE™'), 'Fuel Separator');
  assert.equal(t('ET91000', 'fuel', 'TURBOCORE™'), 'Turbine');
  assert.equal(t('EA20001', 'air'), 'Intake');
  assert.equal(t('EA10001', 'air'), 'Air');
  assert.equal(t('EW70712', 'other'), 'Coolant');
  assert.equal(t('ED40001', 'air'), 'Air Dryer');
  assert.equal(t('EH68277', 'transmission'), 'Transmission');
  assert.equal(t('EH60416', 'hydraulic'), 'Hydraulic');
  assert.equal(t('XX00000', 'fuel'), null);
});

test('shows sub_type only from the closed list', () => {
  const s = (sub_type) => publicSubType({ sub_type });
  assert.equal(s('Primary Radial Seal'), 'Primary Radial Seal');
  assert.equal(s('Secondary'), 'Secondary');
  assert.equal(s('Spin On'), 'Spin On');
  assert.equal(s('Cellulose'), null);
  assert.equal(s('Fleetguard'), null);
  assert.equal(s('Primary Synthetic'), null);
  assert.equal(s(null), null);
});
