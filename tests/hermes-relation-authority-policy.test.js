'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  RACOR_TURBINE_COMPATIBILITY,
  relationAuthorityFor,
  fleetguardFallbackAllowed,
} = require('../lib/hermes-relation-authority-policy');

test('ET9 uses Parker Racor as primary authority', () => {
  const route = relationAuthorityFor({
    sku: 'ET90500',
    duty: 'HEAVY_DUTY',
    enrichment_data: {},
  });
  assert.equal(route.authority, 'PARKER_RACOR');
  assert.equal(route.mode, 'ET9_PRIMARY');
});

test('ET9 permits Fleetguard only after governed Donaldson non-manufacture verification', () => {
  const row = {
    sku: 'ET93029',
    duty: 'HEAVY_DUTY',
    enrichment_data: {
      codigo_base_governance: {
        donaldson_absence_verified: true,
        approved_manufacturer: 'FLEETGUARD',
      },
    },
  };
  const route = relationAuthorityFor(row);
  assert.equal(route.authority, 'PARKER_RACOR');
  assert.equal(route.fallback_authority, 'FLEETGUARD');
  assert.equal(route.fallback_allowed, true);
  assert.equal(fleetguardFallbackAllowed(row), true);
});

test('Donaldson not found is not enough to enable Fleetguard', () => {
  const row = {
    sku: 'ET93029',
    duty: 'HEAVY_DUTY',
    enrichment_data: {
      codigo_base_governance: {
        donaldson_absence_verified: false,
        approved_manufacturer: 'FLEETGUARD',
      },
    },
  };
  assert.equal(relationAuthorityFor(row).authority, 'PARKER_RACOR');
  assert.equal(fleetguardFallbackAllowed(row), false);
});

test('general HD uses Donaldson primary unless non-manufacture is verified', () => {
  assert.equal(relationAuthorityFor({ sku: 'EH60222', duty: 'HEAVY_DUTY' }).authority, 'DONALDSON');
  assert.equal(relationAuthorityFor({
    sku: 'EF95112',
    duty: 'HEAVY_DUTY',
    enrichment_data: {
      codigo_base_governance: {
        donaldson_absence_verified: true,
        approved_manufacturer: 'FLEETGUARD',
      },
    },
  }).authority, 'FLEETGUARD');
});

test('Parker Racor compatibility matrix remains governed', () => {
  assert.deepEqual(RACOR_TURBINE_COMPATIBILITY, {
    '500FG': '2010',
    '500FH': '2010',
    '900FG': '2040',
    '900FH': '2040',
    '1000FG': '2020',
    '1000FH': '2020',
  });
});
