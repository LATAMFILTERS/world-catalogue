'use strict';

const { Client } = require('pg');

const EXECUTE = process.argv.includes('--execute');
const TARGET_SKU = 'EC14226';
const DONALDSON = 'P614226';
const SOURCE_APPLICATION_SKU = 'EA17682';
const EXPECTED_CROSSES = Object.freeze([
  { manufacturer: 'DONALDSON', code: 'P614226' },
  { manufacturer: 'FLEETGUARD', code: 'AF26428' },
  { manufacturer: 'FREIGHTLINER', code: '91595' },
  { manufacturer: 'FREIGHTLINER', code: 'BOA91595' }
]);

function norm(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function codeOf(entry) {
  return entry?.code || entry?.reference || entry?.part_number || entry?.partNumber || null;
}

function mergeCrosses(existing, incoming) {
  const out = Array.isArray(existing) ? [...existing] : [];
  const seen = new Set(out.map(item => `${String(item?.manufacturer || '').toUpperCase()}|${norm(codeOf(item))}`));
  for (const item of incoming) {
    const key = `${String(item.manufacturer || '').toUpperCase()}|${norm(item.code)}`;
    if (!seen.has(key)) {
      out.push(item);
      seen.add(key);
    }
  }
  return out;
}

function identityCodes(row) {
  return [
    row.codigo_base,
    row.canonical_source_code,
    ...(row.oem_codes || []).map(codeOf),
    ...(row.competitor_codes || []).map(codeOf),
    ...Object.values(row.brand_crossrefs || {}).flatMap(value =>
      Array.isArray(value) ? value.map(codeOf).concat(value) : [codeOf(value), value]
    )
  ].map(norm).filter(Boolean);
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
      `SELECT sku,codigo_base,canonical_source_code,filter_type,technology,duty,
              oem_codes,competitor_codes,brand_crossrefs
         FROM public.elimfilters_catalog
        WHERE sku = $1`,
      [TARGET_SKU]
    );

    if (targetResult.rowCount !== 1) {
      throw new Error(`TARGET_IDENTITY_COUNT ${TARGET_SKU} rowCount=${targetResult.rowCount}`);
    }

    const target = targetResult.rows[0];
    if (!/cabin/i.test(String(target.filter_type || ''))) {
      throw new Error(`TARGET_NOT_CABIN ${TARGET_SKU} filter_type=${target.filter_type}`);
    }
    if (target.technology && !/MICROKAPPA/i.test(String(target.technology))) {
      throw new Error(`TARGET_TECHNOLOGY_MISMATCH ${TARGET_SKU} technology=${target.technology}`);
    }

    const codesBefore = identityCodes(target);
    const baseConflict = [target.codigo_base, target.canonical_source_code]
      .filter(Boolean)
      .map(norm)
      .some(code => code !== norm(DONALDSON));
    if (baseConflict) {
      throw new Error(
        `TARGET_BASE_CONFLICT ${TARGET_SKU} codigo_base=${target.codigo_base} canonical_source_code=${target.canonical_source_code}`
      );
    }

    const duplicateIdentity = await client.query(
      `SELECT sku,codigo_base,canonical_source_code,filter_type
         FROM public.elimfilters_catalog
        WHERE sku <> $1
          AND (
            upper(regexp_replace(coalesce(codigo_base,''), '[^A-Z0-9]', '', 'g')) = $2
            OR upper(regexp_replace(coalesce(canonical_source_code,''), '[^A-Z0-9]', '', 'g')) = $2
            OR upper(regexp_replace(coalesce(oem_codes::text,''), '[^A-Z0-9]', '', 'g')) LIKE '%' || $2 || '%'
            OR upper(regexp_replace(coalesce(competitor_codes::text,''), '[^A-Z0-9]', '', 'g')) LIKE '%' || $2 || '%'
            OR upper(regexp_replace(coalesce(brand_crossrefs::text,''), '[^A-Z0-9]', '', 'g')) LIKE '%' || $2 || '%'
          )`,
      [TARGET_SKU, norm(DONALDSON)]
    );
    if (duplicateIdentity.rowCount) {
      throw new Error(`DUPLICATE_DONALDSON_IDENTITY ${JSON.stringify(duplicateIdentity.rows)}`);
    }

    const mergedCrosses = mergeCrosses(target.competitor_codes, EXPECTED_CROSSES);
    await client.query(
      `UPDATE public.elimfilters_catalog
          SET codigo_base = COALESCE(NULLIF(codigo_base,''), $2),
              canonical_source_code = COALESCE(NULLIF(canonical_source_code,''), $2),
              technology = COALESCE(NULLIF(technology,''), 'MICROKAPPA™'),
              competitor_codes = $3::jsonb
        WHERE sku = $1`,
      [TARGET_SKU, DONALDSON, JSON.stringify(mergedCrosses)]
    );

    await client.query(
      `INSERT INTO ld_catalog.ld_product_catalog (elimfilters_sku, source_sku, segment)
       VALUES ($1, $2, 'Cabin Filter')
       ON CONFLICT (elimfilters_sku) DO NOTHING`,
      [TARGET_SKU, DONALDSON]
    );

    const sourceApps = await client.query(
      `SELECT make,model_family,model_type,year,engine_code
         FROM ld_catalog.ld_vehicle_applications
        WHERE elimfilters_sku = $1
          AND upper(coalesce(make,'')) = 'FREIGHTLINER'
          AND upper(coalesce(model_family,'')) = 'COLUMBIA'
          AND upper(coalesce(model_type,'')) IN ('COLUMBIA CL120','COLUMBIA 120')
          AND upper(coalesce(engine_code,'')) LIKE '%DETROIT%'
        ORDER BY year NULLS LAST, id`,
      [SOURCE_APPLICATION_SKU]
    );

    if (!sourceApps.rowCount) {
      throw new Error(`SOURCE_APPLICATION_MISSING ${SOURCE_APPLICATION_SKU} CL120 Series 60`);
    }

    for (const app of sourceApps.rows) {
      await client.query(
        `INSERT INTO ld_catalog.ld_vehicle_applications
           (elimfilters_sku,source_sku,make,model_family,model_type,year,engine_code,source_origin)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'run_122_cl120_cabin_p614226')
         ON CONFLICT (elimfilters_sku,make,model_family,model_type,year)
         DO UPDATE SET
           source_sku = EXCLUDED.source_sku,
           engine_code = COALESCE(EXCLUDED.engine_code, ld_catalog.ld_vehicle_applications.engine_code),
           source_origin = EXCLUDED.source_origin`,
        [
          TARGET_SKU,
          DONALDSON,
          app.make,
          app.model_family,
          app.model_type,
          app.year,
          app.engine_code
        ]
      );
    }

    const kits = await client.query(
      `SELECT kit_sku,name,equipment_ref
         FROM maintenance_kits
        WHERE upper(coalesce(brand,'')) = 'FREIGHTLINER'
          AND upper(coalesce(equipment_ref,'')) LIKE '%COLUMBIA%'
          AND upper(coalesce(equipment_ref,'')) LIKE '%CL120%'
          AND upper(coalesce(equipment_ref,'')) LIKE '%SERIES 60%'
        ORDER BY kit_sku`
    );

    if (!kits.rowCount) {
      throw new Error('CL120_SERIES60_MAINTENANCE_KIT_MISSING');
    }

    for (const kit of kits.rows) {
      await client.query(
        `INSERT INTO kit_components (kit_sku, filter_sku)
         VALUES ($1,$2)
         ON CONFLICT DO NOTHING`,
        [kit.kit_sku, TARGET_SKU]
      );
    }

    const verification = await client.query(
      `SELECT sku,codigo_base,canonical_source_code,filter_type,technology,competitor_codes
         FROM public.elimfilters_catalog
        WHERE sku = $1`,
      [TARGET_SKU]
    );
    const repaired = verification.rows[0];
    const repairedCodes = identityCodes(repaired);
    for (const expected of EXPECTED_CROSSES.map(item => norm(item.code))) {
      if (!repairedCodes.includes(expected)) {
        throw new Error(`CROSS_REFERENCE_MISSING ${expected}`);
      }
    }

    const appCheck = await client.query(
      `SELECT count(*)::int AS n
         FROM ld_catalog.ld_vehicle_applications
        WHERE elimfilters_sku = $1
          AND upper(coalesce(make,'')) = 'FREIGHTLINER'
          AND upper(coalesce(model_family,'')) = 'COLUMBIA'
          AND upper(coalesce(model_type,'')) IN ('COLUMBIA CL120','COLUMBIA 120')
          AND upper(coalesce(engine_code,'')) LIKE '%DETROIT%'`,
      [TARGET_SKU]
    );
    if (appCheck.rows[0].n !== sourceApps.rowCount) {
      throw new Error(
        `APPLICATION_COUNT_MISMATCH target=${appCheck.rows[0].n} source=${sourceApps.rowCount}`
      );
    }

    const kitCheck = await client.query(
      `SELECT kc.kit_sku
         FROM kit_components kc
         JOIN maintenance_kits mk ON mk.kit_sku = kc.kit_sku
        WHERE kc.filter_sku = $1
          AND upper(coalesce(mk.brand,'')) = 'FREIGHTLINER'
          AND upper(coalesce(mk.equipment_ref,'')) LIKE '%CL120%'
          AND upper(coalesce(mk.equipment_ref,'')) LIKE '%SERIES 60%'
        ORDER BY kc.kit_sku`,
      [TARGET_SKU]
    );
    if (kitCheck.rowCount !== kits.rowCount) {
      throw new Error(`KIT_COMPONENT_MISMATCH target=${kitCheck.rowCount} kits=${kits.rowCount}`);
    }

    console.log(JSON.stringify({
      mode: EXECUTE ? 'execute' : 'dry-run',
      target: {
        sku: TARGET_SKU,
        codigo_base_before: target.codigo_base,
        canonical_source_code_before: target.canonical_source_code,
        identity_had_p614226_before: codesBefore.includes(norm(DONALDSON)),
        codigo_base_after: repaired.codigo_base,
        canonical_source_code_after: repaired.canonical_source_code,
        filter_type: repaired.filter_type,
        technology: repaired.technology
      },
      crosses: EXPECTED_CROSSES,
      cloned_application_rows: sourceApps.rowCount,
      verified_application_rows: appCheck.rows[0].n,
      kits: kits.rows,
      kit_components_verified: kitCheck.rows,
      scraper_identity: {
        donaldson: DONALDSON,
        fleetguard: 'AF26428',
        freightliner: ['91595', 'BOA91595']
      }
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
