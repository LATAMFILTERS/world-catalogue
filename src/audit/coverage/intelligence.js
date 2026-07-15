'use strict';

const { fetchApplicationPage, saveCoverageReport, loadLatestCoverageReport } = require('./repository');
const { createCoverageAccumulator, addRows, finalizeCoverage } = require('./service');

const ENGINE_VERSION = 'coverage-intelligence-phase1-v1';
const state = {
  status: 'idle',
  started_at: null,
  completed_at: null,
  pages_processed: 0,
  skus_processed: 0,
  application_rows_processed: 0,
  current_after_sku: null,
  error: null,
  report_id: null,
  report: null,
};

function publicState(includeReport = false) {
  const payload = {
    engine_version: ENGINE_VERSION,
    status: state.status,
    started_at: state.started_at,
    completed_at: state.completed_at,
    progress: {
      pages_processed: state.pages_processed,
      skus_processed: state.skus_processed,
      application_rows_processed: state.application_rows_processed,
      current_after_sku: state.current_after_sku,
    },
    error: state.error,
    report_id: state.report_id,
  };
  if (includeReport) payload.report = state.report;
  return payload;
}

async function runFullCoverageIntelligence(pool, options = {}) {
  if (state.status === 'running') return publicState(false);

  const batchSize = Math.min(Math.max(Number(options.batchSize) || 100, 25), 250);
  const gapLimit = Math.min(Math.max(Number(options.gapLimit) || 500, 50), 2000);
  const reviewLimit = Math.min(Math.max(Number(options.reviewLimit) || 1000, 100), 5000);
  const segment = options.segment || 'ALL';
  const make = options.make || '';

  Object.assign(state, {
    status: 'running',
    started_at: new Date().toISOString(),
    completed_at: null,
    pages_processed: 0,
    skus_processed: 0,
    application_rows_processed: 0,
    current_after_sku: null,
    error: null,
    report_id: null,
    report: null,
  });

  const accumulator = createCoverageAccumulator(segment);
  let afterSku = '';

  try {
    while (true) {
      const client = await pool.connect();
      let rows;
      try {
        await client.query("SET LOCAL statement_timeout = '30000'");
        rows = await fetchApplicationPage(client, { afterSku, limit: batchSize, make });
      } finally {
        client.release();
      }

      if (!rows.length) break;

      addRows(accumulator, rows);
      const pageSkuCount = Number(rows[0].page_sku_count || 0);
      const nextAfterSku = rows[rows.length - 1].sku;

      state.pages_processed += 1;
      state.skus_processed += pageSkuCount;
      state.application_rows_processed += rows.length;
      state.current_after_sku = nextAfterSku;

      if (pageSkuCount < batchSize || !nextAfterSku || nextAfterSku === afterSku) break;
      afterSku = nextAfterSku;
      await new Promise((resolve) => setImmediate(resolve));
    }

    const report = {
      generated_at: new Date().toISOString(),
      engine_version: ENGINE_VERSION,
      scope: { make: make || 'ALL', segment },
      policy: {
        operational_data_only: true,
        unknown_records_quarantined: true,
        unknown_records_are_not_counted_as_coverage_gaps: true,
        catalogue_source: 'elimfilters_catalog.vehicle_applications',
      },
      scan: {
        pages_processed: state.pages_processed,
        skus_processed: state.skus_processed,
        application_rows_processed: state.application_rows_processed,
        final_sku: state.current_after_sku,
      },
      ...finalizeCoverage(accumulator, { gapLimit, reviewLimit }),
    };

    const completedAt = new Date().toISOString();
    const client = await pool.connect();
    try {
      state.report_id = await saveCoverageReport(client, {
        engineVersion: ENGINE_VERSION,
        status: 'completed',
        startedAt: state.started_at,
        completedAt,
        report,
      });
    } finally {
      client.release();
    }

    state.status = 'completed';
    state.completed_at = completedAt;
    state.report = report;
    return publicState(true);
  } catch (error) {
    state.status = 'failed';
    state.completed_at = new Date().toISOString();
    state.error = error.stack || error.message;
    try {
      const client = await pool.connect();
      try {
        state.report_id = await saveCoverageReport(client, {
          engineVersion: ENGINE_VERSION,
          status: 'failed',
          startedAt: state.started_at,
          completedAt: state.completed_at,
          error: state.error,
        });
      } finally {
        client.release();
      }
    } catch (persistError) {
      console.error('[coverage-intelligence-persist]', persistError.message);
    }
    throw error;
  }
}

function startFullCoverageIntelligence(pool, options = {}) {
  if (state.status === 'running') return false;

  // Start the async function directly. It sets state.status='running' before
  // reaching its first await, so the POST response and immediate status check
  // cannot incorrectly report "idle" after accepting the run.
  runFullCoverageIntelligence(pool, options).catch((error) => {
    console.error('[coverage-intelligence-phase1]', error.stack || error.message);
  });

  return true;
}

async function getLatestCoverageIntelligence(pool) {
  if (state.status === 'running' || state.report) return publicState(true);
  const client = await pool.connect();
  try {
    const latest = await loadLatestCoverageReport(client);
    if (!latest) return publicState(false);
    return {
      engine_version: latest.engine_version,
      status: latest.status,
      started_at: latest.started_at,
      completed_at: latest.completed_at,
      report_id: Number(latest.id),
      error: latest.error,
      report: latest.report,
    };
  } finally {
    client.release();
  }
}

module.exports = {
  ENGINE_VERSION,
  startFullCoverageIntelligence,
  runFullCoverageIntelligence,
  getLatestCoverageIntelligence,
  publicState,
};
