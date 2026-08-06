'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  MIN_STATEMENT_TIMEOUT_MS,
  MAX_STATEMENT_TIMEOUT_MS,
  resolveStatementTimeout
} = require('../lib/bot-protocol-db');

test('catalog queries cannot be canceled by legacy short timeouts', () => {
  assert.equal(MIN_STATEMENT_TIMEOUT_MS, 30000);
  assert.equal(resolveStatementTimeout(12000), 30000);
  assert.equal(resolveStatementTimeout(8000), 30000);
});

test('catalog query timeout remains bounded', () => {
  assert.equal(MAX_STATEMENT_TIMEOUT_MS, 60000);
  assert.equal(resolveStatementTimeout(120000), 60000);
  assert.equal(resolveStatementTimeout(undefined), 30000);
});
