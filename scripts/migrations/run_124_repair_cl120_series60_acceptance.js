'use strict';

const { Client } = require('pg');
const APPLY = process.argv.includes('--apply');

const KIT_SKU = 'EK50101';
const MAKE = 'FREIGHTLINER';
const MODEL_FAMILY = 'Columbia';
const MODEL_TYPE = 'Columbia CL120';
const ENGINE = 'Detroit Diesel Series 60';

const COMPONENTS = [
  ['EL82100','P552100','oil'],
  ['ES90463','P550463','fuel'],
  ['EF96916','P556916','fuel'],
  ['EW74685','P554685','coolant'],
  ['EA17682','P527682','air'],
  ['EL82518','P552518','oil'],
  ['EC14226','P614226','cabin']
];

const LEGACY_APPLICATIONS = ['EL32102','EA31300'];

async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');

  const client = new Client({ connectionString:url, ssl:{ rejectUnauthorized:false } });
  await client.connect();
  await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  try {
    const report = {
      mode: APPLY ? 'apply' : 'dry-run',
      kit_sku: KIT_SKU,
      expected_components: COMPONENTS.map(x => x[0]),
      legacy_rows_removed: 0,
      application_rows_upserted: 0,
      kit_rows_inserted: 0,
      kit_rows_removed: 0
    };

    const kit = await client.query(
      'SELECT kit_sku,brand,equipment_ref,duty FROM maintenance_kits WHERE kit_sku=$1',
      [KIT_SKU]
    );
    if (kit.rowCount !== 1) throw new Error('EK50101 maintenance kit missing or duplicated');
    if (String(kit.rows[0].brand || '').toUpperCase() !== MAKE) throw new Error('EK50101 brand mismatch');

    for (const item of COMPONENTS) {
      const sku = item[0], base = item[1], type = item[2];
      const row = await client.query(
        'SELECT sku,codigo_base,canonical_source_code,filter_type FROM public.elimfilters_catalog WHERE sku=$1',
        [sku]
      );
      if (row.rowCount !== 1) throw new Error(sku + ': canonical row missing or duplicated');
      const product = row.rows[0];
      const actualBase = product.canonical_source_code || product.codigo_base;
      if (String(actualBase || '').toUpperCase() !== base) {
        throw new Error(sku + ': expected base ' + base + ', got ' + actualBase);
      }
      if (String(product.filter_type || '').toLowerCase() !== type) {
        throw new Error(sku + ': expected filter_type ' + type + ', got ' + product.filter_type);
      }
    }

    const legacyRows = await client.query(
      "SELECT id,elimfilters_sku FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku = ANY($1) AND upper(coalesce(make,''))=$2 AND upper(coalesce(model_family,''))=upper($3) AND upper(coalesce(model_type,''))=upper($4) AND upper(coalesce(engine_code,''))=upper($5) ORDER BY elimfilters_sku,id",
      [LEGACY_APPLICATIONS,MAKE,MODEL_FAMILY,MODEL_TYPE,ENGINE]
    );
    report.legacy_candidates = legacyRows.rows;

    const currentKit = await client.query(
      'SELECT filter_sku FROM kit_components WHERE kit_sku=$1 ORDER BY filter_sku',
      [KIT_SKU]
    );
    report.kit_before = currentKit.rows.map(r => r.filter_sku);

    if (APPLY) {
      const removed = await client.query(
        "DELETE FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku = ANY($1) AND upper(coalesce(make,''))=$2 AND upper(coalesce(model_family,''))=upper($3) AND upper(coalesce(model_type,''))=upper($4) AND upper(coalesce(engine_code,''))=upper($5)",
        [LEGACY_APPLICATIONS,MAKE,MODEL_FAMILY,MODEL_TYPE,ENGINE]
      );
      report.legacy_rows_removed = removed.rowCount;

      for (const item of COMPONENTS) {
        const sku = item[0], base = item[1];
        const result = await client.query(
          "INSERT INTO ld_catalog.ld_vehicle_applications (elimfilters_sku,source_sku,make,model_family,model_type,year,engine_code,source_origin) VALUES ($1,$2,$3,$4,$5,NULL,$6,'run_124_cl120_series60_acceptance') ON CONFLICT (elimfilters_sku,make,model_family,model_type,year) DO UPDATE SET source_sku=EXCLUDED.source_sku,engine_code=EXCLUDED.engine_code,source_origin=EXCLUDED.source_origin",
          [sku,base,MAKE,MODEL_FAMILY,MODEL_TYPE,ENGINE]
        );
        report.application_rows_upserted += result.rowCount;
      }

      const keep = COMPONENTS.map(x => x[0]);
      const rm = await client.query(
        'DELETE FROM kit_components WHERE kit_sku=$1 AND NOT (filter_sku = ANY($2::varchar[]))',
        [KIT_SKU,keep]
      );
      report.kit_rows_removed = rm.rowCount;

      for (const item of COMPONENTS) {
        const ins = await client.query(
          'INSERT INTO kit_components (kit_sku,filter_sku) VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [KIT_SKU,item[0]]
        );
        report.kit_rows_inserted += ins.rowCount;
      }
    }

    const expected = COMPONENTS.map(x => x[0]).sort();
    const verifyKit = await client.query(
      'SELECT filter_sku FROM kit_components WHERE kit_sku=$1 ORDER BY filter_sku',
      [KIT_SKU]
    );
    report.kit_after = verifyKit.rows.map(r => r.filter_sku);

    const verifyApps = await client.query(
      "SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_vehicle_applications WHERE upper(coalesce(make,''))=$1 AND upper(coalesce(model_family,''))=upper($2) AND upper(coalesce(model_type,''))=upper($3) AND upper(coalesce(engine_code,''))=upper($4) AND elimfilters_sku = ANY($5::varchar[]) ORDER BY elimfilters_sku",
      [MAKE,MODEL_FAMILY,MODEL_TYPE,ENGINE,expected]
    );
    report.application_after = verifyApps.rows;

    if (APPLY) {
      const actualKit = report.kit_after.slice().sort();
      if (JSON.stringify(actualKit) !== JSON.stringify(expected)) {
        throw new Error('EK50101 component verification failed: ' + actualKit.join(','));
      }
      const appSkus = [...new Set(report.application_after.map(r => r.elimfilters_sku))].sort();
      if (JSON.stringify(appSkus) !== JSON.stringify(expected)) {
        throw new Error('CL120 application verification failed: ' + appSkus.join(','));
      }

      const legacyCheck = await client.query(
        "SELECT count(*)::int AS n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku = ANY($1) AND upper(coalesce(make,''))=$2 AND upper(coalesce(model_family,''))=upper($3) AND upper(coalesce(model_type,''))=upper($4) AND upper(coalesce(engine_code,''))=upper($5)",
        [LEGACY_APPLICATIONS,MAKE,MODEL_FAMILY,MODEL_TYPE,ENGINE]
      );
      if (legacyCheck.rows[0].n !== 0) throw new Error('Legacy CL120/S60 rows still present');

      await client.query('COMMIT');
      console.log(JSON.stringify(report,null,2));
      console.log('COMMIT');
    } else {
      await client.query('ROLLBACK');
      console.log(JSON.stringify(report,null,2));
      console.log('ROLLBACK (dry-run)');
    }
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
