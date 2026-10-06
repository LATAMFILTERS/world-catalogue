'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const repair = require('../scripts/repair-catalog-completeness-from-donaldson');

test('classifies filter brands as competitors and equipment makers as OEMs', () => {
  assert.equal(repair.isCompetitor('Fleetguard'), true);
  assert.equal(repair.isCompetitor('MANN-FILTER'), true);
  assert.equal(repair.isCompetitor('Mercedes-Benz'), false);
  assert.equal(repair.isCompetitor('Cummins'), false);
});

test('extractReferences splits mixed Donaldson refs and removes obvious scraper noise', () => {
  const record = {
    oem_codes: [
      { manufacturer: 'CUMMINS', code: '3908616' },
      { manufacturer: 'FLEETGUARD', code: 'LF3000' },
      { manufacturer: 'THREADSIZE', code: '1-16 UNF' },
    ],
    brand_crossrefs: {
      BALDWIN: ['B2'],
      WIX: ['51515'],
    },
  };
  const refs = repair.extractReferences(record);
  assert.deepEqual(refs.oem.map((x) => [x.manufacturer, x.code]), [['CUMMINS', '3908616']]);
  assert.deepEqual(
    refs.competitors.map((x) => [x.manufacturer, x.code]).sort(),
    [['BALDWIN', 'B2'], ['FLEETGUARD', 'LF3000'], ['WIX', '51515']].sort()
  );
  assert.ok(refs.oem.every((x) => x.classification === 'OEM'));
  assert.ok(refs.competitors.every((x) => x.classification === 'AFTERMARKET'));
});

test('extractApplications normalizes and deduplicates equipment records', () => {
  const record = {
    equipment: [
      { equipment: 'CAT 950', engine: 'C7', year: '2010' },
      { equipment: 'CAT 950', engine: 'C7', year: '2010' },
      'KOMATSU WA380',
    ],
  };
  const apps = repair.extractApplications(record);
  assert.equal(apps.length, 2);
  assert.equal(apps[0].equipment, 'CAT 950');
  assert.equal(apps[1].equipment, 'KOMATSU WA380');
});

test('final captures outrank older base captures', () => {
  assert.ok(
    repair.capturePriority('donaldson_fuel_final_results_20260917.json') >
    repair.capturePriority('donaldson_fuel_results.json')
  );
});

test('brand_crossrefs is rebuilt from governed competitor references', () => {
  const map = repair.buildBrandCrossrefs([
    { manufacturer: 'WIX', code: '51515' },
    { manufacturer: 'WIX', code: '51516' },
    { manufacturer: 'WIX', code: '51515' },
  ]);
  assert.deepEqual(map, { WIX: ['51515', '51516'] });
});
