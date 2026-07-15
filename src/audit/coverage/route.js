'use strict';

const { runCoverageAudit } = require('./service');
const { startFullCoverageIntelligence, getLatestCoverageIntelligence, publicState, ENGINE_VERSION } = require('./intelligence');

function isAdmin(req) {
  const configured = process.env.ADMIN_KEY;
  if (!configured) return false;
  const authorization = req.get('authorization') || '';
  return authorization.startsWith('Bearer ') && authorization.slice(7).trim() === configured;
}

function registerCoverageRoutes({ app, pool, limiter }) {
  app.get('/api/audit/coverage-engine', limiter, async (req, res) => {
    const make = String(req.query.make || '').trim().toUpperCase();
    const segment = String(req.query.segment || req.query.duty || 'ALL').trim().toUpperCase();
    const limit = Math.min(Math.max(Number(req.query.limit) || 250, 25), 750);
    const gapLimit = Math.min(Math.max(Number(req.query.gap_limit) || 100, 10), 500);
    const afterSku = String(req.query.after_sku || '').trim().toUpperCase();

    if (make && !/^[A-Z0-9 ._-]{2,80}$/.test(make)) return res.status(400).json({ success: false, error: 'Invalid make.' });
    if (!['LIGHT_DUTY', 'HEAVY_DUTY', 'INDUSTRIAL', 'UNKNOWN', 'ALL'].includes(segment)) return res.status(400).json({ success: false, error: 'Invalid segment.' });
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

  app.post('/api/audit/coverage-intelligence/run', limiter, (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ success: false, error: 'forbidden' });

    const segment = String(req.body?.segment || 'ALL').trim().toUpperCase();
    const make = String(req.body?.make || '').trim().toUpperCase();
    if (!['LIGHT_DUTY', 'HEAVY_DUTY', 'INDUSTRIAL', 'UNKNOWN', 'ALL'].includes(segment)) return res.status(400).json({ success: false, error: 'Invalid segment.' });
    if (make && !/^[A-Z0-9 ._-]{2,80}$/.test(make)) return res.status(400).json({ success: false, error: 'Invalid make.' });

    const started = startFullCoverageIntelligence(pool, {
      segment,
      make,
      batchSize: req.body?.batch_size,
      gapLimit: req.body?.gap_limit,
      reviewLimit: req.body?.review_limit,
    });

    return res.status(started ? 202 : 409).json({
      success: started,
      engine_version: ENGINE_VERSION,
      message: started ? 'Full catalogue coverage intelligence audit started.' : 'An audit is already running.',
      ...publicState(false),
    });
  });

  app.get('/api/audit/coverage-intelligence/status', limiter, async (_req, res) => {
    try {
      const result = await getLatestCoverageIntelligence(pool);
      return res.json({ success: true, ...result });
    } catch (error) {
      console.error('[coverage-intelligence-status]', error.message);
      return res.status(500).json({ success: false, error: 'Unable to load coverage intelligence status.' });
    }
  });
}

module.exports = { registerCoverageRoutes };