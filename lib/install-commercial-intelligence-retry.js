const crypto = require('crypto');
const { Pool } = require('pg');

function poolFromEnvironment() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) return null;
  return new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.COMMERCIAL_WORKER_DB_POOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

function backoffSeconds(attempts) {
  const base = Math.min(3600, 5 * Math.pow(2, Math.min(attempts, 9)));
  const jitter = Math.floor(Math.random() * Math.max(1, Math.floor(base * 0.2)));
  return base + jitter;
}

async function claimBatch(pool, workerId, batchSize) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `WITH claim AS (
         SELECT id
           FROM commercial_event_outbox
          WHERE delivery_status IN ('PENDING','RETRY','PROCESSING')
            AND delivery_attempts < 25
            AND next_attempt_at <= now()
            AND (locked_at IS NULL OR locked_at < now() - interval '5 minutes')
          ORDER BY created_at ASC
          FOR UPDATE SKIP LOCKED
          LIMIT $1
       )
       UPDATE commercial_event_outbox q
          SET delivery_status='PROCESSING', locked_at=now(), locked_by=$2
         FROM claim
        WHERE q.id=claim.id
      RETURNING q.id, q.payload, q.delivery_attempts`,
      [batchSize, workerId]
    );
    await client.query('COMMIT');
    return rows;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

async function deliverRow(pool, row) {
  const url = process.env.CRM_INGEST_URL;
  const attempts = Number(row.delivery_attempts || 0);
  try {
    const headers = { 'content-type': 'application/json' };
    if (process.env.CRM_INGEST_TOKEN) headers.authorization = `Bearer ${process.env.CRM_INGEST_TOKEN}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(row.payload),
      signal: AbortSignal.timeout(Number(process.env.COMMERCIAL_CRM_TIMEOUT_MS || 8000)),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`CRM ${response.status}: ${text.slice(0, 500)}`);
    let crmResponse = {};
    try { crmResponse = text ? JSON.parse(text) : {}; } catch { crmResponse = { body: text.slice(0, 500) }; }
    await pool.query(
      `UPDATE commercial_event_outbox
          SET delivery_status='DELIVERED', delivery_attempts=delivery_attempts+1,
              crm_response=$2::jsonb, delivered_at=now(), last_delivery_error=NULL,
              locked_at=NULL, locked_by=NULL
        WHERE id=$1`,
      [row.id, JSON.stringify(crmResponse)]
    );
    return true;
  } catch (error) {
    const delay = backoffSeconds(attempts + 1);
    await pool.query(
      `UPDATE commercial_event_outbox
          SET delivery_status='RETRY', delivery_attempts=delivery_attempts+1,
              next_attempt_at=now() + ($3 || ' seconds')::interval,
              last_delivery_error=$2, locked_at=NULL, locked_by=NULL
        WHERE id=$1`,
      [row.id, String(error.message || error).slice(0, 1000), String(delay)]
    );
    return false;
  }
}

async function runWithConcurrency(items, concurrency, handler) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await handler(items[index]);
    }
  });
  await Promise.all(workers);
}

function installCommercialIntelligenceRetry() {
  if (!process.env.CRM_INGEST_URL) {
    console.log('[commercial-intelligence] CRM relay not configured; durable outbox will retain events');
    return;
  }

  const pool = poolFromEnvironment();
  if (!pool) {
    console.warn('[commercial-intelligence] database not configured; retry worker disabled');
    return;
  }

  const workerId = `${process.env.RENDER_INSTANCE_ID || process.pid}-${crypto.randomUUID().slice(0, 8)}`;
  const batchSize = Number(process.env.COMMERCIAL_WORKER_BATCH_SIZE || 100);
  const concurrency = Number(process.env.COMMERCIAL_WORKER_CONCURRENCY || 10);
  const intervalMs = Number(process.env.COMMERCIAL_WORKER_INTERVAL_MS || 2000);
  let running = false;

  const flush = async () => {
    if (running) return;
    running = true;
    try {
      let processed = 0;
      while (processed < 1000) {
        const rows = await claimBatch(pool, workerId, batchSize);
        if (!rows.length) break;
        await runWithConcurrency(rows, concurrency, (row) => deliverRow(pool, row));
        processed += rows.length;
        if (rows.length < batchSize) break;
      }
    } catch (error) {
      console.error('[commercial-intelligence] retry flush failed:', error.message);
    } finally {
      running = false;
    }
  };

  const timer = setInterval(flush, intervalMs);
  timer.unref?.();
  setTimeout(flush, 1000).unref?.();
  console.log(`[commercial-intelligence] scalable CRM worker installed batch=${batchSize} concurrency=${concurrency} interval=${intervalMs}ms`);
}

module.exports = { installCommercialIntelligenceRetry, backoffSeconds };
