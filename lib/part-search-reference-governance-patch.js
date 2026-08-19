'use strict';

const REFERENCE_GOVERNANCE = Object.freeze({
  '1R1808': Object.freeze({
    duty: 'HEAVY_DUTY',
    approvedSkus: Object.freeze(['EL81808', 'EL84005', 'EL84105', 'EL87405', 'EL87505']),
    reason: 'Verified HD reference family; exclude secondary cross-reference contamination'
  })
});

function normalizeReference(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function governanceForReferences(references) {
  for (const reference of references || []) {
    const policy = REFERENCE_GOVERNANCE[normalizeReference(reference)];
    if (policy) return { reference: normalizeReference(reference), ...policy };
  }
  return null;
}

function filterProductsForGovernance(products, policy) {
  if (!policy) return Array.isArray(products) ? products : [];
  const allowed = new Set(policy.approvedSkus.map(normalizeReference));
  return (Array.isArray(products) ? products : []).filter(product =>
    allowed.has(normalizeReference(product && product.sku))
  );
}

function singleDutyFromProducts(products) {
  const duties = [...new Set((Array.isArray(products) ? products : [])
    .map(product => String(product && product.duty || '').trim().toUpperCase())
    .filter(Boolean))];
  return duties.length === 1 ? duties[0] : null;
}

function applyGovernanceToCatalogResult(result, references) {
  if (!result || typeof result !== 'object') return result;
  const policy = governanceForReferences(references);
  const products = policy
    ? filterProductsForGovernance(result.products, policy).map(product => ({ ...product, duty: product.duty || policy.duty }))
    : (Array.isArray(result.products) ? result.products : []);
  const resolvedDuty = policy?.duty || singleDutyFromProducts(products);

  return {
    ...result,
    products,
    ...(resolvedDuty ? {
      resolvedDuty,
      dutyResolution: policy ? 'REFERENCE_GOVERNANCE' : 'SINGLE_DUTY_RESULT_SET',
      dutyClarificationRequired: false
    } : {
      dutyClarificationRequired: true
    }),
    ...(policy ? {
      governedReference: policy.reference,
      matchType: products.length ? 'governed_reference_family' : result.matchType
    } : {})
  };
}

function applyGovernanceToSearchBody(body, rawReference) {
  if (!body || typeof body !== 'object') return body;
  const policy = governanceForReferences([rawReference]);
  const next = { ...body };

  if (Array.isArray(body.results)) {
    next.results = policy
      ? filterProductsForGovernance(body.results, policy).map(product => ({ ...product, duty: product.duty || policy.duty }))
      : body.results;
  }
  if (Array.isArray(body.candidates)) {
    next.candidates = policy
      ? filterProductsForGovernance(body.candidates, policy).map(product => ({ ...product, duty: product.duty || policy.duty }))
      : body.candidates;
  }

  const visibleProducts = Array.isArray(next.results) ? next.results : (Array.isArray(next.candidates) ? next.candidates : []);
  const resolvedDuty = policy?.duty || singleDutyFromProducts(visibleProducts);

  if (resolvedDuty) {
    next.resolved_duty = resolvedDuty;
    next.duty_resolution = policy ? 'REFERENCE_GOVERNANCE' : 'SINGLE_DUTY_RESULT_SET';
    next.duty_clarification_required = false;
  } else if (visibleProducts.length) {
    next.duty_clarification_required = true;
  }

  if (policy) next.governed_reference = policy.reference;
  return next;
}

let installed = false;
function installCatalogReferenceGovernance() {
  if (installed) return;
  const catalog = require('./bot-protocol-catalog');
  const original = catalog.searchByReferences;
  if (typeof original !== 'function') return;

  catalog.searchByReferences = async function governedSearchByReferences(references) {
    const result = await original(references);
    return applyGovernanceToCatalogResult(result, references);
  };
  installed = true;
  console.log('[part-search-governance] reference family governance + single-duty resolution enabled');
}

module.exports = {
  REFERENCE_GOVERNANCE,
  normalizeReference,
  governanceForReferences,
  filterProductsForGovernance,
  singleDutyFromProducts,
  applyGovernanceToCatalogResult,
  applyGovernanceToSearchBody,
  installCatalogReferenceGovernance
};
