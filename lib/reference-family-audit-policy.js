'use strict';

function normalizeValue(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function unique(values) {
  return [...new Set((values || []).map(value => String(value || '').trim()).filter(Boolean))];
}

function classifyReferenceFamily(row = {}) {
  const skuCount = Number(row.sku_count || 0);
  const duties = unique(row.duties);
  const filterTypes = unique(row.filter_types);
  const threads = unique(row.thread_sizes).map(normalizeValue).filter(Boolean);
  const states = unique(row.governance_states);
  const flags = [];

  if (skuCount > 5) flags.push('MANY_SKUS');
  if (duties.length > 1) flags.push('CROSS_DUTY');
  if (filterTypes.length > 1) flags.push('CROSS_FILTER_TYPE');
  if (threads.length > 1) flags.push('THREAD_CONFLICT');
  if (states.some(state => state !== 'CANONICAL_EVIDENCED')) flags.push('UNVERIFIED_BASE_GOVERNANCE');

  const minHeight = Number(row.min_height_mm || 0);
  const maxHeight = Number(row.max_height_mm || 0);
  if (minHeight > 0 && maxHeight / minHeight > 1.25) flags.push('HEIGHT_SPREAD');

  const minOd = Number(row.min_outer_diameter_mm || 0);
  const maxOd = Number(row.max_outer_diameter_mm || 0);
  if (minOd > 0 && maxOd / minOd > 1.15) flags.push('DIAMETER_SPREAD');

  const severity = flags.includes('CROSS_DUTY') || flags.includes('THREAD_CONFLICT')
    ? 'HIGH'
    : flags.includes('MANY_SKUS') || flags.includes('CROSS_FILTER_TYPE')
      ? 'MEDIUM'
      : flags.length
        ? 'REVIEW'
        : 'LOW';

  return { flags, severity };
}

function singleDuty(products) {
  const duties = unique((products || []).map(product => product && product.duty).filter(Boolean).map(value => String(value).toUpperCase()));
  return duties.length === 1 ? duties[0] : null;
}

module.exports = { normalizeValue, classifyReferenceFamily, singleDuty };
