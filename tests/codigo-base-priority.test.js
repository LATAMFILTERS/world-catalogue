'use strict';

const assert = require('assert');
const { choosePreferred } = require('../scripts/migrations/run_067_enforce_codigo_base_priority');

function row(duty, competitor_codes = [], oem_codes = [], codigo_base = '') {
  return { duty, competitor_codes, oem_codes, codigo_base };
}

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

{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'DONALDSON', code: 'J8570601' },
    { manufacturer: 'DONALDSON', code: 'P500125' },
  ], [], 'P500125'));
  assert.equal(decision.safe, true);
  assert.equal(decision.alreadyCanonical, true);
  assert.equal(decision.code, 'P500125');
}

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

{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'DONALDSON', code: 'P551313' },
  ], [], 'ST1313'));
  assert.equal(decision.safe, true);
  assert.equal(decision.alreadyCanonical, false);
  assert.equal(decision.code, 'P551313');
}

{
  const decision = choosePreferred(row('HEAVY_DUTY', [
    { manufacturer: 'FLEETGUARD', code: 'FF5320' },
  ]));
  assert.equal(decision.safe, false);
  assert.equal(decision.authority, 'FLEETGUARD');
  assert.equal(decision.candidate, 'FF5320');
}

{
  const decision = choosePreferred(row('LIGHT_DUTY', [
    { manufacturer: 'MANN-FILTER', code: 'WK 820/17' },
  ], [], 'WK 820/17'));
  assert.equal(decision.safe, true);
  assert.equal(decision.alreadyCanonical, true);
  assert.equal(decision.authority, 'MANN_FILTER');
  assert.equal(decision.code, 'WK 820/17');
}

{
  const decision = choosePreferred(row('LIGHT_DUTY', [
    { manufacturer: 'MANN-FILTER', code: 'WK 820/17' },
    { manufacturer: 'MANN', code: 'WK82017X' },
  ], [], 'UNKNOWN'));
  assert.equal(decision.safe, false);
  assert.equal(decision.authority, 'MANN_FILTER');
}

{
  const decision = choosePreferred(row('LIGHT_DUTY', [], [
    { manufacturer: 'TOYOTA', code: '23300-0V010' },
  ]));
  assert.equal(decision.safe, false);
  assert.equal(decision.authority, 'OEM');
}

console.log('codigo_base priority regression tests passed');
