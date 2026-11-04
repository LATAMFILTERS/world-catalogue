'use strict';

const { withProtocolClient } = require('./bot-protocol-db');
const { norm, qualifyApplicationProduct } = require('./bot-application-evidence-policy');
const { resolveReferenceAuthority } = require('./bot-protocol-reference-authority');

const MAX_RESULTS = 8;
const CROSSREF_CANDIDATE_LIMIT_PER_REFERENCE = 40;
const APPLICATION_CANDIDATE_LIMIT = 32;

async function withCatalogReadRetry(callback, primaryTimeoutMs) {
  try {
    return await withProtocolClient(callback, { statementTimeoutMs: primaryTimeoutMs });
  } catch (error) {
    if (error?.code !== '57014') throw error;
    console.warn('[bot-protocol-catalog] read timeout during startup load; retrying once');
    return withProtocolClient(callback, { statementTimeoutMs: 30000 });
  }
}

const RACOR_TURBINE_COMPATIBILITY = Object.freeze({
  '500FG': '2010',
  '500FH': '2010',
  '900FG': '2040',
  '900FH': '2040',
  '1000FG': '2020',
  '1000FH': '2020'
});

const SELECT_FIELDS = `id, sku, codigo_base, name, description, duty, filter_type, sub_type, technology,
  thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
  micron_rating, nominal_efficiency, filter_media, oem_codes,
  competitor_codes, brand_crossrefs, equipment_applications, vehicle_applications, specs,
  enrichment_data, is_primary`;

const YEAR_PATTERN = /^(?:19[8-9]\d|20[0-3]\d)$/;
const CODE_FIELD_NAMES = new Set([
  'code', 'reference', 'part_number', 'partnumber', 'partno',
  'oem_code', 'oemcode', 'cross_reference', 'crossreference'
]);

function normalizeReference(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function extractReferences(text) {
  const source = String(text || '').toUpperCase();
  const years = new Set(source.match(/\b(?:19[8-9]\d|20[0-3]\d)\b/g) || []);
  const alphanumeric = source.match(/\b(?=[A-Z0-9./-]{4,}\b)(?=[A-Z0-9./-]*[A-Z])(?=[A-Z0-9./-]*\d)[A-Z0-9]+(?:[-/.][A-Z0-9]+)*\b/g) || [];
  const numeric = source.match(/\b(?:\d{2,}(?:[-/]\d{2,})+|\d{5,15})\b/g) || [];

  return [...new Set(
    [...alphanumeric, ...numeric]
      .map(normalizeReference)
      .filter(ref => ref.length >= 4 && !years.has(ref) && !YEAR_PATTERN.test(ref))
  )].slice(0, 8);
}

function normalizeProduct(row) {
  return {
    ...row,
    oem_codes: row.oem_codes || [],
    competitor_codes: row.competitor_codes || [],
    brand_crossrefs: row.brand_crossrefs || {},
    equipment_applications: row.equipment_applications || [],
    vehicle_applications: row.vehicle_applications || [],
    specs: row.specs || {},
    enrichment_data: row.enrichment_data || {}
  };
}

function legacyDelimitedCode(value) {
  const text = String(value || '').trim();
  const pipeIndex = text.indexOf('|');
  if (pipeIndex >= 0) return text.slice(pipeIndex + 1).trim();
  return text;
}

function collectReferenceCodes(value, output = []) {
  if (value == null) return output;

  if (typeof value === 'string' || typeof value === 'number') {
    const code = legacyDelimitedCode(value);
    if (code) output.push(code);
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectReferenceCodes(item, output);
    return output;
  }

  if (typeof value !== 'object') return output;

  for (const [key, item] of Object.entries(value)) {
    const normalizedKey = key.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (CODE_FIELD_NAMES.has(normalizedKey)) {
      collectReferenceCodes(item, output);
      continue;
    }

    if (Array.isArray(item) || (item && typeof item === 'object')) {
      collectReferenceCodes(item, output);
    }
  }

  return output;
}

function codesFromJsonArray(value) {
  if (!Array.isArray(value)) return [];
  return collectReferenceCodes(value, []);
}

function codesFromJsonObject(value) {
  if (!value || Array.isArray(value) || typeof value !== 'object') return [];
  return collectReferenceCodes(value, []);
}

function productReferenceSet(product) {
  return new Set([
    product.sku,
    product.codigo_base,
    ...codesFromJsonArray(product.oem_codes),
    ...codesFromJsonArray(product.competitor_codes),
    ...codesFromJsonObject(product.brand_crossrefs)
  ].map(normalizeReference).filter(Boolean));
}

function exactReferenceMatch(product, references) {
  const available = productReferenceSet(product);
  return references.some(reference => available.has(normalizeReference(reference)));
}

function dedupeProducts(products) {
  const seen = new Set();
  return products.filter(product => {
    const key = String(product.id || product.sku || product.codigo_base || '').toUpperCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function referenceContainmentPayloads(reference) {
  const fields = ['code', 'reference', 'part_number', 'partNumber', 'partno', 'oem_code', 'oemCode', 'cross_reference', 'crossReference'];
  return fields.map(field => JSON.stringify([{ [field]: reference }]));
}

async function crossReferenceCandidatesFor(client, reference) {
  const normalizedReference = normalizeReference(reference);
  if (!normalizedReference) return [];

  const payloads = referenceContainmentPayloads(normalizedReference);
  const result = await client.query(
    `SELECT ${SELECT_FIELDS}, 'cross_reference'::text AS protocol_match_type
       FROM elimfilters_catalog c
      WHERE c.oem_codes @> ANY($1::jsonb[])
         OR c.competitor_codes @> ANY($1::jsonb[])
      ORDER BY is_primary DESC NULLS LAST, sku ASC
      LIMIT ${CROSSREF_CANDIDATE_LIMIT_PER_REFERENCE}`,
    [payloads]
  );
  return result.rows.map(normalizeProduct);
}

async function searchByReferences(references) {
  const result = await resolveReferenceAuthority(references);
  return { ...result, lookupStatus: result.lookupStatus === 'validated' ? 'completed' : result.lookupStatus === 'not_found' ? 'completed' : result.lookupStatus === 'database_unavailable' ? 'error' : result.lookupStatus,
    matchType: 'resolver_v7', claim: result.lookupStatus === 'validated' ? (result.authoritySource === 'elimfilters_catalog.sku' ? 'SKU_EXISTS' : 'EQUIVALENCE_CONFIRMED') : 'NONE' };
}

function strongestApplicationToken(tokens) {
  return [...tokens].sort((a, b) => {
    const aScore = /\d/.test(a) ? a.length + 20 : a.length;
    const bScore = /\d/.test(b) ? b.length + 20 : b.length;
    return bScore - aScore;
  })[0] || null;
}

function applicationText(product) {
  return JSON.stringify([
    ...(product.equipment_applications || []),
    ...(product.vehicle_applications || [])
  ]).toUpperCase();
}

function normalizeApplicationYear(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n >= 1900 && n <= 2039) return n;
  if (n >= 0 && n <= 99) return n <= 39 ? 2000 + n : 1900 + n;
  return null;
}

function applicationYearValueMatches(value, year) {
  if (value == null) return false;
  if (typeof value === 'number') return normalizeApplicationYear(value) === year;
  const text = String(value).trim();
  if (/^\d{2,4}$/.test(text)) return normalizeApplicationYear(text) === year;
  const range = text.match(/^(\d{2,4})\s*[-/]\s*(\d{2,4})$/);
  if (!range) return false;
  const a = normalizeApplicationYear(range[1]);
  const b = normalizeApplicationYear(range[2]);
  if (!a || !b) return false;
  return year >= Math.min(a, b) && year <= Math.max(a, b);
}

function applicationYearMatches(product, year) {
  if (!year) return true;
  const apps = [...(product.equipment_applications || []), ...(product.vehicle_applications || [])];
  return apps.some(app => {
    if (!app || typeof app !== 'object') return applicationYearValueMatches(app, year);
    if (applicationYearValueMatches(app.year, year)) return true;
    const from = normalizeApplicationYear(app.year_from ?? app.start_year ?? app.yearStart);
    const to = normalizeApplicationYear(app.year_to ?? app.end_year ?? app.yearEnd);
    return Boolean(from && to && year >= Math.min(from, to) && year <= Math.max(from, to));
  });
}

function applicationMatches(product, terms, year) {
  const haystack = applicationText(product);
  const normalizedTerms = terms.map(term => String(term).toUpperCase());
  if (!normalizedTerms.every(term => haystack.includes(term))) return false;
  return applicationYearMatches(product, year);
}

const SYSTEM_FILTER_TYPE_PATTERNS = {
  oil: /\b(oil|lube|lubricant)\b/i,
  fuel: /\bfuel\b/i,
  coolant: /\bcoolant\b/i,
  hydraulic: /\bhydraulic\b/i,
  cabin: /\b(cabin|pollen)\b/i,
  air: /\bair\b/i
};

function filterTypeMatchesSystem(filterType, system) {
  if (!system) return true;
  const pattern = SYSTEM_FILTER_TYPE_PATTERNS[system];
  if (!pattern) return true;
  const type = String(filterType || '');
  if (system === 'air' && /cabin/i.test(type)) return false;
  return pattern.test(type);
}

async function searchValidatedMaintenanceKit(brand, model, year, context = {}) {
  const approved = await searchByApplication([brand, model, context.engine].filter(Boolean), year, context.system || null, context);
  if (approved.lookupStatus === 'error') return { ...approved, kit: null, ambiguous: false };
  if (!approved.products.length) return { ...approved, products: [], kit: null, ambiguous: approved.lookupStatus === 'ambiguous' };
  try {
    const components = await withCatalogReadRetry(async client => {
      const result = await client.query(`SELECT k.kit_sku, k.name, k.equipment_ref, kc.filter_sku
        FROM maintenance_kits k JOIN kit_components kc ON kc.kit_sku = k.kit_sku
        WHERE upper(k.brand) = upper($1) AND k.duty = $2 AND kc.filter_sku = ANY($3::text[])
        ORDER BY k.kit_sku, kc.filter_sku LIMIT 256`, [brand, approved.products[0].duty, approved.products.map(p => p.sku)]);
      return result.rows;
    }, 4000);
    const kits = [...new Set(components.map(row => row.kit_sku))];
    if (kits.length !== 1) return { products: [], lookupStatus: 'completed', kit: null, ambiguous: kits.length > 1 };
    const skus = new Set(components.map(row => row.filter_sku));
    return { ...approved, products: approved.products.filter(p => skus.has(p.sku)),
      kit: { kit_sku: kits[0], equipment_ref: components[0].equipment_ref }, ambiguous: false };
  } catch { return { products: [], lookupStatus: 'error', kit: null, ambiguous: false }; }
}

async function searchByApplication(tokens, year = null, filterSystem = null, suppliedContext = {}) {
  const terms = [...new Set((tokens || []).map(x => String(x).trim()).filter(Boolean))].slice(0, 8);
  const context = { brand: terms[0], model: terms[1], engine: terms[2] || null, year, ...suppliedContext };
  if (!context.brand || !context.model) return { products: [], lookupStatus: 'insufficient_identity', pendingField: 'equipment', claim: 'NONE' };
  // A model and year are not a complete engine configuration.
  if (!context.engine || !context.year) return { products: [], lookupStatus: 'insufficient_identity', pendingField: !context.year ? 'year' : 'engine_or_configuration', claim: 'NONE' };
  try {
    const products = await withCatalogReadRetry(async client => {
      const result = await client.query(`
        SELECT c.*,
          coalesce((SELECT jsonb_agg(to_jsonb(va) || jsonb_build_object('ledger_verified', exists (
            SELECT 1 FROM catalog_application_evidence e WHERE e.sku = va.elimfilters_sku
              AND e.verified = true AND e.application_kind = 'VEHICLE'
              AND e.evidence_authority = va.evidence_authority AND e.source_url = va.evidence_source_url
              AND e.payload_hash = va.evidence_payload_hash AND e.verified_at IS NOT NULL
          ))) FROM ld_catalog.ld_vehicle_applications va
            WHERE va.elimfilters_sku = c.sku AND va.evidence_status = 'VERIFIED'), '[]'::jsonb) AS protocol_relational_applications,
          coalesce((SELECT jsonb_agg(to_jsonb(e)) FROM catalog_application_evidence e
            WHERE e.sku = c.sku AND e.verified = true AND e.verified_at IS NOT NULL), '[]'::jsonb) AS protocol_application_evidence
        FROM elimfilters_catalog c
        WHERE ($3::text IS NULL OR c.duty = $3)
          AND (concat_ws(' ', c.equipment_applications::text, c.vehicle_applications::text) ILIKE $1
            AND concat_ws(' ', c.equipment_applications::text, c.vehicle_applications::text) ILIKE $2
            OR EXISTS (SELECT 1 FROM ld_catalog.ld_vehicle_applications va
              WHERE va.elimfilters_sku = c.sku AND va.evidence_status = 'VERIFIED'
                AND regexp_replace(upper(coalesce(va.make,'')), '[^A-Z0-9]', '', 'g') = $4
                AND (regexp_replace(upper(coalesce(va.model_family,'')), '[^A-Z0-9]', '', 'g') = $5
                  OR regexp_replace(upper(coalesce(va.model_type,'')), '[^A-Z0-9]', '', 'g') = $5)))
        ORDER BY c.is_primary DESC NULLS LAST, c.sku
        LIMIT 256`, [`%${context.brand}%`, `%${context.model}%`, context.duty || null, norm(context.brand), norm(context.model)]);
      return dedupeProducts(result.rows.map(normalizeProduct)
        .map(product => qualifyApplicationProduct(product, context)).filter(Boolean))
        .filter(product => filterTypeMatchesSystem(product.filter_type, filterSystem));
    }, 8000);
    const duties = new Set(products.map(p => p.duty));
    if (!context.duty && duties.size > 1) return { products: [], lookupStatus: 'ambiguous', pendingField: 'duty', claim: 'NONE' };
    return { products: products.slice(0, MAX_RESULTS), lookupStatus: 'completed', matchType: 'verified_application', claim: products.length ? 'APPLICATION_CONFIRMED' : 'NONE' };
  } catch (error) {
    console.error('[bot-protocol-catalog] governed application lookup failed', error.code || 'DATABASE_ERROR');
    return { products: [], lookupStatus: 'error', claim: 'NONE' };
  }
}

function isHousing(product) {
  return /housing/i.test(String(product?.filter_type || ''));
}

function racorHousingModel(product) {
  const values = [
    product?.codigo_base,
    product?.sku,
    product?.name,
    product?.description,
    ...codesFromJsonArray(product?.oem_codes),
    ...codesFromJsonArray(product?.competitor_codes),
    ...codesFromJsonObject(product?.brand_crossrefs)
  ].filter(Boolean).map(value => String(value).toUpperCase());

  for (const value of values) {
    const match = value.match(/(?:^|[^A-Z0-9])(1000|900|500)(FG|FH)(?:[^A-Z0-9]|$)/);
    if (match) return `${match[1]}${match[2]}`;
  }
  return null;
}

function compatibleSeriesFromProduct(product) {
  const explicit = product?.specs?.compatible_element_series || product?.enrichment_data?.compatible_element_series;
  if (explicit) return String(explicit).replace(/\D/g, '');

  const housingModel = racorHousingModel(product);
  if (housingModel && RACOR_TURBINE_COMPATIBILITY[housingModel]) {
    return RACOR_TURBINE_COMPATIBILITY[housingModel];
  }

  const text = [product?.description, product?.name].filter(Boolean).join(' ');
  return text.match(/accepts?\s+(\d{4})[-\s]*series/i)?.[1]
    || text.match(/bowl\s+class\s+(\d{4})/i)?.[1]
    || null;
}

async function searchCompatibleElements(housingProducts) {
  const housings = (housingProducts || []).filter(isHousing);
  const series = [...new Set(housings.map(compatibleSeriesFromProduct).filter(Boolean))];
  if (!series.length) return { products: [], housingProducts: housings, series: [], lookupStatus: 'not_required' };

  const skus = series.flatMap(value => [`ET9${value}P`, `ET9${value}T`, `ET9${value}S`]);
  try {
    const products = await withProtocolClient(async client => {
      const result = await client.query(
        `SELECT ${SELECT_FIELDS}, 'housing_compatible_element'::text AS protocol_match_type
           FROM elimfilters_catalog c
          WHERE upper(c.sku) = ANY($1::text[])
            AND c.filter_type ILIKE '%Cartridge%'
          ORDER BY CASE right(upper(c.sku), 1)
            WHEN 'P' THEN 1 WHEN 'T' THEN 2 WHEN 'S' THEN 3 ELSE 4 END,
            c.sku ASC`,
        [skus]
      );
      return result.rows.map(normalizeProduct);
    }, { statementTimeoutMs: 5000 });

    return {
      products,
      housingProducts: housings,
      series,
      lookupStatus: 'completed',
      matchType: products[0]?.protocol_match_type || null
    };
  } catch (error) {
    console.error('[bot-protocol-catalog] compatibility lookup failed', error.message);
    return { products: [], housingProducts: housings, series, lookupStatus: 'error', error: error.message };
  }
}

module.exports = {
  RACOR_TURBINE_COMPATIBILITY,
  normalizeReference,
  extractReferences,
  collectReferenceCodes,
  codesFromJsonArray,
  codesFromJsonObject,
  productReferenceSet,
  exactReferenceMatch,
  referenceContainmentPayloads,
  strongestApplicationToken,
  searchByReferences,
  searchValidatedMaintenanceKit,
  searchByApplication,
  searchCompatibleElements,
  compatibleSeriesFromProduct,
  racorHousingModel,
  isHousing,
  MAX_RESULTS
};