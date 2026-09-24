#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import {
  PUBLISHABLE_CATALOGUE_FIELDS,
  APPLICATION_PUBLICATION_FIELDS,
  INDUSTRIAL_CREATE_PLAN_TYPE,
} from './catalogue-publication-plan.mjs';

const require = createRequire(import.meta.url);
const {
  assertGovernedCatalogPatch,
  assertCanonicalWrite,
} = require('../../lib/catalog-write-gateway.js');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service.js');

export const INDUSTRIAL_INSERT_COLUMNS = Object.freeze([
  'sku', 'codigo_base', 'filter_type', 'sub_type', 'technology', 'attachment_type',
  'outer_diameter_mm', 'height_mm', 'duty',
  'oem_codes', 'competitor_codes', 'brand_crossrefs', 'alternatives',
  'equipment_applications', 'vehicle_applications',
  'canonical_source_brand', 'canonical_source_code', 'canonical_source_url',
  'canonical_source_status', 'canonical_verified_at', 'canonical_evidence',
  'enrichment_data', 'catalog_active', 'catalog_scope_reason',
  'catalog_scope_verified_at', 'is_primary',
]);

const INDUSTRIAL_JSON_COLUMNS = new Set([
  'oem_codes', 'competitor_codes', 'brand_crossrefs', 'alternatives',
  'equipment_applications', 'vehicle_applications',
  'canonical_evidence', 'enrichment_data',
]);

const INDUSTRIAL_NUMERIC_COLUMNS = new Set(['outer_diameter_mm', 'height_mm']);

export const COLUMN_GROUPS = {
  filter_type: ['filter_type'], duty: ['duty'], technology: ['technology'], codigo_base: ['codigo_base'],
  equipment_applications: ['equipment_applications'], vehicle_applications: ['vehicle_applications'], oem_codes: ['oem_codes'],
  competitor_codes: ['competitor_codes'], brand_crossrefs: ['brand_crossrefs'],
  dimensions: ['thread_size', 'height_mm', 'outer_diameter_mm', 'inner_diameter_mm', 'gasket_od_mm', 'gasket_id_mm'],
  technical_specs: ['micron_rating', 'bypass_valve_psi', 'iso_test_method', 'anti_drainback_valve', 'nominal_efficiency', 'filter_media', 'burst_pressure_psi', 'collapse_pressure_psi', 'installation_type', 'attachment_type', 'is_primary'],
  source_identity: ['canonical_source_brand','canonical_source_code','canonical_source_url','canonical_source_status','canonical_verified_at','canonical_evidence']
};

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}
function hash(value) { return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex'); }
export function catalogueBackupCore(backup) {
  return {
    schema_version: backup.schema_version, created_at: backup.created_at,
    plan_sha256: backup.plan_sha256, research_bundle_id: backup.research_bundle_id,
    target_sku: backup.target_sku, operations: backup.operations, before: backup.before
  };
}
export function catalogueBackupHash(backup) { return hash(catalogueBackupCore(backup)); }
function assert(condition, message) { if (!condition) throw new Error(message); }

function planCore(plan) {
  const core = {
    schema_version: plan.schema_version, research_bundle_id: plan.research_bundle_id,
    target_sku: plan.target_sku, change_type: plan.change_type,
    approval: plan.approval, knowledge_approval: plan.knowledge_approval,
    snapshot_sha256: plan.snapshot_sha256, operations: plan.operations,
    evidence: plan.evidence, source_urls: plan.source_urls
  };
  if (Object.hasOwn(plan, 'application_evidence')) core.application_evidence = plan.application_evidence;
  return core;
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

  const applicationOperations = plan.operations.filter((op) => APPLICATION_PUBLICATION_FIELDS.has(op.field));
  if (applicationOperations.length) {
    const evidence = plan.application_evidence;
    assert(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'Application publication requires application_evidence');
    assert(String(evidence.authority || '').trim(), 'Application evidence authority is required');
    assert(String(evidence.source_url || '').trim(), 'Application evidence source_url is required');
    assert(String(evidence.evidence_hash || '').trim(), 'Application evidence evidence_hash is required');
    assert((plan.source_urls || []).includes(evidence.source_url), 'Application evidence source_url must be present in source_urls');
  }

  assert(hash(planCore(plan)) === plan.plan_sha256, 'Publication plan hash mismatch');
  return true;
}

export function logicalValue(row, field) {
  if (field === 'dimensions' || field === 'technical_specs' || field === 'source_identity') {
    return Object.fromEntries(COLUMN_GROUPS[field].filter((column) => row[column] !== null && row[column] !== undefined).map((column) => [column, row[column]]));
  }
  return row[field] ?? null;
}

export function cataloguePlanPatch(plan) {
  const patch = {};
  for (const operation of plan.operations) {
    const columns = COLUMN_GROUPS[operation.field];
    assert(columns, `No database mapping for ${operation.field}`);
    if (columns.length === 1) {
      patch[columns[0]] = operation.after;
      continue;
    }
    assert(operation.after && typeof operation.after === 'object' && !Array.isArray(operation.after), `${operation.field} must be an object`);
    for (const column of columns.filter((name) => Object.hasOwn(operation.after, name))) patch[column] = operation.after[column];
  }
  return patch;
}

export function compileUpdate(plan, { excludeFields = new Set() } = {}) {
  const assignments = [];
  const values = [];
  for (const operation of plan.operations) {
    if (excludeFields.has(operation.field)) continue;
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


function industrialPlanCore(plan) {
  return {
    schema_version: plan.schema_version,
    plan_type: plan.plan_type,
    batch_id: plan.batch_id,
    pilot_id: plan.pilot_id,
    approval: plan.approval,
    source_manifest: plan.source_manifest,
    source_manifest_sha256: plan.source_manifest_sha256,
    sku_preview: plan.sku_preview,
    sku_preview_sha256: plan.sku_preview_sha256,
    authorization_sha256: plan.authorization_sha256,
    products: plan.products,
  };
}

export function validateIndustrialCreateBatchPlan(plan, { now = Date.now(), maxAgeMs = 7 * 24 * 60 * 60 * 1000 } = {}) {
  assert(plan?.schema_version === '1.0.0', 'Unsupported Industrial create-plan schema');
  assert(plan.plan_type === INDUSTRIAL_CREATE_PLAN_TYPE, 'Industrial create-plan type mismatch');
  assert(plan.batch_id && plan.pilot_id, 'Industrial batch_id and pilot_id are required');
  assert(plan.approval?.approved_by === 'Victor Abreu', 'Victor approval is required for Industrial catalogue creation');
  assert(!Number.isNaN(Date.parse(plan.approval?.approved_at)), 'Industrial approval timestamp is invalid');
  assert(!Number.isNaN(Date.parse(plan.generated_at))
    && now - Date.parse(plan.generated_at) <= maxAgeMs
    && Date.parse(plan.generated_at) <= now + 60_000,
  'Industrial create plan is expired or future-dated');
  assert(Array.isArray(plan.products) && plan.products.length > 0 && plan.products.length <= 100,
    'Industrial create plan must contain 1-100 products');
  assert(typeof plan.plan_sha256 === 'string' && /^[a-f0-9]{64}$/.test(plan.plan_sha256),
    'Industrial create plan hash is invalid');
  assert(hash(industrialPlanCore(plan)) === plan.plan_sha256, 'Industrial create plan hash mismatch');

  const allowedColumns = new Set(INDUSTRIAL_INSERT_COLUMNS);
  const skus = new Set();
  const sourceIdentities = new Set();
  for (const row of plan.products) {
    assert(row && typeof row === 'object' && !Array.isArray(row), 'Industrial product row must be an object');
    assert(Object.keys(row).every((key) => allowedColumns.has(key)), `Industrial product ${row.sku || '?'} contains a non-approved insert field`);
    assert(row.duty === 'INDUSTRIAL_PROCESS', `${row.sku}: duty must be INDUSTRIAL_PROCESS`);
    assert(row.catalog_active === true, `${row.sku}: Phase 4 activation requires catalog_active=true`);
    assert(Array.isArray(row.oem_codes) && row.oem_codes.length === 0, `${row.sku}: OEM codes must remain empty in the pilot publication`);
    assert(Array.isArray(row.competitor_codes) && row.competitor_codes.length === 0, `${row.sku}: competitor codes must remain empty in the pilot publication`);
    assert(Array.isArray(row.equipment_applications) && row.equipment_applications.length === 0,
      `${row.sku}: equipment applications must not be inferred during Phase 4`);
    assert(Array.isArray(row.vehicle_applications) && row.vehicle_applications.length === 0,
      `${row.sku}: vehicle applications must remain empty for Industrial Process`);
    assert(row.canonical_source_status === 'VERIFIED', `${row.sku}: canonical source must be VERIFIED`);
    assert(row.canonical_evidence?.source_claim_status === 'MANUFACTURER_DECLARED',
      `${row.sku}: manufacturer performance must remain source-attributed`);
    assert(row.enrichment_data?.industrial_claim_governance?.performance_promoted_as_elimfilters_claim === false,
      `${row.sku}: manufacturer performance cannot be promoted as an ELIMFILTERS claim`);
    assertCanonicalWrite(row, { applicationWrite: false });

    const sku = String(row.sku || '').trim().toUpperCase();
    const sourceIdentity = `${String(row.canonical_source_brand || '').trim().toUpperCase()}|${String(row.canonical_source_code || '').trim().toUpperCase()}`;
    assert(!skus.has(sku), `Duplicate Industrial SKU in create plan: ${sku}`);
    assert(!sourceIdentities.has(sourceIdentity), `Duplicate Industrial canonical source identity in create plan: ${sourceIdentity}`);
    skus.add(sku);
    sourceIdentities.add(sourceIdentity);
  }
  return true;
}

function compileIndustrialInsert(row) {
  const columns = INDUSTRIAL_INSERT_COLUMNS.filter((column) => Object.hasOwn(row, column) && row[column] !== undefined);
  const values = columns.map((column) => row[column]);
  const placeholders = columns.map((column, index) => `${index + 1}${INDUSTRIAL_JSON_COLUMNS.has(column) ? '::jsonb' : ''}`);
  return {
    sql: `INSERT INTO elimfilters_catalog (${columns.map((column) => `"${column}"`).join(', ')}) VALUES (${placeholders.join(', ')})`,
    values,
  };
}

export function industrialVerificationCore(row = {}) {
  const core = {};
  for (const column of INDUSTRIAL_INSERT_COLUMNS) {
    if (!Object.hasOwn(row, column) || row[column] === undefined) continue;
    if (INDUSTRIAL_NUMERIC_COLUMNS.has(column)) {
      core[column] = row[column] == null ? null : Number(row[column]);
      continue;
    }
    if (column === 'canonical_verified_at' || column === 'catalog_scope_verified_at') {
      core[column] = row[column] == null ? null : new Date(row[column]).toISOString();
      continue;
    }
    core[column] = row[column];
  }
  return core;
}

export function industrialCreateBackupCore(backup) {
  return {
    schema_version: backup.schema_version,
    backup_type: backup.backup_type,
    created_at: backup.created_at,
    plan_sha256: backup.plan_sha256,
    batch_id: backup.batch_id,
    pilot_id: backup.pilot_id,
    before: backup.before,
    after: backup.after,
  };
}

export function industrialCreateBackupHash(backup) {
  return hash(industrialCreateBackupCore(backup));
}

export async function executeIndustrialCreateBatchPublication({
  plan,
  pool,
  backupDir = 'hermes/backups/catalogue-publication',
  apply = false,
} = {}) {
  validateIndustrialCreateBatchPlan(plan);
  if (!apply) {
    return {
      outcome: 'DRY_RUN',
      database_write: false,
      plan_type: plan.plan_type,
      batch_id: plan.batch_id,
      products: plan.products.length,
    };
  }

  assert(String(process.env.HERMES_CATALOGUE_PUBLISH_LIVE || '').toLowerCase() === 'true',
    'HERMES_CATALOGUE_PUBLISH_LIVE=true is required');

  const client = await pool.connect();
  let backupPath = null;
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");
    await client.query('LOCK TABLE elimfilters_catalog IN SHARE ROW EXCLUSIVE MODE');

    const skus = plan.products.map((row) => String(row.sku).trim().toUpperCase());
    const baseCodes = plan.products.map((row) => String(row.canonical_source_code).trim().toUpperCase());
    const conflicts = await client.query(
      `SELECT sku, codigo_base, canonical_source_brand, canonical_source_code
       FROM elimfilters_catalog
       WHERE UPPER(COALESCE(sku, '')) = ANY($1::text[])
          OR UPPER(COALESCE(canonical_source_code, '')) = ANY($2::text[])
          OR UPPER(COALESCE(codigo_base, '')) = ANY($2::text[])`,
      [skus, baseCodes],
    );
    assert(conflicts.rowCount === 0,
      `Industrial create batch conflicts with existing catalogue identity: ${JSON.stringify(conflicts.rows)}`);

    fs.mkdirSync(backupDir, { recursive: true });
    backupPath = path.join(backupDir, `${plan.batch_id}-${Date.now()}-${plan.plan_sha256.slice(0, 12)}.json`);
    const backup = {
      schema_version: '1.0.0',
      backup_type: INDUSTRIAL_CREATE_PLAN_TYPE,
      created_at: new Date().toISOString(),
      plan_sha256: plan.plan_sha256,
      batch_id: plan.batch_id,
      pilot_id: plan.pilot_id,
      before: [],
      after: plan.products.map((row) => industrialVerificationCore(row)),
    };
    backup.backup_sha256 = industrialCreateBackupHash(backup);
    fs.writeFileSync(backupPath, `${JSON.stringify(backup, null, 2)}\n`, { flag: 'wx' });

    for (const row of plan.products) {
      assertCanonicalWrite(row, { applicationWrite: false });
      const insert = compileIndustrialInsert(row);
      const changed = await client.query(insert.sql, insert.values);
      assert(changed.rowCount === 1, `Industrial insert did not affect exactly one row for ${row.sku}`);
    }

    const verified = await client.query(
      'SELECT * FROM elimfilters_catalog WHERE UPPER(sku) = ANY($1::text[]) ORDER BY sku',
      [skus],
    );
    assert(verified.rowCount === plan.products.length,
      `Industrial post-write verification expected ${plan.products.length} rows and found ${verified.rowCount}`);
    const bySku = new Map(verified.rows.map((row) => [String(row.sku).trim().toUpperCase(), row]));
    for (const expected of plan.products) {
      const actual = bySku.get(String(expected.sku).trim().toUpperCase());
      assert(actual, `Industrial post-write row missing for ${expected.sku}`);
      assert(hash(industrialVerificationCore(actual)) === hash(industrialVerificationCore(expected)),
        `Industrial post-write verification failed for ${expected.sku}`);
    }

    await client.query('COMMIT');
    return {
      outcome: 'PUBLISHED',
      database_write: true,
      plan_type: plan.plan_type,
      batch_id: plan.batch_id,
      products: plan.products.length,
      backup_path: backupPath,
      plan_sha256: plan.plan_sha256,
    };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    error.backup_path = backupPath;
    throw error;
  } finally {
    client.release();
  }
}

export async function executeCataloguePublicationPlan({ plan, pool, backupDir = 'hermes/backups/catalogue-publication', apply = false }) {
  if (plan?.plan_type === INDUSTRIAL_CREATE_PLAN_TYPE) {
    return executeIndustrialCreateBatchPublication({ plan, pool, backupDir, apply });
  }
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
    const backup = { schema_version: '1.0.0', created_at: new Date().toISOString(), plan_sha256: plan.plan_sha256, research_bundle_id: plan.research_bundle_id, target_sku: plan.target_sku, operations: plan.operations, before: row };
    backup.backup_sha256 = catalogueBackupHash(backup);
    fs.writeFileSync(backupPath, `${JSON.stringify(backup, null, 2)}\n`, { flag: 'wx' });
    const applicationOperations = plan.operations.filter((operation) => APPLICATION_PUBLICATION_FIELDS.has(operation.field));
    const genericOperations = plan.operations.filter((operation) => !APPLICATION_PUBLICATION_FIELDS.has(operation.field));

    if (genericOperations.length) {
      const genericPlan = { ...plan, operations: genericOperations };
      const patch = cataloguePlanPatch(genericPlan);
      assertGovernedCatalogPatch(row, patch, { applicationWrite: false });
      const update = compileUpdate(genericPlan);
      const changed = await client.query(update.sql, update.values);
      assert(changed.rowCount === 1, 'Catalogue update did not affect exactly one row');
    }

    if (applicationOperations.length) {
      const applicationParams = {
        sku: plan.target_sku,
        evidence: {
          authority: plan.application_evidence.authority,
          source_url: plan.application_evidence.source_url,
          evidence_hash: plan.application_evidence.evidence_hash,
          metadata: {
            ...(plan.application_evidence.metadata || {}),
            research_bundle_id: plan.research_bundle_id,
            publication_plan_sha256: plan.plan_sha256,
            approved_by: plan.approval.approved_by,
          },
        },
      };
      for (const operation of applicationOperations) applicationParams[operation.field] = operation.after;
      await applyVerifiedApplications(client, applicationParams);
    }

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
