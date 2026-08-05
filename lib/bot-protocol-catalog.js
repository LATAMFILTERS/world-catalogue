'use strict';

const { withProtocolClient } = require('./bot-protocol-db');

const MAX_RESULTS = 8;
const CROSSREF_CANDIDATE_LIMIT = 100;
const APPLICATION_CANDIDATE_LIMIT = 120;

const RACOR_TURBINE_COMPATIBILITY = Object.freeze({
  '500FG': '2010',
  '500FH': '2010',
  '900FG': '2040',
  '900FH': '2040',
  '1000FG': '2020',
  '1000FH': '2020'
});

const SELECT_FIELDS = `id, sku, codigo_base, name, description, filter_type, sub_type, technology,
  thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
  micron_rating, nominal_efficiency, filter_media, oem_codes,
  competitor_codes, brand_crossrefs, equipment_applications, specs,
  enrichment_data, is_primary`;

const YEAR_PATTERN = /^(?:19[8-9]\d|20[0-3]\d)$/;

function normalizeReference(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

function extractReferences(text) {
  const source = String(text || '').toUpperCase();
  const years = new Set(source.match(/\b(?:19[8-9]\d|20[0-3]\d)\b/g) || []);
  const candidates = source.match(/\b(?=[A-Z0-9-]{4,}\b)(?=[A-Z0-9-]*[A-Z])(?=[A-Z0-9-]*\d)[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g) || [];
  return [...new Set(
    candidates
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
    specs: row.specs || {},
    enrichment_data: row.enrichment_data || {}
  };
}

function codesFromJsonArray(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    if (typeof item === 'string' || typeof item === 'number') return [item];
    if (!item || typeof item !== 'object') return [];
    return [item.code, item.reference, item.part_number, item.partNumber, item.oem_code, item.oemCode].filter(Boolean);
  });
}

function codesFromJsonObject(value) {
  if (!value || Array.isArray(value) || typeof value !== 'object') return [];
  return Object.values(value).flatMap(item => {
    if (typeof item === 'string' || typeof item === 'number') return [item];
    if (!item || typeof item !== 'object') return [];
    return [item.code, item.reference, item.part_number, item.partNumber].filter(Boolean);
  });
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
  return references.some(reference => available.has(reference));
}

async function searchByReferences(references) {
  const normalized = [...new Set((references || []).map(normalizeReference).filter(Boolean))];
  if (!normalized.length) return { products: [], lookupStatus: 'not_required' };

  try {
    const products = await withProtocolClient(async client => {
      const direct = await client.query(
        `SELECT ${SELECT_FIELDS}, 'direct_reference'::text AS protocol_match_type
           FROM elimfilters_catalog c
          WHERE upper(c.sku) = ANY($1::text[])
             OR upper(c.codigo_base) = ANY($1::text[])
          ORDER BY is_primary DESC NULLS LAST, sku ASC
          LIMIT ${MAX_RESULTS}`,
        [normalized]
      );

      if (direct.rows.length) return direct.rows.map(normalizeProduct);

      const patterns = normalized.map(reference => `%${reference}%`);
      const candidates = await client.query(
        `SELECT ${SELECT_FIELDS}, 'cross_reference'::text AS protocol_match_type
           FROM elimfilters_catalog c
          WHERE coalesce(c.oem_codes::text, '') ILIKE ANY($1::text[])
             OR coalesce(c.competitor_codes::text, '') ILIKE ANY($1::text[])
             OR coalesce(c.brand_crossrefs::text, '') ILIKE ANY($1::text[])
          ORDER BY is_primary DESC NULLS LAST, sku ASC
          LIMIT ${CROSSREF_CANDIDATE_LIMIT}`,
        [patterns]
      );

      return candidates.rows
        .map(normalizeProduct)
        .filter(product => exactReferenceMatch(product, normalized))
        .slice(0, MAX_RESULTS);
    }, { statementTimeoutMs: 8000 });

    return { products, lookupStatus: 'completed', matchType: products[0]?.protocol_match_type || null };
  } catch (error) {
    console.error('[bot-protocol-catalog] reference lookup failed', error.message);
    return { products: [], lookupStatus: 'error', error: error.message };
  }
}

function strongestApplicationToken(tokens) {
  return [...tokens].sort((a, b) => {
    const aScore = /\d/.test(a) ? a.length + 20 : a.length;
    const bScore = /\d/.test(b) ? b.length + 20 : b.length;
    return bScore - aScore;
  })[0] || null;
}

function applicationText(product) {
  return JSON.stringify(product.equipment_applications || []).toUpperCase();
}

function applicationMatches(product, terms, year) {
  const haystack = applicationText(product);
  const normalizedTerms = terms.map(term => String(term).toUpperCase());
  if (!normalizedTerms.every(term => haystack.includes(term))) return false;
  return !year || haystack.includes(String(year));
}

async function searchByApplication(tokens, year = null) {
  const terms = [...new Set((tokens || []).map(value => String(value).trim()).filter(value => value.length >= 2))].slice(0, 8);
  if (!terms.length) return { products: [], lookupStatus: 'not_required' };

  const strongest = strongestApplicationToken(terms);
  if (!strongest) return { products: [], lookupStatus: 'not_required' };

  try {
    const products = await withProtocolClient(async client => {
      const candidateResult = await client.query(
        `SELECT ${SELECT_FIELDS}, 'application'::text AS protocol_match_type
           FROM elimfilters_catalog c
          WHERE coalesce(c.equipment_applications::text, '') ILIKE $1
          ORDER BY is_primary DESC NULLS LAST, filter_type ASC, sku ASC
          LIMIT ${APPLICATION_CANDIDATE_LIMIT}`,
        [`%${strongest}%`]
      );

      return candidateResult.rows
        .map(normalizeProduct)
        .filter(product => applicationMatches(product, terms, year))
        .slice(0, MAX_RESULTS);
    }, { statementTimeoutMs: 8000 });

    return { products, lookupStatus: 'completed', matchType: products[0]?.protocol_match_type || null };
  } catch (error) {
    console.error('[bot-protocol-catalog] application lookup failed', error.message);
    return { products: [], lookupStatus: 'error', error: error.message };
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

  // Transitional fallback for legacy rows only. Structured compatibility or
  // the Parker-authorized housing matrix always takes precedence.
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
  strongestApplicationToken,
  searchByReferences,
  searchByApplication,
  searchCompatibleElements,
  compatibleSeriesFromProduct,
  racorHousingModel,
  isHousing,
  MAX_RESULTS
};
