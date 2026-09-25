'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../scripts/candidates/premium_guard_oil_ph3387a_el33387_strict_20260924.json'),
  'utf8'
));

test('PH3387A strict manifest is terminal', () => {
  assert.equal(manifest.sku, 'EL33387');
  assert.equal(manifest.codigo_base, 'PH3387A');
  assert.equal(manifest.oem_codes.length, 24);
  assert.equal(manifest.competitor_codes.length, 42);
  assert.equal(manifest.vehicle_applications.length, 308);
  assert.equal(manifest.reference_governance.status, 'RESOLVED_WITH_CANONICAL_PRIORITY_AND_PUBLIC_GOVERNANCE');
  assert.deepEqual(manifest.reference_governance.governed_references, ['PG6161','TG3387A','XG3387A']);
});

test('PH3387A terminal path keeps FRAM canonical and secondary equivalents alternate-only', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../scripts/migrations/run_134_close_ph3387a_terminal.js'),
    'utf8'
  );
  assert.ok(source.includes("state:'CANONICAL_VERIFIED'"));
  assert.ok(source.includes("approved_manufacturer:'FRAM'"));
  assert.ok(source.includes("MANN-FILTER W712/22"));
  assert.ok(source.includes("MAHLE ML 1000"));
});