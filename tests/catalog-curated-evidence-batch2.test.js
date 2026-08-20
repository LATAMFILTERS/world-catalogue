'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'migrations', 'run_078_apply_curated_official_evidence_batch2.js'), 'utf8');

test('batch 2 contains only exact reviewed official product URLs', () => {
  const officialUrls = source.match(/https:\/\/shop\.donaldson\.com\/store\/[a-z]{2}-[a-z]{2}\/product\/[A-Z0-9]+\/[A-Za-z0-9_-]+/g) || [];
  assert.equal(officialUrls.length, 4);
  assert.match(source, /crypto\.createHash\('sha256'\)/);
});

test('batch 2 never mutates protected catalog or application fields', () => {
  assert.doesNotMatch(source, /SET\s+(sku|codigo_base|oem_codes|competitor_codes|equipment_applications|vehicle_applications)\s*=/i);
  assert.match(source, /absence_inferred:\s*0/);
  assert.match(source, /application_mutations:\s*0/);
});

test('historical sanitation is opt-in and capped at five rows per startup', () => {
  const server = fs.readFileSync(path.join(__dirname, '..', 'server-protocol.js'), 'utf8');
  assert.match(server, /CATALOG_HISTORICAL_SANITATION_LIVE === 'true'/);
  assert.match(server, /Math\.min\(5,/);
  assert.doesNotMatch(server, /runHistoricalSanitationBatch\(\{ apply: true, limit: 25 \}\)/);
});
