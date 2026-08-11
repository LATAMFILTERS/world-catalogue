#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { COLUMN_GROUPS, logicalValue } from './publish-catalogue-plan.mjs';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}
function hash(value) { return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex'); }
function assert(condition, message) { if (!condition) throw new Error(message); }

export function validateCatalogueBackup(backup) {
  assert(backup?.schema_version === '1.0.0', 'Unsupported catalogue backup schema');
  assert(backup.target_sku && backup.before?.sku === backup.target_sku, 'Backup target SKU mismatch');
  assert(Array.isArray(backup.operations) && backup.operations.length > 0, 'Backup operations are required');
  assert(backup.operations.every((op) => COLUMN_GROUPS[op.field]), 'Backup contains an unsupported field');
  assert(typeof backup.plan_sha256 === 'string' && /^[a-f0-9]{64}$/.test(backup.plan_sha256), 'Backup plan hash is invalid');
  return true;
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

export async function rollbackCataloguePublication({ backup, pool, apply = false }) {
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
