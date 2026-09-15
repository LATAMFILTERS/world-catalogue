'use strict';

const FUNCTIONAL_FAMILIES = Object.freeze({
  AIR_FILTER: 'AIR_FILTER',
  CABIN_FILTER: 'CABIN_FILTER',
  AIR_DRYER: 'AIR_DRYER',
  AIR_INTAKE_HOUSING: 'AIR_INTAKE_HOUSING',
  FUEL_FILTER: 'FUEL_FILTER',
  FUEL_WATER_SEPARATOR: 'FUEL_WATER_SEPARATOR',
  TURBINE_FUEL_SEPARATOR: 'TURBINE_FUEL_SEPARATOR',
  COOLANT_FILTER: 'COOLANT_FILTER',
  LUBE_OIL_FILTER: 'LUBE_OIL_FILTER',
  HYDRAULIC_FILTER: 'HYDRAULIC_FILTER',
});

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

function has(text, pattern) {
  return pattern.test(text);
}

function functionalFamily(product = {}) {
  const sku = normalize(product.elimfilters_sku || product.sku).replace(/\s/g, '');
  const filterType = normalize(product.filter_type);
  const subType = normalize(product.filter_subtype || product.sub_type);
  const technology = normalize(product.technology);
  const description = normalize(product.description);
  const text = `${filterType} ${subType} ${technology} ${description}`.trim();

  // Specific separator intent wins before generic fuel classification.
  if (has(text, /\b(TURBINE|FH SERIES|FG SERIES)\b/) && has(text, /\b(SEPARATOR|HYDROCORE)\b/)) {
    return FUNCTIONAL_FAMILIES.TURBINE_FUEL_SEPARATOR;
  }
  if (has(technology, /\bHYDROCORE\b/) || has(text, /\b(FUEL WATER SEPARATOR|WATER SEPARATOR|FUEL\/WATER SEPARATOR|SEPARATOR)\b/)) {
    return FUNCTIONAL_FAMILIES.FUEL_WATER_SEPARATOR;
  }

  // Technology mappings are authoritative when the technology is function-specific.
  if (has(technology, /\bMACROCORE\b/)) return FUNCTIONAL_FAMILIES.AIR_FILTER;
  if (has(technology, /\bMICROKAPPA\b/)) return FUNCTIONAL_FAMILIES.CABIN_FILTER;
  if (has(technology, /\bDRYCORE\b/)) return FUNCTIONAL_FAMILIES.AIR_DRYER;
  if (has(technology, /\bINTEKCORE\b/)) return FUNCTIONAL_FAMILIES.AIR_INTAKE_HOUSING;
  if (has(technology, /\bSYNTAPORE\b/)) return FUNCTIONAL_FAMILIES.FUEL_FILTER;
  if (has(technology, /\bSYNTRAX\b/)) return FUNCTIONAL_FAMILIES.LUBE_OIL_FILTER;
  if (has(technology, /\bNANOFORCE\b/)) return FUNCTIONAL_FAMILIES.HYDRAULIC_FILTER;
  if (has(technology, /\bTHERMACORE\b/)) return FUNCTIONAL_FAMILIES.COOLANT_FILTER;

  // Semantic catalog fields outrank SKU prefixes.
  if (has(text, /\b(CABIN|POLLEN)\b/)) return FUNCTIONAL_FAMILIES.CABIN_FILTER;
  if (has(text, /\b(AIR DRYER|DESICCANT)\b/)) return FUNCTIONAL_FAMILIES.AIR_DRYER;
  if (has(text, /\b(AIR INTAKE HOUSING|AIR HOUSING|FILTER HOUSING|HOUSING)\b/)) return FUNCTIONAL_FAMILIES.AIR_INTAKE_HOUSING;
  if (has(text, /\b(HYDRAULIC|HYD)\b/)) return FUNCTIONAL_FAMILIES.HYDRAULIC_FILTER;
  if (has(text, /\b(COOLANT|COOLING|WATER FILTER)\b/)) return FUNCTIONAL_FAMILIES.COOLANT_FILTER;
  if (has(text, /\b(LUBE|LUBRICATION|OIL FILTER|ENGINE OIL)\b/)) return FUNCTIONAL_FAMILIES.LUBE_OIL_FILTER;
  if (has(text, /\b(FUEL FILTER|DIESEL FILTER|GASOLINE FILTER)\b/) || filterType === 'FUEL') {
    return FUNCTIONAL_FAMILIES.FUEL_FILTER;
  }
  if (has(text, /\b(AIR FILTER|AIR CLEANER|PRIMARY AIR|SECONDARY AIR|SAFETY AIR)\b/) || filterType === 'AIR') {
    return FUNCTIONAL_FAMILIES.AIR_FILTER;
  }

  // Prefixes are only a final fallback for established legacy families.
  if (/^ES[A-Z0-9]/.test(sku)) return FUNCTIONAL_FAMILIES.FUEL_WATER_SEPARATOR;
  if (/^EF[A-Z0-9]/.test(sku)) return FUNCTIONAL_FAMILIES.FUEL_FILTER;

  // Fail closed: unknown products must never become alternatives merely because
  // both sides lack classification data or share a secondary reference.
  return null;
}

function isSameFunctionalFamily(primary, alternative) {
  const primaryFamily = functionalFamily(primary);
  const alternativeFamily = functionalFamily(alternative);
  return Boolean(primaryFamily && alternativeFamily && primaryFamily === alternativeFamily);
}

function filterAlternativesByFunctionalFamily(primary, alternatives = []) {
  if (!Array.isArray(alternatives)) return [];
  return alternatives.filter(alternative => isSameFunctionalFamily(primary, alternative));
}

module.exports = {
  FUNCTIONAL_FAMILIES,
  functionalFamily,
  isSameFunctionalFamily,
  filterAlternativesByFunctionalFamily,
};
