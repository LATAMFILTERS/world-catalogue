'use strict';

const express = require('express');
const { Pool } = require('pg');

const TARGET_REFERENCE = 'R90';
const TARGET_SKU = 'EL84004';
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

      if (normalized === TARGET_REFERENCE && !qualified) {
        return res.status(200).json({
          success: true,
          source: 'manufacturer_disambiguation_required',
          resolution: 'AMBIGUOUS_MANUFACTURER',
          results: [],
          candidates: [],
          products: [],
          mixed_duty: false,
          normalized_reference: TARGET_REFERENCE,
          reference_review_required: false,
          manufacturer_required: true,
          manufacturer_clarification_required: true,
          exact_part_number_required: false,
          duty_clarification_required: false,
          message: 'R90 requires manufacturer context. Use TECNOCAR R90 for the validated TECNOCAR cross-reference, or enter the complete RACOR element reference R90S, R90T, or R90P.'
        });
      }

      if (!qualified) return next();

      try {
        const product = await fetchValidatedTecnoCarR90();
        if (!product) {
          return res.status(200).json({
            success: true,
            source: 'manufacturer_reference_validation_failed',
            resolution: 'EVIDENCE_REQUIRED',
            results: [],
            candidates: [],
            products: [],
            normalized_reference: TARGET_REFERENCE,
            manufacturer: 'TECNOCAR',
            governed_reference: 'TECNOCAR R90',
            reference_review_required: true,
            manufacturer_clarification_required: false,
            duty_clarification_required: false,
            mixed_duty: false,
          });
        }

        return res.status(200).json({
          success: true,
          source: 'manufacturer_reference_exact',
          resolution: 'RESOLVED',
          results: [product],
          candidates: [TARGET_SKU],
          products: [product],
          normalized_reference: TARGET_REFERENCE,
          manufacturer: 'TECNOCAR',
          governed_reference: 'TECNOCAR R90',
          resolved_sku: TARGET_SKU,
          resolved_duty: product.duty || null,
          duty_resolution: 'MANUFACTURER_REFERENCE_EXACT',
          reference_review_required: false,
          manufacturer_clarification_required: false,
          duty_clarification_required: false,
          mixed_duty: false,
        });
      } catch (error) {
        console.error('[part-search-r90] TECNOCAR R90 exact lookup failed', error.message);
        return res.status(503).json({
          success: false,
          source: 'manufacturer_reference_lookup_error',
          resolution: 'UNAVAILABLE',
          results: [],
          candidates: [],
          products: [],
        });
      }
    };

    return originalGet.call(this, path, governR90, ...handlers);
  };
}

console.log('[part-search-r90] bare R90 requires manufacturer; TECNOCAR R90 resolves directly to EL84004');

module.exports = {
  TARGET_REFERENCE,
  TARGET_SKU,
  normalizeReference,
  manufacturerFromRequest,
  isQualifiedR90,
  fetchValidatedTecnoCarR90,
};
