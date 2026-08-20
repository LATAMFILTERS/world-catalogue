'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, '..', 'scripts', 'migrations',
  'run_079_apply_p551315_canonical_evidence.js');
const source = fs.readFileSync(migrationPath, 'utf8');

test('P551315 correction uses the exact official Donaldson product page', () => {
  assert.match(source,
    /https:\/\/shop\.donaldson\.com\/store\/en-us\/product\/P551315\/20732/);
  assert.match(source, /sku:\s*'EF91315'/);
  assert.match(source, /previousCodigoBase:\s*'ST1315'/);
  assert.match(source, /codigoBase:\s*'P551315'/);
  assert.doesNotMatch(source, /P556707/);
});

test('P551315 correction passes the Catalog Write Gateway and never infers absence', () => {
  assert.match(source, /assertCanonicalWrite\(/);
  assert.match(source, /primary_manufacturer_verified:\s*true/);
  assert.match(source, /approved_manufacturer:\s*'DONALDSON'/);
  assert.match(source, /absence_inferred:\s*0/);
});

test('P551315 correction protects alternatives and exact application payloads', () => {
  assert.doesNotMatch(source,
    /SET\s+(oem_codes|competitor_codes|alternative_products|alternatives|equipment_applications|vehicle_applications)\s*=/i);
  assert.match(source, /PROTECTED_PAYLOAD_CHANGED/);
  assert.match(source, /CODIGO_BASE_DUPLICATED_IN_ALTERNATES/);
  assert.match(source, /equipment_applications:\s*stableHash/);
  assert.match(source, /vehicle_applications:\s*stableHash/);
});
