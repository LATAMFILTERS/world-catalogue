'use strict';

const express = require('express');

const TARGET_REFERENCE = 'R90';
const TARGET_SKU = 'EL84004';
const VALID_MANUFACTURERS = new Set(['TECNOCAR', 'TECHNOCAR']);

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

function skuOf(row) {
  return String(row?.sku || row?.elimfilters_sku || '').toUpperCase();
}

function filterToValidatedTecnoCarR90(body) {
  if (!body || typeof body !== 'object') return body;
  const next = Array.isArray(body) ? body.slice() : { ...body };

  for (const key of ['results', 'products']) {
    if (Array.isArray(next[key])) {
      next[key] = next[key].filter((row) => skuOf(row) === TARGET_SKU);
    }
  }

  if (Array.isArray(next.candidates)) {
    next.candidates = next.candidates.filter((row) => {
      if (typeof row === 'string') return row.toUpperCase() === TARGET_SKU;
      return skuOf(row) === TARGET_SKU;
    });
  }

  const count = Array.isArray(next.results) ? next.results.length :
    (Array.isArray(next.products) ? next.products.length : 0);

  next.source = 'manufacturer_reference_exact';
  next.normalized_reference = TARGET_REFERENCE;
  next.manufacturer = 'TECNOCAR';
  next.governed_reference = 'TECNOCAR R90';
  next.resolution = count > 0 ? 'RESOLVED' : 'EVIDENCE_REQUIRED';
  next.reference_review_required = count === 0;
  next.manufacturer_clarification_required = false;
  next.duty_clarification_required = false;
  next.mixed_duty = false;
  return next;
}

const originalGet = express.application.get;

if (!express.application.__elimR90FailClosedPatch) {
  Object.defineProperty(express.application, '__elimR90FailClosedPatch', {
    value: true,
    enumerable: false,
  });

  express.application.get = function patchedR90Get(path, ...handlers) {
    if (path !== '/api/search') return originalGet.call(this, path, ...handlers);

    const governR90 = (req, res, next) => {
      const raw = String(req.query?.q || req.query?.sku || '').trim();
      const normalized = normalizeReference(raw);
      const qualified = isQualifiedR90(req, raw);

      // Bare R90 is ambiguous globally. It must never silently select a filter.
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

      // Manufacturer-qualified TECNOCAR R90 is a validated cross-reference to
      // EL84004. Normalize the phrase/parameter to the actual part number for
      // lookup and bypass the manufacturer-agnostic strict canonical guard;
      // the response is then restricted to the validated SKU only.
      req.query.q = TARGET_REFERENCE;
      req.query.sku = TARGET_REFERENCE;
      req.query.mode = 'manufacturer_part';
      req.query.manufacturer = 'TECNOCAR';

      const originalJson = res.json.bind(res);
      res.json = (body) => originalJson(filterToValidatedTecnoCarR90(body));
      next();
    };

    return originalGet.call(this, path, governR90, ...handlers);
  };
}

console.log('[part-search-r90] bare R90 requires manufacturer; TECNOCAR R90 -> EL84004');

module.exports = {
  TARGET_REFERENCE,
  TARGET_SKU,
  normalizeReference,
  manufacturerFromRequest,
  isQualifiedR90,
  filterToValidatedTecnoCarR90,
};
