'use strict';

function normalize(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

function functionalFamily(product = {}) {
  const sku = normalize(product.elimfilters_sku || product.sku).replace(/\s/g, '');
  const filterType = normalize(product.filter_type);
  const subType = normalize(product.filter_subtype || product.sub_type);
  const technology = normalize(product.technology);
  const description = normalize(product.description);
  const text = `${filterType} ${subType} ${technology} ${description}`;

  // Product-family prefixes are authoritative when present. They prevent a
  // generic fuel record from being treated as a separator merely because it
  // shares a secondary reference with one.
  if (/^ES[A-Z0-9]/.test(sku)) return 'FUEL_WATER_SEPARATOR';
  if (/^EF[A-Z0-9]/.test(sku)) return 'FUEL_FILTER';

  if (/\bHYDROCORE\b/.test(technology) || /\b(WATER SEPARATOR|FUEL WATER SEPARATOR|SEPARATOR)\b/.test(text)) {
    return 'FUEL_WATER_SEPARATOR';
  }

  if (/\bFUEL\b/.test(filterType) || /\b(SYNTAPORE|SYNTRAX)\b/.test(technology)) {
    return 'FUEL_FILTER';
  }

  const duty = normalize(product.duty) || 'UNSPECIFIED';
  return `${duty}:${filterType || subType || technology || 'UNKNOWN'}`;
}

function isSameFunctionalFamily(primary, alternative) {
  return functionalFamily(primary) === functionalFamily(alternative);
}

module.exports = { functionalFamily, isSameFunctionalFamily };
