'use strict';

const REFERENCE_GOVERNANCE = Object.freeze({
  '1R1808': Object.freeze({
    duty: 'HEAVY_DUTY',
    approvedSkus: Object.freeze(['EL81808', 'EL84005', 'EL84105', 'EL87405', 'EL87505']),
    reason: 'Verified HD reference family; exclude secondary cross-reference contamination'
  }),
  '1R0732': Object.freeze({
    duty: 'HEAVY_DUTY',
    approvedSkus: Object.freeze(['EH66700']),
    reason: 'EH66700 codigo_base (P556700) is the direct Donaldson match for CAT 1R-0732; ' +
      'EH60926/EH63993 are same-envelope alternates (P550926/P573993) surfaced via alternatives, not duplicate primaries'
  })
});

const MAX_SAFE_OEM_CODES = 1000;
const MAX_SAFE_COMPETITOR_CODES = 500;
const MAX_VISIBLE_REFERENCE_RESULTS = 8;

function normalizeReference(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeThread(value) {
  return normalizeReference(value);
}

function normalizeType(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');
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

function arrayLength(value) {
  return Array.isArray(value) ? value.length : 0;
}

function isDirectReferenceProduct(product, references) {
  const normalized = new Set((references || []).map(normalizeReference).filter(Boolean));
  if (!normalized.size || !product) return false;
  return normalized.has(normalizeReference(product.sku))
    || normalized.has(normalizeReference(product.codigo_base))
    || String(product.protocol_match_type || '').toLowerCase() === 'direct_reference';
}

function isPathologicallyContaminated(product) {
  if (!product || typeof product !== 'object') return false;
  return arrayLength(product.oem_codes) > MAX_SAFE_OEM_CODES
    || arrayLength(product.competitor_codes) > MAX_SAFE_COMPETITOR_CODES;
}

function physicalSignature(product) {
  if (!product || typeof product !== 'object') return null;
  const duty = normalizeType(product.duty);
  const filterType = normalizeType(product.filter_type);
  const thread = normalizeThread(product.thread_size);
  if (!duty || !filterType) return null;
  return `${duty}|${filterType}|${thread || 'NO_THREAD'}`;
}

function filterGlobalReferenceSafety(products, references) {
  const input = Array.isArray(products) ? products : [];
  if (input.length <= 1) {
    return { products: input, status: 'SAFE_SINGLE_RESULT', removed: 0 };
  }

  const direct = input.filter(product => isDirectReferenceProduct(product, references));
  const secondary = input.filter(product => !isDirectReferenceProduct(product, references));
  const nonPathologicalSecondary = secondary.filter(product => !isPathologicallyContaminated(product));
  let removed = secondary.length - nonPathologicalSecondary.length;

  if (direct.length) {
    const directSignatures = new Set(direct.map(physicalSignature).filter(Boolean));
    const compatibleSecondary = directSignatures.size
      ? nonPathologicalSecondary.filter(product => directSignatures.has(physicalSignature(product)))
      : [];
    removed += nonPathologicalSecondary.length - compatibleSecondary.length;
    return {
      products: [...direct, ...compatibleSecondary].slice(0, MAX_VISIBLE_REFERENCE_RESULTS),
      status: removed ? 'DIRECT_ANCHOR_FILTERED' : 'DIRECT_ANCHOR_SAFE',
      removed
    };
  }

  const buckets = new Map();
  const unclassified = [];
  for (const product of nonPathologicalSecondary) {
    const signature = physicalSignature(product);
    if (!signature) {
      unclassified.push(product);
      continue;
    }
    if (!buckets.has(signature)) buckets.set(signature, []);
    buckets.get(signature).push(product);
  }

  const ranked = [...buckets.entries()].sort((a, b) => b[1].length - a[1].length);
  if (!ranked.length) {
    return {
      products: [],
      status: 'AMBIGUOUS_NO_PHYSICAL_SIGNATURE',
      removed: input.length
    };
  }

  if (ranked.length === 1) {
    removed += unclassified.length;
    return {
      products: ranked[0][1].slice(0, MAX_VISIBLE_REFERENCE_RESULTS),
      status: removed ? 'SINGLE_PHYSICAL_FAMILY_FILTERED' : 'SINGLE_PHYSICAL_FAMILY_SAFE',
      removed
    };
  }

  const topCount = ranked[0][1].length;
  const secondCount = ranked[1][1].length;
  if (topCount >= 2 && topCount > secondCount) {
    const selected = ranked[0][1];
    removed += nonPathologicalSecondary.length - selected.length;
    return {
      products: selected.slice(0, MAX_VISIBLE_REFERENCE_RESULTS),
      status: 'DOMINANT_PHYSICAL_FAMILY',
      removed
    };
  }

  return {
    products: [],
    status: 'AMBIGUOUS_PHYSICAL_FAMILIES_REVIEW_REQUIRED',
    removed: input.length
  };
}

function applyGovernanceToCatalogResult(result, references) {
  if (!result || typeof result !== 'object') return result;
  const policy = governanceForReferences(references);
  const safety = filterGlobalReferenceSafety(result.products, references);
  const products = policy
    ? filterProductsForGovernance(safety.products, policy).map(product => ({ ...product, duty: product.duty || policy.duty }))
    : safety.products;
  const resolvedDuty = policy?.duty || singleDutyFromProducts(products);

  return {
    ...result,
    products,
    referenceSafetyStatus: safety.status,
    referenceSafetyRemoved: safety.removed,
    ...(resolvedDuty ? {
      resolvedDuty,
      dutyResolution: policy ? 'REFERENCE_GOVERNANCE' : 'SINGLE_DUTY_RESULT_SET',
      dutyClarificationRequired: false
    } : {
      dutyClarificationRequired: products.length > 0
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

  // body.candidates (AMBIGUOUS resolution branch) holds plain SKU strings for
  // disambiguation, not full product objects — the physical-signature safety
  // filter below needs duty/filter_type/thread_size, so it only ever applies
  // to body.results. Leave candidates untouched so a real disambiguation list
  // isn't clobbered by a safety pass computed over an unrelated (often empty)
  // results array.
  const sourceProducts = Array.isArray(body.results) ? body.results : [];
  const safety = filterGlobalReferenceSafety(sourceProducts, [rawReference]);
  const safeProducts = policy
    ? filterProductsForGovernance(safety.products, policy).map(product => ({ ...product, duty: product.duty || policy.duty }))
    : safety.products;

  if (Array.isArray(body.results)) next.results = safeProducts;

  next.reference_safety_status = safety.status;
  next.reference_safety_removed = safety.removed;

  const resolvedDuty = policy?.duty || singleDutyFromProducts(safeProducts);
  if (resolvedDuty) {
    next.resolved_duty = resolvedDuty;
    next.duty_resolution = policy ? 'REFERENCE_GOVERNANCE' : 'SINGLE_DUTY_RESULT_SET';
    next.duty_clarification_required = false;
  } else if (safeProducts.length) {
    next.duty_clarification_required = true;
  } else {
    next.duty_clarification_required = false;
    if (safety.status.includes('AMBIGUOUS')) next.reference_review_required = true;
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
  console.log('[part-search-governance] global reference-family safety + single-duty resolution enabled');
}

module.exports = {
  REFERENCE_GOVERNANCE,
  MAX_SAFE_OEM_CODES,
  MAX_SAFE_COMPETITOR_CODES,
  normalizeReference,
  governanceForReferences,
  filterProductsForGovernance,
  singleDutyFromProducts,
  isDirectReferenceProduct,
  isPathologicallyContaminated,
  physicalSignature,
  filterGlobalReferenceSafety,
  applyGovernanceToCatalogResult,
  applyGovernanceToSearchBody,
  installCatalogReferenceGovernance
};
