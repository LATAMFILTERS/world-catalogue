'use strict';

const { Client } = require('pg');

const APPLY = process.argv.includes('--apply');

function norm(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
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
    const report = {
      mode: APPLY ? 'apply' : 'dry-run',
      safe_repairs: [],
      holds: [],
      mutations: {
        app_rows_inserted: 0,
        app_rows_updated: 0,
        kit_rows_inserted: 0
      }
    };

    // 1) Public application evidence exists but relational app rows are absent.
    // Only auto-repair when public vehicle_applications carries explicit make/model/year
    // and the SKU has a unique canonical catalog identity.
    const missingRel = await client.query(`
      SELECT sku,codigo_base,canonical_source_code,filter_type,duty,vehicle_applications
      FROM public.elimfilters_catalog
      WHERE jsonb_typeof(coalesce(vehicle_applications,'[]'::jsonb))='array'
        AND jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb))>0
        AND NOT EXISTS (
          SELECT 1 FROM ld_catalog.ld_vehicle_applications v
          WHERE v.elimfilters_sku=public.elimfilters_catalog.sku
        )
      ORDER BY sku
    `);

    for (const row of missingRel.rows) {
      const base = row.canonical_source_code || row.codigo_base;
      if (!base) {
        report.holds.push({ type:'MISSING_RELATIONAL_APPLICATIONS', sku:row.sku, reason:'NO_CANONICAL_SOURCE' });
        continue;
      }

      const apps = Array.isArray(row.vehicle_applications) ? row.vehicle_applications : [];
      const normalized = [];
      let invalid = false;

      for (const app of apps) {
        const make = app.make || app.manufacturer || null;
        const model = app.model_family || app.model || app.equipment || null;
        const modelType = app.model_type || app.model || model || null;
        const year = app.year || app.year_from || null;
        const engine = app.engine_code || app.engine || null;
        if (!make || !model) { invalid = true; break; }
        normalized.push({ make, model, modelType, year, engine });
      }

      if (invalid || !normalized.length) {
        report.holds.push({ type:'MISSING_RELATIONAL_APPLICATIONS', sku:row.sku, reason:'INSUFFICIENT_PUBLIC_APP_SHAPE' });
        continue;
      }

      report.holds.push({
        type:'MISSING_RELATIONAL_APPLICATIONS',
        sku:row.sku,
        base,
        applications:normalized.length,
        reason:'REQUIRES_RELATIONAL_EVIDENCE'
      });
    }

    // 2) Application source identity is governed by the LD parent.
    // Public catalog base/canonical references may legitimately differ from the
    // application evidence source. run_123 never rewrites source_sku from the
    // public catalog alone; parent mismatches stay visible as HOLDs.
    const staleSources = await client.query(`
      SELECT DISTINCT
        v.id,v.elimfilters_sku,v.source_sku AS application_source_sku,
        p.source_sku AS parent_source_sku,
        v.make,v.model_family,v.model_type,v.year,v.engine_code,v.source_origin
      FROM ld_catalog.ld_vehicle_applications v
      JOIN ld_catalog.ld_product_catalog p ON p.elimfilters_sku=v.elimfilters_sku
      WHERE nullif(trim(coalesce(v.source_sku,'')),'') IS NOT NULL
        AND nullif(trim(coalesce(p.source_sku,'')),'') IS NOT NULL
        AND regexp_replace(upper(v.source_sku),'[^A-Z0-9]','','g')
            <> regexp_replace(upper(p.source_sku),'[^A-Z0-9]','','g')
      ORDER BY v.elimfilters_sku,v.id
    `);

    for (const row of staleSources.rows) {
      report.holds.push({
        type:'APPLICATION_SOURCE_PARENT_MISMATCH',
        sku:row.elimfilters_sku,
        id:row.id,
        application_source_sku:row.application_source_sku,
        parent_source_sku:row.parent_source_sku,
        source_origin:row.source_origin,
        reason:'REQUIRES_EVIDENCE_REVIEW'
      });
    }

    // 3) Same vehicle/engine/filter_type has multiple SKUs. Do not auto-resolve:
    // preserve as HOLD unless exactly one candidate has canonical source equal to
    // the application source for all rows in the collision.
    const collisions = await client.query(`
      WITH grouped AS (
        SELECT
          upper(coalesce(v.make,'')) AS make,
          upper(coalesce(v.model_family,'')) AS model_family,
          upper(coalesce(v.model_type,'')) AS model_type,
          coalesce(v.year,'') AS year,
          upper(coalesce(v.engine_code,'')) AS engine_code,
          lower(coalesce(c.filter_type,'')) AS filter_type,
          array_agg(DISTINCT v.elimfilters_sku ORDER BY v.elimfilters_sku) AS skus,
          count(DISTINCT v.elimfilters_sku)::int AS sku_count
        FROM ld_catalog.ld_vehicle_applications v
        JOIN public.elimfilters_catalog c ON c.sku=v.elimfilters_sku
        GROUP BY 1,2,3,4,5,6
      )
      SELECT * FROM grouped WHERE sku_count>1
      ORDER BY sku_count DESC,make,model_family,year,engine_code,filter_type
    `);

    for (const row of collisions.rows) {
      report.holds.push({
        type:'COMPETING_SKUS',
        make:row.make,
        model_family:row.model_family,
        model_type:row.model_type,
        year:row.year,
        engine_code:row.engine_code,
        filter_type:row.filter_type,
        skus:row.skus,
        reason:'AMBIGUOUS_APPLICATION_OWNERSHIP'
      });
    }

    // 4) Kit components with no application row for the kit brand. Safe auto-link
    // only when another sibling component in the same kit provides a unique
    // make/model/year/engine application tuple set.
    const kitGaps = await client.query(`
      WITH k AS (
        SELECT
          mk.kit_sku,mk.brand,mk.equipment_ref,kc.filter_sku,
          c.codigo_base,c.canonical_source_code,c.filter_type
        FROM maintenance_kits mk
        JOIN kit_components kc ON kc.kit_sku=mk.kit_sku
        JOIN public.elimfilters_catalog c ON c.sku=kc.filter_sku
      )
      SELECT *
      FROM k
      WHERE NOT EXISTS (
        SELECT 1 FROM ld_catalog.ld_vehicle_applications v
        WHERE v.elimfilters_sku=k.filter_sku
          AND upper(coalesce(v.make,''))=upper(coalesce(k.brand,''))
      )
      ORDER BY kit_sku,filter_sku
    `);

    for (const row of kitGaps.rows) {
      const siblings = await client.query(
        `SELECT DISTINCT v.make,v.model_family,v.model_type,v.year,v.engine_code
           FROM kit_components kc
           JOIN ld_catalog.ld_vehicle_applications v ON v.elimfilters_sku=kc.filter_sku
          WHERE kc.kit_sku=$1
            AND kc.filter_sku<>$2
            AND upper(coalesce(v.make,''))=upper($3)
          ORDER BY v.make,v.model_family,v.model_type,v.year,v.engine_code`,
        [row.kit_sku,row.filter_sku,row.brand]
      );

      const tuples = siblings.rows;
      report.holds.push({
        type:'KIT_APPLICATION_GAP',
        kit_sku:row.kit_sku,
        sku:row.filter_sku,
        sibling_application_evidence:tuples.length,
        reason:tuples.length ? 'REQUIRES_PLATFORM_EVIDENCE' : 'NO_SIBLING_APPLICATION_EVIDENCE'
      });
    }

    // 5) Prefix/type contradictions are never auto-repaired.
    const prefixContradictions = await client.query(`
      SELECT sku,codigo_base,filter_type,duty
      FROM public.elimfilters_catalog
      WHERE
        (sku LIKE 'EL%' AND lower(coalesce(filter_type,'')) !~ 'oil|lube|transmission')
        OR (sku LIKE 'EA%' AND lower(coalesce(filter_type,'')) !~ 'air')
        OR (sku LIKE 'EC%' AND lower(coalesce(filter_type,'')) !~ 'cabin')
        OR (sku LIKE 'EW%' AND lower(coalesce(filter_type,'')) !~ 'coolant|water')
        OR (sku LIKE 'EH%' AND lower(coalesce(filter_type,'')) !~ 'hydraulic')
      ORDER BY sku
    `);
    for (const row of prefixContradictions.rows) {
      report.holds.push({ type:'SKU_PREFIX_FILTER_TYPE_CONTRADICTION', ...row, reason:'REQUIRES_IDENTITY_REVIEW' });
    }

    // Post-write verification.
    if (APPLY) {
      const unresolvedSafe = await client.query(`
        SELECT count(*)::int AS n
        FROM public.elimfilters_catalog c
        WHERE jsonb_typeof(coalesce(c.vehicle_applications,'[]'::jsonb))='array'
          AND jsonb_array_length(coalesce(c.vehicle_applications,'[]'::jsonb))>0
          AND NOT EXISTS (
            SELECT 1 FROM ld_catalog.ld_vehicle_applications v
            WHERE v.elimfilters_sku=c.sku
          )
      `);
      if (unresolvedSafe.rows[0].n > 0) {
        report.holds.push({ type:'POSTWRITE_REMAINING_PUBLIC_APP_GAPS', count:unresolvedSafe.rows[0].n });
      }
    }

    report.summary = {
      safe_repairs: report.safe_repairs.length,
      holds: report.holds.length,
      mutations: report.mutations
    };

    console.log(JSON.stringify(report,null,2));

    if (APPLY) {
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
