'use strict';

const FRAM_LD_FAMILIES = Object.freeze({
  LUBE: 'LUBE',
  AIR: 'AIR',
  CABIN: 'CABIN',
  FUEL: 'FUEL'
});

const ALLOWED_FAMILIES = Object.freeze(Object.values(FRAM_LD_FAMILIES));

const MARKET_POLICY = Object.freeze({
  knowledge_domain: 'LIGHT_DUTY_KNOWLEDGE_DOMAIN',
  industry: 'Automotive',
  fram_role: 'NON_EUROPEAN_LD_REFERENCE',
  europe_promotion_allowed: false,
  europe_nomenclature_authority: 'MANN_FILTER',
  catalog_auto_update_allowed: false
});

function classifyFramLdFamily(value = '') {
  const s = String(value).toLowerCase();
  if (/cabin|fresh[-\s]?breeze|interior air/.test(s)) return FRAM_LD_FAMILIES.CABIN;
  if (/engine[-\s]?air|air filter|extra guard air/.test(s)) return FRAM_LD_FAMILIES.AIR;
  if (/oil|lube|lubrication|spin[-\s]?on oil|cartridge oil/.test(s)) return FRAM_LD_FAMILIES.LUBE;
  if (/fuel|diesel fuel|gasoline fuel/.test(s)) return FRAM_LD_FAMILIES.FUEL;
  return null;
}

function isAllowedFramLdFamily(family) {
  return ALLOWED_FAMILIES.includes(family);
}

function isEuropeMarket(value = '') {
  return /\b(europe|european|eu|uk|united kingdom|germany|france|italy|spain|belgium|netherlands|sweden|norway|denmark|finland|austria|switzerland|poland|czech|slovakia|hungary|romania|portugal|ireland)\b/i.test(String(value));
}

function classifyCrossReference({ manufacturer = null, part_number = null, source_market_scope = '' } = {}) {
  const maker = String(manufacturer || '').trim();
  const isMann = /\bmann(?:-filter)?\b/i.test(maker);
  if (isMann && !isEuropeMarket(source_market_scope)) {
    return {
      manufacturer: maker || 'MANN-FILTER',
      part_number,
      classification: 'Cross Reference Competitor',
      relation_type: 'competitor_cross_candidate',
      nomenclature_authority: false,
      application_authority: false,
      catalog_auto_write_allowed: false
    };
  }
  return {
    manufacturer: maker || null,
    part_number,
    classification: 'Cross Reference Competitor',
    relation_type: 'competitor_cross_candidate',
    nomenclature_authority: false,
    application_authority: false,
    catalog_auto_write_allowed: false
  };
}

const NON_EUROPEAN_OVERLAP_DECISIONS = Object.freeze({
  SECONDARY_APPLICATION_EVIDENCE: 'SECONDARY_APPLICATION_EVIDENCE',
  TECHNICAL_CONTRADICTION: 'TECHNICAL_CONTRADICTION',
  NO_PROVEN_APPLICATION_OVERLAP: 'NO_PROVEN_APPLICATION_OVERLAP',
  NOT_APPLICABLE: 'NOT_APPLICABLE'
});

const TECHNICAL_CONTRADICTION_REASONS = Object.freeze([
  'INCOMPATIBLE_DIMENSIONS',
  'INCOMPATIBLE_THREAD',
  'INCOMPATIBLE_GASKET',
  'INCOMPATIBLE_FILTER_TYPE',
  'REJECTED_RELATIONSHIP',
  'CONFLICTING_ELIMFILTERS_IDENTITY',
  'EXPLICIT_MANUFACTURER_CONTRADICTION'
]);

function classifyNonEuropeanApplicationOverlap({
  origin_group = '',
  canonical_brand = '',
  peer_manufacturer = '',
  overlap_proven = false,
  technical_conflict_reasons = []
} = {}) {
  const origin = String(origin_group || '').trim().toUpperCase();
  const canonical = String(canonical_brand || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const peer = String(peer_manufacturer || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (origin !== 'NON_EUROPEAN' || canonical !== 'FRAM' || !['MANN', 'MANNFILTER', 'MANNHUMMEL'].includes(peer)) {
    return {
      applies: false,
      decision: NON_EUROPEAN_OVERLAP_DECISIONS.NOT_APPLICABLE,
      hold_required: false,
      canonical_application_authority: canonical === 'FRAM',
      peer_application_authority: false,
      application_overlap: Boolean(overlap_proven),
      technical_contradiction: false,
      technical_conflict_reasons: []
    };
  }

  const reasons = [...new Set((Array.isArray(technical_conflict_reasons) ? technical_conflict_reasons : [])
    .map((reason) => String(reason || '').trim().toUpperCase())
    .filter(Boolean))];

  const invalidReasons = reasons.filter((reason) => !TECHNICAL_CONTRADICTION_REASONS.includes(reason));
  if (invalidReasons.length) {
    throw new Error(`UNSUPPORTED_TECHNICAL_CONTRADICTION_REASON:${invalidReasons.join(',')}`);
  }

  if (reasons.length) {
    return {
      applies: true,
      decision: NON_EUROPEAN_OVERLAP_DECISIONS.TECHNICAL_CONTRADICTION,
      hold_required: true,
      canonical_application_authority: true,
      peer_application_authority: false,
      application_overlap: Boolean(overlap_proven),
      technical_contradiction: true,
      technical_conflict_reasons: reasons
    };
  }

  if (overlap_proven) {
    return {
      applies: true,
      decision: NON_EUROPEAN_OVERLAP_DECISIONS.SECONDARY_APPLICATION_EVIDENCE,
      hold_required: false,
      canonical_application_authority: true,
      peer_application_authority: false,
      application_overlap: true,
      technical_contradiction: false,
      technical_conflict_reasons: []
    };
  }

  return {
    applies: true,
    decision: NON_EUROPEAN_OVERLAP_DECISIONS.NO_PROVEN_APPLICATION_OVERLAP,
    hold_required: false,
    canonical_application_authority: true,
    peer_application_authority: false,
    application_overlap: false,
    technical_contradiction: false,
    technical_conflict_reasons: []
  };
}

module.exports = {
  FRAM_LD_FAMILIES,
  ALLOWED_FAMILIES,
  MARKET_POLICY,
  classifyFramLdFamily,
  isAllowedFramLdFamily,
  isEuropeMarket,
  classifyCrossReference,
  NON_EUROPEAN_OVERLAP_DECISIONS,
  TECHNICAL_CONTRADICTION_REASONS,
  classifyNonEuropeanApplicationOverlap
};
