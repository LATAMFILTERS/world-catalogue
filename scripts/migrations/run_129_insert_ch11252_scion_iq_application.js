'use strict';

// Inserts the single FRAM CH11252 application (SCION IQ 2012-2015 L4-1.3L) into EL36006.
// Requires run_128 to have removed the foreign CH11252 claims from EA36006 / EC36006 first.
// Every precondition is evaluated and reported; any failure aborts before the insert.
// Dry-run by default; --execute is required to COMMIT.

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const {
  partitionByDirectOwnership,
  partitionByApplicationCollision,
  classifyApplicationCollision
} = require('../hermes/apply-fram-ld-reconciliations');
const { publicFramOwners } = require('./run_128_remove_fram_oil_claims_from_6006_duplicates');

const EXECUTE = process.argv.includes('--execute');
const ROOT = path.resolve(__dirname, '../..');
const AUTHORITY = 'CH11252';
const TARGET_SKU = 'EL36006';
const SOURCE_ORIGIN = 'FRAM_LD_MULTI_REGION';
const CLEANED_DUPLICATES = ['EA36006', 'EC36006'];
const EVIDENCE_FILE = path.join(ROOT, 'elimfilters-vault/91-private-evidence/fram-usa-ld-catalog/fram-usa-ld-full-20260911/products', `${AUTHORITY}.json`);
const EXPECTED_EVIDENCE = { make: 'SCION', model: 'IQ', year: '15-12', engine: 'L4-1.3L' };

const norm = value => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const isFram = entry => entry && typeof entry === 'object' && norm(entry.manufacturer || entry.brand) === 'FRAM';

// Same column convention as the FRAM_LD_MULTI_REGION rows written by apply-fram-ld-reconciliations.
function buildApplicationRow(evidence) {
  return {
    elimfilters_sku: TARGET_SKU,
    source_sku: AUTHORITY,
    make: evidence.make,
    model_family: evidence.model,
    model_type: evidence.engine || '',
    year: evidence.year,
    engine_code: evidence.engine || null,
    source_origin: SOURCE_ORIGIN
  };
}

async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const report = { mode: EXECUTE ? 'execute' : 'dry-run', authority: AUTHORITY, target_sku: TARGET_SKU, preconditions: {} };
  const failures = [];
  const check = (name, ok, detail) => { report.preconditions[name] = ok ? 'PASS' : { FAIL: detail }; if (!ok) failures.push(name); };
  try {
    const target = (await client.query('SELECT current_database() AS db, inet_server_port() AS port')).rows[0];
    if (target.db !== 'catalogo_elimfilters' || Number(target.port) !== 5441) throw new Error(`WRONG_TARGET_DATABASE: ${JSON.stringify(target)}`);
    report.database = target;

    const sku = (await client.query(
      `SELECT sku,duty,filter_type FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE`, [TARGET_SKU]
    )).rows[0];
    check('TARGET_SKU_LIGHT_DUTY_OIL', sku && sku.duty === 'LIGHT_DUTY' && String(sku.filter_type).toLowerCase() === 'oil', sku);

    const ld = (await client.query(
      `SELECT array_agg(DISTINCT elimfilters_sku) AS owners FROM ld_catalog.ld_competitor_cross_references
        WHERE upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(competitor_part_number)=$1`,
      [AUTHORITY]
    )).rows[0].owners || [];
    check('SINGLE_LD_FRAM_OWNER', ld.length === 1 && ld[0] === TARGET_SKU, ld);

    const publicOwners = await publicFramOwners(client, [AUTHORITY]);
    const claimants = (publicOwners.get(AUTHORITY) || []).filter(s => s !== TARGET_SKU);
    const hd = claimants.length ? (await client.query(
      `SELECT sku FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) AND duty='HEAVY_DUTY'`, [claimants]
    )).rows.map(r => r.sku) : [];
    check('NO_OTHER_PUBLIC_FRAM_CLAIMANT', claimants.length === 0, claimants);
    check('NO_HEAVY_DUTY_CLAIMANT', hd.length === 0, hd);
    const entry = { authority: AUTHORITY, sku: TARGET_SKU, family: 'LUBE' };
    const ownership = partitionByDirectOwnership([entry], new Map([[AUTHORITY, ld]]), publicOwners);
    check('OWNERSHIP_GUARD', ownership.eligible.length === 1, ownership.held);

    const dupes = (await client.query(
      `SELECT sku,competitor_codes FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])`, [CLEANED_DUPLICATES]
    )).rows;
    for (const row of dupes) {
      const codes = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
      check(`RUN_128_CLEANUP_PRESENT_${row.sku}`, !codes.some(e => isFram(e) && norm(e.code) === AUTHORITY), 'exact FRAM CH11252 claim still present');
      check(`ECO_VARIANT_PRESENT_${row.sku}`, codes.some(e => isFram(e) && norm(e.code) === `${AUTHORITY}ECO`), 'CH11252ECO missing');
    }

    const evidence = JSON.parse(fs.readFileSync(EVIDENCE_FILE, 'utf8'));
    const proposal = evidence.public_catalog_proposal || {};
    const candidates = proposal.vehicle_application_candidates || [];
    check('FRAM_EVIDENCE_OIL_CARTRIDGE', proposal.product_type === 'Engine Oil Filter' && (proposal.technical_specifications || {}).style === 'Cartridge', proposal.product_type);
    const match = candidates.filter(x => x.make === EXPECTED_EVIDENCE.make && x.model === EXPECTED_EVIDENCE.model && x.year === EXPECTED_EVIDENCE.year && x.engine === EXPECTED_EVIDENCE.engine);
    check('FRAM_EVIDENCE_ROW_PRESENT', candidates.length === 1 && match.length === 1, candidates);
    const row = buildApplicationRow(EXPECTED_EVIDENCE);
    report.proposed_row = row;

    const duplicate = (await client.query(
      `SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND make=$2 AND model_family=$3 AND model_type=$4 AND year=$5`,
      [row.elimfilters_sku, row.make, row.model_family, row.model_type, row.year]
    )).rows;
    check('NOT_ALREADY_PRESENT', duplicate.length === 0, duplicate);

    const peers = (await client.query(
      `SELECT v.elimfilters_sku AS sku,v.make,v.model_family,v.model_type,v.year,v.engine_code,v.ccm,lower(c.filter_type) AS filter_type
         FROM ld_catalog.ld_vehicle_applications v JOIN public.elimfilters_catalog c ON c.sku=v.elimfilters_sku
        WHERE regexp_replace(upper(coalesce(v.make,'')),'[^A-Z0-9]','','g')=$1`,
      [norm(row.make)]
    )).rows;
    const rowResult = classifyApplicationCollision(row, 'oil', peers);
    report.collision_result = rowResult === 'HOLD_COLLISION' ? 'COLLISION' : 'NO_COLLISION';
    report.ambiguity_result = rowResult === 'HOLD_AMBIGUOUS_APPLICATION' ? 'AMBIGUOUS' : 'NOT_AMBIGUOUS';
    const authorityLevel = partitionByApplicationCollision([entry], new Map([[entry, [row]]]), new Map([[TARGET_SKU, 'oil']]), peers);
    check('COLLISION_AND_AMBIGUITY_GUARD', rowResult === null && authorityLevel.eligible.length === 1, rowResult);

    const readiness = (await client.query(
      `SELECT has_applications,md5(row(r.*)::text) AS h FROM ld_catalog.ld_production_readiness r WHERE elimfilters_sku=$1`, [TARGET_SKU]
    )).rows[0];
    report.readiness = { has_applications: readiness && readiness.has_applications, action: 'none (EL36006 already has applications; readiness is never written)' };

    if (failures.length) {
      report.inserted = 0;
      report.transaction = 'ROLLBACK';
      console.log(JSON.stringify(report, null, 2));
      throw new Error(`PRECONDITIONS_FAILED: ${failures.join(', ')}`);
    }

    const guardedCounts = async () => (await client.query(
      `SELECT (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications) AS apps,
              (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku<>$1) AS other_apps,
              (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE source_sku='CH10358') AS ch10358_apps,
              (SELECT md5(coalesce(string_agg(md5(row(x.*)::text),',' ORDER BY md5(row(x.*)::text)),'')) FROM ld_catalog.ld_competitor_cross_references x WHERE elimfilters_sku=ANY($2::text[])) AS competitor,
              (SELECT md5(coalesce(string_agg(md5(row(x.*)::text),',' ORDER BY md5(row(x.*)::text)),'')) FROM ld_catalog.ld_oem_cross_references x WHERE elimfilters_sku=$1) AS oem,
              (SELECT md5(coalesce(string_agg(md5(row(x.*)::text),',' ORDER BY md5(row(x.*)::text)),'')) FROM ld_catalog.ld_product_specifications x WHERE elimfilters_sku=$1) AS specs,
              (SELECT md5(coalesce(string_agg(md5(row(c.*)::text),',' ORDER BY sku),'')) FROM public.elimfilters_catalog c WHERE sku=ANY($2::text[])) AS public_rows,
              (SELECT md5(row(r.*)::text) FROM ld_catalog.ld_production_readiness r WHERE elimfilters_sku=$1) AS readiness`,
      [TARGET_SKU, [TARGET_SKU, ...CLEANED_DUPLICATES]]
    )).rows[0];
    const before = await guardedCounts();

    const inserted = await client.query(
      `INSERT INTO ld_catalog.ld_vehicle_applications (elimfilters_sku,source_sku,make,model_family,model_type,year,engine_code,ccm,kw,hp,source_origin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NULL,NULL,NULL,$8) RETURNING id`,
      [row.elimfilters_sku, row.source_sku, row.make, row.model_family, row.model_type, row.year, row.engine_code, row.source_origin]
    );
    if (inserted.rowCount !== 1) throw new Error('EXPECTED_EXACTLY_ONE_INSERT');

    const after = await guardedCounts();
    const verify = {
      exactly_one_row: after.apps === before.apps + 1,
      other_skus_unchanged: after.other_apps === before.other_apps,
      ch10358_untouched: after.ch10358_apps === before.ch10358_apps,
      competitor_unchanged: after.competitor === before.competitor,
      oem_unchanged: after.oem === before.oem,
      specs_unchanged: after.specs === before.specs,
      public_rows_unchanged: after.public_rows === before.public_rows,
      readiness_unchanged: after.readiness === before.readiness
    };
    report.post_insert_verification = verify;
    if (Object.values(verify).some(v => !v)) throw new Error(`POST_INSERT_VERIFY_FAILED: ${JSON.stringify(verify)}`);
    report.inserted = 1;

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

module.exports = { buildApplicationRow, AUTHORITY, TARGET_SKU, SOURCE_ORIGIN, EXPECTED_EVIDENCE };
