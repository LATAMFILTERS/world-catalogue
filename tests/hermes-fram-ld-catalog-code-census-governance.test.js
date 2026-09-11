'use strict';

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const script = fs.readFileSync(path.resolve('scripts/hermes/extract-fram-ld-catalog-codes.mjs'),'utf8');

test('FRAM LD catalog census remains private and read-only', () => {
  assert.match(script, /LIGHT_DUTY_KNOWLEDGE_DOMAIN/);
  assert.match(script, /private_evidence_only:true/);
  assert.match(script, /catalog_auto_update:false/);
  assert.match(script, /cross_auto_confirmation:false/);
  assert.match(script, /application_auto_confirmation:false/);
  assert.doesNotMatch(script, /\bINSERT\s+INTO\s+elimfilters_catalog\b/i);
  assert.doesNotMatch(script, /\bUPDATE\s+elimfilters_catalog\b/i);
  assert.doesNotMatch(script, /\bDELETE\s+FROM\s+elimfilters_catalog\b/i);
});

test('FRAM LD catalog census writes a codes-only artifact with traceability', () => {
  assert.match(script, /fram-ld-codes\.json/);
  assert.match(script, /fram-ld-codes\.csv/);
  assert.match(script, /source_urls/);
  assert.match(script, /source_snapshot_sha256/);
  assert.match(script, /unique_code_count/);
});
