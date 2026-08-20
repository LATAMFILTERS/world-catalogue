'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const migration = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'migrations',
  'run_080_alternate_integrity_and_reference_quarantine.js'), 'utf8');
const gateway = fs.readFileSync(path.join(__dirname, '..', 'lib', 'catalog-write-gateway.js'), 'utf8');
const startup = fs.readFileSync(path.join(__dirname, '..', 'server-protocol.js'), 'utf8');

test('migration removes only exact codigo_base duplicates from alternate arrays', () => {
  assert.match(migration, /SET oem_codes\s*=/);
  assert.match(migration, /competitor_codes\s*=/);
  assert.doesNotMatch(migration, /SET\s+(codigo_base|sku|equipment_applications|vehicle_applications)\s*=/i);
  assert.match(migration, /absence_inferred:\s*0/);
  assert.match(migration, /classification_inferred:\s*0/);
});

test('migration audits application payloads before and after', () => {
  assert.match(migration, /audit_before\.application_payload_hash/);
  assert.match(migration, /audit_after\.application_payload_hash/);
  assert.match(migration, /APPLICATION_PAYLOAD_CHANGED/);
});

test('future writes block canonical duplication and monotonic cross-column growth', () => {
  assert.match(gateway, /CODIGO_BASE_DUPLICATED_IN_ALTERNATES/);
  assert.match(migration, /cross-column duplicates cannot increase/);
  assert.match(migration, /explicitly classified reference stored in wrong column/);
});

test('startup applies structural sanitation before curated evidence writes', () => {
  const integrity = startup.indexOf('applyAlternateIntegrityAndReferenceQuarantine');
  const curated = startup.indexOf('applyCuratedOfficialEvidenceBatch1');
  assert.ok(integrity >= 0 && curated >= 0 && integrity < curated);
  assert.match(startup, /loadReferenceQuarantine/);
});
