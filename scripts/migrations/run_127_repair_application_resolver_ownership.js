'use strict';

const { Client } = require('pg');

const EXECUTE = process.argv.includes('--execute');

function norm(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function key4(row) {
  return [
    norm(row.make),
    norm(row.model_family),
    norm(row.model_type),
    String(row.year || '')
  ].join('|');
}

function platformKey(row) {
  return [
    norm(row.make),
    norm(row.model_family),
    norm(row.model_type)
  ].join('|');
}

function authorityKey(row) {
  return [
    row.source_product_sku,
    row.target_sku,
    norm(row.authority_code)
  ].join('|');
}

async function main() {
  const url = process.env.CATALOG_DATABASE_URL
    || process.env.ELIMFILTERS_DATABASE_URL
    || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');

  const db = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  await db.connect();
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  try {
    const candidateResult = await db.query(`
      WITH resolver AS (
        SELECT
          regexp_replace(upper(coalesce(code,'')),'[^A-Z0-9]','','g') AS code_n,
          min(sku) FILTER (
            WHERE coalesce(status,'') ~* 'RESOLVED|CANONICAL'
          ) AS target_sku,
          count(DISTINCT sku) FILTER (
            WHERE coalesce(status,'') ~* 'RESOLVED|CANONICAL'
          )::int AS owner_count
        FROM public.v_api_resolver_v7
        GROUP BY 1
      )
      SELECT
        v.id,
        v.elimfilters_sku AS source_product_sku,
        v.source_sku AS authority_code,
        p.source_sku AS parent_source_sku,
        v.make,v.model_family,v.model_type,v.year,v.engine_code,v.source_origin,
        src.filter_type AS source_filter_type,
        src.duty AS source_duty,
        tgt.sku AS target_sku,
        tgt.filter_type AS target_filter_type,
        tgt.duty AS target_duty,
        tgt.catalog_active AS target_active,
        EXISTS (
          SELECT 1
          FROM ld_catalog.ld_competitor_cross_references x
          WHERE x.elimfilters_sku=r.target_sku
            AND regexp_replace(
                  upper(coalesce(x.competitor_part_number,'')),
                  '[^A-Z0-9]','','g'
                )=regexp_replace(
                  upper(coalesce(v.source_sku,'')),
                  '[^A-Z0-9]','','g'
                )
        ) AS direct_competitor_owner
      FROM ld_catalog.ld_vehicle_applications v
      JOIN ld_catalog.ld_product_catalog p
        ON p.elimfilters_sku=v.elimfilters_sku
      JOIN public.elimfilters_catalog src
        ON src.sku=v.elimfilters_sku
      JOIN resolver r
        ON r.code_n=regexp_replace(
          upper(coalesce(v.source_sku,'')),
          '[^A-Z0-9]','','g'
        )
      LEFT JOIN public.elimfilters_catalog tgt
        ON tgt.sku=r.target_sku
      WHERE nullif(
              regexp_replace(
                upper(coalesce(v.source_sku,'')),
                '[^A-Z0-9]','','g'
              ),''
            ) IS NOT NULL
        AND nullif(
              regexp_replace(
                upper(coalesce(p.source_sku,'')),
                '[^A-Z0-9]','','g'
              ),''
            ) IS NOT NULL
        AND regexp_replace(
              upper(coalesce(v.source_sku,'')),
              '[^A-Z0-9]','','g'
            ) <> regexp_replace(
              upper(coalesce(p.source_sku,'')),
              '[^A-Z0-9]','','g'
            )
        AND r.owner_count=1
        AND r.target_sku<>v.elimfilters_sku
      ORDER BY v.elimfilters_sku,v.source_sku,v.id
    `);

    const rows = candidateResult.rows;
    const targetSkus = [...new Set(rows.map(r => r.target_sku).filter(Boolean))];

    const targetAppsResult = targetSkus.length
      ? await db.query(
          `SELECT elimfilters_sku AS sku,make,model_family,model_type,year
             FROM ld_catalog.ld_vehicle_applications
            WHERE elimfilters_sku=ANY($1::text[])`,
          [targetSkus]
        )
      : { rows: [] };

    const exactByTarget = new Map();
    const platformByTarget = new Map();
    for (const row of targetAppsResult.rows) {
      if (!exactByTarget.has(row.sku)) exactByTarget.set(row.sku,new Set());
      if (!platformByTarget.has(row.sku)) platformByTarget.set(row.sku,new Set());
      exactByTarget.get(row.sku).add(key4(row));
      platformByTarget.get(row.sku).add(platformKey(row));
    }

    for (const row of rows) {
      row.authority = authorityKey(row);
      row.disposition = 'SAFE_CANDIDATE';
      if (!row.target_sku) row.disposition = 'TARGET_MISSING';
      else if (row.target_active !== true) row.disposition = 'TARGET_INACTIVE';
      else if (row.direct_competitor_owner !== true) {
        row.disposition = 'DIRECT_OWNERSHIP_MISSING';
      } else if (String(row.source_filter_type || '') !== String(row.target_filter_type || '')) {
        row.disposition = 'FILTER_TYPE_MISMATCH';
      } else if (
        norm(row.source_duty) !== norm(row.target_duty)
      ) {
        row.disposition = 'DUTY_MISMATCH';
      } else if (exactByTarget.get(row.target_sku)?.has(key4(row))) {
        row.disposition = 'TARGET_EXACT_EXISTS';
      } else if (platformByTarget.get(row.target_sku)?.has(platformKey(row))) {
        row.disposition = 'TARGET_PLATFORM_VARIANT';
      }
    }

    const convergence = new Map();
    for (const row of rows.filter(r => r.disposition === 'SAFE_CANDIDATE')) {
      const key = [row.target_sku,key4(row)].join('|');
      convergence.set(key,(convergence.get(key) || 0) + 1);
    }
    for (const row of rows) {
      if (row.disposition !== 'SAFE_CANDIDATE') continue;
      const key = [row.target_sku,key4(row)].join('|');
      if ((convergence.get(key) || 0) > 1) {
        row.disposition = 'CANDIDATE_CONVERGENCE_COLLISION';
      }
    }

    const grouped = new Map();
    for (const row of rows) {
      if (!grouped.has(row.authority)) grouped.set(row.authority,[]);
      grouped.get(row.authority).push(row);
    }

    const authorities = [];
    for (const [authority, authorityRows] of grouped) {
      const dispositions = [...new Set(
        authorityRows.map(r => r.disposition)
      )].sort();
      const safe = dispositions.length === 1
        && dispositions[0] === 'SAFE_CANDIDATE';
      authorities.push({
        authority,
        source_product_sku: authorityRows[0].source_product_sku,
        target_sku: authorityRows[0].target_sku,
        authority_code: authorityRows[0].authority_code,
        parent_source_sku: authorityRows[0].parent_source_sku,
        filter_type: authorityRows[0].source_filter_type,
        source_duty: authorityRows[0].source_duty,
        target_duty: authorityRows[0].target_duty,
        rows: authorityRows.length,
        dispositions,
        safe,
        ids: authorityRows.map(r => r.id)
      });
    }

    const safeAuthorities = authorities.filter(a => a.safe);
    const heldAuthorities = authorities.filter(a => !a.safe);
    const safeRows = safeAuthorities.reduce((n,a) => n+a.rows,0);
    const heldRows = heldAuthorities.reduce((n,a) => n+a.rows,0);

    const report = {
      mode: EXECUTE ? 'execute' : 'dry-run',
      input_conflict_rows: rows.length,
      unique_authorities: authorities.length,
      safe_authorities: safeAuthorities.length,
      safe_rows: safeRows,
      held_authorities: heldAuthorities.length,
      held_rows: heldRows,
      holds_by_reason: {},
      mutations: {
        application_rows_reowned: 0,
        competitor_rows: 0,
        oem_rows: 0,
        specification_rows: 0,
        readiness_rows: 0
      },
      safe_authority_plan: safeAuthorities.map(a => ({
        source_product_sku:a.source_product_sku,
        target_sku:a.target_sku,
        authority_code:a.authority_code,
        filter_type:a.filter_type,
        source_duty:a.source_duty,
        target_duty:a.target_duty,
        rows:a.rows
      })),
      held_authority_plan: heldAuthorities.map(a => ({
        source_product_sku:a.source_product_sku,
        target_sku:a.target_sku,
        authority_code:a.authority_code,
        filter_type:a.filter_type,
        source_duty:a.source_duty,
        target_duty:a.target_duty,
        rows:a.rows,
        dispositions:a.dispositions
      }))
    };

    for (const authority of heldAuthorities) {
      for (const reason of authority.dispositions) {
        report.holds_by_reason[reason]
          = (report.holds_by_reason[reason] || 0) + 1;
      }
    }

    if (EXECUTE) {
      for (const authority of safeAuthorities) {
        const result = await db.query(
          `UPDATE ld_catalog.ld_vehicle_applications
              SET elimfilters_sku=$1
            WHERE id=ANY($2::int[])
              AND elimfilters_sku=$3
              AND regexp_replace(
                    upper(coalesce(source_sku,'')),
                    '[^A-Z0-9]','','g'
                  )=$4`,
          [
            authority.target_sku,
            authority.ids,
            authority.source_product_sku,
            norm(authority.authority_code)
          ]
        );
        if (result.rowCount !== authority.ids.length) {
          throw new Error(
            `ownership move row-count mismatch for ${authority.authority}: `
            + `${result.rowCount} != ${authority.ids.length}`
          );
        }
        report.mutations.application_rows_reowned += result.rowCount;
      }

      const movedIds = safeAuthorities.flatMap(a => a.ids);
      if (movedIds.length) {
        const verify = await db.query(
          `SELECT count(*)::int AS n
             FROM ld_catalog.ld_vehicle_applications
            WHERE id=ANY($1::int[])`,
          [movedIds]
        );
        if (verify.rows[0].n !== movedIds.length) {
          throw new Error('post-write row preservation check failed');
        }
      }

      await db.query('COMMIT');
      console.log(JSON.stringify(report,null,2));
      console.log('COMMIT');
    } else {
      await db.query('ROLLBACK');
      console.log(JSON.stringify(report,null,2));
      console.log('ROLLBACK (dry-run)');
    }
  } catch (error) {
    try { await db.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    await db.end();
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
