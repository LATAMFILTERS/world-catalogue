'use strict';

const assert = require('assert');
const { choosePreferred } = require('../scripts/migrations/run_067_enforce_codigo_base_priority');

function row(duty, competitor_codes = [], oem_codes = [], codigo_base = '') {
  return { duty, competitor_codes, oem_codes, codigo_base };
}

// HD: existing Donaldson codigo_base is canonical.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'FLEETGUARD', code: 'FF5320' },
    { manufacturer: 'DONALDSON', code: 'P551313' },
  ], [], 'P551313'));
  assert.equal(decision.safe, true);
  assert.equal(decision.alreadyCanonical, true);
  assert.equal(decision.authority, 'DONALDSON');
  assert.equal(decision.code, 'P551313');
}

// HD: do not replace one evidenced Donaldson code with another Donaldson code.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'DONALDSON', code: 'J8570601' },
    { manufacturer: 'DONALDSON', code: 'P500125' },
  ], [], 'P500125'));
  assert.equal(decision.safe, true);
  assert.equal(decision.alreadyCanonical, true);
  assert.equal(decision.code, 'P500125');
}

// HD: multiple Donaldson candidates are ambiguous when current base matches none.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'DONALDSON', code: 'J8570601' },
    { manufacturer: 'DONALDSON', code: 'P500125' },
  ], [], 'UNKNOWN'));
  assert.equal(decision.safe, false);
  assert.equal(decision.authority, 'DONALDSON');
  assert.equal(decision.reason, 'Multiple preferred-manufacturer references exist; primary codigo_base is ambiguous');
  assert.deepEqual(decision.candidates, ['J8570601', 'P500125']);
}

// Critical regression: a single Donaldson reference is NOT enough to replace
// an unclassified current codigo_base. This prevents P500125 -> J8570601 style
// destructive rewrites when the catalog simply lacks manufacturer provenance
// for the existing base.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'DONALDSON', code: 'J8570601' },
  ], [], 'P500125'));
  assert.equal(decision.safe, false);
  assert.equal(decision.authority, 'DONALDSON');
  assert.equal(decision.reason, 'Current codigo_base manufacturer is not evidenced in catalog; replacement is not provable');
  assert.equal(decision.candidate, 'J8570601');
}

// Proven correction: current base is explicitly Fleetguard and exactly one
// Donaldson reference exists, so moving to Donaldson is evidence-backed.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'FLEETGUARD', code: 'FF5320' },
    { manufacturer: 'DONALDSON', code: 'P551313' },
  ], [], 'FF5320'));
  assert.equal(decision.safe, true);
  assert.equal(decision.alreadyCanonical, false);
  assert.equal(decision.code, 'P551313');
  assert.deepEqual(decision.current_authorities, ['FLEETGUARD']);
}

// ST1313-style unknown provenance must not be mass-mutated merely because one
// Donaldson candidate exists; it requires explicit evidence or manual repair.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'DONALDSON', code: 'P551313' },
  ], [], 'ST1313'));
  assert.equal(decision.safe, false);
  assert.equal(decision.candidate, 'P551313');
}

// Fleetguard fallback remains unresolved until Donaldson absence is verified.
{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'FLEETGUARD', code: 'FF5320' },
  ], [], 'FF5320'));
  assert.equal(decision.safe, false);
  assert.equal(decision.authority, 'FLEETGUARD');
  assert.equal(decision.candidate, 'FF5320');
}

// LD: existing MANN-FILTER codigo_base is canonical.
{
  const decision = choosePreferred(row('LIGHT_DUTY', [
    { manufacturer: 'MANN-FILTER', code: 'WK 820/17' },
  ], [], 'WK 820/17'));
  assert.equal(decision.safe, true);
  assert.equal(decision.alreadyCanonical, true);
  assert.equal(decision.authority, 'MANN_FILTER');
}

// LD: single MANN candidate cannot replace an unclassified current base.
{
  const decision = choosePreferred(row('LIGHT_DUTY', [
    { manufacturer: 'MANN-FILTER', code: 'WK 820/17' },
  ], [], 'OEM456'));
  assert.equal(decision.safe, false);
  assert.equal(decision.reason, 'Current codigo_base manufacturer is not evidenced in catalog; replacement is not provable');
}

// LD: proven OEM -> MANN correction is safe when both sides are evidenced.
{
  const decision = choosePreferred(row('LIGHT_DUTY', [
    { manufacturer: 'MANN-FILTER', code: 'WK 820/17' },
  ], [
    { manufacturer: 'TOYOTA', code: '23300-0V010' },
  ], '23300-0V010'));
  assert.equal(decision.safe, true);
  assert.equal(decision.code, 'WK 820/17');
  assert.deepEqual(decision.current_authorities, ['TOYOTA']);
}

console.log('codigo_base priority regression tests passed');
