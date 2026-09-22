'use strict';

const fs = require('fs');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const server = fs.readFileSync(path.join(__dirname, '..', 'server-original.js'), 'utf8');
const startup = fs.readFileSync(path.join(__dirname, '..', 'server-protocol.js'), 'utf8');

test('equipment search reuses relational LD vehicle applications with safe postgres placeholders', () => {
  assert.match(server, /FROM ld_catalog\.ld_vehicle_applications va/);
  assert.match(server, /canonical_make/);
  assert.match(server, /canonical_model/);
  assert.match(server, /LIKE \$\$\{idx\}/);
  assert.doesNotMatch(server, /vehicleConds\.push\([^\n]*LIKE \$\{idx\}/);
});

test('equipment search exposes additive canonical vehicle resolution metadata', () => {
  assert.match(server, /vehicle_resolution:/);
  assert.match(server, /platform: identity\.platform \|\| null/);
  assert.match(server, /normalized: identity\.matched === true/);
});

test('vehicle schema migration is controlled and not forced on every runtime startup', () => {
  assert.doesNotMatch(startup, /run_112_vehicle_application_normalization/);
});
