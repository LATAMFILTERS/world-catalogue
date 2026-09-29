#!/usr/bin/env node
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { Pool } = require('pg');
const { normalizedApplication } = require('../../lib/catalog-application-governance.js');

const ledgerPath = 'hermes/reports/isuzu-v160-decision-ledger.json';
const doc = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
const cs = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!cs) throw new Error('DB URL required');
const local = /@(127\.0\.0\.1|localhost):/.test(cs);
const pool = new Pool({ connectionString: cs, ssl: local ? false : { rejectUnauthorized: false }, max: 1 });

const key = (x) => JSON.stringify(normalizedApplication(x));
const appOf = (r) => ({ make:r.make, model:r.model, equipment:r.equipment, type:r.type, engine:r.engine, year:String(r.year) });
const skus = [...new Set((doc.rows || []).map((r) => r.target_sku || r.sku))];
const db = await pool.connect();
let catalogRows = [];
let evidenceRows = [];
try {
  const q = await db.query(`select sku,duty,codigo_base,equipment_applications,enrichment_data,
    md5(coalesce(equipment_applications,'[]'::jsonb)::text) payload_hash
    from elimfilters_catalog where sku = any($1)`, [skus]);
  catalogRows = q.rows;
  const e = await db.query(`select sku,payload_hash,application_kind
    from catalog_application_evidence where sku = any($1) and verified is true`, [skus]);
  evidenceRows = e.rows;
} finally { db.release(); await pool.end(); }
const bySku = new Map(catalogRows.map((r) => [r.sku, r]));
const evidenceKinds = new Map();
for (const e of evidenceRows) {
  const k = e.sku + '|' + e.payload_hash;
  if (!evidenceKinds.has(k)) evidenceKinds.set(k, new Set());
  evidenceKinds.get(k).add(e.application_kind);
}
let satisfied = 0;
for (const r of doc.rows || []) {
  const hydratable = new Set(['HOLD','READY_TO_IMPLEMENT','READY_REMAP']);
  if (!hydratable.has(r.decision)) continue;
  const target = r.target_sku || r.sku;
  const row = bySku.get(target);
  if (!row) { r.resolution_state = 'TARGET_MISSING'; continue; }
  const apps = row.equipment_applications || [];
  const present = new Set(apps.map(key)).has(key(appOf(r)));
  const g = row.enrichment_data?.application_governance || {};
  const kinds = evidenceKinds.get(target + '|' + row.payload_hash) || new Set();
  const governed = g.equipment_db_payload_hash === row.payload_hash &&
    g.engine_db_payload_hash === row.payload_hash &&
    kinds.has('ENGINE') && kinds.has('EQUIPMENT');
  if (present && governed) {
    if (r.decision !== 'HOLD') {
      r.implemented_evidence = {
        authority:r.evidence_authority||null,url:r.evidence_url||null,reference:r.evidence_reference||null,
        resolution_rule:r.resolution_rule||null
      };
    }
    r.decision = 'SATISFIED';
    r.evidence_verified = true;
    r.evidence_authority = 'LIVE_GOVERNED_CATALOG';
    r.evidence_reference = row.payload_hash;
    r.evidence_url = null;
    r.resolution_state = 'ALREADY_IMPLEMENTED_VERIFIED';
    r.reviewer_note = 'Exact tuple already exists in the governed live catalog; no database write required.';
    satisfied++;
  } else {
    r.resolution_state = present ? 'PRESENT_BUT_GOVERNANCE_INCOMPLETE' : 'NOT_PRESENT';
  }
}
if (!doc.allowed_decisions.includes('SATISFIED')) doc.allowed_decisions.push('SATISFIED');
doc.hydration = { source:'live_catalog_governance', satisfied, total:(doc.rows||[]).length, generated_at:new Date().toISOString() };
fs.writeFileSync(ledgerPath, JSON.stringify(doc, null, 2) + '\n');
console.log(JSON.stringify(doc.hydration, null, 2));
