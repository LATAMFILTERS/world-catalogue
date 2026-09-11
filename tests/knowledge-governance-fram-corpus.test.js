const test = require('node:test');
const assert = require('node:assert/strict');

const {
  SOURCE,
  URLS,
  TOPIC_MAP,
  KNOWLEDGE_CONTENT_TYPES,
  canonicalizeSourceUrl,
  getUniqueCorpusUrls,
  classifyAutomotiveSource,
  classifyKnowledgeContentType,
  buildHermesCorpusSources
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
  assert.equal(buildHermesCorpusSources().length, 36);
});

test('source URL canonicalization strips query strings, hashes and trailing slash', () => {
  const canonical = canonicalizeSourceUrl('https://www.fram.com/vehicle-maintenance-center/post/how-oil-filters-work/?x=1#section');
  assert.equal(canonical, 'https://www.fram.com/vehicle-maintenance-center/post/how-oil-filters-work');
});

test('corpus maps LD knowledge to SYNTRAX, MACROCORE and MICROKAPPA topic families', () => {
  assert.equal(TOPIC_MAP.lubrication.includes('SYNTRAX™'), true);
  assert.equal(TOPIC_MAP.engine_air_intake.includes('MACROCORE™'), true);
  assert.equal(TOPIC_MAP.cabin_air.includes('MICROKAPPA™'), true);

  const carbonCabin = classifyAutomotiveSource('https://www.fram.com/vehicle-maintenance-center/post/how-carbon-air-filters-work');
  assert.equal(carbonCabin.technology_candidates.includes('MICROKAPPA™'), true);
  assert.equal(carbonCabin.knowledge_systems.includes('Air Intake & Airflow Protection Systems'), true);
});

test('corpus assigns precise knowledge content types without changing legacy candidate_type', () => {
  assert.equal(
    classifyKnowledgeContentType('https://www.fram.com/vehicle-maintenance-center/post/oil-filter-capacity-flow-rate-efficiency-and-micron-rating'),
    KNOWLEDGE_CONTENT_TYPES.ENGINEERING_REFERENCE
  );
  assert.equal(
    classifyKnowledgeContentType('https://www.fram.com/vehicle-maintenance-center/post/common-oil-filter-failures'),
    KNOWLEDGE_CONTENT_TYPES.FAILURE_ANALYSIS_GUIDE
  );
  assert.equal(
    classifyKnowledgeContentType('https://www.fram.com/vehicle-maintenance-center/post/how-to-change-engine-air-filter'),
    KNOWLEDGE_CONTENT_TYPES.INSTALLATION_PROCEDURE
  );
  assert.equal(
    classifyKnowledgeContentType('https://www.fram.com/vehicle-maintenance-center/post/how-often-should-you-change-your-oil-filter'),
    KNOWLEDGE_CONTENT_TYPES.SERVICE_REFERENCE
  );
});

test('every built corpus source is governed as LD Automotive with non-public technology/application candidates', () => {
  for (const source of buildHermesCorpusSources()) {
    assert.equal(source.knowledge_domain, KNOWLEDGE_DOMAINS.LIGHT_DUTY);
    assert.equal(source.industry, 'Automotive');
    assert.equal(source.technology_relation, 'probable');
    assert.equal(source.application_relation, 'candidate');
    assert.equal(source.public_brand_reference, false);
    assert.equal(source.catalog_auto_update, false);
    assert.equal(Object.values(KNOWLEDGE_CONTENT_TYPES).includes(source.knowledge_content_type), true);
  }
});
