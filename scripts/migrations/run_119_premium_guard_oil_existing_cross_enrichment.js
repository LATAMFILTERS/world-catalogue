'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const MIGRATION = '119_PREMIUM_GUARD_OIL_EXISTING_CROSS_ENRICHMENT';
const APPLY = process.argv.includes('--apply');
const MANIFEST = path.resolve(__dirname, '../candidates/premium_guard_oil_phase2b_ready_20260923.json');

function normalizeCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeBrand(value) {
  return normalizeCode(value);
}

function sslFor(url) {
  const host = new URL(url).hostname.toLowerCase();
  return ['127.0.0.1','localhost','::1'].includes(host) ? false : { rejectUnauthorized:false };
}

function codeFromRef(ref) {
  return String(ref?.code || ref?.part_number || ref?.reference || '').trim();
}

function brandFromRef(ref) {
  return String(ref?.manufacturer || ref?.brand || '').trim();
}

function mergePremiumGuardRef(existing, item) {
  const refs = Array.isArray(existing) ? [...existing] : [];
  const code = normalizeCode(item.premium_guard_code);
  const already = refs.some((ref) =>
    normalizeBrand(brandFromRef(ref)) === 'PREMIUMGUARD' &&
    normalizeCode(codeFromRef(ref)) === code
  );
  if (already) return refs;
  refs.push({
    manufacturer: 'PREMIUM GUARD',
    code: item.premium_guard_code,
    classification: 'AFTERMARKET',
    source_url: item.source_page,
    evidence_hash: item.source_html_sha256,
    evidence_authority: 'PREMIUM_GUARD_PUBLIC_PRODUCT_PAGE',
    verified_at: '2026-09-23T00:00:00.000Z',
  });
  return refs;
}
async function run() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing database URL');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  if (!Array.isArray(manifest) || manifest.length !== 91) {
    throw new Error('EXPECTED_91_MANIFEST_ROWS');
  }

  const client = new Client({ connectionString:databaseUrl, ssl:sslFor(databaseUrl) });
  const report = {
    migration:MIGRATION,
    mode:APPLY ? 'apply' : 'dry-run',
    manifest_rows:manifest.length,
    unique_target_skus:new Set(manifest.map((x) => x.target_sku)).size,
    preflight:{},
    mutations:{},
    audit:{},
  };

  await client.connect();
  try {
    await client.query('BEGIN');

    const duplicateCodes = manifest
      .map((x) => normalizeCode(x.premium_guard_code))
      .filter((code, index, all) => all.indexOf(code) !== index);
    if (duplicateCodes.length) throw new Error('DUPLICATE_MANIFEST_CODES:'+duplicateCodes.join(','));

    const forbidden = manifest.filter((x) => ['PG101','PG251'].includes(normalizeCode(x.premium_guard_code)));
    if (forbidden.length) throw new Error('COLLISION_CODES_MUST_NOT_BE_APPLIED');

    const targetSkus = [...new Set(manifest.map((x) => x.target_sku))];
    const catalogRows = await client.query(
      'select * from public.elimfilters_catalog where sku=any($1::text[]) for update',
      [targetSkus]
    );
    const bySku = new Map(catalogRows.rows.map((row) => [row.sku,row]));
    if (bySku.size !== targetSkus.length) {
      const missing = targetSkus.filter((sku) => !bySku.has(sku));
      throw new Error('TARGET_SKUS_MISSING:'+missing.join(','));
    }

    const ownershipRows = await client.query(
      `select elimfilters_sku as sku, competitor_brand as brand, competitor_part_number as code
       from ld_catalog.ld_competitor_cross_references
       where upper(regexp_replace(competitor_part_number,'[^A-Z0-9]','','g'))=any($1::text[])`,
      [manifest.map((x) => normalizeCode(x.premium_guard_code))]
    );
    const conflictingOwnership = ownershipRows.rows.filter((row) => {
      const item = manifest.find((x) => normalizeCode(x.premium_guard_code) === normalizeCode(row.code));
      return item && row.sku !== item.target_sku;
    });
    if (conflictingOwnership.length) {
      throw new Error('RELATIONAL_OWNER_CONFLICT:'+JSON.stringify(conflictingOwnership));
    }
    const manifestBySku = new Map();
    for (const item of manifest) {
      if (!manifestBySku.has(item.target_sku)) manifestBySku.set(item.target_sku, []);
      manifestBySku.get(item.target_sku).push(item);
    }

    const prepared = [];
    const gatewayBlocked = [];

    for (const [sku, items] of manifestBySku) {
      const row = bySku.get(sku);
      let nextCompetitors = Array.isArray(row.competitor_codes) ? [...row.competitor_codes] : [];
      for (const item of items) nextCompetitors = mergePremiumGuardRef(nextCompetitors, item);
      const patch = { competitor_codes: nextCompetitors };
      try {
        const validation = assertGovernedCatalogPatch(row, patch);
        prepared.push({ sku, items, row, nextCompetitors, validation });
      } catch (error) {
        gatewayBlocked.push({
          sku,
          premium_guard_codes:items.map((item) => item.premium_guard_code),
          error:error.message,
          validation:error.validation || null,
        });
      }
    }

    report.preflight.gateway_pass = prepared.reduce((n, row) => n + row.items.length, 0);
    report.preflight.gateway_pass_skus = prepared.length;
    report.preflight.gateway_blocked = gatewayBlocked;
    if (gatewayBlocked.length) {
      throw new Error('GATEWAY_BLOCKED_SKUS:'+gatewayBlocked.length);
    }

    if (!APPLY) {
      await client.query('ROLLBACK');
      report.transaction='ROLLBACK';
      return report;
    }

    let publicUpdated = 0;
    let relationalInserted = 0;
    for (const preparedRow of prepared) {
      const { sku, items, row, nextCompetitors } = preparedRow;
      const update = await client.query(
        'update public.elimfilters_catalog set competitor_codes=$1::jsonb where sku=$2',
        [JSON.stringify(nextCompetitors), sku]
      );
      if (update.rowCount !== 1) throw new Error('PUBLIC_UPDATE_FAILED:'+sku);
      publicUpdated += update.rowCount;

      for (const item of items) {
        const rel = await client.query(
          `insert into ld_catalog.ld_competitor_cross_references
            (elimfilters_sku,source_sku,competitor_brand,competitor_part_number)
           values ($1,$2,'PREMIUM GUARD',$3)
           on conflict (elimfilters_sku,competitor_brand,competitor_part_number) do nothing`,
          [sku,row.codigo_base,item.premium_guard_code]
        );
        relationalInserted += rel.rowCount;
      }
    }

    for (const sku of targetSkus) {
      await client.query('select refresh_crossref_cache_sku($1)',[sku]);
    }

    report.mutations.public_updated = publicUpdated;
    report.mutations.relational_inserted = relationalInserted;
    report.mutations.cache_refreshed_skus = targetSkus.length;
    const publicAudit = await client.query(
      `select count(*)::int n
       from public.elimfilters_catalog c
       cross join lateral jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) x
       where upper(regexp_replace(coalesce(x->>'manufacturer',x->>'brand',''),'[^A-Z0-9]','','g'))='PREMIUMGUARD'
         and upper(regexp_replace(coalesce(x->>'code',x->>'part_number',x->>'reference',''),'[^A-Z0-9]','','g'))=any($1::text[])
         and c.sku=any($2::text[])`,
      [manifest.map((x) => normalizeCode(x.premium_guard_code)),targetSkus]
    );
    const relationalAudit = await client.query(
      `select count(*)::int n
       from ld_catalog.ld_competitor_cross_references
       where upper(regexp_replace(competitor_brand,'[^A-Z0-9]','','g'))='PREMIUMGUARD'
         and upper(regexp_replace(competitor_part_number,'[^A-Z0-9]','','g'))=any($1::text[])
         and elimfilters_sku=any($2::text[])`,
      [manifest.map((x) => normalizeCode(x.premium_guard_code)),targetSkus]
    );

    const resolverAudit = await client.query(
      `select code,sku,status
       from public.v_api_resolver_v5
       where code=any($1::text[])`,
      [manifest.map((x) => normalizeCode(x.premium_guard_code))]
    );
    const resolverMap = new Map(resolverAudit.rows.map((row) => [normalizeCode(row.code),row]));
    const resolverFailures = manifest.filter((item) => {
      const row = resolverMap.get(normalizeCode(item.premium_guard_code));
      return !row || row.sku !== item.target_sku;
    }).map((item) => ({
      premium_guard_code:item.premium_guard_code,
      expected_sku:item.target_sku,
      actual:resolverMap.get(normalizeCode(item.premium_guard_code)) || null,
    }));

    report.audit.public_pg_refs = publicAudit.rows[0].n;
    report.audit.relational_pg_refs = relationalAudit.rows[0].n;
    report.audit.resolver_rows = resolverAudit.rowCount;
    report.audit.resolver_failures = resolverFailures;

    if (report.audit.public_pg_refs !== 91) throw new Error('PUBLIC_AUDIT_EXPECTED_91');
    if (report.audit.relational_pg_refs !== 91) throw new Error('RELATIONAL_AUDIT_EXPECTED_91');
    if (resolverFailures.length) throw new Error('RESOLVER_AUDIT_FAILED:'+resolverFailures.length);

    await client.query('COMMIT');
    report.transaction='COMMIT';
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
    .then((report) => console.log('[premium-guard-oil-existing-cross]',JSON.stringify(report,null,2)))
    .catch((error) => {
      console.error('[premium-guard-oil-existing-cross] failed',JSON.stringify(error.migrationReport || {error:error.message},null,2));
      console.error(error.stack || error.message);
      process.exit(1);
    });
}

module.exports = { MIGRATION, MANIFEST, mergePremiumGuardRef, run };
