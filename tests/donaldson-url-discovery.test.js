'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  canonicalOfficialProductUrl,
  discoveryUrls,
  extractOfficialProductUrls,
} = require('../lib/donaldson-url-discovery');

test('accepts exact official product URLs across valid Donaldson locales', () => {
  assert.equal(
    canonicalOfficialProductUrl('https://shop.donaldson.com/store/en-us/product/P551313/20730?_requestid=9', 'P551313'),
    'https://shop.donaldson.com/store/en-us/product/P551313/20730',
  );
  assert.equal(
    canonicalOfficialProductUrl('https://shop.donaldson.com/store/es-us/product/P551313/20730', 'P551313'),
    'https://shop.donaldson.com/store/es-us/product/P551313/20730',
  );
});

test('rejects third-party, wrong-code, non-HTTPS and incomplete URLs', () => {
  assert.equal(canonicalOfficialProductUrl('https://example.com/store/en-us/product/P551313/20730', 'P551313'), null);
  assert.equal(canonicalOfficialProductUrl('https://shop.donaldson.com/store/en-us/product/P551315/20732', 'P551313'), null);
  assert.equal(canonicalOfficialProductUrl('http://shop.donaldson.com/store/en-us/product/P551313/20730', 'P551313'), null);
  assert.equal(canonicalOfficialProductUrl('https://shop.donaldson.com/store/en-us/product/P551313', 'P551313'), null);
});

test('extracts direct, HTML-encoded, percent-encoded and JSON-escaped official URLs', () => {
  const payload = [
    '<a href="https://shop.donaldson.com/store/en-us/product/P551313/20730?x=1&amp;y=2">direct</a>',
    'https%3A%2F%2Fshop.donaldson.com%2Fstore%2Ffr-fr%2Fproduct%2FP551313%2F20730',
    'https:\\/\\/shop.donaldson.com\\/store\\/en-za\\/product\\/P551313\\/20730',
  ].join('\n');
  assert.deepEqual(extractOfficialProductUrls(payload, 'P551313').sort(), [
    'https://shop.donaldson.com/store/en-us/product/P551313/20730',
    'https://shop.donaldson.com/store/en-za/product/P551313/20730',
    'https://shop.donaldson.com/store/fr-fr/product/P551313/20730',
  ]);
});

test('unwraps DuckDuckGo and Bing redirect targets but preserves official-only validation', () => {
  const official = 'https://shop.donaldson.com/store/en-us/product/P551313/20730';
  const duck = `https://duckduckgo.com/l/?uddg=${encodeURIComponent(official)}`;
  const bingPayload = Buffer.from(official).toString('base64url');
  const bing = `https://www.bing.com/ck/a?u=a1${bingPayload}`;
  assert.equal(canonicalOfficialProductUrl(duck, 'P551313'), official);
  assert.equal(canonicalOfficialProductUrl(bing, 'P551313'), official);
});

test('uses redundant discovery transports without treating any result as evidence', () => {
  const urls = discoveryUrls('P551313');
  assert.equal(urls.length, 4);
  assert.match(urls[0], /format=rss/);
  assert.ok(urls.every((url) => /bing\.com|duckduckgo\.com/.test(url)));
  assert.ok(urls.every((url) => !url.startsWith('https://shop.donaldson.com/')));
});
