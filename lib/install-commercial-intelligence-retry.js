const { Pool } = require('pg');

function poolFromEnvironment() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) return null;
  return new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 2,
  });
}

async function deliverRow(pool, row) {
  const url = process.env.CRM_INGEST_URL;
  if (!url || typeof fetch !== 'function') return;
  try {
    const headers = { 'content-type': 'application/json' };
    if (process.env.CRM_INGEST_TOKEN) headers.authorization = `Bearer ${process.env.CRM_INGEST_TOKEN}`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(row.payload),
      signal: AbortSignal.timeout(8000),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`CRM ${response.status}: ${text.slice(0, 500)}`);
    let crmResponse = {};
    try { crmResponse = text ? JSON.parse(text) : {}; } catch { crmResponse = { body: text.slice(0, 500) }; }
    await pool.query(
      `UPDATE commercial_event_outbox
         SET delivery_status='DELIVERED', delivery_attempts=delivery_attempts+1,
             crm_response=$2::jsonb, delivered_at=now(), last_delivery_error=NULL
       WHERE id=$1`,
      [row.id, JSON.stringify(crmResponse)]
    );
  } catch (error) {
    await pool.query(
      `UPDATE commercial_event_outbox
         SET delivery_status='RETRY', delivery_attempts=delivery_attempts+1,
             last_delivery_error=$2
       WHERE id=$1`,
      [row.id, String(error.message || error).slice(0, 1000)]
    );
  }
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

  let running = false;
  const flush = async () => {
    if (running) return;
    running = true;
    try {
      const { rows } = await pool.query(
        `SELECT id, payload
           FROM commercial_event_outbox
          WHERE delivery_status IN ('PENDING','RETRY')
            AND delivery_attempts < 25
          ORDER BY created_at ASC
          LIMIT 50`
      );
      for (const row of rows) await deliverRow(pool, row);
    } catch (error) {
      console.error('[commercial-intelligence] retry flush failed:', error.message);
    } finally {
      running = false;
    }
  };

  const timer = setInterval(flush, 60_000);
  timer.unref?.();
  setTimeout(flush, 5_000).unref?.();
  console.log('[commercial-intelligence] CRM retry worker installed');
}

module.exports = { installCommercialIntelligenceRetry };
