'use strict';

const { withProtocolClient } = require('./bot-protocol-db');

const MAX_RESULTS = 8;
const CROSSREF_CANDIDATE_LIMIT = 100;

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
      // Fast path: let normal indexes serve direct ELIMFILTERS SKU/base-code matches.
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

      // Cross-reference path: first use a cheap textual prefilter. The previous
      // query expanded and regex-normalized every JSONB element in the table,
      // which timed out in production. Exact matching is performed in JS on
      // the small candidate set, so the bot still cannot accept partial codes.
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

async function searchByApplication(tokens, year = null) {
  const terms = [...new Set((tokens || []).map(value => String(value).trim()).filter(value => value.length >= 2))].slice(0, 8);
  if (!terms.length) return { products: [], lookupStatus: 'not_required' };

  try {
    const products = await withProtocolClient(async client => {
      const patterns = terms.map(term => `%${term}%`);
      const params = [patterns];
      let yearClause = '';
      if (year) {
        params.push(`%${year}%`);
        yearClause = ' AND c.equipment_applications::text ILIKE $2';
      }
      const result = await client.query(
        `SELECT ${SELECT_FIELDS}, 'application'::text AS protocol_match_type
           FROM elimfilters_catalog c
          WHERE c.equipment_applications::text ILIKE ANY($1::text[])${yearClause}
          ORDER BY is_primary DESC NULLS LAST, filter_type ASC, sku ASC
          LIMIT ${MAX_RESULTS}`,
        params
      );
      return result.rows.map(normalizeProduct);
    }, { statementTimeoutMs: 3000 });

    return { products, lookupStatus: 'completed', matchType: products[0]?.protocol_match_type || null };
  } catch (error) {
    console.error('[bot-protocol-catalog] application lookup failed', error.message);
    return { products: [], lookupStatus: 'error', error: error.message };
  }
}

module.exports = {
  normalizeReference,
  extractReferences,
  strongestApplicationToken,
  searchByReferences,
  searchByApplication,
  MAX_RESULTS
};
