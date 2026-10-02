'use strict';

const { Client } = require('pg');

const EXECUTE = process.argv.includes('--execute');
const SOURCE_SKU = 'EA31300';
const TARGET_SKU = 'EA17682';
const DONALDSON = 'P527682';
const MANN = 'C341300';

function norm(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function sameIdentity(row) {
  const codes = [
    row.codigo_base,
    row.canonical_source_code,
    ...(row.competitor_codes || []).flatMap(x => [x?.code, x?.reference]),
    ...Object.values(row.brand_crossrefs || {}).flat()
  ].map(norm);
  return codes.includes(norm(DONALDSON)) && codes.includes(norm(MANN));
}

async function main() {
  const url = process.env.CATALOG_DATABASE_URL
    || process.env.ELIMFILTERS_DATABASE_URL
    || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  try {
    const targetResult = await client.query(
      `SELECT sku,codigo_base,canonical_source_code,filter_type,duty,competitor_codes,brand_crossrefs
         FROM public.elimfilters_catalog
        WHERE sku = $1`,
      [TARGET_SKU]
    );
    if (targetResult.rowCount !== 1) {
      throw new Error(`TARGET_IDENTITY_MISSING ${TARGET_SKU}`);
    }
    if (!sameIdentity(targetResult.rows[0])) {
      throw new Error(
        `TARGET_IDENTITY_MISMATCH ${TARGET_SKU} expected ${DONALDSON} + ${MANN}`
      );
    }

    await client.query(
      `INSERT INTO ld_catalog.ld_product_catalog (elimfilters_sku, source_sku, segment)
       VALUES ($1, $2, $3)
       ON CONFLICT (elimfilters_sku) DO NOTHING`,
      [TARGET_SKU, DONALDSON, 'Air Filter']
    );

    const sourceIdentity = await client.query(
      `SELECT sku,codigo_base,canonical_source_code
         FROM public.elimfilters_catalog
        WHERE sku = $1`,
      [SOURCE_SKU]
    );

    const badRows = await client.query(
      `SELECT id,elimfilters_sku,make,model_family,model_type,year,engine_code
         FROM ld_catalog.ld_vehicle_applications
        WHERE elimfilters_sku = $1
          AND upper(coalesce(make,'')) = 'FREIGHTLINER'
          AND upper(coalesce(model_family,'')) = 'COLUMBIA'
          AND upper(coalesce(model_type,'')) IN ('COLUMBIA CL120','COLUMBIA 120')
          AND upper(coalesce(engine_code,'')) LIKE '%DETROIT%'
        ORDER BY id`,
      [SOURCE_SKU]
    );

    console.log(JSON.stringify({
      mode: EXECUTE ? 'execute' : 'dry-run',
      source_identity: sourceIdentity.rows,
      target_identity: targetResult.rows.map(r => ({
        sku: r.sku,
        codigo_base: r.codigo_base,
        canonical_source_code: r.canonical_source_code
      })),
      contaminated_application_rows: badRows.rows
    }, null, 2));
    let updated = 0;
    let deduped = 0;

    for (const row of badRows.rows) {
      const duplicate = await client.query(
        `SELECT id
           FROM ld_catalog.ld_vehicle_applications
          WHERE elimfilters_sku = $1
            AND make IS NOT DISTINCT FROM $2
            AND model_family IS NOT DISTINCT FROM $3
            AND model_type IS NOT DISTINCT FROM $4
            AND year IS NOT DISTINCT FROM $5
            AND engine_code IS NOT DISTINCT FROM $6
          LIMIT 1`,
        [TARGET_SKU, row.make, row.model_family, row.model_type, row.year, row.engine_code]
      );

      if (duplicate.rowCount) {
        await client.query(
          'DELETE FROM ld_catalog.ld_vehicle_applications WHERE id = $1',
          [row.id]
        );
        deduped += 1;
      } else {
        await client.query(
          'UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku = $1 WHERE id = $2',
          [TARGET_SKU, row.id]
        );
        updated += 1;
      }
    }

    const remaining = await client.query(
      `SELECT count(*)::int AS n
         FROM ld_catalog.ld_vehicle_applications
        WHERE elimfilters_sku = $1
          AND upper(coalesce(make,'')) = 'FREIGHTLINER'
          AND upper(coalesce(model_family,'')) = 'COLUMBIA'
          AND upper(coalesce(model_type,'')) IN ('COLUMBIA CL120','COLUMBIA 120')
          AND upper(coalesce(engine_code,'')) LIKE '%DETROIT%'`,
      [SOURCE_SKU]
    );

    const repaired = await client.query(
      `SELECT id,elimfilters_sku,make,model_family,model_type,year,engine_code
         FROM ld_catalog.ld_vehicle_applications
        WHERE elimfilters_sku = $1
          AND upper(coalesce(make,'')) = 'FREIGHTLINER'
          AND upper(coalesce(model_family,'')) = 'COLUMBIA'
          AND upper(coalesce(model_type,'')) IN ('COLUMBIA CL120','COLUMBIA 120')
          AND upper(coalesce(engine_code,'')) LIKE '%DETROIT%'
        ORDER BY id`,
      [TARGET_SKU]
    );

    if (remaining.rows[0].n !== 0) {
      throw new Error(`REPAIR_INCOMPLETE remaining=${remaining.rows[0].n}`);
    }
    if (badRows.rowCount && !repaired.rowCount) {
      throw new Error('REPAIR_INCOMPLETE target application missing');
    }
    console.log(JSON.stringify({
      mutation: {
        updated,
        deduped,
        remaining_source_rows: remaining.rows[0].n
      },
      repaired_application_rows: repaired.rows
    }, null, 2));

    if (EXECUTE) {
      await client.query('COMMIT');
      console.log('COMMIT');
    } else {
      await client.query('ROLLBACK');
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
