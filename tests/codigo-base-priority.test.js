'use strict';

const assert = require('assert');
const { choosePreferred } = require('../scripts/migrations/run_067_enforce_codigo_base_priority');

function row(duty, competitor_codes = [], oem_codes = [], codigo_base = '', enrichment_data = {}) {
  return { duty, competitor_codes, oem_codes, codigo_base, enrichment_data };
}

// Existing preferred-manufacturer base is canonical.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'DONALDSON', code: 'P551313' },
    { manufacturer: 'FLEETGUARD', code: 'FF5320' },
  ], [], 'P551313'));
  assert.equal(decision.safe, true);
  assert.equal(decision.alreadyCanonical, true);
  assert.equal(decision.authority, 'DONALDSON');
}

// Raw cross-reference evidence alone can never authorize mutation.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'DONALDSON', code: 'P551313' },
    { manufacturer: 'FLEETGUARD', code: 'FF5320' },
  ], [], 'FF5320'));
  assert.equal(decision.safe, false);
  assert.equal(decision.authority, 'DONALDSON');
  assert.equal(decision.candidate, 'P551313');
}

// Unknown current provenance also stays unresolved.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'DONALDSON', code: 'J8570601' },
  ], [], 'P500125'));
  assert.equal(decision.safe, false);
  assert.equal(decision.reason, 'Donaldson candidate exists but replacement lacks explicit governance approval');
}

// Explicit verified governance approval authorizes Donaldson replacement.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'DONALDSON', code: 'P551313' },
    { manufacturer: 'FLEETGUARD', code: 'FF5320' },
  ], [], 'FF5320', {
    codigo_base_governance: {
      replacement_verified: true,
      approved_codigo_base: 'P551313',
      approved_authority: 'DONALDSON',
    },
  }));
  assert.equal(decision.safe, true);
  assert.equal(decision.alreadyCanonical, false);
  assert.equal(decision.code, 'P551313');
  assert.equal(decision.authority, 'DONALDSON');
}

// Invalid Donaldson approval is rejected if code is absent from evidence.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'DONALDSON', code: 'P551313' },
  ], [], 'FF5320', {
    codigo_base_governance: {
      replacement_verified: true,
      approved_codigo_base: 'P999999',
      approved_authority: 'DONALDSON',
    },
  }));
  assert.equal(decision.safe, false);
  assert.equal(decision.authority, 'GOVERNANCE');
}

// Fleetguard fallback needs Donaldson absence proof even when approved.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'FLEETGUARD', code: 'FF5320' },
  ], [], 'OEM123', {
    codigo_base_governance: {
      replacement_verified: true,
      approved_codigo_base: 'FF5320',
      approved_authority: 'FLEETGUARD',
    },
  }));
  assert.equal(decision.safe, false);
  assert.equal(decision.authority, 'GOVERNANCE');
}

// Fleetguard becomes valid only with verified Donaldson absence.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'FLEETGUARD', code: 'FF5320' },
  ], [], 'OEM123', {
    codigo_base_governance: {
      replacement_verified: true,
      approved_codigo_base: 'FF5320',
      approved_authority: 'FLEETGUARD',
      donaldson_absence_verified: true,
    },
  }));
  assert.equal(decision.safe, true);
  assert.equal(decision.code, 'FF5320');
}

// Existing MANN-FILTER base is canonical.
{
  const decision = choosePreferred(row('LIGHT_DUTY', [
    { manufacturer: 'MANN-FILTER', code: 'WK 820/17' },
  ], [], 'WK 820/17'));
  assert.equal(decision.safe, true);
  assert.equal(decision.alreadyCanonical, true);
  assert.equal(decision.authority, 'MANN_FILTER');
}

// LD replacement also requires explicit approval.
{
  const decision = choosePreferred(row('LIGHT_DUTY', [
    { manufacturer: 'MANN-FILTER', code: 'WK 820/17' },
  ], [{ manufacturer: 'TOYOTA', code: '23300-0V010' }], '23300-0V010'));
  assert.equal(decision.safe, false);
  assert.equal(decision.authority, 'MANN_FILTER');
}

// Explicit MANN approval authorizes the replacement.
{
  const decision = choosePreferred(row('LIGHT_DUTY', [
    { manufacturer: 'MANN-FILTER', code: 'WK 820/17' },
  ], [{ manufacturer: 'TOYOTA', code: '23300-0V010' }], '23300-0V010', {
    codigo_base_governance: {
      replacement_verified: true,
      approved_codigo_base: 'WK 820/17',
      approved_authority: 'MANN_FILTER',
    },
  }));
  assert.equal(decision.safe, true);
  assert.equal(decision.code, 'WK 820/17');
}

console.log('codigo_base priority governance regression tests passed');
