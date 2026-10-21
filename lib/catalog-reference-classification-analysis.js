'use strict';

const { refsFrom } = require('./catalog-codigo-base-policy');

/** Explain numeric overlaps without treating different brand names as proof.
 * No database writes, conflict exemptions or certification decisions.
 */
function explainReferenceClassification(row) {
  if (!row || !Array.isArray(row.oem_codes) || !Array.isArray(row.competitor_codes)) {
    throw new TypeError('Both original reference arrays are required');
  }
  const oem = refsFrom(row.oem_codes);
  const competitor = refsFrom(row.competitor_codes);
  const byCode = new Map();
  for (const left of oem) {
    if (!left.normalizedCode) continue;
    for (const right of competitor) {
      if (left.normalizedCode !== right.normalizedCode) continue;
      const code = left.normalizedCode;
      if (!byCode.has(code)) byCode.set(code, new Map());
      const reason = !left.manufacturer || !right.manufacturer
        ? 'MANUFACTURER_MISSING'
        : left.manufacturer === right.manufacturer
          ? 'SAME_MANUFACTURER_IN_BOTH_COLUMNS'
          : 'DISTINCT_NAMES_REQUIRE_ENTITY_AND_ROLE_EVIDENCE';
      const pair = { oem_manufacturer: left.manufacturer,
        competitor_manufacturer: right.manufacturer, reason };
      byCode.get(code).set(JSON.stringify(pair), pair);
    }
  }
  return [...byCode].sort(([a], [b]) => a.localeCompare(b)).map(([code, pairs]) => ({
    sku: row.sku,
    normalized_reference: code,
    pairs: [...pairs.values()].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
    status: 'EVIDENCE_REQUIRED',
    references_mutated: false,
    conflict_exemption_allowed: false,
  }));
}

module.exports = { explainReferenceClassification };
