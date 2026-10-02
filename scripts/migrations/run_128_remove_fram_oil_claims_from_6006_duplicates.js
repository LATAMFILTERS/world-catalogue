'use strict';

// Removes the FRAM oil-cartridge claims CH10358 / CH11252 from the air (EA36006) and cabin
// (EC36006) duplicates of EL36006. Governed by duplicate_product_quarantine EA36006 -> EL36006
// ("clear searchable refs from EA duplicate") and FRAM's own product type (Engine Oil Filter /
// Cartridge). Entries are matched by normalized manufacturer + code, never by array position.
// Dry-run by default; --execute is required to COMMIT.

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const {
  partitionByDirectOwnership,
  partitionByApplicationCollision,
  classifyApplicationCollision
} = require('../hermes/apply-fram-ld-reconciliations');

const EXECUTE = process.argv.includes('--execute');
const ROOT = path.resolve(__dirname, '../..');
const OWNER = { sku: 'EL36006', filter_type: 'oil' };
const TARGETS = { EA36006: 'air', EC36006: 'cabin' };
const CODES = ['CH10358', 'CH11252'];
const SURVIVING_VARIANTS = ['CH10358ECO', 'CH11252ECO'];
const EVIDENCE_DIR = path.join(ROOT, 'elimfilters-vault/91-private-evidence/fram-usa-ld-catalog/fram-usa-ld-full-20260911/products');
const EXPECTED_APPLICATIONS = {
  CH11252: { missing: 1, collision: 0, ambiguous: 0, rows: ['SCION IQ 15-12 L4-1.3L'] },
  CH10358: { missing: 12, collision: 5, ambiguous: 2 }
};

const norm = value => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const isFram = entry => entry && typeof entry === 'object' && norm(entry.manufacturer || entry.brand) === 'FRAM';
const codeOf = entry => norm(typeof entry === 'string' ? entry : entry && entry.code);

// Pure: split a competitor_codes array into kept entries and the exact FRAM CH10358/CH11252 claims.
function removeExactFramClaims(entries, codes = CODES) {
  const kept = [];
  const removed = [];
  for (const entry of Array.isArray(entries) ? entries : []) {
    if (isFram(entry) && codes.includes(codeOf(entry))) removed.push(entry);
    else kept.push(entry);
  }
  return { kept, removed };
}

function fail(code, detail) {
  throw new Error(detail === undefined ? code : `${code}: ${JSON.stringify(detail)}`);
}

async function publicFramOwners(client, codes) {
  const rows = (await client.query(
    `SELECT part,array_agg(DISTINCT sku) AS owners FROM (
       SELECT regexp_replace(upper(x),'[^A-Z0-9]','','g') AS part,c.sku FROM public.elimfilters_catalog c CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN jsonb_typeof(c.brand_crossrefs->'FRAM')='array' THEN c.brand_crossrefs->'FRAM' ELSE '[]'::jsonb END) x
       UNION ALL
       SELECT regexp_replace(upper(e->>'code'),'[^A-Z0-9]','','g'),c.sku FROM public.elimfilters_catalog c CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(c.competitor_codes)='array' THEN c.competitor_codes ELSE '[]'::jsonb END) e WHERE jsonb_typeof(e)='object' AND upper(regexp_replace(coalesce(e->>'brand',e->>'manufacturer',''),'[^A-Za-z0-9]','','g'))='FRAM'
     ) s WHERE part=ANY($1::text[]) GROUP BY 1`,
    [codes]
  )).rows;
  return new Map(rows.map(r => [r.part, r.owners]));
}

async function cacheRows(client, skus) {
  return (await client.query(
    `SELECT sku,code,manufacturer,score FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[]) ORDER BY sku,code,manufacturer`,
    [skus]
  )).rows.map(r => `${r.sku}|${r.code}|${r.manufacturer}|${r.score}`);
}

async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const report = { mode: EXECUTE ? 'execute' : 'dry-run', owner: OWNER.sku, targets: Object.keys(TARGETS), codes: CODES };
  try {
    const target = (await client.query('SELECT current_database() AS db, inet_server_port() AS port')).rows[0];
    if (target.db !== 'catalogo_elimfilters' || Number(target.port) === 5432) fail('WRONG_TARGET_DATABASE', target);
    report.database = target;

    // Preconditions (fail closed).
    const skus = [OWNER.sku, ...Object.keys(TARGETS)];
    const rows = new Map((await client.query(
      `SELECT sku,duty,filter_type,competitor_codes,md5(row(c.*)::text) AS row_hash,md5(coalesce(brand_crossrefs::text,'')) AS bx_hash
         FROM public.elimfilters_catalog c WHERE sku=ANY($1::text[]) FOR UPDATE`,
      [skus]
    )).rows.map(r => [r.sku, r]));
    for (const [sku, type] of [[OWNER.sku, OWNER.filter_type], ...Object.entries(TARGETS)]) {
      const r = rows.get(sku);
      if (!r || r.duty !== 'LIGHT_DUTY' || String(r.filter_type).toLowerCase() !== type) fail('SKU_PRECONDITION_FAILED', { sku, expected: type, got: r && { duty: r.duty, filter_type: r.filter_type } });
    }

    const ldOwners = new Map((await client.query(
      `SELECT ld_catalog.norm_part(competitor_part_number) AS part,array_agg(DISTINCT elimfilters_sku) AS owners
         FROM ld_catalog.ld_competitor_cross_references
        WHERE upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM'
          AND ld_catalog.norm_part(competitor_part_number)=ANY($1::text[]) GROUP BY 1`,
      [CODES]
    )).rows.map(r => [r.part, r.owners]));
    for (const code of CODES) {
      const owners = ldOwners.get(code) || [];
      if (owners.length !== 1 || owners[0] !== OWNER.sku) fail('LD_FRAM_OWNER_PRECONDITION_FAILED', { code, owners });
      const evidence = JSON.parse(fs.readFileSync(path.join(EVIDENCE_DIR, `${code}.json`), 'utf8'));
      const proposal = evidence.public_catalog_proposal || {};
      if (proposal.product_type !== 'Engine Oil Filter' || (proposal.technical_specifications || {}).style !== 'Cartridge') {
        fail('FRAM_EVIDENCE_PRECONDITION_FAILED', { code, product_type: proposal.product_type });
      }
    }

    const duplicate = (await client.query(
      `SELECT bad_sku,good_sku,reason FROM public.duplicate_product_quarantine WHERE bad_sku='EA36006' AND good_sku=$1`,
      [OWNER.sku]
    )).rows;
    if (duplicate.length !== 1 || !/clear searchable refs from EA duplicate/i.test(duplicate[0].reason)) fail('DUPLICATE_QUARANTINE_PRECONDITION_FAILED', duplicate);
    report.duplicate_quarantine = duplicate[0];

    const ownersBefore = await publicFramOwners(client, CODES);
    for (const code of CODES) {
      const unexpected = (ownersBefore.get(code) || []).filter(s => !(s in TARGETS));
      if (unexpected.length) fail('UNEXPECTED_PUBLIC_FRAM_CLAIMANTS', { code, unexpected });
    }

    const plan = {};
    for (const sku of Object.keys(TARGETS)) {
      const before = rows.get(sku).competitor_codes || [];
      const { kept, removed } = removeExactFramClaims(before);
      const removedCodes = removed.map(codeOf).sort();
      if (removedCodes.join(',') !== [...CODES].sort().join(',')) fail('EXACT_CLAIMS_PRECONDITION_FAILED', { sku, removed });
      plan[sku] = { before, kept, removed };
    }
    report.entries_to_remove = Object.fromEntries(Object.entries(plan).map(([sku, p]) => [sku, p.removed]));

    const cacheBefore = await cacheRows(client, Object.keys(TARGETS));
    const appsBefore = (await client.query(`SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications`)).rows[0].n;
    const readinessBefore = (await client.query(
      `SELECT md5(string_agg(md5(row(r.*)::text),',' ORDER BY elimfilters_sku)) h FROM ld_catalog.ld_production_readiness r WHERE elimfilters_sku=ANY($1::text[])`,
      [skus]
    )).rows[0].h;

    // Mutation: competitor_codes of the two duplicates only; optimistic match on the previous value.
    for (const [sku, p] of Object.entries(plan)) {
      const updated = await client.query(
        `UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb WHERE sku=$1 AND competitor_codes=$3::jsonb`,
        [sku, JSON.stringify(p.kept), JSON.stringify(p.before)]
      );
      if (updated.rowCount !== 1) fail('CONCURRENT_COMPETITOR_CODES_CHANGE', { sku });
    }

    // Post-write verification inside the same transaction.
    const after = new Map((await client.query(
      `SELECT sku,competitor_codes,md5(row(c.*)::text) AS row_hash,md5(coalesce(brand_crossrefs::text,'')) AS bx_hash
         FROM public.elimfilters_catalog c WHERE sku=ANY($1::text[])`,
      [skus]
    )).rows.map(r => [r.sku, r]));
    if (after.get(OWNER.sku).row_hash !== rows.get(OWNER.sku).row_hash) fail('OWNER_ROW_MODIFIED');
    report.counts = {};
    for (const sku of Object.keys(TARGETS)) {
      const b = plan[sku].before;
      const a = after.get(sku).competitor_codes || [];
      const count = list => ({ total: list.length, fram: list.filter(isFram).length, non_fram: list.filter(e => !isFram(e)).length });
      const cb = count(b);
      const ca = count(a);
      report.counts[sku] = { before: cb, after: ca };
      if (ca.total !== cb.total - 2 || ca.fram !== cb.fram - 2 || ca.non_fram !== cb.non_fram) fail('POST_COUNT_MISMATCH', { sku, before: cb, after: ca });
      if (a.some(e => isFram(e) && CODES.includes(codeOf(e)))) fail('TARGET_CLAIM_SURVIVED', { sku });
      for (const variant of SURVIVING_VARIANTS) if (!a.some(e => isFram(e) && codeOf(e) === variant)) fail('ECO_VARIANT_REMOVED', { sku, variant });
      if (after.get(sku).bx_hash !== rows.get(sku).bx_hash) fail('BRAND_CROSSREFS_MODIFIED', { sku });
    }
    report.counts[OWNER.sku] = { competitor_codes: (after.get(OWNER.sku).competitor_codes || []).length, unchanged: true };

    // The existing trg_sync_crossref_cache rebuilds the cache for each updated SKU: only the two codes may disappear.
    const cacheAfter = await cacheRows(client, Object.keys(TARGETS));
    const gone = cacheBefore.filter(r => !cacheAfter.includes(r));
    const added = cacheAfter.filter(r => !cacheBefore.includes(r));
    if (added.length || gone.some(r => !CODES.includes(norm(r.split('|')[1])))) fail('CROSSREF_CACHE_UNEXPECTED_DIFF', { gone, added });
    report.crossref_cache = { before: cacheBefore.length, after: cacheAfter.length, removed: gone };

    const appsAfter = (await client.query(`SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications`)).rows[0].n;
    const readinessAfter = (await client.query(
      `SELECT md5(string_agg(md5(row(r.*)::text),',' ORDER BY elimfilters_sku)) h FROM ld_catalog.ld_production_readiness r WHERE elimfilters_sku=ANY($1::text[])`,
      [skus]
    )).rows[0].h;
    if (appsAfter !== appsBefore || readinessAfter !== readinessBefore) fail('APPLICATION_OR_READINESS_WRITTEN');

    // Ownership re-validation with the governed reconciliation guard.
    const entries = CODES.map(authority => ({ authority, sku: OWNER.sku, family: 'LUBE' }));
    const ownership = partitionByDirectOwnership(entries, ldOwners, await publicFramOwners(client, CODES));
    if (ownership.held.length) fail('OWNERSHIP_STILL_HELD', ownership.held);
    report.ownership = Object.fromEntries(CODES.map(code => [code, `DIRECTLY_OWNED by ${OWNER.sku}`]));

    // Application status (reported only; this migration never writes applications).
    const own = new Set((await client.query(
      `SELECT make,model_family,model_type,year FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1`,
      [OWNER.sku]
    )).rows.map(r => [norm(r.make), norm(r.model_family), norm(r.model_type), String(r.year || '').trim()].join('|')));
    const rowsByEntry = new Map();
    for (const entry of entries) {
      const evidence = JSON.parse(fs.readFileSync(path.join(EVIDENCE_DIR, `${entry.authority}.json`), 'utf8'));
      rowsByEntry.set(entry, ((evidence.public_catalog_proposal || {}).vehicle_application_candidates || [])
        .filter(x => x.make && x.model && x.year)
        .map(x => ({ elimfilters_sku: OWNER.sku, source_sku: entry.authority, make: x.make, model_family: x.model, model_type: x.engine || '', year: x.year, engine_code: x.engine || null }))
        .filter(r => !own.has([norm(r.make), norm(r.model_family), norm(r.model_type), String(r.year).trim()].join('|'))));
    }
    const makes = [...new Set([...rowsByEntry.values()].flat().map(r => norm(r.make)))];
    const peers = (await client.query(
      `SELECT v.elimfilters_sku AS sku,v.make,v.model_family,v.model_type,v.year,v.engine_code,v.ccm,lower(c.filter_type) AS filter_type
         FROM ld_catalog.ld_vehicle_applications v JOIN public.elimfilters_catalog c ON c.sku=v.elimfilters_sku
        WHERE regexp_replace(upper(coalesce(v.make,'')),'[^A-Z0-9]','','g')=ANY($1::text[])`,
      [makes]
    )).rows;
    const collision = partitionByApplicationCollision(entries, rowsByEntry, new Map([[OWNER.sku, OWNER.filter_type]]), peers);
    report.applications = {};
    for (const entry of entries) {
      const list = rowsByEntry.get(entry).map(r => ({ row: [r.make, r.model_family, r.year, r.engine_code].join(' '), result: classifyApplicationCollision(r, OWNER.filter_type, peers) || 'NO_COLLISION' }));
      const summary = { missing: list.length, collision: list.filter(x => x.result === 'HOLD_COLLISION').length, ambiguous: list.filter(x => x.result === 'HOLD_AMBIGUOUS_APPLICATION').length, rows: list };
      const expected = EXPECTED_APPLICATIONS[entry.authority];
      if (summary.missing !== expected.missing || summary.collision !== expected.collision || summary.ambiguous !== expected.ambiguous
        || (expected.rows && JSON.stringify(list.map(x => x.row)) !== JSON.stringify(expected.rows))) fail('APPLICATION_STATUS_CHANGED', { authority: entry.authority, summary });
      summary.status = collision.eligible.includes(entry) ? 'SAFE_APPLICATION_CANDIDATE (not inserted)' : 'HOLD_APPLICATION (authority held as a whole; not inserted)';
      report.applications[entry.authority] = summary;
    }

    if (EXECUTE) await client.query('COMMIT');
    else await client.query('ROLLBACK');
    report.transaction = EXECUTE ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
    console.log(EXECUTE ? 'COMMIT' : 'ROLLBACK (dry-run)');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}

module.exports = { removeExactFramClaims, CODES, TARGETS, OWNER, SURVIVING_VARIANTS };
