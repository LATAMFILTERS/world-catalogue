'use strict';

/**
 * Apply Victor-authorized "existing SKU -> new equipment" applications (HERMES Thursday AUTORIZAR, phase 1).
 *
 * Input: a reviewed batch file in data/catalogue-authorizations/ (built by
 * scripts/hermes/catalogue-authorization-batch.mjs and merged through a PR).
 * Each item APPENDS one Heavy Duty equipment application to an existing, active
 * SKU through the governed write service (verified evidence + payload hash);
 * existing applications are never removed. Already-present entries are skipped,
 * so re-running is idempotent. New SKUs and Light Duty vehicles are out of scope.
 *
 * Dry-run by default (everything rolled back). Pass --execute to COMMIT.
 * Run once per database (5441, then 5432) with CATALOG_DATABASE_URL set to it:
 *   node scripts/migrations/run_284_apply_authorized_equipment_applications.js --batch <file> [--execute]
 */

require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');
const { normalizedApplication } = require('../../lib/catalog-application-governance');

const SCHEMA = 'elimfilters.catalogue_authorization_batch.v1';
const AUTHORITY = 'HERMES_OEM_RESEARCH_AUTHORIZED_BY_VICTOR';

/** Batch shape check; returns a list of problems (empty = valid). */
function validateBatch(batch) {
  const errors = [];
  if (batch?.schema !== SCHEMA) errors.push(`schema must be ${SCHEMA}`);
  if (!Array.isArray(batch?.items) || !batch.items.length) errors.push('items must be a non-empty array');
  (batch?.items || []).forEach((it, i) => {
    const at = `items[${i}]`;
    if (!/^HERMES_SKU_[A-Z0-9]+$/.test(it?.proposal_code || '')) errors.push(`${at}.proposal_code invalid`);
    if (!/^E[A-Z][0-9][A-Z0-9]{4,5}$/.test(it?.sku || '')) errors.push(`${at}.sku invalid`);
    if (it?.duty !== 'HEAVY_DUTY') errors.push(`${at}.duty must be HEAVY_DUTY (phase 1)`);
    if (!String(it?.equipment?.brand || '').trim() || !String(it?.equipment?.model || '').trim()) errors.push(`${at}.equipment.brand/model required`);
    if (!String(it?.position || '').trim()) errors.push(`${at}.position required`);
    if (!/^https:\/\//.test(it?.evidence?.source_url || '') || !/^[a-f0-9]{64}$/i.test(it?.evidence?.evidence_sha256 || '')) errors.push(`${at}.evidence needs https source_url and sha256`);
    if (it?.authorized_by !== 'Victor Abreu' || Number.isNaN(Date.parse(it?.authorized_at || ''))) errors.push(`${at} must be authorized by Victor Abreu with a date`);
  });
  return errors;
}

/** The application entry written to elimfilters_catalog.equipment_applications. */
function entryFor(it) {
  const e = it.equipment;
  return Object.fromEntries(Object.entries({
    make: String(e.brand).trim().toUpperCase(),
    model: String(e.model).trim().toUpperCase(),
    equipment: `${String(e.brand).trim()} ${String(e.model).trim()}`.toUpperCase(),
    type: e.type ? String(e.type).trim().toUpperCase() : undefined,
    engine: e.engine ? String(e.engine).trim().toUpperCase() : undefined,
    year: e.year ? String(e.year).trim() : undefined,
    filter_position: String(it.position).trim().toUpperCase()
  }).filter(([, v]) => v !== undefined && v !== ''));
}

const sameApplication = (a, b) => {
  const x = normalizedApplication(a) || {}; const y = normalizedApplication(b) || {};
  const pos = (v) => String(v?.filter_position || '').trim().toUpperCase();
  return x.make === y.make && x.model === y.model && (x.engine || '') === (y.engine || '') && pos(a) === pos(b);
};

async function applyBatch(db, batch, { execute = false } = {}) {
  const errors = validateBatch(batch);
  if (errors.length) throw new Error(`BATCH_INVALID: ${errors.join('; ')}`);
  const report = { mode: execute ? 'execute' : 'dry-run', batch: batch.batch_id, items: [] };
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  try {
    await db.query("SET LOCAL lock_timeout = '5s'");
    await db.query("SET LOCAL statement_timeout = '45s'");
    for (const it of batch.items) {
      const row = (await db.query('SELECT sku,duty,catalog_active,equipment_applications FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [it.sku])).rows[0];
      if (!row) throw new Error(`SKU_NOT_FOUND ${it.sku}`);
      if (row.catalog_active !== true) throw new Error(`SKU_NOT_ACTIVE ${it.sku}`);
      if (row.duty !== 'HEAVY_DUTY') throw new Error(`SKU_NOT_HEAVY_DUTY ${it.sku} (${row.duty})`);
      const current = Array.isArray(row.equipment_applications) ? row.equipment_applications : [];
      const entry = entryFor(it);
      if (current.some((a) => sameApplication(a, entry))) { report.items.push({ sku: it.sku, proposal: it.proposal_code, outcome: 'ALREADY_PRESENT' }); continue; }
      const next = [...current, entry];
      const write = await applyVerifiedApplications(db, {
        sku: it.sku,
        equipment_applications: next,
        evidence: {
          authority: AUTHORITY,
          source_url: it.evidence.source_url,
          evidence_hash: it.evidence.evidence_sha256.toLowerCase(),
          metadata: {
            batch_id: batch.batch_id, proposal_code: it.proposal_code, case_id: it.case_id, oem_code: it.oem_code,
            authorized_by: it.authorized_by, authorized_at: it.authorized_at, researched_by: it.researched_by,
            added_entry: entry, previous_entry_count: current.length,
            previous_payload_sha256: crypto.createHash('sha256').update(JSON.stringify(current)).digest('hex')
          }
        }
      });
      const after = (await db.query('SELECT jsonb_array_length(equipment_applications) AS n FROM public.elimfilters_catalog WHERE sku=$1', [it.sku])).rows[0];
      if (Number(after.n) !== next.length) throw new Error(`POSTCHECK_COUNT_MISMATCH ${it.sku}`);
      report.items.push({ sku: it.sku, proposal: it.proposal_code, outcome: execute ? 'APPLIED' : 'WOULD_APPLY', entries_before: current.length, entries_after: next.length, evidence: write.evidence_authority || AUTHORITY });
    }
    await db.query(execute ? 'COMMIT' : 'ROLLBACK');
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    throw error;
  }
  return report;
}

async function main() {
  const at = process.argv.indexOf('--batch');
  const file = at > 0 ? process.argv[at + 1] : null;
  if (!file) throw new Error('usage: --batch <data/catalogue-authorizations/....json> [--execute]');
  const batch = JSON.parse(fs.readFileSync(file, 'utf8'));
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  try {
    const report = await applyBatch(db, batch, { execute: process.argv.includes('--execute') });
    report.database = url.replace(/\/\/[^@]*@/, '//***@');
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  main().catch((error) => { console.error(`[run_284] ${error.message}`); process.exit(1); });
}

module.exports = { SCHEMA, AUTHORITY, validateBatch, entryFor, sameApplication, applyBatch };
