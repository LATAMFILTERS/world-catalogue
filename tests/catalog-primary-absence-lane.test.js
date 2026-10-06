'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const migrationPath = path.join(
  __dirname,
  '..',
  'scripts',
  'migrations',
  'run_212_primary_absence_awaiting_explicit_authority.js'
);
const queueMigrationPath = path.join(
  __dirname,
  '..',
  'scripts',
  'migrations',
  'run_074_catalog_historical_sanitation_queue.js'
);
const sanitationPath = path.join(
  __dirname,
  '..',
  'scripts',
  'catalog-historical-sanitation.js'
);

test('primary absence awaiting authority lane is fail closed and queue only', () => {
  const source = fs.readFileSync(migrationPath, 'utf8');

  assert.match(source, /PRIMARY_ABSENCE_AWAITING_EXPLICIT_AUTHORITY/);
  assert.match(source, /EXPLICIT_DONALDSON_MANUFACTURING_ABSENCE/);
  assert.match(source, /EXPLICIT_PRIMARY_ABSENCE_AUTHORITY_REQUIRED/);

  assert.doesNotMatch(source, /UPDATE\s+elimfilters_catalog/i);
  assert.doesNotMatch(source, /SET\s+donaldson_absence_verified\s*=\s*true/i);
  assert.doesNotMatch(source, /status\s*=\s*'RESOLVED'/i);
  assert.doesNotMatch(source, /canonical_source_brand\s*=/i);
  assert.doesNotMatch(source, /canonical_source_status\s*=/i);
});

test('primary absence lane refuses rows whose Donaldson absence is already verified', () => {
  const source = fs.readFileSync(migrationPath, 'utf8');

  assert.match(source, /donaldson_absence_verified/);
  assert.match(source, /REFUSE_ALREADY_VERIFIED_ABSENCE_ROWS/);
  assert.match(source, /donaldson_absence_verified'\)::boolean/);
  assert.match(source, /=false/);
});

test('historical queue rebuild preserves the explicit absence authority lane', () => {
  const source = fs.readFileSync(queueMigrationPath, 'utf8');

  assert.match(source, /PRIMARY_ABSENCE_AWAITING_EXPLICIT_AUTHORITY/);
  assert.match(source, /EXPLICIT_DONALDSON_MANUFACTURING_ABSENCE/);
  assert.match(source, /catalog_codigo_base_sanitation_queue\.governance_state/);
});

test('automatic sanitation worker cannot promote the awaiting absence lane', () => {
  const source = fs.readFileSync(sanitationPath, 'utf8');

  assert.match(
    source,
    /IN \('CANONICAL_EVIDENCED_NOT_VERIFIED','REVIEW_PRIMARY_CANDIDATE'\)/
  );
  assert.doesNotMatch(source, /PRIMARY_ABSENCE_AWAITING_EXPLICIT_AUTHORITY/);
});
