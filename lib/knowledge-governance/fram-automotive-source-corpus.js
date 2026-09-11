'use strict';

const SOURCE = Object.freeze({
  publisher: 'FRAM',
  domain: 'fram.com',
  source_type: 'external_industry_evidence',
  knowledge_domain: 'LIGHT_DUTY_KNOWLEDGE_DOMAIN',
  industry: 'Automotive',
  public_brand_reference: false,
  catalog_auto_update: false,
  knowledge_candidate: true
});

const URLS = Object.freeze([
  'https://www.fram.com/vehicle-maintenance-center/post/oil-filter-capacity-flow-rate-efficiency-and-micron-rating',
  'https://www.fram.com/vehicle-maintenance-center/post/do-synthetic-oils-require-specialized-oil-filters',
  'https://www.fram.com/vehicle-maintenance-center/post/the-role-of-the-oil-filter-bypass-valve-in-engine-protection',
  'https://www.fram.com/vehicle-maintenance-center/post/factors-that-affect-oil-filter-lifespan',
  'https://www.fram.com/vehicle-maintenance-center/post/how-dirty-engine-oil-affects-your-car',
  'https://www.fram.com/vehicle-maintenance-center/post/cabin-air-filter-air-flow-direction',
  'https://www.fram.com/vehicle-maintenance-center/post/what-happens-if-you-use-the-wrong-oil-filter',
  'https://www.fram.com/vehicle-maintenance-center/post/learn-all-about-cabin-air-filters',
  'https://www.fram.com/vehicle-maintenance-center/post/oil-filter-is-stuck-and-wont-come-off',
  'https://www.fram.com/vehicle-maintenance-center/post/low-oil-pressure-causes-and-symptoms',
  'https://www.fram.com/vehicle-maintenance-center/post/how-oil-filters-work',
  'https://www.fram.com/vehicle-maintenance-center/post/how-to-increase-your-gas-mileage',
  'https://www.fram.com/vehicle-maintenance-center/post/how-to-tell-if-your-oil-filter-is-clogged',
  'https://www.fram.com/vehicle-maintenance-center/post/common-causes-of-oil-leaks-and-how-to-fix-them',
  'https://www.fram.com/vehicle-maintenance-center/post/how-carbon-air-filters-work',
  'https://www.fram.com/vehicle-maintenance-center/post/dirty-cabin-air-filter-symptoms',
  'https://www.fram.com/vehicle-maintenance-center/post/how-cold-weather-affects-engine-oil',
  'https://www.fram.com/vehicle-maintenance-center/post/how-often-to-change-engine-air-filter',
  'https://www.fram.com/vehicle-maintenance-center/post/signs-your-car-needs-an-oil-change',
  'https://www.fram.com/vehicle-maintenance-center/post/cartridge-vs-spin-on-oil-filters',
  'https://www.fram.com/vehicle-maintenance-center/post/how-often-should-you-change-your-cabin-air-filter',
  'https://www.fram.com/vehicle-maintenance-center/post/how-to-change-engine-air-filter',
  'https://www.fram.com/vehicle-maintenance-center/post/common-oil-filter-failures',
  'https://www.fram.com/vehicle-maintenance-center/post/dirty-air-filter-symptoms',
  'https://www.fram.com/vehicle-maintenance-center/post/5-different-types-of-oil-filters',
  'https://www.fram.com/vehicle-maintenance-center/post/synthetic-oil-vs-conventional-oil-all-questions-answered',
  'https://www.fram.com/vehicle-maintenance-center/post/quick-guide-to-locating-the-oil-filter-in-different-vehicles',
  'https://www.fram.com/vehicle-maintenance-center/post/how-to-prepare-your-vehicle-for-fall-weather',
  'https://www.fram.com/vehicle-maintenance-center/post/how-to-choose-the-right-engine-oil-filter-for-your-car',
  'https://www.fram.com/vehicle-maintenance-center/post/the-different-types-of-engine-air-filters-and-how-they-work',
  'https://www.fram.com/vehicle-maintenance-center/post/how-often-should-you-change-your-oil-filter',
  'https://www.fram.com/vehicle-maintenance-center/post/breathe-easy-during-heat-waves-cabin-air-filters-for-summer-months',
  'https://www.fram.com/vehicle-maintenance-center/post/Engine-Performance-in-the-Summer-Heat-Optimal-Oil-Filter-Selection',
  'https://www.fram.com/vehicle-maintenance-center/post/preparing-your-vehicle-for-winter',
  'https://www.fram.com/vehicle-maintenance-center/post/making-engine-filtration-improvements',
  'https://www.fram.com/vehicle-maintenance-center/post/filtration-for-total-vehicle-protection'
]);

const TOPIC_MAP = Object.freeze({
  lubrication: Object.freeze([
    'SYNTRAX™', 'oil filter', 'engine oil', 'bypass', 'restriction', 'pressure',
    'service life', 'synthetic oil', 'contamination', 'spin-on', 'cartridge'
  ]),
  engine_air_intake: Object.freeze([
    'MACROCORE™', 'engine air filter', 'airflow', 'restriction', 'dust loading', 'service interval'
  ]),
  cabin_air: Object.freeze([
    'MICROKAPPA™', 'cabin air filter', 'airflow direction', 'activated carbon', 'HVAC', 'particulate loading'
  ]),
  shared_engineering: Object.freeze([
    'efficiency', 'micron rating', 'flow rate', 'capacity', 'differential pressure',
    'service interval', 'installation', 'failure analysis', 'operating conditions'
  ])
});

const SYSTEMS = Object.freeze({
  LUBE: 'Lube/Oil Protection Systems',
  AIR: 'Air Intake & Airflow Protection Systems',
  CABIN: 'Air Intake & Airflow Protection Systems'
});

const KNOWLEDGE_CONTENT_TYPES = Object.freeze({
  ENGINEERING_REFERENCE: 'Engineering Reference',
  FAILURE_ANALYSIS_GUIDE: 'Failure Analysis Guide',
  INSTALLATION_PROCEDURE: 'Installation Procedure',
  APPLICATION_NOTE: 'Application Note',
  SERVICE_REFERENCE: 'Service Reference'
});

function canonicalizeSourceUrl(url = '') {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = '';
    parsed.search = '';
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/$/, '');
    return parsed.toString();
  } catch (_) {
    return String(url || '').trim();
  }
}

function getUniqueCorpusUrls() {
  return [...new Set(URLS.map(canonicalizeSourceUrl))];
}

function sourceSlug(url) {
  try {
    return new URL(url).pathname.split('/').filter(Boolean).pop().toLowerCase();
  } catch (_) {
    return String(url || '').toLowerCase();
  }
}

function classifyAutomotiveSource(url) {
  const slug = sourceSlug(url);

  if (slug.includes('cabin') || slug.includes('carbon-air-filter')) {
    return {
      knowledge_systems: [SYSTEMS.CABIN],
      technology_candidates: ['MICROKAPPA™'],
      knowledge_topics: TOPIC_MAP.cabin_air
    };
  }

  if (slug.includes('engine-air-filter') || slug.includes('dirty-air-filter')) {
    return {
      knowledge_systems: [SYSTEMS.AIR],
      technology_candidates: ['MACROCORE™'],
      knowledge_topics: TOPIC_MAP.engine_air_intake
    };
  }

  if (slug.includes('oil') || slug.includes('bypass')) {
    return {
      knowledge_systems: [SYSTEMS.LUBE],
      technology_candidates: ['SYNTRAX™'],
      knowledge_topics: TOPIC_MAP.lubrication
    };
  }

  return {
    knowledge_systems: [],
    technology_candidates: [],
    knowledge_topics: TOPIC_MAP.shared_engineering
  };
}

function classifyKnowledgeContentType(url) {
  const slug = sourceSlug(url);

  if (
    slug.includes('failures') || slug.includes('symptoms') || slug.includes('clogged') ||
    slug.includes('low-oil-pressure') || slug.includes('oil-leaks') || slug.includes('stuck') ||
    slug.includes('dirty-engine-oil') || slug.includes('wrong-oil-filter')
  ) return KNOWLEDGE_CONTENT_TYPES.FAILURE_ANALYSIS_GUIDE;

  if (
    slug.includes('how-to-change') || slug.includes('air-flow-direction') ||
    slug.includes('locating-the-oil-filter')
  ) return KNOWLEDGE_CONTENT_TYPES.INSTALLATION_PROCEDURE;

  if (
    slug.includes('how-often') || slug.includes('lifespan') || slug.includes('prepare-your-vehicle') ||
    slug.includes('preparing-your-vehicle') || slug.includes('summer-heat') || slug.includes('heat-waves')
  ) return KNOWLEDGE_CONTENT_TYPES.SERVICE_REFERENCE;

  if (
    slug.includes('choose-the-right') || slug.includes('synthetic-oil') ||
    slug.includes('gas-mileage') || slug.includes('filtration-for-total-vehicle-protection')
  ) return KNOWLEDGE_CONTENT_TYPES.APPLICATION_NOTE;

  return KNOWLEDGE_CONTENT_TYPES.ENGINEERING_REFERENCE;
}

function buildHermesCorpusSources() {
  return getUniqueCorpusUrls().map((url, index) => {
    const classification = classifyAutomotiveSource(url);
    return {
      id: `fram_ld_${String(index + 1).padStart(2, '0')}`,
      name: 'FRAM Group',
      organization_id: 'fram_group',
      category: 'technical_publication',
      url,
      source_type: 'html',
      enabled: true,
      official: true,
      trust_level: 'medium',
      region: 'North America',
      knowledge_domain: SOURCE.knowledge_domain,
      industry: SOURCE.industry,
      knowledge_content_type: classifyKnowledgeContentType(url),
      public_brand_reference: SOURCE.public_brand_reference,
      catalog_auto_update: SOURCE.catalog_auto_update,
      technology_relation: 'probable',
      application_relation: 'candidate',
      ...classification
    };
  });
}

module.exports = {
  SOURCE,
  URLS,
  TOPIC_MAP,
  SYSTEMS,
  KNOWLEDGE_CONTENT_TYPES,
  canonicalizeSourceUrl,
  getUniqueCorpusUrls,
  classifyAutomotiveSource,
  classifyKnowledgeContentType,
  buildHermesCorpusSources
};
