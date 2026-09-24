'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

test('Power Search classifies known aftermarket brand variants as competitors', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'server-original.js'), 'utf8');
  const required = ['ECOGARD','K&N','MAHLE/KNECHT','MOBIL 1','NAPA GOLD','PREMIUM GUARD'];
  for (const brand of required) {
    assert.ok(source.includes("'" + brand + "'"), brand + ' must stay in COMPETITOR_BRANDS');
  }
});
