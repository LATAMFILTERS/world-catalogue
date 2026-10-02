'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { extractApplicationEntities } = require('../lib/bot-protocol-unified-orchestrator');

test('application parser separates Hyundai Sonata from generic 2.5L engine displacement', () => {
  const parsed = extractApplicationEntities('que filtro de aceite usa Hyundai Sonata 2022 2.5L');
  assert.equal(parsed.brand, 'HYUNDAI');
  assert.equal(parsed.model, 'SONATA');
  assert.equal(parsed.engine, '2.5L');
  assert.equal(parsed.year, 2022);
  assert.deepEqual(parsed.tokens, ['HYUNDAI','SONATA','2.5L']);
});


test('application parser separates Prius from alphanumeric Toyota engine code', () => {
  const parsed = extractApplicationEntities('que filtro de aceite usa Toyota Prius con motor 2ZRFXE');
  assert.equal(parsed.brand, 'TOYOTA');
  assert.equal(parsed.model, 'PRIUS');
  assert.equal(parsed.engine, '2ZRFXE');
  assert.deepEqual(parsed.tokens, ['TOYOTA','PRIUS','2ZRFXE']);
});
