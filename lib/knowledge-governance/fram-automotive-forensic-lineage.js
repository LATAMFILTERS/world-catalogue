'use strict';

const crypto = require('node:crypto');
const { buildHermesCorpusSources } = require('./fram-automotive-source-corpus');

const FORENSIC_LINEAGE_VERSION = '1.0.0';
const SOURCE_REGISTRATION_COMMIT = '87cbc549002a215a6014eda0ae26c288529bbd10';
const HERMES_CLASSIFICATION_COMMIT = 'f3eb4526512cfcff8802ef58fb26c4c49b22b1ad';
const CANONICAL_PROMOTION_COMMIT = '6dba55e879d7526147e0d8420669a7e36e415e5a';

const PROMOTION_MAP = Object.freeze({
  'oil-filter-capacity-flow-rate-efficiency-and-micron-rating': ['LD-LUBE-PERFORMANCE-BALANCE'],
  'do-synthetic-oils-require-specialized-oil-filters': ['LD-LUBE-EXTENDED-SERVICE'],
  'the-role-of-the-oil-filter-bypass-valve-in-engine-protection': ['LD-LUBE-BYPASS-OPERATION'],
  'factors-that-affect-oil-filter-lifespan': ['LD-LUBE-CONTAMINANT-LOADING', 'LD-LUBE-EXTENDED-SERVICE'],
  'how-dirty-engine-oil-affects-your-car': ['LD-LUBE-CONTAMINANT-LOADING'],
  'cabin-air-filter-air-flow-direction': ['LD-CABIN-AIRFLOW-DIRECTION'],
  'what-happens-if-you-use-the-wrong-oil-filter': ['LD-LUBE-FITMENT-COMPATIBILITY'],
  'learn-all-about-cabin-air-filters': ['LD-CABIN-FUNDAMENTALS'],
  'oil-filter-is-stuck-and-wont-come-off': ['LD-LUBE-SERVICE-ACCESS'],
  'low-oil-pressure-causes-and-symptoms': ['LD-LUBE-LOW-PRESSURE-DIAGNOSIS'],
  'how-oil-filters-work': ['LD-LUBE-COMPONENT-ARCHITECTURE'],
  'how-to-increase-your-gas-mileage': ['LD-SHARED-TOTAL-VEHICLE-PROTECTION'],
  'how-to-tell-if-your-oil-filter-is-clogged': ['LD-LUBE-CONTAMINANT-LOADING', 'LD-LUBE-BYPASS-OPERATION'],
  'common-causes-of-oil-leaks-and-how-to-fix-them': ['LD-LUBE-SEAL-LEAKAGE'],
  'how-carbon-air-filters-work': ['LD-CABIN-CARBON-MEDIA'],
  'dirty-cabin-air-filter-symptoms': ['LD-CABIN-LOADING-SYMPTOMS'],
  'how-cold-weather-affects-engine-oil': ['LD-LUBE-COLD-START'],
  'how-often-to-change-engine-air-filter': ['LD-AIR-SERVICE-INTERVAL'],
  'signs-your-car-needs-an-oil-change': ['LD-LUBE-CONTAMINANT-LOADING'],
  'cartridge-vs-spin-on-oil-filters': ['LD-LUBE-COMPONENT-ARCHITECTURE'],
  'how-often-should-you-change-your-cabin-air-filter': ['LD-CABIN-SERVICE-INTERVAL'],
  'how-to-change-engine-air-filter': ['LD-AIR-REPLACEMENT-PROCEDURE'],
  'common-oil-filter-failures': ['LD-LUBE-BYPASS-OPERATION', 'LD-LUBE-SEAL-LEAKAGE', 'LD-LUBE-FITMENT-COMPATIBILITY'],
  'dirty-air-filter-symptoms': ['LD-AIR-RESTRICTION-SYMPTOMS'],
  '5-different-types-of-oil-filters': ['LD-LUBE-COMPONENT-ARCHITECTURE'],
  'synthetic-oil-vs-conventional-oil-all-questions-answered': ['LD-LUBE-EXTENDED-SERVICE'],
  'quick-guide-to-locating-the-oil-filter-in-different-vehicles': ['LD-LUBE-SERVICE-ACCESS'],
  'how-to-prepare-your-vehicle-for-fall-weather': ['LD-SHARED-SEASONAL-FILTRATION'],
  'how-to-choose-the-right-engine-oil-filter-for-your-car': ['LD-LUBE-FITMENT-COMPATIBILITY'],
  'the-different-types-of-engine-air-filters-and-how-they-work': ['LD-AIR-FILTER-ARCHITECTURE'],
  'how-often-should-you-change-your-oil-filter': ['LD-LUBE-CONTAMINANT-LOADING', 'LD-LUBE-EXTENDED-SERVICE'],
  'breathe-easy-during-heat-waves-cabin-air-filters-for-summer-months': ['LD-CABIN-SERVICE-INTERVAL', 'LD-SHARED-SEASONAL-FILTRATION'],
  'engine-performance-in-the-summer-heat-optimal-oil-filter-selection': ['LD-LUBE-EXTENDED-SERVICE', 'LD-SHARED-SEASONAL-FILTRATION'],
  'preparing-your-vehicle-for-winter': ['LD-LUBE-COLD-START', 'LD-SHARED-SEASONAL-FILTRATION'],
  'making-engine-filtration-improvements': ['LD-AIR-FILTER-ARCHITECTURE', 'LD-AIR-SERVICE-INTERVAL'],
  'filtration-for-total-vehicle-protection': ['LD-SHARED-TOTAL-VEHICLE-PROTECTION']
});

function sourceSlug(url = '') {
  try {
    return new URL(url).pathname.split('/').filter(Boolean).pop().toLowerCase();
  } catch (_) {
    return String(url || '').toLowerCase();
  }
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

function buildForensicLineageLedger() {
  return buildHermesCorpusSources().map((source) => {
    const slug = sourceSlug(source.url);
    const ordinal = source.id.replace('fram_ld_', '');
    const canonicalIds = PROMOTION_MAP[slug] || [];

    return Object.freeze({
      lineage_version: FORENSIC_LINEAGE_VERSION,
      lineage_status: 'locked',
      lineage_origin: 'forensic_backfill_from_governed_commits',
      source_id: source.id,
      source_url: source.url,
      source_identity_sha256: sha256(source.url),
      source_content_sha256: null,
      source_content_hash_status: 'historical_snapshot_not_captured',
      evidence_id: `EVID-FRAM-LD-${ordinal}`,
      evidence_record_origin: 'forensic_backfill',
      candidate_id: `KCAND-FRAM-LD-${ordinal}`,
      candidate_record_origin: 'forensic_backfill',
      knowledge_domain: source.knowledge_domain,
      industry: source.industry,
      knowledge_systems: source.knowledge_systems,
      technology_candidates: source.technology_candidates,
      knowledge_content_type: source.knowledge_content_type,
      canonical_ids: Object.freeze([...canonicalIds]),
      disposition: canonicalIds.length ? 'promoted_to_canonical' : 'support_only_not_promoted',
      source_registration_commit: SOURCE_REGISTRATION_COMMIT,
      hermes_classification_commit: HERMES_CLASSIFICATION_COMMIT,
      canonical_promotion_commit: canonicalIds.length ? CANONICAL_PROMOTION_COMMIT : null,
      public_brand_reference: false,
      public_provenance_allowed: false
    });
  });
}

module.exports = {
  FORENSIC_LINEAGE_VERSION,
  SOURCE_REGISTRATION_COMMIT,
  HERMES_CLASSIFICATION_COMMIT,
  CANONICAL_PROMOTION_COMMIT,
  PROMOTION_MAP,
  buildForensicLineageLedger
};
