'use strict';

const {
  applyReferenceResponsePolicy,
  identifyReferenceSource,
  selectApplications,
  filterTypeLabel,
  normalizeReference
} = require('./bot-protocol-reference-response-policy');

const OEM_PRIORITY = [
  'Caterpillar', 'Cummins', 'Volvo', 'John Deere', 'Mack', 'Detroit Diesel',
  'Mercedes-Benz', 'Scania', 'Hino', 'Isuzu', 'Toyota', 'Komatsu', 'Hitachi',
  'CASE', 'New Holland', 'AGCO', 'Kenworth', 'Peterbilt', 'Freightliner', 'International'
];

const AFTERMARKET_PRIORITY = [
  'Fleetguard', 'Donaldson', 'Baldwin', 'WIX', 'MANN-FILTER', 'MANN', 'MAHLE', 'Bosch', 'FRAM'
];

const BRAND_ALIASES = new Map([
  ['CAT', 'Caterpillar'],
  ['CATERPILLAR', 'Caterpillar'],
  ['CUMMINS', 'Cummins'],
  ['VOLVO', 'Volvo'],
  ['JOHNDEERE', 'John Deere'],
  ['JOHN DEERE', 'John Deere'],
  ['MACK', 'Mack'],
  ['DETROIT', 'Detroit Diesel'],
  ['DETROITDIESEL', 'Detroit Diesel'],
  ['MERCEDESBENZ', 'Mercedes-Benz'],
  ['SCANIA', 'Scania'],
  ['HINO', 'Hino'],
  ['ISUZU', 'Isuzu'],
  ['TOYOTA', 'Toyota'],
  ['KOMATSU', 'Komatsu'],
  ['HITACHI', 'Hitachi'],
  ['CASE', 'CASE'],
  ['NEWHOLLAND', 'New Holland'],
  ['AGCO', 'AGCO'],
  ['KENWORTH', 'Kenworth'],
  ['PETERBILT', 'Peterbilt'],
  ['FREIGHTLINER', 'Freightliner'],
  ['INTERNATIONAL', 'International'],
  ['FLEETGUARD', 'Fleetguard'],
  ['DONALDSON', 'Donaldson'],
  ['BALDWIN', 'Baldwin'],
  ['WIX', 'WIX'],
  ['MANN', 'MANN'],
  ['MANNFILTER', 'MANN-FILTER'],
  ['MAHLE', 'MAHLE'],
  ['BOSCH', 'Bosch'],
  ['FRAM', 'FRAM']
]);

function clean(value, max = 260) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function canonicalBrand(value) {
  const raw = clean(value, 80);
  if (!raw) return null;
  const key = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  return BRAND_ALIASES.get(key) || raw;
}

function codeFromEntry(entry) {
  if (entry == null) return null;
  if (typeof entry === 'string' || typeof entry === 'number') {
    const text = String(entry).trim();
    const pipe = text.indexOf('|');
    return pipe >= 0 ? text.slice(pipe + 1).trim() : text;
  }
  if (typeof entry !== 'object') return null;
  for (const key of ['code', 'reference', 'part_number', 'partNumber', 'partno', 'oem_code', 'oemCode', 'cross_reference', 'crossReference']) {
    if (entry[key] != null) return String(entry[key]).trim();
  }
  return null;
}

function manufacturerFromEntry(entry, fallback = null) {
  if (entry && typeof entry === 'object') {
    for (const key of ['manufacturer', 'brand', 'make', 'source_brand', 'sourceBrand', 'mfr']) {
      if (entry[key]) return canonicalBrand(entry[key]);
    }
  }
  return canonicalBrand(fallback);
}

function flattenReferences(value, fallbackBrand = null, out = []) {
  if (value == null) return out;
  if (Array.isArray(value)) {
    for (const item of value) flattenReferences(item, fallbackBrand, out);
    return out;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const code = codeFromEntry(value);
    if (code) out.push({ manufacturer: canonicalBrand(fallbackBrand), code });
    return out;
  }
  if (typeof value !== 'object') return out;

  const directCode = codeFromEntry(value);
  if (directCode) {
    out.push({ manufacturer: manufacturerFromEntry(value, fallbackBrand), code: directCode });
    return out;
  }

  for (const [key, item] of Object.entries(value)) {
    flattenReferences(item, canonicalBrand(key) || fallbackBrand, out);
  }
  return out;
}

function uniqueReferenceRows(rows) {
  const seen = new Set();
  const out = [];
  for (const row of rows) {
    const manufacturer = canonicalBrand(row.manufacturer);
    const code = clean(row.code, 80);
    if (!manufacturer || !code) continue;
    const key = `${manufacturer.toUpperCase()}|${normalizeReference(code)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ manufacturer, code });
  }
  return out;
}

function priorityIndex(brand, list) {
  const index = list.findIndex(item => item.toUpperCase() === String(brand || '').toUpperCase());
  return index >= 0 ? index : 999;
}

function selectEquivalentReferences(product = {}, referenceSource = {}, max = 3) {
  const searched = normalizeReference(referenceSource.code || '');
  const sourceBrand = String(referenceSource.brand || '').toUpperCase();

  const rows = uniqueReferenceRows([
    ...flattenReferences(product.oem_codes),
    ...flattenReferences(product.competitor_codes),
    ...flattenReferences(product.brand_crossrefs)
  ]).filter(row => {
    const sameCode = normalizeReference(row.code) === searched;
    const sameBrand = String(row.manufacturer || '').toUpperCase() === sourceBrand;
    return !(sameCode && sameBrand);
  });

  const oemRows = rows
    .filter(row => OEM_PRIORITY.some(brand => brand.toUpperCase() === String(row.manufacturer).toUpperCase()))
    .sort((a, b) => priorityIndex(a.manufacturer, OEM_PRIORITY) - priorityIndex(b.manufacturer, OEM_PRIORITY));

  const aftermarketRows = rows
    .filter(row => AFTERMARKET_PRIORITY.some(brand => brand.toUpperCase() === String(row.manufacturer).toUpperCase()))
    .sort((a, b) => priorityIndex(a.manufacturer, AFTERMARKET_PRIORITY) - priorityIndex(b.manufacturer, AFTERMARKET_PRIORITY));

  const selected = [];
  const manufacturers = new Set();
  for (const row of [...oemRows, ...aftermarketRows, ...rows]) {
    if (selected.length >= max) break;
    const manufacturerKey = String(row.manufacturer).toUpperCase();
    if (manufacturers.has(manufacturerKey)) continue;
    selected.push(row);
    manufacturers.add(manufacturerKey);
  }
  return selected;
}

function technicalDescription(product = {}, language = 'es') {
  const raw = clean(product.description || product.name, 300);
  if (raw) {
    return raw
      .replace(/^ELIMFILTERS®?\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const type = filterTypeLabel(product.filter_type, language);
  return language === 'en'
    ? `${type} validated in the ELIMFILTERS catalog.`
    : `${type} validado en el catálogo ELIMFILTERS.`;
}

function technicalAnswer(product, referenceSource, applications, equivalents, language = 'es') {
  const sku = clean(product.sku, 40);
  const type = filterTypeLabel(product.filter_type, language);
  const description = technicalDescription(product, language);
  const sourceLabel = referenceSource.brand
    ? `${referenceSource.brand} ${referenceSource.code || ''}`.trim()
    : (language === 'en' ? `external reference ${referenceSource.code || ''}` : `referencia externa ${referenceSource.code || ''}`);

  if (language === 'en') {
    const lines = [
      `Validated reference: ${sourceLabel}.`,
      `ELIMFILTERS SKU: ${sku}.`,
      `Filter type: ${type}.`,
      `Technical description: ${description}`
    ];
    if (applications.length) lines.push(`Primary validated applications: ${applications.join('; ')}.`);
    if (equivalents.length) lines.push(`Primary cross-references: ${equivalents.map(item => `${item.manufacturer} ${item.code}`).join('; ')}.`);
    return lines.join('\n');
  }

  const lines = [
    `Referencia validada: ${sourceLabel}.`,
    `SKU ELIMFILTERS: ${sku}.`,
    `Tipo de filtro: ${type}.`,
    `Descripción técnica: ${description}`
  ];
  if (applications.length) lines.push(`Aplicaciones principales validadas: ${applications.join('; ')}.`);
  if (equivalents.length) lines.push(`Cross-references principales: ${equivalents.map(item => `${item.manufacturer} ${item.code}`).join('; ')}.`);
  return lines.join('\n');
}

function languageOf(requestBody = {}) {
  return String(requestBody.language || requestBody.lang || requestBody?.context?.language || 'es').toLowerCase() === 'en' ? 'en' : 'es';
}

function applyTechnicalProductPresentation(payload = {}, requestBody = {}) {
  const governed = applyReferenceResponsePolicy(payload, requestBody);
  if (governed?.governance?.reference_response_policy !== 'validated_deterministic') return governed;

  const products = Array.isArray(governed?.evidence?.products) ? governed.evidence.products : [];
  if (products.length !== 1) return governed;

  const product = products[0];
  const reference = governed?.evidence?.references?.[0] || product.protocol_resolved_reference || product.sku;
  const referenceSource = product.protocol_source_brand
    ? {
        brand: canonicalBrand(product.protocol_source_brand),
        code: product.protocol_resolved_reference || reference,
        source: product.protocol_source_brand === 'ELIMFILTERS' ? 'internal' : 'resolver'
      }
    : identifyReferenceSource(product, reference);

  const applications = selectApplications(product.equipment_applications, 3);
  const equivalents = selectEquivalentReferences(product, referenceSource, 3);
  const language = languageOf(requestBody);

  return {
    ...governed,
    answer: technicalAnswer(product, referenceSource, applications, equivalents, language),
    governance: {
      ...(governed.governance || {}),
      reference_response_policy: 'validated_technical_deterministic',
      applications_published: applications.length,
      equivalent_references_published: equivalents.length,
      technical_description_source: product.description ? 'catalog_description' : (product.name ? 'catalog_name' : 'filter_type')
    }
  };
}

module.exports = {
  applyTechnicalProductPresentation,
  selectEquivalentReferences,
  technicalDescription,
  technicalAnswer
};
