#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import {
  COLUMN_GROUPS,
  catalogueBackupHash,
  logicalValue,
  industrialCreateBackupHash,
  industrialVerificationCore,
} from './publish-catalogue-plan.mjs';
import { INDUSTRIAL_CREATE_PLAN_TYPE } from './catalogue-publication-plan.mjs';

const require = createRequire(import.meta.url);
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway.js');

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}
function hash(value) { return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex'); }
function assert(condition, message) { if (!condition) throw new Error(message); }

export function validateIndustrialCreateBackup(backup) {
  assert(backup?.schema_version === '1.0.0', 'Unsupported Industrial create backup schema');
  assert(backup.backup_type === INDUSTRIAL_CREATE_PLAN_TYPE, 'Industrial create backup type mismatch');
  assert(backup.batch_id && backup.pilot_id, 'Industrial create backup batch identity is required');
  assert(Array.isArray(backup.before) && backup.before.length === 0, 'Industrial create backup before-state must be empty');
  assert(Array.isArray(backup.after) && backup.after.length > 0, 'Industrial create backup after-state is required');
  assert(typeof backup.plan_sha256 === 'string' && /^[a-f0-9]{64}$/.test(backup.plan_sha256), 'Industrial create backup plan hash is invalid');
  assert(typeof backup.backup_sha256 === 'string' && /^[a-f0-9]{64}$/.test(backup.backup_sha256), 'Industrial create backup checksum is invalid');
  assert(industrialCreateBackupHash(backup) === backup.backup_sha256, 'Industrial create backup checksum mismatch');
  assert(new Set(backup.after.map((row) => String(row.sku || '').trim().toUpperCase())).size === backup.after.length,
    'Industrial create backup contains duplicate SKUs');
  return true;
}

export function validateCatalogueBackup(backup) {
  assert(backup?.schema_version === '1.0.0', 'Unsupported catalogue backup schema');
  assert(backup.target_sku && backup.before?.sku === backup.target_sku, 'Backup target SKU mismatch');
  assert(Array.isArray(backup.operations) && backup.operations.length > 0, 'Backup operations are required');
  assert(backup.operations.every((op) => COLUMN_GROUPS[op.field]), 'Backup contains an unsupported field');
  assert(typeof backup.plan_sha256 === 'string' && /^[a-f0-9]{64}$/.test(backup.plan_sha256), 'Backup plan hash is invalid');
  assert(typeof backup.backup_sha256 === 'string' && /^[a-f0-9]{64}$/.test(backup.backup_sha256), 'Backup checksum is invalid');
  assert(catalogueBackupHash(backup) === backup.backup_sha256, 'Catalogue backup checksum mismatch');
  return true;
}

export function catalogueRestorePatch(backup) {
  const patch = {};
  for (const operation of backup.operations) {
    for (const column of COLUMN_GROUPS[operation.field]) patch[column] = backup.before[column] ?? null;
  }
  return patch;
}

function compileRestore(backup) {
  const assignments=[]; const values=[];
  for (const operation of backup.operations) {
    for (const column of COLUMN_GROUPS[operation.field]) {
      values.push(backup.before[column] ?? null);
      assignments.push(`${column} = $${values.length}`);
    }
  }
  values.push(backup.target_sku);
  return { sql:`UPDATE elimfilters_catalog SET ${assignments.join(', ')} WHERE sku = $${values.length}`, values };
}

export async function rollbackIndustrialCreateBatch({ backup, pool, apply = false } = {}) {
  validateIndustrialCreateBackup(backup);
  if (!apply) {
    return {
      outcome: 'DRY_RUN',
      database_write: false,
      backup_type: backup.backup_type,
      batch_id: backup.batch_id,
      products: backup.after.length,
      plan_sha256: backup.plan_sha256,
    };
  }
  assert(String(process.env.HERMES_CATALOGUE_ROLLBACK_LIVE || '').toLowerCase() === 'true',
    'HERMES_CATALOGUE_ROLLBACK_LIVE=true is required');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");
    await client.query('LOCK TABLE elimfilters_catalog IN SHARE ROW EXCLUSIVE MODE');

    const skus = backup.after.map((row) => String(row.sku).trim().toUpperCase());
    const current = await client.query(
      'SELECT * FROM elimfilters_catalog WHERE UPPER(sku) = ANY($1::text[]) ORDER BY sku',
      [skus],
    );
    assert(current.rowCount === backup.after.length,
      `Industrial rollback expected ${backup.after.length} current rows and found ${current.rowCount}`);

    const bySku = new Map(current.rows.map((row) => [String(row.sku).trim().toUpperCase(), row]));
    for (const expected of backup.after) {
      const actual = bySku.get(String(expected.sku).trim().toUpperCase());
      assert(actual, `Industrial rollback row missing for ${expected.sku}`);
      assert(hash(industrialVerificationCore(actual)) === hash(industrialVerificationCore(expected)),
        `Industrial rollback blocked because ${expected.sku} changed after publication`);
    }

    const deleted = await client.query(
      'DELETE FROM elimfilters_catalog WHERE UPPER(sku) = ANY($1::text[])',
      [skus],
    );
    assert(deleted.rowCount === backup.after.length,
      `Industrial rollback deleted ${deleted.rowCount}; expected ${backup.after.length}`);

    await client.query('COMMIT');
    return {
      outcome: 'ROLLED_BACK',
      database_write: true,
      backup_type: backup.backup_type,
      batch_id: backup.batch_id,
      products: backup.after.length,
      plan_sha256: backup.plan_sha256,
    };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

export async function rollbackCataloguePublication({ backup, pool, apply = false }) {
  if (backup?.backup_type === INDUSTRIAL_CREATE_PLAN_TYPE) {
    return rollbackIndustrialCreateBatch({ backup, pool, apply });
  }
  validateCatalogueBackup(backup);
  if (!apply) return { outcome:'DRY_RUN', database_write:false, target_sku:backup.target_sku, plan_sha256:backup.plan_sha256 };
  assert(String(process.env.HERMES_CATALOGUE_ROLLBACK_LIVE || '').toLowerCase() === 'true', 'HERMES_CATALOGUE_ROLLBACK_LIVE=true is required');
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");
    const locked=await client.query('SELECT * FROM elimfilters_catalog WHERE sku = $1 FOR UPDATE',[backup.target_sku]);
    assert(locked.rowCount === 1, `Expected exactly one row for ${backup.target_sku}`);
    for (const operation of backup.operations) assert(hash(logicalValue(locked.rows[0],operation.field)) === hash(operation.after), `Current ${operation.field} no longer matches the published plan; rollback aborted`);
    const restorePatch = catalogueRestorePatch(backup);
    assertGovernedCatalogPatch(locked.rows[0], restorePatch, { applicationWrite: false });
    const restore=compileRestore(backup);
    const changed=await client.query(restore.sql,restore.values);
    assert(changed.rowCount === 1,'Rollback did not affect exactly one row');
    const verified=await client.query('SELECT * FROM elimfilters_catalog WHERE sku = $1',[backup.target_sku]);
    for (const operation of backup.operations) assert(hash(logicalValue(verified.rows[0],operation.field)) === hash(operation.before), `Rollback verification failed for ${operation.field}`);
    await client.query('COMMIT');
    return { outcome:'ROLLED_BACK',database_write:true,target_sku:backup.target_sku,plan_sha256:backup.plan_sha256 };
  } catch(error) { try { await client.query('ROLLBACK'); } catch {} throw error; }
  finally { client.release(); }
}

async function main() {
  const [backupPath]=process.argv.slice(2).filter((arg)=>arg!=='--apply');
  const apply=process.argv.includes('--apply');
  if(!backupPath){ console.error('Usage: node scripts/hermes/rollback-catalogue-publication.mjs <backup.json> [--apply]'); process.exit(2); }
  const backup=JSON.parse(fs.readFileSync(path.resolve(backupPath),'utf8'));
  if(!apply){ console.log(JSON.stringify(await rollbackCataloguePublication({backup,apply:false}),null,2)); return; }
  const connectionString=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  assert(connectionString,'A catalogue database URL is required');
  const {Pool}=await import('pg'); const pool=new Pool({connectionString,ssl:{rejectUnauthorized:false},application_name:'hermes-catalogue-rollback',max:1});
  try { console.log(JSON.stringify(await rollbackCataloguePublication({backup,pool,apply:true}),null,2)); } finally { await pool.end(); }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) main().catch((error)=>{console.error(`[HERMES catalogue rollback] ${error.message}`);process.exit(1);});
