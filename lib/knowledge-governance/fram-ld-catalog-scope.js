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

module.exports = {
  FRAM_LD_FAMILIES,
  ALLOWED_FAMILIES,
  MARKET_POLICY,
  classifyFramLdFamily,
  isAllowedFramLdFamily,
  isEuropeMarket,
  classifyCrossReference
};
