'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, '..', 'scripts', 'migrations', 'run_071_build_codigo_base_review_queue.js');
const source = fs.readFileSync(migrationPath, 'utf8');

assert.match(source, /CREATE TABLE IF NOT EXISTS codigo_base_review_queue/);
assert.match(source, /REFERENCES elimfilters_catalog\(sku\) ON UPDATE CASCADE ON DELETE CASCADE/);
assert.match(source, /REVIEW_DONALDSON_CANDIDATE' THEN 10/);
assert.match(source, /REVIEW_MANN_CANDIDATE' THEN 20/);
assert.match(source, /REVIEW_DONALDSON_ABSENCE' THEN 30/);
assert.match(source, /REVIEW_DONALDSON_AND_FLEETGUARD_ABSENCE' THEN 40/);
assert.match(source, /REVIEW_MANN_ABSENCE' THEN 50/);
assert.match(source, /codigo_base_mutations: 0/);
assert.doesNotMatch(source, /UPDATE\s+elimfilters_catalog\s+SET\s+codigo_base\s*=/i);
assert.match(source, /catalog_unresolved/);
assert.match(source, /queue_active/);

console.log('codigo_base review queue migration regression tests passed');
