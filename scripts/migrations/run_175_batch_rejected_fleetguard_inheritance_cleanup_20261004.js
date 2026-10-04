'use strict';

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { TARGETS } = require('./run_174_revert_cross_reference_authority_promotions');
const { normalizeCode } = require('../../lib/catalog-codigo-base-policy');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--apply');
const POLICY_VERSION = '2026-10-04-rejected-inheritance-batch-v1';
const SOURCE_URL = 'https://github.com/LATAMFILTERS/world-catalogue/blob/main/scripts/migrations/run_175_batch_rejected_fleetguard_inheritance_cleanup_20261004.js';

function norm(value) {
  return normalizeCode(value || '');
}

function inheritedFrom(row = {}) {
  const data = row.enrichment_data && typeof row.enrichment_data === 'object' && !Array.isArray(row.enrichment_data)
    ? row.enrichment_data
    : {};
  return String(data.equipment_inherited_from || '').trim();
}

function rejectedRelationPresence(row = {}, rejectedCode) {
  const rejected = norm(rejectedCode);
  const competitorCodes = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
  const inCompetitor = competitorCodes.some((entry) =>
    norm(entry?.manufacturer || entry?.brand) === 'DONALDSON' &&
    norm(entry?.code || entry?.reference) === rejected
  );

  const refs = row.brand_crossrefs && typeof row.brand_crossrefs === 'object' && !Array.isArray(row.brand_crossrefs)
    ? row.brand_crossrefs
    : {};
  const inBrandCrossrefs = Object.entries(refs).some(([brand, values]) =>
    norm(brand) === 'DONALDSON' &&
    Array.isArray(values) && values.some((value) => norm(value) === rejected)
  );

  return { inCompetitor, inBrandCrossrefs, present: inCompetitor || inBrandCrossrefs };
}

function candidateDecision(row, target, options = {}) {
  const [sku, rejected, fleetguardBase] = target;
  if (!row) return { eligible: false, reason: 'SKU_MISSING', sku };
  if (row.catalog_active !== true) return { eligible: false, reason: 'SKU_INACTIVE', sku };
  if (!/^HF/.test(norm(fleetguardBase))) return { eligible: false, reason: 'TARGET_NOT_FLEETGUARD_BASE', sku };
  if (norm(row.codigo_base) !== norm(fleetguardBase)) return { eligible: false, reason: 'FLEETGUARD_BASE_NOT_RESTORED', sku };
  const source = inheritedFrom(row);
  if (!source) return { eligible: false, reason: 'NO_HISTORICAL_INHERITANCE', sku };
  const presence = rejectedRelationPresence(row, rejected);
  if (!presence.present) return { eligible: false, reason: 'REJECTED_RELATION_ALREADY_REMOVED', sku };
  if (options.hasIndependentVerifiedApplications === true) {
    return { eligible: false, reason: 'INDEPENDENT_APPLICATION_EVIDENCE', sku };
  }
  return { eligible: true, reason: 'ELIGIBLE', sku, rejected, fleetguardBase, inheritedFrom: source, presence };
}

function cleanRejectedCompetitorCodes(row, rejectedCode) {
  const rejected = norm(rejectedCode);
  const before = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
  return before.filter((entry) => !(
    norm(entry?.manufacturer || entry?.brand) === 'DONALDSON' &&
    norm(entry?.code || entry?.reference) === rejected
  ));
}

function cleanRejectedBrandCrossrefs(row, rejectedCode) {
  const rejected = norm(rejectedCode);
  const source = row.brand_crossrefs && typeof row.brand_crossrefs === 'object' && !Array.isArray(row.brand_crossrefs)
    ? row.brand_crossrefs
    : {};
  const next = {};
  for (const [brand, values] of Object.entries(source)) {
    if (!Array.isArray(values)) {
      next[brand] = values;
      continue;
    }
    const filtered = norm(brand) === 'DONALDSON'
      ? values.filter((value) => norm(value) !== rejected)
      : [...values];
    if (filtered.length) next[brand] = filtered;
  }
  return next;
}

function currentEquipmentApplications(row = {}) {
  return Array.isArray(row.equipment_applications) ? row.equipment_applications : [];
}

async function hasIndependentVerifiedApplicationEvidence(client, row) {
  const apps = currentEquipmentApplications(row);
  if (!apps.length) return false;
  const result = await client.query(`
    SELECT EXISTS (
      SELECT 1
      FROM catalog_application_evidence e
      WHERE e.sku=$1
        AND e.application_kind='EQUIPMENT'
        AND e.verified IS TRUE
        AND e.payload_hash=md5($2::jsonb::text)
    ) AS verified
  `, [row.sku, JSON.stringify(apps)]);
  return result.rows[0]?.verified === true;
}

async function tableExists(client, regclass) {
  const result = await client.query('SELECT to_regclass($1) AS name', [regclass]);
  return Boolean(result.rows[0]?.name);
}

async function quarantineRejectedRelation(client, row, rejectedCode) {
  if (!await tableExists(client, 'public.bad_crossref_quarantine')) return;
  await client.query(`
    INSERT INTO bad_crossref_quarantine(
      query_code,source_sku,source_base,source_duty,source_filter_type,source_field,brand,reason
    )
    SELECT $1,$2,$3,$4,$5,'competitor_codes','DONALDSON','USER_REJECTED_RELATION__HISTORICAL_INHERITANCE_CLEANUP'
    WHERE NOT EXISTS (
      SELECT 1 FROM bad_crossref_quarantine
      WHERE query_code=$1 AND source_sku=$2 AND source_field='competitor_codes'
    )
  `, [rejectedCode, row.sku, row.codigo_base, row.duty, row.filter_type]);
}

async function markResearching(client, sku, evidence) {
  if (!await tableExists(client, 'public.catalog_sku_certification')) return;
  await client.query(`
    UPDATE catalog_sku_certification
       SET certification_state='RESEARCHING',
           blocker_count=1,
           blockers=ARRAY['HERMES_RESEARCH_REQUIRED']::text[],
           evidence=coalesce(evidence,'{}'::jsonb) || $2::jsonb,
           certified_at=NULL,
           audited_at=now()
     WHERE sku=$1
  `, [sku, JSON.stringify(evidence)]);
}

async function enqueueHermes(client, sku) {
  if (!await tableExists(client, 'public.hermes_catalogue_backlog')) return { queued: false, reason: 'BACKLOG_TABLE_ABSENT' };

  const existing = await client.query(
    "SELECT 1 FROM hermes_catalogue_backlog WHERE sku=$1 AND gap_type='SOURCE' LIMIT 1",
    [sku]
  );
  if (existing.rowCount) {
    const columns = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='hermes_catalogue_backlog'
    `);
    const names = new Set(columns.rows.map((row) => row.column_name));
    const sets = ["status='OPEN'", 'research_attempts=0', 'next_attempt_at=NULL', 'updated_at=now()'];
    if (names.has('recommended_action')) sets.push("recommended_action='RESEARCH_PRIMARY_IDENTITY'");
    await client.query(
      `UPDATE hermes_catalogue_backlog SET ${sets.join(', ')} WHERE sku=$1 AND gap_type='SOURCE'`,
      [sku]
    );
    return { queued: true, mode: 'REOPENED' };
  }

  const cols = await client.query(`
    SELECT column_name,is_nullable,column_default
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='hermes_catalogue_backlog'
    ORDER BY ordinal_position
  `);
  const names = new Set(cols.rows.map((row) => row.column_name));
  const fields = ['backlog_id','sku','gap_type','status'];
  const values = ['$1','$2',"'SOURCE'","'OPEN'"];
  const params = [`SOURCE:${sku}`, sku];
  const optional = [
    ['priority','1'],
    ['recommended_action',"'RESEARCH_PRIMARY_IDENTITY'"],
    ['research_attempts','0'],
    ['next_attempt_at','NULL'],
    ['opened_at','now()'],
    ['created_at','now()'],
    ['updated_at','now()'],
  ];
  for (const [name, sqlValue] of optional) {
    if (names.has(name)) { fields.push(name); values.push(sqlValue); }
  }

  const supplied = new Set(fields);
  const unknownRequired = cols.rows.filter((column) =>
    column.is_nullable === 'NO' &&
    !column.column_default &&
    !supplied.has(column.column_name)
  );
  if (unknownRequired.length) {
    throw new Error('HERMES_BACKLOG_SCHEMA_UNSUPPORTED:' + unknownRequired.map((x) => x.column_name).join(','));
  }

  await client.query(
    `INSERT INTO hermes_catalogue_backlog(${fields.join(',')}) VALUES(${values.join(',')})`,
    params
  );
  return { queued: true, mode: 'INSERTED' };
}

async function processCandidate(client, row, target) {
  const [sku, rejected, fleetguardBase] = target;
  const cleanedCompetitors = cleanRejectedCompetitorCodes(row, rejected);
  const cleanedBrandCrossrefs = cleanRejectedBrandCrossrefs(row, rejected);
  const removedCompetitor = cleanedCompetitors.length < (Array.isArray(row.competitor_codes) ? row.competitor_codes.length : 0);

  if (removedCompetitor) {
    assertGovernedCatalogPatch(row, { competitor_codes: cleanedCompetitors }, { rejectionCleanup: true });
  }

  const applications = currentEquipmentApplications(row);
  if (applications.length) {
    const evidenceHash = crypto.createHash('sha256').update(JSON.stringify({
      policy: POLICY_VERSION,
      sku,
      rejected_relation: rejected,
      inherited_from: inheritedFrom(row),
      action: 'REMOVE_UNVERIFIED_INHERITED_EQUIPMENT_APPLICATIONS',
    })).digest('hex');
    await applyVerifiedApplications(client, {
      sku,
      equipment_applications: [],
      evidence: {
        authority: 'ELIMFILTERS_GOVERNANCE',
        source_url: SOURCE_URL,
        evidence_hash: evidenceHash,
        metadata: {
          policy_version: POLICY_VERSION,
          reason: 'Historical inherited applications removed because the rejected Donaldson relation is not canonical authority and the payload has no independent verified evidence.',
          inherited_from: inheritedFrom(row),
          rejected_relation: rejected,
          fleetguard_base: fleetguardBase,
        },
      },
    });
  }

  const refreshed = await client.query(
    'SELECT enrichment_data FROM elimfilters_catalog WHERE sku=$1 FOR UPDATE',
    [sku]
  );
  const enrichment = refreshed.rows[0]?.enrichment_data && typeof refreshed.rows[0].enrichment_data === 'object'
    ? { ...refreshed.rows[0].enrichment_data }
    : {};
  const sourceSku = String(enrichment.equipment_inherited_from || inheritedFrom(row) || '').trim();
  delete enrichment.equipment_inherited_from;
  delete enrichment.equipment_inheritance_date;
  delete enrichment.equipment_inheritance_shared_codes;
  enrichment.resolution_status = {
    state: 'HERMES_RESEARCHING',
    reason: 'REJECTED_DONALDSON_RELATION_AND_UNVERIFIED_HISTORICAL_INHERITANCE_REMOVED',
    rejected_relation: rejected,
    fleetguard_base: fleetguardBase,
    inherited_from: sourceSku || null,
    policy_version: POLICY_VERSION,
    updated_at: new Date().toISOString(),
  };

  await client.query(`
    UPDATE elimfilters_catalog
       SET competitor_codes=$2::jsonb,
           brand_crossrefs=$3::jsonb,
           enrichment_data=$4::jsonb
     WHERE sku=$1
  `, [sku, JSON.stringify(cleanedCompetitors), JSON.stringify(cleanedBrandCrossrefs), JSON.stringify(enrichment)]);

  await quarantineRejectedRelation(client, row, rejected);
  await markResearching(client, sku, {
    policy_version: POLICY_VERSION,
    rejected_relation: rejected,
    fleetguard_base: fleetguardBase,
    inherited_from: sourceSku || null,
    resolution: 'HERMES_RESEARCHING',
  });
  const hermes = await enqueueHermes(client, sku);

  return {
    sku,
    rejected_relation: rejected,
    fleetguard_base: fleetguardBase,
    inherited_from: sourceSku || null,
    removed_competitor_relation: removedCompetitor,
    cleared_equipment_applications: applications.length,
    hermes,
  };
}

async function main() {
  const connectionString = process.env.SEARCH_DB_URL || process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Missing SEARCH_DB_URL/CATALOG_DATABASE_URL/DATABASE_URL');
  const parsed = new URL(connectionString);
  if (parsed.hostname !== '127.0.0.1' || !['5432','5441'].includes(parsed.port) || parsed.pathname !== '/catalogo_elimfilters') {
    throw new Error('REFUSE_NON_LOCAL_CATALOG_DB');
  }

  const client = new Client({ connectionString, ssl: false });
  await client.connect();
  const report = { policy_version: POLICY_VERSION, mode: APPLY ? 'apply' : 'dry-run', eligible: [], exceptions: [], transaction: null };

  try {
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    for (const target of TARGETS) {
      const [sku] = target;
      const result = await client.query('SELECT * FROM elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku]);
      if (result.rowCount !== 1) {
        report.exceptions.push({ sku, reason: 'SKU_MISSING' });
        continue;
      }
      const row = result.rows[0];
      const independentEvidence = await hasIndependentVerifiedApplicationEvidence(client, row);
      const decision = candidateDecision(row, target, { hasIndependentVerifiedApplications: independentEvidence });
      if (!decision.eligible) {
        report.exceptions.push({ sku, reason: decision.reason });
        continue;
      }
      const processed = await processCandidate(client, row, target);
      report.eligible.push(processed);
    }

    if (APPLY) {
      await client.query('COMMIT');
      report.transaction = 'COMMIT';
    } else {
      await client.query('ROLLBACK');
      report.transaction = 'ROLLBACK';
    }

    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.stack || error);
    process.exit(1);
  });
}

module.exports = {
  POLICY_VERSION,
  candidateDecision,
  rejectedRelationPresence,
  cleanRejectedCompetitorCodes,
  cleanRejectedBrandCrossrefs,
  main,
};
