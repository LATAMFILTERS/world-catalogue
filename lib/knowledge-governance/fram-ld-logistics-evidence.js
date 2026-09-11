'use strict';

function toNumber(value) {
  const n = Number(String(value ?? '').replace(/,/g, '').match(/-?\d+(?:\.\d+)?/)?.[0]);
  return Number.isFinite(n) ? n : null;
}

function normalizeUnit(label = '') {
  const s = String(label).toLowerCase();
  if (/inch|\bin\b/.test(s)) return 'in';
  if (/millimeter|\bmm\b/.test(s)) return 'mm';
  if (/centimeter|\bcm\b/.test(s)) return 'cm';
  if (/pound|\blb\b/.test(s)) return 'lb';
  if (/ounce|\boz\b/.test(s)) return 'oz';
  if (/kilogram|\bkg\b/.test(s)) return 'kg';
  if (/gram|\bg\b/.test(s)) return 'g';
  return null;
}

function extractLabelValue(text, labels) {
  for (const label of labels) {
    const re = new RegExp(`${label}\\s*(?:\\([^)]*\\))?\\s*[:|]?\\s*([0-9][0-9.,-]*)`, 'i');
    const m = String(text).match(re);
    if (m) return { value: toNumber(m[1]), raw: m[0], unit: normalizeUnit(m[0]) };
  }
  return { value: null, raw: null, unit: null };
}

function calculateVolume(length, width, height) {
  if (![length, width, height].every(v => Number.isFinite(v) && v > 0)) return null;
  return Number((length * width * height).toFixed(6));
}

function extractFramLdLogisticsEvidence(text = '') {
  const length = extractLabelValue(text, ['Length', 'Overall Length', 'Package Length', 'Case Length']);
  const width = extractLabelValue(text, ['Width', 'Package Width', 'Case Width']);
  const height = extractLabelValue(text, ['Height', 'Overall Height', 'Package Height', 'Case Height']);
  const diameter = extractLabelValue(text, ['Outside Diameter', 'Outer Diameter', 'Diameter']);
  const weight = extractLabelValue(text, ['Weight', 'Product Weight', 'Unit Weight', 'Package Weight']);
  const packQty = extractLabelValue(text, ['Package Quantity', 'Pack Quantity', 'Units Per Package', 'Unit Pack']);
  const caseQty = extractLabelValue(text, ['Case Quantity', 'Case Pack', 'Units Per Case']);
  const upc = String(text).match(/\bUPC\s*[:|]?\s*([0-9]{8,14})\b/i)?.[1] || null;
  const unit = length.unit || width.unit || height.unit || null;
  const unitVolume = unit && length.value && width.value && height.value
    ? { value: calculateVolume(length.value, width.value, height.value), unit: `${unit}3` }
    : null;

  return {
    product_dimensions: {
      length: length.value,
      width: width.value,
      height: height.value,
      diameter: diameter.value,
      dimensional_unit: unit
    },
    product_weight: { value: weight.value, unit: weight.unit },
    package_quantity: packQty.value,
    case_quantity: caseQty.value,
    upc,
    unit_volume: unitVolume,
    source_role: 'private_logistics_evidence',
    public_exposure_allowed: false,
    logistics_auto_write_allowed: false,
    requires_application_and_market_validation: true
  };
}

module.exports = {
  extractFramLdLogisticsEvidence,
  calculateVolume,
  normalizeUnit
};
