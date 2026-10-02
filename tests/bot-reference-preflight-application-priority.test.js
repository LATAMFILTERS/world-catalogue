'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { shouldPreflight } = require('../lib/bot-protocol-reference-preflight');

test('vehicle application query is not intercepted by reference preflight', () => {
  const message = 'que filtros lleva el Columbia CL120 Freightliner con motor Detroit Diesel S60';
  assert.equal(shouldPreflight(message, {}, ['CL120','S60']), false);
});

test('explicit reference lookup still uses preflight', () => {
  const message = 'busca la referencia P552100 y dime su equivalente';
  assert.equal(shouldPreflight(message, {}, ['P552100']), true);
});
