'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DEFAULT_STATEMENT_TIMEOUT_MS,
  MIN_STATEMENT_TIMEOUT_MS,
  MAX_STATEMENT_TIMEOUT_MS,
  resolveStatementTimeout
} = require('../lib/bot-protocol-db');

test('an explicit shorter timeout from the caller is respected, not raised', () => {
  assert.equal(DEFAULT_STATEMENT_TIMEOUT_MS, 30000);
  assert.equal(resolveStatementTimeout(12000), 12000);
  assert.equal(resolveStatementTimeout(8000), 8000);
  assert.equal(resolveStatementTimeout(700), 700);
});

test('catalog query timeout remains bounded', () => {
  assert.equal(MAX_STATEMENT_TIMEOUT_MS, 60000);
  assert.equal(resolveStatementTimeout(120000), 60000);
  assert.equal(resolveStatementTimeout(undefined), DEFAULT_STATEMENT_TIMEOUT_MS);
});

test('nonsensical requested values fall back to a sane floor or the default', () => {
  assert.equal(MIN_STATEMENT_TIMEOUT_MS, 250);
  assert.equal(resolveStatementTimeout(0), DEFAULT_STATEMENT_TIMEOUT_MS);
  assert.equal(resolveStatementTimeout(-500), DEFAULT_STATEMENT_TIMEOUT_MS);
  assert.equal(resolveStatementTimeout(100), MIN_STATEMENT_TIMEOUT_MS);
});
