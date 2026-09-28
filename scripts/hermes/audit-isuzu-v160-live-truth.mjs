#!/usr/bin/env node
// Read-only: re-checks EVERY v160 ledger tuple (including SATISFIED) against the live catalog,
// using the same tuple key and governance test as hydrate-isuzu-v160-decision-ledger.mjs.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { Pool } = require('pg');
const { normalizedApplication } = require('../../lib/catalog-application-governance.js');

const doc = JSON.parse(fs.readFileSync('hermes/reports/isuzu-v160-decision-ledger.json', 'utf8'));
const cs = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString: cs, ssl: /@(127\.0\.0\.1|localhost):/.test(cs) ? false : { rejectUnauthorized: false }, max: 1 });
const key = (x) => JSON.stringify(normalizedApplication(x));
const appOf = (r) => ({ make: r.make, model: r.model, equipment: r.equipment, type: r.type, engine: r.engine, year: String(r.year) });
const skus = [...new Set(doc.rows.flatMap((r) => [r.sku, r.target_sku].filter(Boolean)))];
const db = await pool.connect();
let rows, ev;
try {
  await db.query('BEGIN READ ONLY');
  rows = (await db.query(`select sku, equipment_applications, enrichment_data, md5(coalesce(equipment_applications,'[]'::jsonb)::text) payload_hash
    from elimfilters_catalog where sku = any($1)`, [skus])).rows;
  ev = (await db.query('select sku, payload_hash, application_kind from catalog_application_evidence where sku = any($1) and verified is true', [skus])).rows;
} finally { await db.query('ROLLBACK'); db.release(); await pool.end(); }
const bySku = new Map(rows.map((r) => [r.sku, r]));
const kinds = new Map();
for (const e of ev) { const k = e.sku + '|' + e.payload_hash; if (!kinds.has(k)) kinds.set(k, new Set()); kinds.get(k).add(e.application_kind); }
const out = doc.rows.map((r) => {
  const target = r.target_sku || r.sku;
  const row = bySku.get(target);
  if (!row) return { id: r.id, ledger: r.decision, target, live: 'TARGET_MISSING' };
  const present = new Set((row.equipment_applications || []).map(key)).has(key(appOf(r)));
  const g = row.enrichment_data?.application_governance || {};
  const k = kinds.get(target + '|' + row.payload_hash) || new Set();
  const governed = g.equipment_db_payload_hash === row.payload_hash && g.engine_db_payload_hash === row.payload_hash && k.has('ENGINE') && k.has('EQUIPMENT');
  return { id: r.id, ledger: r.decision, target, model: r.model, engine: r.engine, year: r.year, live: present ? (governed ? 'PRESENT_GOVERNED' : 'PRESENT_UNGOVERNED') : 'NOT_PRESENT' };
});
const tally = {};
for (const o of out) { const k = o.ledger + ' -> ' + o.live; tally[k] = (tally[k] || 0) + 1; }
fs.writeFileSync('hermes/reports/isuzu-v160-live-truth.json', JSON.stringify({ generated_at: new Date().toISOString(), tally, rows: out }, null, 2) + '\n');
console.log(JSON.stringify(tally, null, 2));
