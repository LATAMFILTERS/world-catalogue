const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');

const ALLOWED_SOURCES = new Set(['gsc', 'ga4', 'llm-referral', 'nodal-center', 'commercial-rollup']);
const MAX_ROWS = Number(process.env.CONTENT_INTELLIGENCE_MAX_ROWS || 1000);
const BATCH_SIZE = Number(process.env.CONTENT_INTELLIGENCE_WORKER_BATCH_SIZE || 20);
const WORKER_INTERVAL_MS = Number(process.env.CONTENT_INTELLIGENCE_WORKER_INTERVAL_MS || 5000);

function dbPool() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) return null;
  return new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.CONTENT_INTELLIGENCE_DB_POOL_MAX || 6),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

function canonicalize(value) {
  try {
    const url = new URL(String(value));
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host !== 'elimfilters.com') return null;
    url.protocol = 'https:';
    url.hostname = 'elimfilters.com';
    url.search = '';
    url.hash = '';
    url.pathname = url.pathname.replace(/\/+/g, '/');
    if (url.pathname !== '/' && !url.pathname.endsWith('/')) url.pathname += '/';
    return url.toString();
  } catch {
    return null;
  }
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeRow(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
  const canonicalUrl = canonicalize(row.canonicalUrl || row.canonical_url || row.page || row.url);
  if (!canonicalUrl) return null;
  const metricDate = String(row.metricDate || row.metric_date || row.date || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(metricDate)) return null;
  return {
    canonicalUrl,
    metricDate,
    entityType: String(row.entityType || row.entity_type || '').slice(0, 80) || null,
    entityKey: String(row.entityKey || row.entity_key || '').slice(0, 255) || null,
    nodalSourcePath: String(row.nodalSourcePath || row.nodal_source_path || '').slice(0, 1024) || null,
    knowledgeGraphEntityId: String(row.knowledgeGraphEntityId || row.knowledge_graph_entity_id || '').slice(0, 255) || null,
    gscClicks: Math.max(0, Math.trunc(finiteNumber(row.gscClicks ?? row.gsc_clicks))),
    gscImpressions: Math.max(0, Math.trunc(finiteNumber(row.gscImpressions ?? row.gsc_impressions))),
    gscCtr: row.gscCtr ?? row.gsc_ctr ?? null,
    gscPosition: row.gscPosition ?? row.gsc_position ?? null,
    ga4Sessions: Math.max(0, Math.trunc(finiteNumber(row.ga4Sessions ?? row.ga4_sessions))),
    ga4EngagedSessions: Math.max(0, Math.trunc(finiteNumber(row.ga4EngagedSessions ?? row.ga4_engaged_sessions))),
    ga4KeyEvents: Math.max(0, Math.trunc(finiteNumber(row.ga4KeyEvents ?? row.ga4_key_events))),
    llmSessions: Math.max(0, Math.trunc(finiteNumber(row.llmSessions ?? row.llm_sessions))),
    conversionCount: Math.max(0, Math.trunc(finiteNumber(row.conversionCount ?? row.conversion_count))),
    leadCount: Math.max(0, Math.trunc(finiteNumber(row.leadCount ?? row.lead_count))),
    opportunityCount: Math.max(0, Math.trunc(finiteNumber(row.opportunityCount ?? row.opportunity_count))),
    metadata: row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata) ? row.metadata : {},
  };
}

async function ensureSchema(pool) {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS content_intelligence_batch_outbox (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      idempotency_key text NOT NULL UNIQUE,
      source text NOT NULL,
      window_start date,
      window_end date,
      row_count integer NOT NULL,
      payload jsonb NOT NULL,
      delivery_status text NOT NULL DEFAULT 'PENDING',
      delivery_attempts integer NOT NULL DEFAULT 0,
      next_attempt_at timestamptz NOT NULL DEFAULT now(),
      locked_at timestamptz,
      locked_by text,
      last_delivery_error text,
      crm_response jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      delivered_at timestamptz
    );
    CREATE INDEX IF NOT EXISTS idx_ci_batch_outbox_ready
      ON content_intelligence_batch_outbox(delivery_status, next_attempt_at, created_at)
      WHERE delivery_status IN ('PENDING','RETRY','PROCESSING');
  `);
}

function checksum(source, rows, windowStart, windowEnd) {
  return crypto.createHash('sha256')
    .update(JSON.stringify({ source, rows, windowStart, windowEnd }))
    .digest('hex');
}

async function persistBatch(pool, batch) {
  const result = await pool.query(
    `INSERT INTO content_intelligence_batch_outbox
      (idempotency_key, source, window_start, window_end, row_count, payload)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb)
     ON CONFLICT (idempotency_key) DO UPDATE SET idempotency_key=EXCLUDED.idempotency_key
     RETURNING id, delivery_status, created_at`,
    [batch.idempotencyKey, batch.source, batch.windowStart, batch.windowEnd, batch.rows.length, JSON.stringify(batch)]
  );
  return result.rows[0];
}

function delaySeconds(attempts) {
  return Math.min(3600, 10 * Math.pow(2, Math.min(Number(attempts || 0), 8)));
}

async function claim(pool, workerId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `WITH picked AS (
         SELECT id
         FROM content_intelligence_batch_outbox
         WHERE delivery_status IN ('PENDING','RETRY','PROCESSING')
           AND next_attempt_at <= now()
           AND (locked_at IS NULL OR locked_at < now() - interval '10 minutes')
         ORDER BY created_at ASC
         FOR UPDATE SKIP LOCKED
         LIMIT $1
       )
       UPDATE content_intelligence_batch_outbox q
       SET delivery_status='PROCESSING', locked_at=now(), locked_by=$2
       FROM picked
       WHERE q.id=picked.id
       RETURNING q.id, q.payload, q.delivery_attempts`,
      [BATCH_SIZE, workerId]
    );
    await client.query('COMMIT');
    return result.rows;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

async function deliver(pool, row) {
  const endpoint = process.env.CRM_CONTENT_INTELLIGENCE_URL;
  if (!endpoint || typeof fetch !== 'function') return false;
  try {
    const headers = { 'content-type': 'application/json' };
    if (process.env.CRM_INGEST_TOKEN) headers.authorization = `Bearer ${process.env.CRM_INGEST_TOKEN}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(row.payload),
      signal: AbortSignal.timeout(Number(process.env.CONTENT_INTELLIGENCE_CRM_TIMEOUT_MS || 15000)),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`CRM ${response.status}: ${text.slice(0, 500)}`);
    let parsed = {};
    try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { body: text.slice(0, 500) }; }
    await pool.query(
      `UPDATE content_intelligence_batch_outbox
       SET delivery_status='DELIVERED', delivery_attempts=delivery_attempts+1,
           delivered_at=now(), crm_response=$2::jsonb, last_delivery_error=NULL,
           locked_at=NULL, locked_by=NULL
       WHERE id=$1`,
      [row.id, JSON.stringify(parsed)]
    );
    return true;
  } catch (error) {
    const delay = delaySeconds(Number(row.delivery_attempts || 0) + 1);
    await pool.query(
      `UPDATE content_intelligence_batch_outbox
       SET delivery_status='RETRY', delivery_attempts=delivery_attempts+1,
           next_attempt_at=now() + ($3 || ' seconds')::interval,
           last_delivery_error=$2, locked_at=NULL, locked_by=NULL
       WHERE id=$1`,
      [row.id, String(error.message || error).slice(0, 1000), String(delay)]
    );
    return false;
  }
}

function installContentIntelligence(app, requireAdmin) {
  const pool = dbPool();
  ensureSchema(pool).catch((error) => console.error('[content-intelligence] schema init failed:', error.message));
  const json = express.json({ limit: process.env.CONTENT_INTELLIGENCE_BODY_LIMIT || '5mb' });

  app.post('/api/admin/content-intelligence/batch', requireAdmin, json, async (req, res) => {
    try {
      if (!pool) return res.status(503).json({ error: 'database_not_configured' });
      const source = String(req.body?.source || '').toLowerCase();
      if (!ALLOWED_SOURCES.has(source)) return res.status(400).json({ error: 'invalid_source' });
      if (!Array.isArray(req.body?.rows) || req.body.rows.length < 1 || req.body.rows.length > MAX_ROWS) {
        return res.status(400).json({ error: 'rows_out_of_range', maxRows: MAX_ROWS });
      }
      const rows = req.body.rows.map(normalizeRow).filter(Boolean);
      const rejected = req.body.rows.length - rows.length;
      if (!rows.length) return res.status(400).json({ error: 'no_valid_rows' });
      const windowStart = String(req.body.windowStart || req.body.window_start || rows[0].metricDate).slice(0, 10);
      const windowEnd = String(req.body.windowEnd || req.body.window_end || rows[rows.length - 1].metricDate).slice(0, 10);
      const idempotencyKey = String(req.body.idempotencyKey || req.body.idempotency_key || checksum(source, rows, windowStart, windowEnd)).slice(0, 128);
      const record = await persistBatch(pool, { source, windowStart, windowEnd, idempotencyKey, rows });
      res.status(202).json({ accepted: true, batchId: record.id, idempotencyKey, acceptedRows: rows.length, rejectedRows: rejected, deliveryStatus: record.delivery_status });
    } catch (error) {
      console.error('[content-intelligence] batch ingest failed:', error);
      res.status(500).json({ error: 'content_intelligence_ingest_failed' });
    }
  });

  app.get('/api/admin/content-intelligence/health', requireAdmin, async (_req, res) => {
    if (!pool) return res.status(503).json({ status: 'error', database: 'not_configured' });
    try {
      const { rows } = await pool.query(`SELECT delivery_status, count(*)::int AS count FROM content_intelligence_batch_outbox GROUP BY delivery_status`);
      res.json({ status: 'ok', crmRelayConfigured: Boolean(process.env.CRM_CONTENT_INTELLIGENCE_URL), queue: rows });
    } catch (error) {
      res.status(500).json({ status: 'error', database: 'error', message: error.message });
    }
  });

  if (pool && process.env.CRM_CONTENT_INTELLIGENCE_URL) {
    const workerId = `${process.env.RENDER_INSTANCE_ID || process.pid}-ci-${crypto.randomUUID().slice(0, 8)}`;
    let running = false;
    const flush = async () => {
      if (running) return;
      running = true;
      try {
        const rows = await claim(pool, workerId);
        await Promise.all(rows.map((row) => deliver(pool, row)));
      } catch (error) {
        console.error('[content-intelligence] worker failed:', error.message);
      } finally {
        running = false;
      }
    };
    const timer = setInterval(flush, WORKER_INTERVAL_MS);
    timer.unref?.();
    setTimeout(flush, 1500).unref?.();
  }

  console.log(`[content-intelligence] batch ingest installed maxRows=${MAX_ROWS}`);
}

module.exports = { installContentIntelligence, canonicalize, normalizeRow };
