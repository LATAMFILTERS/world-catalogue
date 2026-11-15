'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { plan } = require('../scripts/migrations/run_316_weichai_1000424916a_es90017.js');

const row = () => ({
  oem_codes: [{ manufacturer: 'WEICHAI', code: '1000424916' }],
  competitor_codes: [{ manufacturer: 'MANN-FILTER', code: 'PL420X' }],
});

test('adds 1000424916A as a separate code, keeps 1000424916', () => {
  const p = plan(row());
  assert.deepEqual(p.oem_codes.map((x) => x.code), ['1000424916', '1000424916A']);
  assert.deepEqual(p.competitor_codes.map((x) => x.code), ['PL420X', '95102E', 'SK 3359']);
});

test('never writes HIFI or unverified Donaldson/Fleetguard', () => {
  const codes = plan(row()).competitor_codes.map((x) => x.manufacturer);
  assert.ok(!codes.includes('HIFI') && !codes.includes('DONALDSON') && !codes.includes('FLEETGUARD'));
});

test('idempotent', () => {
  const r = row();
  const p = plan(r);
  assert.equal(plan({ oem_codes: p.oem_codes, competitor_codes: p.competitor_codes }), null);
});
