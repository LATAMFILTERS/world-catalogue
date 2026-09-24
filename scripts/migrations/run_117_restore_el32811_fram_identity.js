'use strict';

const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const MIGRATION = '117_RESTORE_EL32811_FRAM_IDENTITY';
const APPLY = process.argv.includes('--apply');
const OLD_SKU = 'EL36350';
const NEW_SKU = 'EL32811';
const BASE = 'CH12811';

function sslFor(url) {
  const host = new URL(url).hostname.toLowerCase();
  return ['127.0.0.1','localhost','::1'].includes(host) ? false : { rejectUnauthorized:false };
}

function correctedEnrichment(value) {
  const current = value || {};
  return {
    ...current,
    sku_governance: {
      ...(current.sku_governance || {}),
      canonical_sku: NEW_SKU,
      prior_sku: OLD_SKU,
      governing_rule: 'LD_NON_EUROPEAN_FRAM_CANONICAL_BASE_LAST4',
      canonical_base: BASE,
      canonical_suffix: '2811',
      correction_reason: 'EL36350 was derived from Hyundai/Kia OEM 26350-2S000 instead of canonical FRAM CH12811.',
      corrected_at: '2026-09-23T00:00:00.000Z'
    }
  };
}
async function run() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('Missing database URL');
  const client = new Client({ connectionString:url, ssl:sslFor(url) });
  const report = { migration:MIGRATION, mode:APPLY?'apply':'dry-run', old_sku:OLD_SKU, new_sku:NEW_SKU, checks:{}, mutations:{} };

  await client.connect();
  try {
    await client.query('BEGIN');

    const source = await client.query('select * from public.elimfilters_catalog where sku=$1 for update',[OLD_SKU]);
    const target = await client.query('select sku from public.elimfilters_catalog where sku=$1',[NEW_SKU]);
    report.checks.source_count = source.rowCount;
    report.checks.target_count = target.rowCount;

    if (source.rowCount !== 1) throw new Error('SOURCE_EL36350_NOT_UNIQUE');
    if (target.rowCount !== 0) throw new Error('TARGET_EL32811_ALREADY_EXISTS');

    const row = source.rows[0];
    if (row.codigo_base !== BASE || row.duty !== 'LIGHT_DUTY' || row.filter_type !== 'oil' ||
        row.technology !== 'SYNTRAX™' || row.canonical_source_brand !== 'FRAM' ||
        row.canonical_source_code !== BASE) {
      throw new Error('SOURCE_CANONICAL_IDENTITY_MISMATCH');
    }

    const enrichment = correctedEnrichment(row.enrichment_data);
    const patch = { sku:NEW_SKU, enrichment_data:enrichment };
    report.checks.gateway = assertGovernedCatalogPatch(row, patch);
    const appEvidence = await client.query('select count(*)::int n from public.catalog_application_evidence where sku=$1',[OLD_SKU]);
    const cache = await client.query('select count(*)::int n from public.crossref_resolved_cache where sku=$1',[OLD_SKU]);
    const ldParent = await client.query('select count(*)::int n from ld_catalog.ld_product_catalog where elimfilters_sku=$1',[OLD_SKU]);
    const identity = await client.query('select count(*)::int n from ld_catalog.ld_canonical_product_identity where elimfilters_sku=$1',[OLD_SKU]);

    report.checks.application_evidence = appEvidence.rows[0].n;
    report.checks.cache_rows = cache.rows[0].n;
    report.checks.ld_parent = ldParent.rows[0].n;
    report.checks.canonical_identity = identity.rows[0].n;

    if (ldParent.rows[0].n !== 1 || identity.rows[0].n !== 1) {
      throw new Error('LD_IDENTITY_PRECONDITION_FAILED');
    }

    if (APPLY) {
      const updated = await client.query(
        'update public.elimfilters_catalog set sku=$1,enrichment_data=$2::jsonb,description=$3 where sku=$4 returning sku,codigo_base,technology',
        [NEW_SKU,JSON.stringify(enrichment),
         'ELIMFILTERS® EL32811 cartridge lube oil filter. Canonical source FRAM CH12811; OEM family Hyundai/Kia 26350-2S000 / 26350-2S001.',
         OLD_SKU]
      );
      if (updated.rowCount !== 1) throw new Error('PUBLIC_SKU_RESTORE_FAILED');
      report.mutations.public_catalog = updated.rows[0];

      const parent = await client.query(
        'update ld_catalog.ld_product_catalog set elimfilters_sku=$1,updated_at=now() where elimfilters_sku=$2 returning elimfilters_sku,source_sku,segment',
        [NEW_SKU,OLD_SKU]
      );
      if (parent.rowCount !== 1) throw new Error('LD_PARENT_RESTORE_FAILED');
      report.mutations.ld_parent = parent.rows[0];

      const id = await client.query(
        "update ld_catalog.ld_canonical_product_identity set elimfilters_sku=$1,origin_group='NON_EUROPEAN',canonical_brand='FRAM',canonical_part_number=$2,filter_type='oil',status='ACTIVE',evidence_source='MIGRATION_117_RESTORE_EL32811_FRAM_IDENTITY',updated_at=now() where elimfilters_sku=$3 returning elimfilters_sku,canonical_brand,canonical_part_number",
        [NEW_SKU,BASE,OLD_SKU]
      );
      if (id.rowCount !== 1) throw new Error('CANONICAL_IDENTITY_RESTORE_FAILED');
      report.mutations.canonical_identity = id.rows[0];
      const evidenceMoved = await client.query(
        'update public.catalog_application_evidence set sku=$1 where sku=$2',
        [NEW_SKU,OLD_SKU]
      );
      report.mutations.application_evidence_moved = evidenceMoved.rowCount;

      await client.query('delete from public.crossref_resolved_cache where sku in ($1,$2)',[OLD_SKU,NEW_SKU]);
      await client.query('select refresh_crossref_cache_sku($1)',[NEW_SKU]);

      const audit = await client.query(
        "select " +
        "(select count(*)::int from public.elimfilters_catalog where sku=$1) new_public," +
        "(select count(*)::int from public.elimfilters_catalog where sku=$2) old_public," +
        "(select count(*)::int from ld_catalog.ld_product_catalog where elimfilters_sku=$1) ld_parent," +
        "(select count(*)::int from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1) competitor," +
        "(select count(*)::int from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1) oem," +
        "(select count(*)::int from ld_catalog.ld_vehicle_applications where elimfilters_sku=$1) applications," +
        "(select count(*)::int from ld_catalog.ld_product_specifications where elimfilters_sku=$1) specifications," +
        "(select count(*)::int from public.catalog_application_evidence where sku=$1) application_evidence," +
        "(select count(*)::int from public.crossref_resolved_cache where sku=$1) cache_rows," +
        "(select count(*)::int from ld_catalog.ld_canonical_product_identity where elimfilters_sku=$1 and canonical_brand='FRAM' and canonical_part_number=$3 and status='ACTIVE') identity",
        [NEW_SKU,OLD_SKU,BASE]
      );
      report.audit = audit.rows[0];

      const a = report.audit;
      if (a.new_public !== 1 || a.old_public !== 0 || a.ld_parent !== 1 ||
          a.competitor < 20 || a.oem !== 4 || a.applications !== 8 ||
          a.specifications !== 12 || a.application_evidence !== report.checks.application_evidence ||
          a.cache_rows < 20 || a.identity !== 1) {
        throw new Error('POSTWRITE_AUDIT_FAILED '+JSON.stringify(a));
      }

      const resolver = await client.query(
        "select code,sku,manufacturer,status from public.v_api_resolver_v7 where upper(regexp_replace(code,'[^A-Z0-9]','','g'))=any($1::text[]) order by code,sku",
        [['CH12811','263502S000','263502S001','WL10514']]
      );
      report.resolver = resolver.rows;
      if (resolver.rows.some(r => r.sku !== NEW_SKU)) {
        throw new Error('RESOLVER_POINTS_TO_WRONG_SKU '+JSON.stringify(resolver.rows));
      }

      await client.query('COMMIT');
    } else {
      await client.query('ROLLBACK');
    }

    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    return report;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw Object.assign(error,{migrationReport:report});
  } finally {
    await client.end();
  }
}
if (require.main === module) {
  run()
    .then(report => console.log('[restore-el32811]',JSON.stringify(report,null,2)))
    .catch(error => {
      console.error('[restore-el32811] failed',JSON.stringify(error.migrationReport || {error:error.message},null,2));
      console.error(error.stack || error.message);
      process.exit(1);
    });
}

module.exports = { MIGRATION, OLD_SKU, NEW_SKU, BASE, correctedEnrichment, run };
