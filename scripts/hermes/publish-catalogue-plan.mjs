#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PUBLISHABLE_CATALOGUE_FIELDS } from './catalogue-publication-plan.mjs';

export const COLUMN_GROUPS = {
  filter_type: ['filter_type'], duty: ['duty'], technology: ['technology'],
  equipment_applications: ['equipment_applications'], oem_codes: ['oem_codes'],
  competitor_codes: ['competitor_codes'], brand_crossrefs: ['brand_crossrefs'],
  dimensions: ['thread_size', 'height_mm', 'outer_diameter_mm', 'inner_diameter_mm', 'gasket_od_mm', 'gasket_id_mm'],
  technical_specs: ['micron_rating', 'bypass_valve_psi', 'iso_test_method', 'anti_drainback_valve', 'nominal_efficiency', 'filter_media', 'burst_pressure_psi', 'collapse_pressure_psi', 'installation_type', 'attachment_type', 'is_primary']
};

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}
function hash(value) { return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex'); }
function assert(condition, message) { if (!condition) throw new Error(message); }

function planCore(plan) {
  return {
    schema_version: plan.schema_version, research_bundle_id: plan.research_bundle_id,
    target_sku: plan.target_sku, change_type: plan.change_type,
    approval: plan.approval, knowledge_approval: plan.knowledge_approval,
    snapshot_sha256: plan.snapshot_sha256, operations: plan.operations,
    evidence: plan.evidence, source_urls: plan.source_urls
  };
}

export function validateCataloguePublicationPlan(plan, { now = Date.now(), maxAgeMs = 7 * 24 * 60 * 60 * 1000 } = {}) {
  assert(plan?.schema_version === '1.0.0', 'Unsupported publication plan schema');
  assert(plan.target_sku && Array.isArray(plan.operations) && plan.operations.length > 0, 'Plan target and operations are required');
  assert(plan.approval?.approved_by === 'Victor Abreu' && plan.knowledge_approval?.approved_by === 'Victor Abreu', 'Both Victor approvals are required');
  assert(!Number.isNaN(Date.parse(plan.approval.approved_at)) && !Number.isNaN(Date.parse(plan.knowledge_approval.approved_at)), 'Approval timestamps are invalid');
  assert(!Number.isNaN(Date.parse(plan.generated_at)) && now - Date.parse(plan.generated_at) <= maxAgeMs && Date.parse(plan.generated_at) <= now + 60_000, 'Publication plan is expired or future-dated');
  assert(plan.operations.every((op) => PUBLISHABLE_CATALOGUE_FIELDS.has(op.field)), 'Plan contains a non-publishable field');
  assert(new Set(plan.operations.map((op) => op.field)).size === plan.operations.length, 'Plan contains duplicate field operations');
  assert(Array.isArray(plan.approval.approved_fields), 'approved_fields is required');
  assert(hash([...plan.operations.map((op) => op.field)].sort()) === hash([...plan.approval.approved_fields].sort()), 'Plan operations do not match approved_fields');
  assert(hash(planCore(plan)) === plan.plan_sha256, 'Publication plan hash mismatch');
  return true;
}

export function logicalValue(row, field) {
  if (field === 'dimensions' || field === 'technical_specs') {
    return Object.fromEntries(COLUMN_GROUPS[field].filter((column) => row[column] !== null && row[column] !== undefined).map((column) => [column, row[column]]));
  }
  return row[field] ?? null;
}

export function compileUpdate(plan) {
  const assignments = [];
  const values = [];
  for (const operation of plan.operations) {
    const columns = COLUMN_GROUPS[operation.field];
    assert(columns, `No database mapping for ${operation.field}`);
    if (columns.length === 1) {
      values.push(operation.after);
      assignments.push(`${columns[0]} = $${values.length}`);
    } else {
      assert(operation.after && typeof operation.after === 'object' && !Array.isArray(operation.after), `${operation.field} must be an object`);
      for (const column of columns.filter((name) => Object.hasOwn(operation.after, name))) {
        values.push(operation.after[column]);
        assignments.push(`${column} = $${values.length}`);
      }
    }
  }
  assert(assignments.length > 0, 'Plan produced no database assignments');
  values.push(plan.target_sku);
  return { sql: `UPDATE elimfilters_catalog SET ${assignments.join(', ')} WHERE sku = $${values.length}`, values };
}

export async function executeCataloguePublicationPlan({ plan, pool, backupDir = 'hermes/backups/catalogue-publication', apply = false }) {
  validateCataloguePublicationPlan(plan);
  if (!apply) return { outcome: 'DRY_RUN', database_write: false, target_sku: plan.target_sku, operations: plan.operations.length };
  assert(String(process.env.HERMES_CATALOGUE_PUBLISH_LIVE || '').toLowerCase() === 'true', 'HERMES_CATALOGUE_PUBLISH_LIVE=true is required');
  const client = await pool.connect();
  const columns = [...new Set(['sku', ...plan.operations.flatMap((op) => COLUMN_GROUPS[op.field])])];
  let backupPath = null;
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");
    const locked = await client.query('SELECT * FROM elimfilters_catalog WHERE sku = $1 FOR UPDATE', [plan.target_sku]);
    assert(locked.rowCount === 1, `Expected exactly one existing row for ${plan.target_sku}`);
    const row = locked.rows[0];
    for (const operation of plan.operations) assert(hash(logicalValue(row, operation.field)) === hash(operation.before), `Stale snapshot for ${operation.field}; publication aborted`);
    fs.mkdirSync(backupDir, { recursive: true });
    backupPath = path.join(backupDir, `${plan.target_sku}-${Date.now()}-${plan.plan_sha256.slice(0, 12)}.json`);
    fs.writeFileSync(backupPath, `${JSON.stringify({ schema_version: '1.0.0', created_at: new Date().toISOString(), plan_sha256: plan.plan_sha256, research_bundle_id: plan.research_bundle_id, target_sku: plan.target_sku, operations: plan.operations, before: row }, null, 2)}\n`, { flag: 'wx' });
    const update = compileUpdate(plan);
    const changed = await client.query(update.sql, update.values);
    assert(changed.rowCount === 1, 'Catalogue update did not affect exactly one row');
    const verified = await client.query(`SELECT ${columns.join(', ')} FROM elimfilters_catalog WHERE sku = $1`, [plan.target_sku]);
    for (const operation of plan.operations) assert(hash(logicalValue(verified.rows[0], operation.field)) === hash(operation.after), `Post-write verification failed for ${operation.field}`);
    await client.query('COMMIT');
    return { outcome: 'PUBLISHED', database_write: true, target_sku: plan.target_sku, backup_path: backupPath, plan_sha256: plan.plan_sha256 };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    error.backup_path = backupPath;
    throw error;
  } finally { client.release(); }
}

async function main() {
  const [planPath] = process.argv.slice(2).filter((arg) => arg !== '--apply');
  const apply = process.argv.includes('--apply');
  if (!planPath) { console.error('Usage: node scripts/hermes/publish-catalogue-plan.mjs <plan.json> [--apply]'); process.exit(2); }
  const plan = JSON.parse(fs.readFileSync(path.resolve(planPath), 'utf8'));
  if (!apply) { console.log(JSON.stringify(await executeCataloguePublicationPlan({ plan, apply: false }), null, 2)); return; }
  const connectionString = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  assert(connectionString, 'A catalogue database URL is required');
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, application_name: 'hermes-controlled-catalogue-publisher', max: 1 });
  try { console.log(JSON.stringify(await executeCataloguePublicationPlan({ plan, pool, apply: true }), null, 2)); } finally { await pool.end(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch((error) => { console.error(`[HERMES catalogue publish] ${error.message}`); process.exit(1); });
