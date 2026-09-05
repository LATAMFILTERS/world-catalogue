'use strict';

const CATALOG_INTENTS = new Set([
  'exact_reference_lookup',
  'cross_reference_lookup',
  'specification_lookup'
]);

const BRAND_CANONICAL = new Map([
  ['DONALDSON', 'Donaldson'],
  ['FLEETGUARD', 'Fleetguard'],
  ['WIX', 'WIX'],
  ['BALDWIN', 'Baldwin'],
  ['MANN', 'MANN'],
  ['MANNFILTER', 'MANN-FILTER'],
  ['MAHLE', 'MAHLE'],
  ['BOSCH', 'Bosch'],
  ['FRAM', 'FRAM'],
  ['CATERPILLAR', 'Caterpillar'],
  ['CAT', 'Caterpillar'],
  ['CUMMINS', 'Cummins'],
  ['JOHNDEERE', 'John Deere'],
  ['VOLVO', 'Volvo'],
  ['MACK', 'Mack'],
  ['DETROIT', 'Detroit Diesel'],
  ['HINO', 'Hino'],
  ['ISUZU', 'Isuzu'],
  ['TOYOTA', 'Toyota'],
  ['KOMATSU', 'Komatsu'],
  ['HITACHI', 'Hitachi'],
  ['CASE', 'CASE'],
  ['NEWHOLLAND', 'New Holland'],
  ['SCANIA', 'Scania'],
  ['MERCEDESBENZ', 'Mercedes-Benz'],
  ['KENWORTH', 'Kenworth'],
  ['PETERBILT', 'Peterbilt'],
  ['FREIGHTLINER', 'Freightliner'],
  ['INTERNATIONAL', 'International']
]);

function normalizeReference(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function clean(value, max = 180) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function canonicalBrand(value) {
  const raw = clean(value, 80);
  if (!raw) return null;
  const key = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  return BRAND_CANONICAL.get(key) || raw;
}

function messageReference(requestBody = {}, evidence = {}) {
  const message = String(requestBody.message || '');
  const candidates = message.match(/\b[A-Z0-9][A-Z0-9._/-]{3,}\b/gi) || [];
  const target = normalizeReference(Array.isArray(evidence.references) ? evidence.references[0] : '');
  if (target) {
    const exact = candidates.find(value => normalizeReference(value) === target);
    if (exact) return exact.toUpperCase();
  }
  const preferred = candidates.find(value => /\d/.test(value));
  return String(preferred || candidates[0] || evidence.references?.[0] || '').trim().toUpperCase();
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
    if (entry[key] != null) return String(entry[key]);
  }
  return null;
}

function brandFromEntry(entry, fallback = null) {
  if (!entry || typeof entry !== 'object') return canonicalBrand(fallback);
  for (const key of ['manufacturer', 'brand', 'make', 'source_brand', 'sourceBrand', 'mfr']) {
    if (entry[key]) return canonicalBrand(entry[key]);
  }
  return canonicalBrand(fallback);
}

function findMatchInCollection(value, target, fallbackBrand = null) {
  if (value == null) return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findMatchInCollection(item, target, fallbackBrand);
      if (match) return match;
    }
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return normalizeReference(codeFromEntry(value)) === target
      ? { code: String(codeFromEntry(value)), brand: canonicalBrand(fallbackBrand) }
      : null;
  }
  if (typeof value !== 'object') return null;

  const directCode = codeFromEntry(value);
  if (directCode && normalizeReference(directCode) === target) {
    return { code: String(directCode), brand: brandFromEntry(value, fallbackBrand) };
  }

  for (const [key, item] of Object.entries(value)) {
    const keyAsBrand = canonicalBrand(key);
    const match = findMatchInCollection(item, target, keyAsBrand || fallbackBrand);
    if (match) return match;
  }
  return null;
}

function identifyReferenceSource(product = {}, reference) {
  const target = normalizeReference(reference);
  if (!target) return { brand: null, code: reference || null, source: 'unknown' };

  if (normalizeReference(product.sku) === target || normalizeReference(product.codigo_base) === target) {
    return { brand: 'ELIMFILTERS', code: reference, source: 'internal' };
  }

  const collections = [
    ['competitor_codes', product.competitor_codes],
    ['brand_crossrefs', product.brand_crossrefs],
    ['oem_codes', product.oem_codes]
  ];
  for (const [source, value] of collections) {
    const match = findMatchInCollection(value, target);
    if (match) return { brand: match.brand, code: match.code || reference, source };
  }
  return { brand: null, code: reference || null, source: 'unknown' };
}

function filterTypeLabel(filterType, language = 'es') {
  const type = String(filterType || '').toLowerCase();
  const es = [
    [/cabin/, 'Filtro de cabina'],
    [/hydraulic|hidr[aá]ul/, 'Filtro hidráulico'],
    [/fuel|diesel|combustible/, 'Filtro de combustible'],
    [/oil|lube|lubric|aceite/, 'Filtro de lubricación'],
    [/coolant|refrigerante/, 'Filtro de refrigerante'],
    [/dryer|secador/, 'Filtro secador de aire'],
    [/air.*housing|housing.*air/, 'Carcasa de admisión de aire'],
    [/housing/, 'Carcasa de filtración'],
    [/air|intake|admisi[oó]n/, 'Filtro de aire']
  ];
  const en = [
    [/cabin/, 'Cabin air filter'],
    [/hydraulic/, 'Hydraulic filter'],
    [/fuel|diesel/, 'Fuel filter'],
    [/oil|lube|lubric/, 'Lube filter'],
    [/coolant/, 'Coolant filter'],
    [/dryer/, 'Air dryer filter'],
    [/air.*housing|housing.*air/, 'Air intake housing'],
    [/housing/, 'Filter housing'],
    [/air|intake/, 'Air filter']
  ];
  for (const [pattern, label] of language === 'en' ? en : es) if (pattern.test(type)) return label;
  return clean(filterType, 80) || (language === 'en' ? 'Filter' : 'Filtro');
}

function applicationLabel(item) {
  if (!item) return null;
  if (typeof item === 'string' || typeof item === 'number') return clean(item, 110) || null;
  if (typeof item !== 'object') return null;

  for (const key of ['application', 'equipment', 'fitment', 'description', 'label', 'name', 'value']) {
    if (typeof item[key] === 'string' && clean(item[key], 110)) return clean(item[key], 110);
  }

  const brand = clean(item.manufacturer || item.make || item.brand || item.equipment_make || item.vehicle_make, 45);
  const model = clean(item.model || item.equipment_model || item.vehicle_model || item.series, 55);
  const engine = clean(item.engine || item.engine_model || item.motor, 55);
  const years = clean(item.year || item.years || item.year_range || '', 25);
  const parts = [brand, model, engine ? `motor ${engine}` : null, years].filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}

function applicationBrand(label) {
  const upper = String(label || '').toUpperCase();
  for (const brand of BRAND_CANONICAL.values()) {
    if (upper.includes(String(brand).toUpperCase())) return brand;
  }
  return upper.split(/\s+/)[0] || '';
}

function selectApplications(applications, max = 3) {
  if (!Array.isArray(applications)) return [];
  const candidates = [];
  const seen = new Set();
  for (const item of applications) {
    const label = applicationLabel(item);
    if (!label) continue;
    const key = label.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const score = (/\d/.test(label) ? 4 : 0) + (/motor|engine/i.test(label) ? 3 : 0) + (label.split(/\s+/).length >= 2 ? 2 : 0);
    candidates.push({ label, score, brand: applicationBrand(label) });
  }
  candidates.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));

  const selected = [];
  const brands = new Set();
  for (const candidate of candidates) {
    if (selected.length >= max) break;
    if (!brands.has(candidate.brand)) {
      selected.push(candidate.label);
      brands.add(candidate.brand);
    }
  }
  for (const candidate of candidates) {
    if (selected.length >= max) break;
    if (!selected.includes(candidate.label)) selected.push(candidate.label);
  }
  return selected;
}

function uniqueProductsBySku(products = []) {
  const out = [];
  const seen = new Set();
  for (const product of products) {
    const key = normalizeReference(product?.sku || product?.codigo_base || product?.id);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(product);
  }
  return out;
}

function languageOf(requestBody = {}) {
  return String(requestBody.language || requestBody.lang || requestBody?.context?.language || 'es').toLowerCase() === 'en' ? 'en' : 'es';
}

function notFoundAnswer(reference, language) {
  if (language === 'en') {
    return `I could not find a verified match for ${reference || 'that reference'} in the ELIMFILTERS catalog. The reference may not currently be registered in our database or it may have been entered differently. Please verify the code printed on the filter. I will not provide an ELIMFILTERS cross-reference without validation.`;
  }
  return `No encontré una coincidencia verificada para ${reference || 'esa referencia'} en el catálogo ELIMFILTERS. La referencia puede no estar registrada actualmente en nuestra base de datos o puede haber sido ingresada de forma diferente. Verifica el código impreso en el filtro. No proporcionaré una equivalencia ELIMFILTERS sin validación.`;
}

function ambiguousAnswer(reference, language) {
  return language === 'en'
    ? `I found more than one possible catalog match for ${reference || 'that reference'} and cannot select one safely. Please confirm the brand printed on the filter or provide a clear photo of the reference.`
    : `Encontré más de una coincidencia posible para ${reference || 'esa referencia'} y no puedo seleccionar una de forma segura. Confirma la marca impresa en el filtro o envía una foto clara de la referencia.`;
}

function unavailableAnswer(reference, language) {
  return language === 'en'
    ? `I cannot verify ${reference || 'that reference'} in the ELIMFILTERS catalog right now. I will not provide a cross-reference without a successful database validation. Please try again shortly.`
    : `En este momento no puedo verificar ${reference || 'esa referencia'} en el catálogo ELIMFILTERS. No proporcionaré una equivalencia sin una validación correcta de la base de datos. Inténtalo nuevamente en unos minutos.`;
}

function verifiedAnswer(product, referenceSource, applications, language) {
  const reference = referenceSource.code || '';
  const sourceLabel = referenceSource.brand
    ? `${referenceSource.brand} ${reference}`.trim()
    : (language === 'en' ? `external reference ${reference}` : `referencia externa ${reference}`);
  const type = filterTypeLabel(product.filter_type, language);
  const sku = clean(product.sku, 40);

  if (referenceSource.brand === 'ELIMFILTERS') {
    const lines = language === 'en'
      ? [`ELIMFILTERS reference ${reference} is confirmed in the catalog.`, '', `${sku} — ${type}.`]
      : [`La referencia ELIMFILTERS ${reference} está confirmada en el catálogo.`, '', `${sku} — ${type}.`];
    if (applications.length) lines.push('', `${language === 'en' ? 'Registered applications' : 'Aplicaciones registradas'}: ${applications.join('; ')}.`);
    return lines.join('\n');
  }

  const lines = language === 'en'
    ? [`The ${sourceLabel} reference has a validated ELIMFILTERS cross-reference:`, '', `ELIMFILTERS ${sku} — ${type}.`]
    : [`La referencia ${sourceLabel} tiene una equivalencia validada en ELIMFILTERS:`, '', `ELIMFILTERS ${sku} — ${type}.`];
  if (applications.length) lines.push('', `${language === 'en' ? 'Registered applications' : 'Aplicaciones registradas'}: ${applications.join('; ')}.`);
  return lines.join('\n');
}

function applyReferenceResponsePolicy(payload = {}, requestBody = {}) {
  if (!CATALOG_INTENTS.has(payload.intent)) return payload;

  const language = languageOf(requestBody);
  const evidence = payload.evidence || {};
  const reference = messageReference(requestBody, evidence);
  const lookupStatus = String(evidence.lookup_status || '').toLowerCase();

  if (['database_unavailable', 'error'].includes(lookupStatus)) {
    return {
      ...payload,
      answer: unavailableAnswer(reference, language),
      pending_field: null,
      evidence: { ...evidence, validated: false, count: 0, products: [] },
      governance: { ...(payload.governance || {}), reference_response_policy: 'database_unavailable' }
    };
  }

  if (lookupStatus === 'not_found' || (!evidence.validated && Number(evidence.count || 0) === 0)) {
    return {
      ...payload,
      answer: notFoundAnswer(reference, language),
      pending_field: null,
      evidence: { ...evidence, lookup_status: 'not_found', validated: false, count: 0, products: [] },
      governance: { ...(payload.governance || {}), reference_response_policy: 'not_found' }
    };
  }

  const products = uniqueProductsBySku(Array.isArray(evidence.products) ? evidence.products : []);
  if (lookupStatus === 'ambiguous' || products.length > 1) {
    return {
      ...payload,
      answer: ambiguousAnswer(reference, language),
      pending_field: null,
      evidence: { ...evidence, lookup_status: 'ambiguous', validated: false, count: products.length, products },
      governance: { ...(payload.governance || {}), reference_response_policy: 'ambiguous' }
    };
  }

  if (evidence.validated === true && products.length === 1) {
    const product = products[0];
    const referenceSource = identifyReferenceSource(product, reference);
    const applications = selectApplications(product.equipment_applications, 3);
    return {
      ...payload,
      answer: verifiedAnswer(product, referenceSource, applications, language),
      evidence: { ...evidence, count: 1, products },
      governance: {
        ...(payload.governance || {}),
        reference_response_policy: 'validated_deterministic',
        source_brand: referenceSource.brand,
        applications_published: applications.length,
        llm_product_claims_disabled: true
      }
    };
  }

  return payload;
}

module.exports = {
  applyReferenceResponsePolicy,
  identifyReferenceSource,
  selectApplications,
  filterTypeLabel,
  normalizeReference,
  messageReference
};
