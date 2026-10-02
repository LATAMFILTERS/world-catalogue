'use strict';

const { Client } = require('pg');

const EXECUTE = process.argv.includes('--execute');
const A3_REASON_PREFIX = 'A3:';

function norm(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
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
    const candidatesResult = await db.query(`
      WITH resolver AS (
        SELECT
          ld_catalog.norm_part(code) AS code_n,
          min(sku) FILTER (
            WHERE coalesce(status,'') ~* 'RESOLVED|CANONICAL'
          ) AS target_sku,
          min(manufacturer) FILTER (
            WHERE coalesce(status,'') ~* 'RESOLVED|CANONICAL'
          ) AS manufacturer,
          count(DISTINCT sku) FILTER (
            WHERE coalesce(status,'') ~* 'RESOLVED|CANONICAL'
          )::int AS owner_count
        FROM public.v_api_resolver_v7
        GROUP BY 1
      ),
      base AS (
        SELECT
          v.elimfilters_sku AS source_product_sku,
          v.source_sku AS authority_code,
          p.source_sku AS parent_source_sku,
          src.filter_type AS source_filter_type,
          src.duty AS source_duty,
          r.target_sku,
          r.manufacturer AS resolver_manufacturer,
          tgt.codigo_base AS target_base,
          tgt.filter_type AS target_filter_type,
          tgt.duty AS target_duty,
          count(*)::int AS application_rows
        FROM ld_catalog.ld_vehicle_applications v
        JOIN ld_catalog.ld_product_catalog p
          ON p.elimfilters_sku=v.elimfilters_sku
        JOIN public.elimfilters_catalog src
          ON src.sku=v.elimfilters_sku
        JOIN resolver r
          ON r.code_n=ld_catalog.norm_part(v.source_sku)
        JOIN public.elimfilters_catalog tgt
          ON tgt.sku=r.target_sku
        WHERE nullif(ld_catalog.norm_part(v.source_sku),'') IS NOT NULL
          AND nullif(ld_catalog.norm_part(p.source_sku),'') IS NOT NULL
          AND ld_catalog.norm_part(v.source_sku)
              <> ld_catalog.norm_part(p.source_sku)
          AND r.owner_count=1
          AND r.target_sku<>v.elimfilters_sku
          AND NOT EXISTS (
            SELECT 1
            FROM ld_catalog.ld_competitor_cross_references x
            WHERE x.elimfilters_sku=r.target_sku
              AND ld_catalog.norm_part(x.competitor_part_number)
                  =ld_catalog.norm_part(v.source_sku)
          )
          AND (
            coalesce(src.duty,'')<>coalesce(tgt.duty,'')
            OR coalesce(src.filter_type,'')<>coalesce(tgt.filter_type,'')
          )
        GROUP BY
          v.elimfilters_sku,v.source_sku,p.source_sku,
          src.filter_type,src.duty,
          r.target_sku,r.manufacturer,
          tgt.codigo_base,tgt.filter_type,tgt.duty
      )
      SELECT
        b.*,
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements(
            CASE
              WHEN jsonb_typeof(t.competitor_codes)='array'
                THEN t.competitor_codes
              ELSE '[]'::jsonb
            END
          ) e
          WHERE ld_catalog.norm_part(
                  coalesce(e->>'code',e->>'part_number','')
                )=ld_catalog.norm_part(b.authority_code)
        ) AS in_competitor_jsonb,
        EXISTS (
          SELECT 1
          FROM jsonb_array_elements(
            CASE
              WHEN jsonb_typeof(t.oem_codes)='array'
                THEN t.oem_codes
              ELSE '[]'::jsonb
            END
          ) e
          WHERE ld_catalog.norm_part(
                  coalesce(e->>'code',e->>'oem_code',e->>'part_number','')
                )=ld_catalog.norm_part(b.authority_code)
        ) AS in_oem_jsonb
      FROM base b
      JOIN public.elimfilters_catalog t ON t.sku=b.target_sku
      ORDER BY b.target_sku,b.authority_code,b.source_product_sku
    `);

    const candidates = candidatesResult.rows;
    const invalidJsonb = candidates.filter(
      row => !row.in_competitor_jsonb && !row.in_oem_jsonb
    );
    if (invalidJsonb.length) {
      throw new Error(
        `A3 candidates without public JSONB evidence: ${invalidJsonb.length}`
      );
    }

    const planned = [];
    for (const row of candidates) {
      const sourceField = row.in_competitor_jsonb && row.in_oem_jsonb
        ? 'A3_competitor_codes+oem_codes'
        : row.in_competitor_jsonb
          ? 'A3_competitor_codes'
          : 'A3_oem_codes';
      const reason = row.source_duty !== row.target_duty
        ? `A3:CROSS_DUTY_LEGACY_RESOLVER ${row.source_duty}->${row.target_duty}`
        : `A3:CROSS_FILTER_LEGACY_RESOLVER ${row.source_filter_type}->${row.target_filter_type}`;
      planned.push({ ...row, sourceField, reason });
    }

    const existingA3 = await db.query(`
      SELECT source_sku,query_code,reason
      FROM public.bad_crossref_quarantine
      WHERE reason LIKE 'A3:%'
    `);
    const existingKeys = new Set(existingA3.rows.map(
      row => [row.source_sku,norm(row.query_code),row.reason].join('|')
    ));
    const toInsert = planned.filter(row => !existingKeys.has(
      [row.target_sku,norm(row.authority_code),row.reason].join('|')
    ));

    const currentCache = await db.query(`
      SELECT c.code,c.sku,c.manufacturer,c.score
      FROM public.crossref_resolved_cache c
      WHERE EXISTS (
        SELECT 1
        FROM unnest($1::text[],$2::text[]) AS x(sku,code)
        WHERE x.sku=c.sku
          AND ld_catalog.norm_part(x.code)=ld_catalog.norm_part(c.code)
      )
      ORDER BY c.sku,c.code,c.manufacturer
    `, [
      planned.map(row => row.target_sku),
      planned.map(row => row.authority_code)
    ]);

    const report = {
      mode: EXECUTE ? 'execute' : 'dry-run',
      candidate_authorities: planned.length,
      candidate_application_rows: planned.reduce(
        (sum,row) => sum + Number(row.application_rows || 0), 0
      ),
      cross_duty_authorities: planned.filter(
        row => row.source_duty !== row.target_duty
      ).length,
      cross_filter_authorities: planned.filter(
        row => row.source_duty === row.target_duty
          && row.source_filter_type !== row.target_filter_type
      ).length,
      planned_quarantine_inserts: toInsert.length,
      cache_rows_currently_exposed: currentCache.rows.length,
      mutations: {
        quarantine_rows_inserted: 0,
        cache_rows_deleted: 0,
        application_rows: 0,
        public_jsonb_rows: 0
      }
    };

    if (EXECUTE) {
      for (const row of toInsert) {
        const inserted = await db.query(`
          INSERT INTO public.bad_crossref_quarantine
            (query_code,source_sku,source_base,source_duty,
             source_filter_type,source_field,brand,reason)
          SELECT $1,$2,$3,$4,$5,$6,$7,$8
          WHERE NOT EXISTS (
            SELECT 1
            FROM public.bad_crossref_quarantine q
            WHERE q.source_sku=$2
              AND ld_catalog.norm_part(q.query_code)=ld_catalog.norm_part($1)
              AND q.reason=$8
          )
        `, [
          row.authority_code,
          row.target_sku,
          row.target_base,
          row.target_duty,
          row.target_filter_type,
          row.sourceField,
          row.resolver_manufacturer,
          row.reason
        ]);
        report.mutations.quarantine_rows_inserted += inserted.rowCount;
      }

      await db.query(`
        CREATE OR REPLACE FUNCTION public.refresh_crossref_cache()
        RETURNS integer
        LANGUAGE plpgsql
        AS $function$
        DECLARE v_count INTEGER;
        BEGIN
          TRUNCATE crossref_resolved_cache;
          INSERT INTO crossref_resolved_cache
            (code,sku,manufacturer,score)
          SELECT DISTINCT
            UPPER(REPLACE(ref->>'code','-','')),
            c.sku,
            UPPER(COALESCE(
              NULLIF(TRIM(ref->>'manufacturer'),''),
              'UNKNOWN'
            )),
            20
          FROM elimfilters_catalog c,
               jsonb_array_elements(c.oem_codes) AS ref
          WHERE c.oem_codes IS NOT NULL
            AND jsonb_typeof(c.oem_codes)='array'
            AND ref->>'code' IS NOT NULL
            AND TRIM(ref->>'code')!=''
            AND NOT EXISTS (
              SELECT 1
              FROM bad_crossref_quarantine q
              WHERE q.reason LIKE 'A3:%'
                AND q.source_sku=c.sku
                AND ld_catalog.norm_part(q.query_code)
                    =ld_catalog.norm_part(ref->>'code')
            )
          UNION
          SELECT DISTINCT
            UPPER(REPLACE(ref->>'code','-','')),
            c.sku,
            UPPER(COALESCE(
              NULLIF(TRIM(ref->>'manufacturer'),''),
              NULLIF(TRIM(ref->>'brand'),''),
              'UNKNOWN'
            )),
            20
          FROM elimfilters_catalog c,
               jsonb_array_elements(c.competitor_codes) AS ref
          WHERE c.competitor_codes IS NOT NULL
            AND jsonb_typeof(c.competitor_codes)='array'
            AND ref->>'code' IS NOT NULL
            AND TRIM(ref->>'code')!=''
            AND NOT EXISTS (
              SELECT 1
              FROM bad_crossref_quarantine q
              WHERE q.reason LIKE 'A3:%'
                AND q.source_sku=c.sku
                AND ld_catalog.norm_part(q.query_code)
                    =ld_catalog.norm_part(ref->>'code')
            );
          GET DIAGNOSTICS v_count = ROW_COUNT;
          RETURN v_count;
        END;
        $function$
      `);

      await db.query(`
        CREATE OR REPLACE FUNCTION public.refresh_crossref_cache_sku(p_sku text)
        RETURNS void
        LANGUAGE plpgsql
        AS $function$
        BEGIN
          DELETE FROM crossref_resolved_cache WHERE sku=p_sku;
          INSERT INTO crossref_resolved_cache
            (code,sku,manufacturer,score)
          SELECT DISTINCT
            UPPER(REPLACE(ref->>'code','-','')),
            c.sku,
            UPPER(COALESCE(
              NULLIF(TRIM(ref->>'manufacturer'),''),
              'UNKNOWN'
            )),
            20
          FROM elimfilters_catalog c,
               jsonb_array_elements(c.oem_codes) AS ref
          WHERE c.sku=p_sku
            AND c.oem_codes IS NOT NULL
            AND jsonb_typeof(c.oem_codes)='array'
            AND ref->>'code' IS NOT NULL
            AND TRIM(ref->>'code')!=''
            AND NOT EXISTS (
              SELECT 1
              FROM bad_crossref_quarantine q
              WHERE q.reason LIKE 'A3:%'
                AND q.source_sku=c.sku
                AND ld_catalog.norm_part(q.query_code)
                    =ld_catalog.norm_part(ref->>'code')
            );
          INSERT INTO crossref_resolved_cache
            (code,sku,manufacturer,score)
          SELECT DISTINCT
            UPPER(REPLACE(ref->>'code','-','')),
            c.sku,
            UPPER(COALESCE(
              NULLIF(TRIM(ref->>'manufacturer'),''),
              NULLIF(TRIM(ref->>'brand'),''),
              'UNKNOWN'
            )),
            20
          FROM elimfilters_catalog c,
               jsonb_array_elements(c.competitor_codes) AS ref
          WHERE c.sku=p_sku
            AND c.competitor_codes IS NOT NULL
            AND jsonb_typeof(c.competitor_codes)='array'
            AND ref->>'code' IS NOT NULL
            AND TRIM(ref->>'code')!=''
            AND NOT EXISTS (
              SELECT 1
              FROM bad_crossref_quarantine q
              WHERE q.reason LIKE 'A3:%'
                AND q.source_sku=c.sku
                AND ld_catalog.norm_part(q.query_code)
                    =ld_catalog.norm_part(ref->>'code')
            )
          ON CONFLICT DO NOTHING;
        END;
        $function$
      `);

      const deleted = await db.query(`
        DELETE FROM public.crossref_resolved_cache c
        WHERE EXISTS (
          SELECT 1
          FROM public.bad_crossref_quarantine q
          WHERE q.reason LIKE 'A3:%'
            AND q.source_sku=c.sku
            AND ld_catalog.norm_part(q.query_code)
                =ld_catalog.norm_part(c.code)
        )
      `);
      report.mutations.cache_rows_deleted = deleted.rowCount;

      const remaining = await db.query(`
        SELECT count(*)::int AS n
        FROM public.v_api_resolver_v7 r
        WHERE EXISTS (
          SELECT 1
          FROM public.bad_crossref_quarantine q
          WHERE q.reason LIKE 'A3:%'
            AND q.source_sku=r.sku
            AND ld_catalog.norm_part(q.query_code)
                =ld_catalog.norm_part(r.code)
        )
      `);
      report.remaining_a3_resolver_pairs = remaining.rows[0].n;
      if (report.remaining_a3_resolver_pairs !== 0) {
        throw new Error(
          `A3 resolver pairs remain after quarantine: `
          + report.remaining_a3_resolver_pairs
        );
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
