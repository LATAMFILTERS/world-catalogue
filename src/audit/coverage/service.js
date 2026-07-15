'use strict';

const { normalizeApplication } = require('./normalization');
const { evaluateCoverage } = require('./policies');
const { fetchApplicationPage } = require('./repository');

function unitKey(item) {
  return [item.segment, item.assetClass, item.make || 'UNKNOWN', item.model || 'UNKNOWN', item.yearFrom ?? 'UNKNOWN', item.yearTo ?? 'OPEN', item.fuel, item.market].join('|');
}

function buildUnits(rows, requestedSegment) {
  const groups = new Map();
  const quality = {
    rows_scanned: rows.length,
    rows_missing_year: 0,
    rows_unknown_fuel: 0,
    rows_unknown_market: 0,
    rows_unknown_segment: 0,
    rows_missing_make: 0,
    rows_missing_model: 0,
  };
  const uniqueSkus = new Set();

  for (const row of rows) {
    const item = normalizeApplication(row);
    if (requestedSegment !== 'ALL' && item.segment !== requestedSegment) continue;

    uniqueSkus.add(item.sku);
    if (item.yearFrom === null) quality.rows_missing_year += 1;
    if (item.fuel === 'unknown') quality.rows_unknown_fuel += 1;
    if (item.market === 'unknown') quality.rows_unknown_market += 1;
    if (item.segment === 'UNKNOWN') quality.rows_unknown_segment += 1;
    if (!item.make) quality.rows_missing_make += 1;
    if (!item.model) quality.rows_missing_model += 1;

    const key = unitKey(item);
    if (!groups.has(key)) {
      groups.set(key, {
        segment: item.segment,
        asset_class: item.assetClass,
        make: item.make,
        model: item.model,
        yearFrom: item.yearFrom,
        yearTo: item.yearTo,
        fuel: item.fuel,
        market: item.market,
        categories: new Set(),
        skus: new Set(),
        application_rows: 0,
        confidence: item.confidence,
      });
    }
    const group = groups.get(key);
    group.categories.add(item.category);
    group.skus.add(item.sku);
    group.application_rows += 1;
  }

  const units = [...groups.values()].map((group) => evaluateCoverage({
    ...group,
    categories: [...group.categories].sort(),
    skus: [...group.skus].sort().slice(0, 25),
    sku_count: group.skus.size,
  }));

  return { units, quality, uniqueSkus };
}

async function runCoverageAudit(client, options) {
  const rows = await fetchApplicationPage(client, options);
  const { units, quality, uniqueSkus } = buildUnits(rows, options.segment);

  const statusCounts = {};
  const segmentCounts = {};
  const categoryCounts = {};
  for (const unit of units) {
    statusCounts[unit.status] = (statusCounts[unit.status] || 0) + 1;
    segmentCounts[unit.segment] = (segmentCounts[unit.segment] || 0) + 1;
    for (const category of unit.categories) categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }

  const pageSkuCount = rows.length ? Number(rows[0].page_sku_count || 0) : 0;
  const nextAfterSku = rows.length ? rows[rows.length - 1].sku : null;

  return {
    pagination: {
      returned_application_rows: rows.length,
      returned_skus: pageSkuCount,
      has_more: pageSkuCount === options.limit,
      next_after_sku: nextAfterSku,
    },
    summary: {
      ...quality,
      unique_skus: uniqueSkus.size,
      coverage_units: units.length,
      status_counts: statusCounts,
      segment_counts: segmentCounts,
      category_unit_counts: categoryCounts,
    },
    priority_gaps: units
      .filter((unit) => unit.status !== 'complete')
      .sort((a, b) => b.priority_score - a.priority_score || String(a.make).localeCompare(String(b.make)) || String(a.model).localeCompare(String(b.model)))
      .slice(0, options.gapLimit),
  };
}

module.exports = { runCoverageAudit, buildUnits };
