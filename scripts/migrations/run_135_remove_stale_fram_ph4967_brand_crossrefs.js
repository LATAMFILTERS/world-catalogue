'use strict';

// Removes the stale FRAM PH4967 entry from brand_crossrefs.FRAM on the HD Donaldson SKUs
// EL82015 / EL82024. run_085 already removed the same contaminated PH4967 alternate from their
// competitor_codes while promoting EL34967 as canonical FRAM PH4967, but left this residue.
// Matching is by normalized value, never by array position. Dry-run by default; --execute commits.

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const {
  classifyApplicationCollision,
  isLegitimateFramMultiFit,
  loadFramMultiFitFacts
} = require('../hermes/apply-fram-ld-reconciliations');
const { publicFramOwners } = require('./run_128_remove_fram_oil_claims_from_6006_duplicates');

const EXECUTE = process.argv.includes('--execute');
const ROOT = path.resolve(__dirname, '../..');
const CODE = 'PH4967';
const CANONICAL = { sku: 'EL34967', duty: 'LIGHT_DUTY', filter_type: 'oil', brand: 'FRAM', code: 'PH4967' };
const TARGETS = {
  EL82015: { duty: 'HEAVY_DUTY', filter_type: 'oil', brand: 'DONALDSON', code: 'P502015' },
  EL82024: { duty: 'HEAVY_DUTY', filter_type: 'oil', brand: 'DONALDSON', code: 'P502024' }
};
const RUN_085 = path.join(__dirname, 'run_085_ph4967_canonical_repair.js');
const PRODUCTS = path.join(ROOT, 'elimfilters-vault/91-private-evidence/fram-usa-ld-catalog/fram-usa-ld-full-20260911/products');
const REEVALUATE = { authority: 'CH10358', sku: 'EL36006', filter_type: 'oil' };

const norm = value => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const fail = (code, detail) => { throw new Error(detail === undefined ? code : `${code}: ${JSON.stringify(detail)}`); };

// Pure: return brand_crossrefs with only normalized PH4967 removed from the FRAM list.
function removeFramCode(brandCrossrefs, code = CODE) {
  const source = brandCrossrefs && typeof brandCrossrefs === 'object' && !Array.isArray(brandCrossrefs) ? brandCrossrefs : {};
  const fram = Array.isArray(source.FRAM) ? source.FRAM : [];
  const kept = fram.filter(value => norm(value) !== code);
  const removed = fram.filter(value => norm(value) === code);
  if (!kept.length) fail('FRAM_LIST_WOULD_BECOME_EMPTY');
  return { next: { ...source, FRAM: kept }, removed, kept };
}

async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const report = { mode: EXECUTE ? 'execute' : 'dry-run', code: CODE, targets: Object.keys(TARGETS), preconditions: {} };
  const failures = [];
  const check = (name, ok, detail) => { report.preconditions[name] = ok ? 'PASS' : { FAIL: detail }; if (!ok) failures.push(name); };
  try {
    const target = (await client.query('SELECT current_database() AS db, inet_server_port() AS port')).rows[0];
    if (target.db !== 'catalogo_elimfilters' || Number(target.port) === 5432) fail('WRONG_TARGET_DATABASE', target);
    report.database = target;

    const skus = [CANONICAL.sku, ...Object.keys(TARGETS)];
    const rows = new Map((await client.query(
      `SELECT sku,duty,filter_type,canonical_source_brand,canonical_source_code,canonical_source_status,brand_crossrefs,competitor_codes,
              md5(row(c.*)::text) AS row_hash,md5((to_jsonb(c)-'brand_crossrefs')::text) AS rest_hash
         FROM public.elimfilters_catalog c WHERE sku=ANY($1::text[]) FOR UPDATE`,
      [skus]
    )).rows.map(r => [r.sku, r]));

    const c = rows.get(CANONICAL.sku);
    check('CANONICAL_EL34967_FRAM_PH4967_VERIFIED', c && c.duty === CANONICAL.duty && c.filter_type === CANONICAL.filter_type
      && c.canonical_source_brand === CANONICAL.brand && c.canonical_source_code === CANONICAL.code && c.canonical_source_status === 'VERIFIED', c && { duty: c.duty, filter_type: c.filter_type, canonical: [c.canonical_source_brand, c.canonical_source_code, c.canonical_source_status] });
    const identity = (await client.query(
      `SELECT elimfilters_sku,canonical_brand,canonical_part_number,status FROM ld_catalog.ld_canonical_product_identity
        WHERE elimfilters_sku=$1 OR regexp_replace(upper(canonical_part_number),'[^A-Z0-9]','','g')=$2`,
      [CANONICAL.sku, CODE]
    )).rows;
    check('CANONICAL_IDENTITY_ACTIVE', identity.length === 1 && identity[0].elimfilters_sku === CANONICAL.sku && identity[0].canonical_brand === 'FRAM'
      && norm(identity[0].canonical_part_number) === CODE && identity[0].status === 'ACTIVE', identity);
    const ldOwners = (await client.query(
      `SELECT DISTINCT elimfilters_sku FROM ld_catalog.ld_competitor_cross_references
        WHERE upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(competitor_part_number)=$1`,
      [CODE]
    )).rows.map(r => r.elimfilters_sku);
    check('SINGLE_LD_FRAM_OWNER_EL34967', ldOwners.length === 1 && ldOwners[0] === CANONICAL.sku, ldOwners);

    for (const [sku, expected] of Object.entries(TARGETS)) {
      const r = rows.get(sku);
      check(`${sku}_HD_DONALDSON_VERIFIED`, r && r.duty === expected.duty && r.filter_type === expected.filter_type && r.canonical_source_brand === expected.brand
        && r.canonical_source_code === expected.code && r.canonical_source_status === 'VERIFIED', r && { duty: r.duty, filter_type: r.filter_type, canonical: [r.canonical_source_brand, r.canonical_source_code, r.canonical_source_status] });
      const fram = r && r.brand_crossrefs && Array.isArray(r.brand_crossrefs.FRAM) ? r.brand_crossrefs.FRAM : [];
      check(`${sku}_FRAM_LIST_HAS_PH4967`, fram.filter(v => norm(v) === CODE).length === 1, fram);
      const comp = r && Array.isArray(r.competitor_codes) ? r.competitor_codes : [];
      check(`${sku}_COMPETITOR_CODES_WITHOUT_PH4967`, !comp.some(e => norm(typeof e === 'string' ? e : e && e.code) === CODE), 'competitor_codes still contains PH4967');
    }

    const run085 = fs.existsSync(RUN_085) ? fs.readFileSync(RUN_085, 'utf8') : '';
    check('RUN_085_GOVERNANCE_PRESENT', /WHERE c\.sku IN \([^)]*'EL82015','EL82024'\)/.test(run085) && /ph4967_alternates_removed_from_rows/.test(run085)
      && /VALUES \('EL34967','NON_EUROPEAN','FRAM','PH4967'/.test(run085), 'run_085 PH4967 alternate cleanup / EL34967 promotion not found');

    const anyClaims = (await client.query(
      `SELECT DISTINCT c.sku FROM public.elimfilters_catalog c CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(c.competitor_codes)='array' THEN c.competitor_codes ELSE '[]'::jsonb END) e
        WHERE regexp_replace(upper(coalesce(e->>'code',e#>>'{}')),'[^A-Z0-9]','','g')=$1`,
      [CODE]
    )).rows.map(r => r.sku);
    const framClaims = (await publicFramOwners(client, [CODE])).get(CODE) || [];
    const unexpected = [...new Set([...anyClaims, ...framClaims])].filter(s => !skus.includes(s));
    check('NO_UNEXPECTED_PUBLIC_CLAIMANT', unexpected.length === 0, unexpected);
    report.public_claimants_before = [...new Set([...anyClaims, ...framClaims])].sort();

    const plan = {};
    for (const sku of Object.keys(TARGETS)) {
      const r = rows.get(sku);
      try { plan[sku] = { before: r.brand_crossrefs, ...removeFramCode(r.brand_crossrefs) }; } catch (e) { check(`${sku}_FRAM_LIST_REMAINS_NON_EMPTY`, false, e.message); }
    }
    report.fram_before = Object.fromEntries(Object.entries(plan).map(([sku, p]) => [sku, p.before.FRAM]));
    report.fram_after_planned = Object.fromEntries(Object.entries(plan).map(([sku, p]) => [sku, p.kept]));

    if (failures.length) {
      report.updated = 0;
      report.transaction = 'ROLLBACK';
      console.log(JSON.stringify(report, null, 2));
      fail('PRECONDITIONS_FAILED', failures);
    }

    const guarded = async () => (await client.query(
      `SELECT (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications) AS apps,
              (SELECT md5(coalesce(string_agg(md5(row(r.*)::text),',' ORDER BY elimfilters_sku),'')) FROM ld_catalog.ld_production_readiness r WHERE elimfilters_sku=ANY($1::text[])) AS readiness,
              (SELECT md5(coalesce(string_agg(md5(row(i.*)::text),',' ORDER BY md5(row(i.*)::text)),'')) FROM ld_catalog.ld_canonical_product_identity i WHERE elimfilters_sku=ANY($1::text[])) AS identity,
              (SELECT md5(coalesce(string_agg(md5(row(x.*)::text),',' ORDER BY md5(row(x.*)::text)),'')) FROM ld_catalog.ld_competitor_cross_references x WHERE elimfilters_sku=ANY($1::text[])) AS ld_competitor,
              (SELECT md5(coalesce(string_agg(md5(row(p.*)::text),',' ORDER BY elimfilters_sku),'')) FROM ld_catalog.ld_product_catalog p WHERE elimfilters_sku=ANY($1::text[])) AS ld_product,
              (SELECT md5(coalesce(string_agg(sku||'|'||code||'|'||manufacturer||'|'||score,',' ORDER BY sku,code,manufacturer),'')) FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])) AS cache`,
      [skus]
    )).rows[0];
    const before = await guarded();

    let updated = 0;
    for (const [sku, p] of Object.entries(plan)) {
      const result = await client.query(
        `UPDATE public.elimfilters_catalog SET brand_crossrefs=$2::jsonb WHERE sku=$1 AND brand_crossrefs=$3::jsonb`,
        [sku, JSON.stringify(p.next), JSON.stringify(p.before)]
      );
      if (result.rowCount !== 1) fail('CONCURRENT_BRAND_CROSSREFS_CHANGE', { sku });
      updated += result.rowCount;
    }

    const after = new Map((await client.query(
      `SELECT sku,brand_crossrefs,md5(row(c.*)::text) AS row_hash,md5((to_jsonb(c)-'brand_crossrefs')::text) AS rest_hash
         FROM public.elimfilters_catalog c WHERE sku=ANY($1::text[])`,
      [skus]
    )).rows.map(r => [r.sku, r]));
    const sorted = obj => JSON.stringify(Object.keys(obj || {}).sort().map(k => [k, obj[k]]));
    let removed = 0;
    const verify = { exactly_two_rows_updated: updated === 2, canonical_EL34967_unchanged: after.get(CANONICAL.sku).row_hash === rows.get(CANONICAL.sku).row_hash };
    report.fram_after = {};
    for (const sku of Object.keys(TARGETS)) {
      const b = rows.get(sku);
      const a = after.get(sku);
      const beforeFram = b.brand_crossrefs.FRAM;
      const afterFram = a.brand_crossrefs.FRAM;
      removed += beforeFram.filter(v => norm(v) === CODE).length - afterFram.filter(v => norm(v) === CODE).length;
      report.fram_after[sku] = afterFram;
      verify[`${sku}_only_ph4967_removed`] = JSON.stringify(afterFram) === JSON.stringify(beforeFram.filter(v => norm(v) !== CODE));
      const { FRAM: _bf, ...otherBefore } = b.brand_crossrefs;
      const { FRAM: _af, ...otherAfter } = a.brand_crossrefs;
      verify[`${sku}_other_brands_unchanged`] = sorted(otherBefore) === sorted(otherAfter);
      verify[`${sku}_other_columns_unchanged`] = a.rest_hash === b.rest_hash;
    }
    verify.exactly_two_ph4967_claims_removed = removed === 2;
    const afterGuarded = await guarded();
    for (const key of Object.keys(before)) verify[`${key}_unchanged`] = afterGuarded[key] === before[key];
    const claimantsAfter = (await publicFramOwners(client, [CODE])).get(CODE) || [];
    const hdAfter = claimantsAfter.length ? (await client.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) AND duty='HEAVY_DUTY'`, [claimantsAfter])).rows.map(r => r.sku) : [];
    verify.no_hd_public_claimant = hdAfter.length === 0;
    const ldAfter = (await client.query(
      `SELECT DISTINCT elimfilters_sku FROM ld_catalog.ld_competitor_cross_references WHERE upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(competitor_part_number)=$1`, [CODE]
    )).rows.map(r => r.elimfilters_sku);
    verify.ld_owner_still_EL34967 = ldAfter.length === 1 && ldAfter[0] === CANONICAL.sku;
    report.public_claimants_after = claimantsAfter;
    report.post_mutation_verification = verify;
    report.updated = updated;
    report.ph4967_claims_removed = removed;
    if (Object.values(verify).some(v => !v)) fail('POST_MUTATION_VERIFY_FAILED', verify);

    // Read-only re-evaluation of CH10358 -> EL36006 with the current guard (no application is written).
    const evidence = JSON.parse(fs.readFileSync(path.join(PRODUCTS, `${REEVALUATE.authority}.json`), 'utf8'));
    const own = new Set((await client.query(`SELECT make,model_family,model_type,year FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1`, [REEVALUATE.sku])).rows
      .map(r => [norm(r.make), norm(r.model_family), norm(r.model_type), String(r.year || '').trim()].join('|')));
    const candidates = ((evidence.public_catalog_proposal || {}).vehicle_application_candidates || [])
      .filter(x => x.make && x.model && x.year)
      .map(x => ({ elimfilters_sku: REEVALUATE.sku, source_sku: REEVALUATE.authority, source_origin: 'FRAM_LD_MULTI_REGION', make: x.make, model_family: x.model, model_type: x.engine || '', year: x.year, engine_code: x.engine || null }))
      .filter(r => !own.has([norm(r.make), norm(r.model_family), norm(r.model_type), String(r.year).trim()].join('|')));
    const peers = (await client.query(
      `SELECT v.elimfilters_sku AS sku,v.source_sku,v.source_origin,v.make,v.model_family,v.model_type,v.year,v.engine_code,v.ccm,lower(c.filter_type) AS filter_type
         FROM ld_catalog.ld_vehicle_applications v JOIN public.elimfilters_catalog c ON c.sku=v.elimfilters_sku
        WHERE regexp_replace(upper(coalesce(v.make,'')),'[^A-Z0-9]','','g')=ANY($1::text[])`,
      [[...new Set(candidates.map(r => norm(r.make)))]]
    )).rows;
    const pairs = [{ sku: REEVALUATE.sku, authority: REEVALUATE.authority }, ...peers.filter(p => p.source_origin === 'FRAM_LD_MULTI_REGION').map(p => ({ sku: p.sku, authority: p.source_sku }))];
    const facts = await loadFramMultiFitFacts(client, pairs, a => path.join(PRODUCTS, `${a}.json`));
    report.ch10358_reevaluation = candidates.map(r => ({
      row: [r.make, r.model_family, r.year, r.engine_code].join(' '),
      result: classifyApplicationCollision(r, REEVALUATE.filter_type, peers, (x, o) => isLegitimateFramMultiFit(x, o, facts)) || 'SAFE'
    }));

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

module.exports = { removeFramCode, CODE, CANONICAL, TARGETS };
