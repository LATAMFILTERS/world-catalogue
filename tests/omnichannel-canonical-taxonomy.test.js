'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { inferTechnology } = require('../lib/bot-protocol-channel-format');

const cases = [
  [{ filter_type: 'Fuel Filter' }, 'SYNTAPORE™'],
  [{ filter_type: 'Primary Diesel Fuel Filter' }, 'SYNTAPORE™'],
  [{ filter_type: 'Fuel Water Separator' }, 'TURBOCORE™'],
  [{ description: 'Approved 900FH turbine fuel separator element' }, 'TURBOCORE™'],
  [{ filter_type: 'Hydraulic Filter' }, 'NANOFORCE™'],
  [{ filter_type: 'Lube Oil Filter' }, 'SYNTRAX™'],
  [{ filter_type: 'Coolant Filter' }, 'THERMACORE™'],
  [{ filter_type: 'Cabin Air Filter' }, 'MICROKAPPA™'],
  [{ filter_type: 'Air Dryer Cartridge' }, 'DRYCORE™'],
  [{ filter_type: 'Air Intake Housing' }, 'INTEKCORE™'],
  [{ filter_type: 'Engine Air Filter' }, 'MACROCORE™'],
];

test('omnichannel formatter infers only current canonical technologies', () => {
  for (const [product, expected] of cases) {
    assert.equal(inferTechnology(product), expected, JSON.stringify(product));
  }
});

test('explicit governed technology takes precedence over inference', () => {
  assert.equal(
    inferTechnology({ filter_type: 'Fuel Filter', technology: 'SYNTAPORE™' }),
    'SYNTAPORE™'
  );
});
