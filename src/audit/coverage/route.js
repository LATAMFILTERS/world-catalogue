'use strict';

const { runCoverageAudit } = require('./service');

function registerCoverageRoutes({ app, pool, limiter }) {
  app.get('/api/audit/coverage-engine', limiter, async (req, res) => {
    const make = String(req.query.make || '').trim().toUpperCase();
    const segment = String(req.query.segment || req.query.duty || 'ALL').trim().toUpperCase();
    const limit = Math.min(Math.max(Number(req.query.limit) || 250, 25), 750);
    const gapLimit = Math.min(Math.max(Number(req.query.gap_limit) || 100, 10), 500);
    const afterSku = String(req.query.after_sku || '').trim().toUpperCase();

    if (make && !/^[A-Z0-9 ._-]{2,80}$/.test(make)) return res.status(400).json({ success: false, error: 'Invalid make.' });
    if (!['LIGHT_DUTY', 'HEAVY_DUTY', 'INDUSTRIAL', 'UNKNOWN', 'ALL'].includes(segment)) {
      return res.status(400).json({ success: false, error: 'Invalid segment.' });
    }
    if (afterSku && !/^[A-Z0-9_-]{2,100}$/.test(afterSku)) return res.status(400).json({ success: false, error: 'Invalid after_sku.' });

    const client = await pool.connect();
    try {
      await client.query("SET LOCAL statement_timeout = '12000'");
      const report = await runCoverageAudit(client, { make, segment, limit, gapLimit, afterSku });
      return res.json({
        success: true,
        engine_version: 'coverage-audit-domain-v2-quarantine',
        read_only: true,
        scope: { make: make || 'ALL', segment, sku_limit: limit, gap_limit: gapLimit, after_sku: afterSku || null },
        policy: {
          operational_data_only: true,
          unknown_records_quarantined: true,
          unknown_records_are_not_counted_as_coverage_gaps: true,
        },
        limitation: 'This audit evaluates stored applications after domain normalization. Completely absent assets require an external reference universe.',
        ...report,
      });
    } catch (error) {
      console.error('[coverage-audit-domain]', error.code || '', error.message);
      return res.status(500).json({ success: false, error: 'Coverage audit engine failed', code: error.code || null, detail: error.message });
    } finally {
      client.release();
    }
  });
}

module.exports = { registerCoverageRoutes };