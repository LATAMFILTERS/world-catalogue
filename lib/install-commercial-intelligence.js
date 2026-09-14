const express = require('express');
const crypto = require('crypto');
const { Pool } = require('pg');
const { installPartSeoPages } = require('./install-part-seo-pages');

const LEAD_TYPE_MAP = Object.freeze({
  'L-1': 'application_support',
  'L-2': 'commercial',
  'L-3': 'distributor',
  'L-4': 'product_intelligence',
  'L-5': 'commercial',
  'L-6': 'technical_support',
  'L-7': 'application_support',
});

const ALLOWED_LEAD_TYPES = new Set([
  'product_intelligence',
  'application_support',
  'distributor',
  'partner_application',
  'commercial',
  'technical_support',
]);

const ALLOWED_ORIGINS = new Set([
  'https://elimfilters.com',
  'https://www.elimfilters.com',
  'https://part-search.elimfilters.com',
  'https://elimfilters-frontend.onrender.com',
  'https://elimfilters-search-pro.onrender.com',
]);

function clean(value, max = 1024) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, max) : null;
}

function cleanObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function cleanCommercialAccountCode(value) {
  const normalized = clean(value, 9)?.toUpperCase();
  return normalized && /^[A-Z]{2}-[0-9]{6}$/.test(normalized) ? normalized : null;
}

function normalizeLeadType(value) {
  const mapped = LEAD_TYPE_MAP[value] || value || 'commercial';
  return ALLOWED_LEAD_TYPES.has(mapped) ? mapped : 'commercial';
}

function entityContextFromPath(pathname = '') {
  const path = String(pathname || '').toLowerCase();
  return {
    technology: path.match(/\/technologies\/([a-z0-9-]+)/)?.[1] || null,
    system: path.match(/\/systems\/([a-z0-9-]+)/)?.[1] || null,
    industry: path.match(/\/industries\/([a-z0-9-]+)/)?.[1] || null,
  };
}

function buildEventPayload(req, kind) {
  const body = cleanObject(req.body);
  const fields = cleanObject(body.fields);
  const pagePath = clean(body.pagePath || body.conversionPage || body.page_path, 1024);
  const inferred = entityContextFromPath(pagePath);
  const eventName = clean(body.eventName || body.event_name || body.conversionAction || body.conversion_action, 120) || kind;
  return {
    eventId: clean(body.eventId, 120) || crypto.randomUUID(),
    eventKind: kind,
    eventName,
    leadType: normalizeLeadType(body.leadType || body.lead_type),
    occurredAt: new Date().toISOString(),
    commercialAccountCode: cleanCommercialAccountCode(body.commercialAccountCode || body.commercial_account_code),
    source: {
      channel: clean(body.sourceChannel || body.source_channel, 80),
      domain: clean(body.sourceDomain || body.source_domain, 255),
      referrer: clean(body.referrer || req.get('referer'), 2048),
      landingPage: clean(body.landingPage || body.landing_page, 2048),
      conversionPage: clean(body.conversionPage || body.pageLocation || body.page_location || req.get('origin'), 2048),
      pagePath,
      pageTitle: clean(body.pageTitle || body.page_title, 255),
    },
    campaign: {
      source: clean(body.campaignSource || body.campaign_source, 255),
      medium: clean(body.campaignMedium || body.campaign_medium, 255),
      name: clean(body.campaignName || body.campaign_name, 255),
      content: clean(body.campaignContent || body.campaign_content, 255),
      term: clean(body.campaignTerm || body.campaign_term, 255),
    },
    entityContext: {
      technology: clean(body.technologySlug || body.technology_slug, 120) || inferred.technology,
      system: clean(body.systemSlug || body.system_slug, 120) || inferred.system,
      industry: clean(body.industrySlug || body.industry_slug, 120) || inferred.industry,
      sku: clean(body.sku, 120),
    },
    session: {
      sessionId: clean(body.sessionId || body.session_id, 255),
      visitorId: clean(body.visitorId || body.visitor_id, 255),
      deviceCategory: clean(body.deviceCategory || body.device_category, 80),
      countryCode: clean(body.countryCode || body.country_code, 2)?.toUpperCase() || null,
    },
    contact: {
      name: clean(fields.name || body.name, 255),
      email: clean(fields.email || body.email, 320),
      company: clean(fields.company || body.company, 255),
      phone: clean(fields.phone || body.phone, 80),
      country: clean(fields.country || body.country, 120),
    },
    applicationContext: {
      application: clean(fields.application || body.application, 1024),
      quantity: clean(fields.quantity || body.quantity, 255),
      failureDescription: clean(fields.failureDescription || body.failureDescription, 4000),
      teamSize: clean(fields.teamSize || body.teamSize, 120),
    },
    metadata: cleanObject(body.metadata),
  };
}

function getPool() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) return null;
  return new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.COMMERCIAL_DB_POOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

async function ensureOutbox(pool) {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS commercial_event_outbox (
      id uuid PRIMARY KEY,
      event_kind text NOT NULL,
      event_name text NOT NULL,
      lead_type text,
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
    ALTER TABLE commercial_event_outbox ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz NOT NULL DEFAULT now();
    ALTER TABLE commercial_event_outbox ADD COLUMN IF NOT EXISTS locked_at timestamptz;
    ALTER TABLE commercial_event_outbox ADD COLUMN IF NOT EXISTS locked_by text;
    CREATE INDEX IF NOT EXISTS idx_commercial_event_outbox_dispatch
      ON commercial_event_outbox (delivery_status, next_attempt_at, created_at)
      WHERE delivery_status IN ('PENDING','RETRY','PROCESSING');
  `);
}

async function persist(pool, payload) {
  if (!pool) return false;
  await pool.query(
    `INSERT INTO commercial_event_outbox (id, event_kind, event_name, lead_type, payload)
     VALUES ($1,$2,$3,$4,$5::jsonb)
     ON CONFLICT (id) DO NOTHING`,
    [payload.eventId, payload.eventKind, payload.eventName, payload.leadType, JSON.stringify(payload)]
  );
  return true;
}

function installCommercialIntelligence(app) {
  const pool = getPool();
  installPartSeoPages(app, pool);
  ensureOutbox(pool).catch((error) => console.error('[commercial-intelligence] outbox init failed:', error.message));

  const json = express.json({ limit: '64kb' });
  const limiter = new Map();
  const perMinuteLimit = Number(process.env.COMMERCIAL_INGEST_PER_IP_PER_MINUTE || 600);

  const allowRequest = (req) => {
    const key = crypto.createHash('sha256').update(String(req.ip || 'unknown')).digest('hex').slice(0, 20);
    const now = Date.now();
    const current = limiter.get(key) || { start: now, count: 0 };
    if (now - current.start > 60_000) { current.start = now; current.count = 0; }
    current.count += 1;
    limiter.set(key, current);
    if (limiter.size > 10_000) {
      for (const [k, v] of limiter) if (now - v.start > 120_000) limiter.delete(k);
    }
    return current.count <= perMinuteLimit;
  };

  const corsGuard = (req, res, next) => {
    const origin = req.get('origin');
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(origin && ALLOWED_ORIGINS.has(origin) ? 204 : 403);
    if (origin && !ALLOWED_ORIGINS.has(origin)) return res.status(403).json({ error: 'origin_not_allowed' });
    if (!allowRequest(req)) return res.status(429).json({ error: 'rate_limited' });
    next();
  };

  const handle = (kind) => async (req, res) => {
    try {
      const payload = buildEventPayload(req, kind);
      const persisted = await persist(pool, payload);
      res.status(202).json({
        accepted: true,
        eventId: payload.eventId,
        persisted,
        delivery: persisted ? 'queued' : 'database_not_configured',
      });
    } catch (error) {
      console.error('[commercial-intelligence]', error);
      res.status(500).json({ error: 'commercial_intelligence_ingest_failed' });
    }
  };

  app.options('/api/lead-capture', corsGuard);
  app.options('/api/conversion-event', corsGuard);
  app.post('/api/lead-capture', corsGuard, json, handle('lead'));
  app.post('/api/conversion-event', corsGuard, json, handle('conversion'));

  app.get('/api/commercial-intelligence/health', async (_req, res) => {
    let db = 'not_configured';
    let queueDepth = null;
    if (pool) {
      try {
        const result = await pool.query(`SELECT count(*)::int AS depth FROM commercial_event_outbox WHERE delivery_status IN ('PENDING','RETRY','PROCESSING')`);
        db = 'ok';
        queueDepth = result.rows[0]?.depth ?? 0;
      } catch {
        db = 'error';
      }
    }
    res.json({
      status: db === 'error' ? 'degraded' : 'ok',
      outboxDatabase: db,
      queueDepth,
      crmRelayConfigured: Boolean(process.env.CRM_INGEST_URL),
      perIpPerMinuteLimit,
    });
  });

  console.log('[commercial-intelligence] burst-safe lead/conversion ingestion installed');
}

module.exports = { installCommercialIntelligence, buildEventPayload, normalizeLeadType };
