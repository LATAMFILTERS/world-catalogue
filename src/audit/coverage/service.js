'use strict';

const { normalizeApplication } = require('./normalization');
const { evaluateCoverage } = require('./policies');
const { fetchApplicationPage } = require('./repository');

function unitKey(item) {
  return [item.segment, item.assetClass, item.make || 'UNKNOWN', item.model || 'UNKNOWN', item.yearFrom ?? 'UNKNOWN', item.yearTo ?? 'OPEN', item.fuel, item.market].join('|');
}

function createCoverageAccumulator(requestedSegment = 'ALL') {
  return {
    requestedSegment,
    groups: new Map(),
    reviewBySku: new Map(),
    uniqueSkus: new Set(),
    quality: {
      rows_scanned: 0,
      operational_rows: 0,
      quarantined_rows: 0,
      rows_missing_year: 0,
      rows_unknown_fuel: 0,
      rows_unknown_market: 0,
      rows_unknown_segment: 0,
      rows_missing_make: 0,
      rows_missing_model: 0,
    },
  };
}

function reviewReasons(item) {
  const reasons = [];
  if (item.segment === 'UNKNOWN') reasons.push('unclassified_asset');
  if (!item.make) reasons.push('missing_make');
  if (!item.model) reasons.push('missing_model');
  if (item.category === 'hydraulic') reasons.push('possible_hydraulic_product_without_confirmed_equipment');
  if (item.category === 'other') reasons.push('uncertain_product_category');
  return reasons;
}

function addRows(accumulator, rows) {
  accumulator.quality.rows_scanned += rows.length;

  for (const row of rows) {
    const item = normalizeApplication(row);
    if (accumulator.requestedSegment !== 'ALL' && accumulator.requestedSegment !== 'UNKNOWN' && item.segment !== accumulator.requestedSegment) continue;

    const quarantined = item.segment === 'UNKNOWN' || !item.make || !item.model;
    if (quarantined) {
      accumulator.quality.quarantined_rows += 1;
      if (item.segment === 'UNKNOWN') accumulator.quality.rows_unknown_segment += 1;
      if (!item.make) accumulator.quality.rows_missing_make += 1;
      if (!item.model) accumulator.quality.rows_missing_model += 1;
      if (!accumulator.reviewBySku.has(item.sku)) {
        accumulator.reviewBySku.set(item.sku, {
          sku: item.sku,
          category: item.category,
          segment: item.segment,
          make: item.make,
          model: item.model,
          reasons: new Set(),
          application_rows: 0,
          likely_hydraulic: item.category === 'hydraulic',
        });
      }
      const review = accumulator.reviewBySku.get(item.sku);
      for (const reason of reviewReasons(item)) review.reasons.add(reason);
      review.application_rows += 1;
      continue;
    }

    if (accumulator.requestedSegment === 'UNKNOWN') continue;

    accumulator.quality.operational_rows += 1;
    accumulator.uniqueSkus.add(item.sku);
    if (item.yearFrom === null) accumulator.quality.rows_missing_year += 1;
    if (item.fuel === 'unknown') accumulator.quality.rows_unknown_fuel += 1;
    if (item.market === 'unknown') accumulator.quality.rows_unknown_market += 1;

    const key = unitKey(item);
    if (!accumulator.groups.has(key)) {
      accumulator.groups.set(key, {
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
    const group = accumulator.groups.get(key);
    group.categories.add(item.category);
    group.skus.add(item.sku);
    group.application_rows += 1;
  }

  return accumulator;
}

function materializeUnits(accumulator) {
  return [...accumulator.groups.values()].map((group) => evaluateCoverage({
    ...group,
    categories: [...group.categories].sort(),
    skus: [...group.skus].sort().slice(0, 25),
    sku_count: group.skus.size,
  }));
}

function finalizeCoverage(accumulator, { gapLimit = 100, reviewLimit = 250 } = {}) {
  const units = materializeUnits(accumulator);
  const statusCounts = {};
  const segmentCounts = {};
  const categoryCounts = {};
  const makeStats = new Map();

  for (const unit of units) {
    statusCounts[unit.status] = (statusCounts[unit.status] || 0) + 1;
    segmentCounts[unit.segment] = (segmentCounts[unit.segment] || 0) + 1;
    for (const category of unit.categories) categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    if (!makeStats.has(unit.make)) makeStats.set(unit.make, { make: unit.make, units: 0, complete: 0, partial: 0, needs_context: 0, opportunity_score: 0 });
    const stat = makeStats.get(unit.make);
    stat.units += 1;
    if (unit.status === 'complete') stat.complete += 1;
    if (unit.status === 'partial' || unit.status === 'no_core_coverage') stat.partial += 1;
    if (unit.status === 'needs_context' || unit.status === 'needs_year') stat.needs_context += 1;
    stat.opportunity_score += unit.missing_required_categories.length * Math.max(1, unit.sku_count);
  }

  const priorityGaps = units
    .filter((unit) => unit.status === 'partial' || unit.status === 'no_core_coverage')
    .sort((a, b) => b.priority_score - a.priority_score || String(a.make).localeCompare(String(b.make)) || String(a.model).localeCompare(String(b.model)))
    .slice(0, gapLimit);

  const dataQualityQueue = units
    .filter((unit) => unit.status === 'needs_context' || unit.status === 'needs_year')
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, gapLimit);

  const reviewQueue = [...accumulator.reviewBySku.values()]
    .map((item) => ({ ...item, reasons: [...item.reasons].sort() }))
    .sort((a, b) => Number(b.likely_hydraulic) - Number(a.likely_hydraulic) || b.application_rows - a.application_rows || a.sku.localeCompare(b.sku))
    .slice(0, reviewLimit);

  return {
    summary: {
      ...accumulator.quality,
      unique_skus: accumulator.uniqueSkus.size,
      review_skus: accumulator.reviewBySku.size,
      coverage_units: units.length,
      status_counts: statusCounts,
      segment_counts: segmentCounts,
      category_unit_counts: categoryCounts,
    },
    coverage_matrix: {
      by_segment: segmentCounts,
      by_category: categoryCounts,
      by_status: statusCounts,
    },
    priority_gaps: priorityGaps,
    data_quality_queue: dataQualityQueue,
    review_queue: reviewQueue,
    opportunities_by_make: [...makeStats.values()]
      .sort((a, b) => b.opportunity_score - a.opportunity_score || b.units - a.units || a.make.localeCompare(b.make))
      .slice(0, 100),
  };
}

function buildUnits(rows, requestedSegment) {
  const accumulator = createCoverageAccumulator(requestedSegment);
  addRows(accumulator, rows);
  const report = finalizeCoverage(accumulator, { gapLimit: Number.MAX_SAFE_INTEGER, reviewLimit: Number.MAX_SAFE_INTEGER });
  return {
    units: materializeUnits(accumulator),
    reviewQueue: report.review_queue,
    quality: report.summary,
    uniqueSkus: accumulator.uniqueSkus,
    reviewSkus: new Set(accumulator.reviewBySku.keys()),
  };
}

async function runCoverageAudit(client, options) {
  const rows = await fetchApplicationPage(client, options);
  const accumulator = createCoverageAccumulator(options.segment);
  addRows(accumulator, rows);
  const report = finalizeCoverage(accumulator, { gapLimit: options.gapLimit, reviewLimit: options.reviewLimit || 250 });
  const pageSkuCount = rows.length ? Number(rows[0].page_sku_count || 0) : 0;
  const nextAfterSku = rows.length ? rows[rows.length - 1].sku : null;

  return {
    pagination: {
      returned_application_rows: rows.length,
      returned_skus: pageSkuCount,
      has_more: pageSkuCount === options.limit,
      next_after_sku: nextAfterSku,
    },
    ...report,
  };
}

module.exports = {
  runCoverageAudit,
  buildUnits,
  createCoverageAccumulator,
  addRows,
  finalizeCoverage,
};