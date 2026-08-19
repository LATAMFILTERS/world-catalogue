'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const migrationPath = path.join(__dirname, '..', 'scripts', 'migrations', 'run_068_enforce_turbine_et9.js');
const source = fs.readFileSync(migrationPath, 'utf8');

test('turbine migration explicitly retires the known legacy 2020 alias', () => {
  assert.match(source, /\['EF92020', 'ET92020T'\]/);
});

test('turbine migration enforces ET9 as the only accepted turbine SKU prefix', () => {
  assert.match(source, /NEW\.sku !~ '\^ET9'/);
  assert.match(source, /technology = 'TURBOCORE™'/);
});

test('2010 2020 and 2040 PM SM TM elements resolve deterministically to ET9 variants', () => {
  assert.match(source, /\(2010\|2020\|2040\)\(PM\|SM\|TM\)/);
  assert.match(source, /`ET9\$\{m\[1\]\}\$\{letter\}`/);
});

test('migration aborts instead of guessing unresolved turbine rows', () => {
  assert.match(source, /Aborting: \$\{unresolved\.length\} turbine-like rows require evidence before mutation/);
});

test('legacy alias must be absent after verification', () => {
  assert.match(source, /WHERE sku = 'EF92020'/);
  assert.match(source, /noncanonical turbine rows remain/);
});
