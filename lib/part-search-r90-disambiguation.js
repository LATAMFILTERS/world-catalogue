'use strict';

// R90 is not a complete RACOR element reference (R90S/R90T/R90P are),
// while TECNOCAR/TECHNOCAR R90 is a validated commercial cross-reference.
// Never let a bare R90 silently select a product. With explicit TECNOCAR
// context, preserve the validated EL84004 mapping and filter the public result
// set to that SKU only.

const express = require('express');

const TARGET_REFERENCE = 'R90';
const TARGET_SKU = 'EL84004';
const VALID_MANUFACTURERS = new Set(['TECNOCAR', 'TECHNOCAR']);

function normalize(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function manufacturerFromRequest(req, raw) {
  const explicit = normalize(
    req.query?.manufacturer || req.query?.brand || req.query?.make || ''
  );
  if (VALID_MANUFACTURERS.has(explicit)) return 'TECNOCAR';

  const compact = normalize(raw);
  if (compact === 'TECNOCARR90' || compact === 'TECHNOCARR90' ||
      compact === 'R90TECNOCAR' || compact === 'R90TECHNOCAR') {
    return 'TECNOCAR';
  }
  return null;
}

function isBareR90(raw) {
  return normalize(raw) === TARGET_REFERENCE;
}

function isManufacturerQualifiedR90(req, raw) {
  const manufacturer = manufacturerFromRequest(req, raw);
  if (!manufacturer) return false;

  const compact = normalize(raw);
  return compact === TARGET_REFERENCE ||
    compact === 'TECNOCARR90' || compact === 'TECHNOCARR90' ||
    compact === 'R90TECNOCAR' || compact === 'R90TECHNOCAR';
}

function skuOf(row) {
  return String(row?.sku || row?.elimfilters_sku || '').toUpperCase();
}

function filterToValidatedSku(body) {
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
  next.duty_clarification_required = false;
  next.mixed_duty = false;
  return next;
}

let installed = false;
function installR90Disambiguation() {
  if (installed) return;
  installed = true;

  const previousGet = express.application.get;
  if (typeof previousGet !== 'function') return;

  express.application.get = function patchedGet(path, ...handlers) {
    if (path !== '/api/search') return previousGet.call(this, path, ...handlers);

    const r90Guard = (req, res, next) => {
      const raw = String(req.query?.q || req.query?.sku || '').trim();
      const qualified = isManufacturerQualifiedR90(req, raw);

      // A bare R90 is globally ambiguous and must never silently resolve.
      if (isBareR90(raw) && !qualified) {
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
          manufacturer_clarification_required: true,
          duty_clarification_required: false,
          message: 'R90 requires manufacturer context. Use TECNOCAR R90 for the validated TECNOCAR cross-reference, or enter the complete RACOR element reference R90S, R90T, or R90P.'
        });
      }

      if (!qualified) return next();

      // Normalize a qualified phrase/parameter to the actual part number for
      // the legacy lookup, but bypass the manufacturer-agnostic strict guard.
      req.query.q = TARGET_REFERENCE;
      req.query.sku = TARGET_REFERENCE;
      req.query.mode = 'manufacturer_part';
      req.query.manufacturer = 'TECNOCAR';

      const originalJson = res.json.bind(res);
      res.json = (body) => originalJson(filterToValidatedSku(body));
      next();
    };

    return previousGet.call(this, path, r90Guard, ...handlers);
  };

  console.log('[part-search-r90] bare R90 fail-closed; TECNOCAR R90 -> EL84004');
}

installR90Disambiguation();

module.exports = {
  TARGET_REFERENCE,
  TARGET_SKU,
  normalize,
  manufacturerFromRequest,
  isBareR90,
  isManufacturerQualifiedR90,
  filterToValidatedSku,
  installR90Disambiguation,
};
