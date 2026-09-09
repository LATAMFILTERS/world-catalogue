'use strict';

const express = require('express');

function normalizeReference(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

const originalGet = express.application.get;

if (!express.application.__elimR90FailClosedPatch) {
  Object.defineProperty(express.application, '__elimR90FailClosedPatch', {
    value: true,
    enumerable: false,
  });

  express.application.get = function patchedR90Get(path, ...handlers) {
    if (path !== '/api/search') return originalGet.call(this, path, ...handlers);

    const blockBareR90 = (req, res, next) => {
      const raw = String(req.query?.q || req.query?.sku || '').trim();
      const normalized = normalizeReference(raw);

      if (normalized !== 'R90') return next();

      return res.status(200).json({
        success: true,
        source: 'reference_governance',
        resolution: 'EVIDENCE_REQUIRED',
        results: [],
        candidates: [],
        products: [],
        mixed_duty: false,
        normalized_reference: 'R90',
        reference_review_required: true,
        manufacturer_required: true,
        exact_part_number_required: true,
        duty_clarification_required: false,
        message: 'R90 is not accepted as a standalone cross-reference. Specify the manufacturer or the complete validated part number. RACOR family references must use the complete code, such as R90S, R90T, or R90P.'
      });
    };

    return originalGet.call(this, path, blockBareR90, ...handlers);
  };
}

console.log('[part-search-r90] bare R90 fail-closed guard enabled');
