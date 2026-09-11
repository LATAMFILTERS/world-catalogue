const test = require('node:test');
const assert = require('node:assert/strict');

const {
  SOURCE,
  URLS,
  TOPIC_MAP,
  canonicalizeSourceUrl,
  getUniqueCorpusUrls
} = require('../lib/knowledge-governance/fram-automotive-source-corpus');

const {
  KNOWLEDGE_DOMAINS
} = require('../lib/knowledge-governance/knowledge-domain-registry');

test('FRAM automotive corpus is internal LD evidence and cannot mutate catalogue automatically', () => {
  assert.equal(SOURCE.knowledge_domain, KNOWLEDGE_DOMAINS.LIGHT_DUTY);
  assert.equal(SOURCE.industry, 'Automotive');
  assert.equal(SOURCE.public_brand_reference, false);
  assert.equal(SOURCE.catalog_auto_update, false);
  assert.equal(SOURCE.knowledge_candidate, true);
});

test('FRAM corpus contains the governed set of 36 unique automotive pages', () => {
  assert.equal(URLS.length, 36);
  assert.equal(getUniqueCorpusUrls().length, 36);
});

test('source URL canonicalization strips query strings, hashes and trailing slash', () => {
  const canonical = canonicalizeSourceUrl('https://www.fram.com/vehicle-maintenance-center/post/how-oil-filters-work/?x=1#section');
  assert.equal(canonical, 'https://www.fram.com/vehicle-maintenance-center/post/how-oil-filters-work');
});

test('corpus maps LD knowledge to SYNTRAX, MACROCORE and MICROKAPPA topic families', () => {
  assert.equal(TOPIC_MAP.lubrication.includes('SYNTRAX™'), true);
  assert.equal(TOPIC_MAP.engine_air_intake.includes('MACROCORE™'), true);
  assert.equal(TOPIC_MAP.cabin_air.includes('MICROKAPPA™'), true);
});
