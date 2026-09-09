'use strict';

const express = require('express');
const { Pool } = require('pg');

const TARGET_REFERENCE = 'R90';
const TARGET_SKU = 'EL84004';
const TARGET_R90T_REFERENCE = 'R90T';
const TARGET_R90T_SKU = 'ES91855';
const VALID_MANUFACTURERS = new Set(['TECNOCAR', 'TECHNOCAR']);

let pool = null;
function getPool() {
  if (pool) return pool;
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 2,
    statement_timeout: 4000,
  });
  return pool;
}

function normalizeReference(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function manufacturerFromRequest(req, raw) {
  const explicit = normalizeReference(
    req.query?.manufacturer || req.query?.brand || req.query?.make || ''
  );
  if (VALID_MANUFACTURERS.has(explicit)) return 'TECNOCAR';

  const compact = normalizeReference(raw);
  if (
    compact === 'TECNOCARR90' || compact === 'TECHNOCARR90' ||
    compact === 'R90TECNOCAR' || compact === 'R90TECHNOCAR'
  ) return 'TECNOCAR';

  return null;
}

function isQualifiedR90(req, raw) {
  if (!manufacturerFromRequest(req, raw)) return false;
  const compact = normalizeReference(raw);
  return compact === TARGET_REFERENCE ||
    compact === 'TECNOCARR90' || compact === 'TECHNOCARR90' ||
    compact === 'R90TECNOCAR' || compact === 'R90TECHNOCAR';
}

async function fetchValidatedTecnoCarR90() {
  const result = await getPool().query(`
    SELECT c.*
    FROM public.elimfilters_catalog c
    WHERE c.sku = $1
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(coalesce(c.competitor_codes, '[]'::jsonb)) x
        WHERE upper(regexp_replace(coalesce(x->>'code',''), '[^A-Z0-9]', '', 'g')) = 'R90'
          AND upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', ''), '[^A-Z0-9]', '', 'g')) IN ('TECNOCAR','TECHNOCAR')
      )
    LIMIT 1
  `, [TARGET_SKU]);
  return result.rows[0] || null;
}

async function fetchValidatedR90T() {
  const result = await getPool().query(`
    SELECT c.*
    FROM public.elimfilters_catalog c
    WHERE c.sku = $1
      AND c.codigo_base = 'P551855'
      AND lower(coalesce(c.filter_type,'')) = 'separator'
      AND coalesce(c.micron_rating::text,'') = '10'
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(coalesce(c.competitor_codes, '[]'::jsonb)) x
        WHERE upper(regexp_replace(coalesce(x->>'code',''), '[^A-Z0-9]', '', 'g')) = 'R90T'
          AND upper(regexp_replace(coalesce(x->>'manufacturer', x->>'brand', ''), '[^A-Z0-9]', '', 'g')) = 'RACOR'
      )
    LIMIT 1
  `, [TARGET_R90T_SKU]);
  return result.rows[0] || null;
}

function exactProductResponse(product, reference, sku, manufacturer, source, dutyResolution) {
  return {
    success: true,
    source,
    resolution: 'RESOLVED',
    results: [product],
    candidates: [sku],
    products: [product],
    alternatives: [],
    alternative_products: [],
    related_products: [],
    normalized_reference: reference,
    manufacturer,
    governed_reference: `${manufacturer} ${reference}`,
    resolved_sku: sku,
    resolved_duty: product.duty || null,
    duty_resolution: dutyResolution,
    reference_review_required: false,
    manufacturer_required: false,
    manufacturer_clarification_required: false,
    duty_clarification_required: false,
    mixed_duty: false,
  };
}

const originalGet = express.application.get;

if (!express.application.__elimR90FailClosedPatch) {
  Object.defineProperty(express.application, '__elimR90FailClosedPatch', {
    value: true,
    enumerable: false,
  });

  express.application.get = function patchedR90Get(path, ...handlers) {
    if (path !== '/api/search') return originalGet.call(this, path, ...handlers);

    const governR90 = async (req, res, next) => {
      const raw = String(req.query?.q || req.query?.sku || '').trim();
      const normalized = normalizeReference(raw);
      const qualified = isQualifiedR90(req, raw);

      // RACOR R90T is a validated 10-micron fuel/water separator.
      // Resolve directly to ES91855 and suppress cross-family alternatives
      // such as EF91075 (P551075 / SYNTAPORE / 4 micron).
      if (normalized === TARGET_R90T_REFERENCE) {
        try {
          const product = await fetchValidatedR90T();
          if (!product) {
            return res.status(200).json({
              success: true,
              source: 'racor_r90t_validation_failed',
              resolution: 'EVIDENCE_REQUIRED',
              results: [],
              candidates: [],
              products: [],
              alternatives: [],
              alternative_products: [],
              related_products: [],
              normalized_reference: TARGET_R90T_REFERENCE,
              manufacturer: 'RACOR',
              governed_reference: 'RACOR R90T',
              reference_review_required: true,
              manufacturer_clarification_required: false,
              duty_clarification_required: false,
              mixed_duty: false,
            });
          }

          return res.status(200).json(exactProductResponse(
            product,
            TARGET_R90T_REFERENCE,
            TARGET_R90T_SKU,
            'RACOR',
            'racor_reference_exact',
            'RACOR_REFERENCE_EXACT'
          ));
        } catch (error) {
          console.error('[part-search-r90t] validated R90T lookup failed', error.message);
          return res.status(503).json({
            success: false,
            source: 'racor_r90t_lookup_error',
            resolution: 'UNAVAILABLE',
            results: [],
            candidates: [],
            products: [],
            alternatives: [],
          });
        }
      }

      const bareValidatedR90 = normalized === TARGET_REFERENCE;

      // Database sanitation leaves exactly one validated bare R90 identity:
      // TECNOCAR R90 -> EL84004. R90S/R90P remain independent RACOR
      // references and continue through the normal certified resolver.
      if (!bareValidatedR90 && !qualified) return next();

      try {
        const product = await fetchValidatedTecnoCarR90();
        if (!product) {
          return res.status(200).json({
            success: true,
            source: 'validated_reference_missing',
            resolution: 'EVIDENCE_REQUIRED',
            results: [],
            candidates: [],
            products: [],
            alternatives: [],
            alternative_products: [],
            related_products: [],
            normalized_reference: TARGET_REFERENCE,
            manufacturer: 'TECNOCAR',
            governed_reference: 'TECNOCAR R90',
            reference_review_required: true,
            manufacturer_clarification_required: false,
            duty_clarification_required: false,
            mixed_duty: false,
          });
        }

        return res.status(200).json(exactProductResponse(
          product,
          TARGET_REFERENCE,
          TARGET_SKU,
          'TECNOCAR',
          bareValidatedR90 ? 'validated_reference_exact' : 'manufacturer_reference_exact',
          bareValidatedR90 ? 'VALIDATED_REFERENCE_EXACT' : 'MANUFACTURER_REFERENCE_EXACT'
        ));
      } catch (error) {
        console.error('[part-search-r90] validated R90 lookup failed', error.message);
        return res.status(503).json({
          success: false,
          source: 'validated_reference_lookup_error',
          resolution: 'UNAVAILABLE',
          results: [],
          candidates: [],
          products: [],
          alternatives: [],
        });
      }
    };

    return originalGet.call(this, path, governR90, ...handlers);
  };
}

console.log('[part-search-r90] R90 -> EL84004; RACOR R90T -> ES91855; cross-family alternatives suppressed');

module.exports = {
  TARGET_REFERENCE,
  TARGET_SKU,
  TARGET_R90T_REFERENCE,
  TARGET_R90T_SKU,
  normalizeReference,
  manufacturerFromRequest,
  isQualifiedR90,
  fetchValidatedTecnoCarR90,
  fetchValidatedR90T,
};