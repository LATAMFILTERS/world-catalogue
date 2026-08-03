'use strict';

const { withProtocolClient } = require('./bot-protocol-db');

const MAX_RESULTS = 8;

const SELECT_FIELDS = `id, sku, codigo_base, name, description, filter_type, sub_type, technology,
  thread_size, height_mm, outer_diameter_mm, gasket_od_mm, gasket_id_mm,
  micron_rating, nominal_efficiency, filter_media, oem_codes,
  competitor_codes, brand_crossrefs, equipment_applications, specs,
  enrichment_data, is_primary`;

const YEAR_PATTERN = /^(?:19[8-9]\d|20[0-3]\d)$/;

function normalizeReference(value) {
  return String(value || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

// Extracts candidate part-number-like tokens from free text, excluding
// anything that looks like a model year (per requirement: "excluir años").
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

// Single canonical reference-matching query. Handles:
// - oem_codes / competitor_codes as JSONB arrays of {code, manufacturer} objects
// - brand_crossrefs as a JSONB object (brand -> code)
// - reference normalization (strip spaces/dashes, uppercase) on both sides
async function searchByReferences(references) {
  const normalized = [...new Set((references || []).map(normalizeReference).filter(Boolean))];
  if (!normalized.length) return { products: [], lookupStatus: 'not_required' };

  try {
    const products = await withProtocolClient(async client => {
      const result = await client.query(
        `SELECT ${SELECT_FIELDS},
          CASE
            WHEN upper(regexp_replace(coalesce(sku, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
              OR upper(regexp_replace(coalesce(codigo_base, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
            THEN 'direct_reference'
            ELSE 'cross_reference'
          END AS protocol_match_type
         FROM elimfilters_catalog c
         WHERE upper(regexp_replace(coalesce(c.sku, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
            OR upper(regexp_replace(coalesce(c.codigo_base, ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
            OR EXISTS (
                 SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(c.oem_codes) = 'array' THEN c.oem_codes ELSE '[]'::jsonb END) item
                  WHERE upper(regexp_replace(coalesce(item->>'code', item#>>'{}', ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
               )
            OR EXISTS (
                 SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(c.competitor_codes) = 'array' THEN c.competitor_codes ELSE '[]'::jsonb END) item
                  WHERE upper(regexp_replace(coalesce(item->>'code', item#>>'{}', ''), '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
               )
            OR EXISTS (
                 SELECT 1 FROM jsonb_each_text(CASE WHEN jsonb_typeof(c.brand_crossrefs) = 'object' THEN c.brand_crossrefs ELSE '{}'::jsonb END) pair
                  WHERE upper(regexp_replace(pair.value, '[^A-Z0-9]', '', 'g')) = ANY($1::text[])
               )
         ORDER BY protocol_match_type ASC, is_primary DESC NULLS LAST, sku ASC
         LIMIT ${MAX_RESULTS}`,
        [normalized]
      );
      return result.rows.map(normalizeProduct);
    }, { statementTimeoutMs: 3000 });

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

// Single canonical equipment-application query (brand/model/engine tokens + optional year).
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
