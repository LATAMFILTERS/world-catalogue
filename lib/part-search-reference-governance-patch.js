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
  const policy = governanceForReferences(references);
  if (!policy || !result || typeof result !== 'object') return result;

  const products = filterProductsForGovernance(result.products, policy).map(product => ({
    ...product,
    duty: product.duty || policy.duty
  }));

  return {
    ...result,
    products,
    resolvedDuty: policy.duty,
    dutyResolution: 'REFERENCE_GOVERNANCE',
    governedReference: policy.reference,
    matchType: products.length ? 'governed_reference_family' : result.matchType
  };
}

function applyGovernanceToSearchBody(body, rawReference) {
  const policy = governanceForReferences([rawReference]);
  if (!policy || !body || typeof body !== 'object') return body;

  const next = { ...body };
  if (Array.isArray(body.results)) {
    next.results = filterProductsForGovernance(body.results, policy).map(product => ({
      ...product,
      duty: product.duty || policy.duty
    }));
  }
  if (Array.isArray(body.candidates)) {
    next.candidates = filterProductsForGovernance(body.candidates, policy).map(product => ({
      ...product,
      duty: product.duty || policy.duty
    }));
  }

  next.resolved_duty = policy.duty;
  next.duty_resolution = 'REFERENCE_GOVERNANCE';
  next.governed_reference = policy.reference;
  next.duty_clarification_required = false;
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
  console.log('[part-search-governance] ambiguous reference family governance enabled');
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
