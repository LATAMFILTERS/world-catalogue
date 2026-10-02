'use strict';

const { Client } = require('pg');
const SUMMARY_ONLY = process.argv.includes('--summary-only');

function norm(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function family(value) {
  const text = String(value || '').toLowerCase();
  if (/cabin/.test(text)) return 'cabin';
  if (/air/.test(text)) return 'air';
  if (/oil|lube/.test(text)) return 'oil';
  if (/fuel|separator/.test(text)) return 'fuel';
  if (/coolant|water/.test(text)) return 'coolant';
  if (/hydraulic/.test(text)) return 'hydraulic';
  if (/transmission/.test(text)) return 'transmission';
  if (/dryer/.test(text)) return 'air_dryer';
  return text || 'unknown';
}

function formatOemCodes(value) {
  const entries = Array.isArray(value) ? value : [];
  const codes = entries
    .map(entry => {
      if (typeof entry === 'string') return entry.trim();
      if (!entry || typeof entry !== 'object') return '';
      return String(entry.code || entry.oem_code || entry.part_number || '').trim();
    })
    .filter(Boolean);
  return [...new Set(codes)].join(' | ');
}

function withOem(row) {
  const { oem_codes, ...rest } = row;
  return { ...rest, oem: formatOemCodes(oem_codes) };
}

function alternativeSku(value) {
  if (!value) return '';
  if (typeof value === 'string') return String(value).toUpperCase();
  if (typeof value !== 'object' || Array.isArray(value)) return '';
  return String(value.sku || value.elimfilters_sku || value.code || '').toUpperCase();
}

function isMutualAlternativeGroup(skus, alternativesBySku) {
  if (!Array.isArray(skus) || skus.length < 2) return false;
  for (let i = 0; i < skus.length; i += 1) {
    for (let j = i + 1; j < skus.length; j += 1) {
      const a = String(skus[i] || '').toUpperCase();
      const b = String(skus[j] || '').toUpperCase();
      const aAlts = alternativesBySku.get(a) || new Set();
      const bAlts = alternativesBySku.get(b) || new Set();
      if (!aAlts.has(b) || !bAlts.has(a)) return false;
    }
  }
  return true;
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

  try {
    const report = {
      generated_at: new Date().toISOString(),
      readonly: true,
      categories: {},
      informational: {},
      summary: {},
      informational_summary: {}
    };

    // A. Public JSON application evidence exists, but normalized relational
    // application rows are absent. This is the exact type of dissociation that
    // caused valid product knowledge not to reach application_lookup.
    const jsonVsRel = await client.query(`
      WITH public_apps AS (
        SELECT
          c.sku,
          c.codigo_base,
          c.filter_type,
          c.duty,
          c.oem_codes,
          CASE
            WHEN jsonb_typeof(coalesce(c.vehicle_applications,'[]'::jsonb))='array'
              THEN jsonb_array_length(coalesce(c.vehicle_applications,'[]'::jsonb))
            ELSE 0
          END AS vehicle_json_count,
          CASE
            WHEN jsonb_typeof(coalesce(c.equipment_applications,'[]'::jsonb))='array'
              THEN jsonb_array_length(coalesce(c.equipment_applications,'[]'::jsonb))
            ELSE 0
          END AS equipment_json_count
        FROM public.elimfilters_catalog c
      ),
      rel AS (
        SELECT elimfilters_sku AS sku, count(*)::int AS relational_count
        FROM ld_catalog.ld_vehicle_applications
        GROUP BY elimfilters_sku
      )
      SELECT
        p.sku,p.codigo_base,p.filter_type,p.duty,p.oem_codes,
        p.vehicle_json_count,p.equipment_json_count,
        coalesce(r.relational_count,0)::int AS relational_count
      FROM public_apps p
      LEFT JOIN rel r USING (sku)
      WHERE (p.vehicle_json_count + p.equipment_json_count) > 0
        AND coalesce(r.relational_count,0)=0
      ORDER BY p.duty,p.filter_type,p.sku
    `);
    report.categories.application_evidence_not_normalized = jsonVsRel.rows.map(withOem);

    // B. Source identity differences are not automatically errors. Classify them
    // against the active LD canonical identity and the governed resolver. A source
    // that resolves uniquely to the same SKU is informational, not a HOLD.
    const sourceMismatch = await client.query(`
      SELECT DISTINCT
        v.elimfilters_sku AS sku,
        c.codigo_base,
        c.canonical_source_code,
        c.filter_type,
        c.oem_codes,
        p.source_sku AS expected_parent_source_sku,
        v.source_sku AS application_source_sku,
        v.make,v.model_family,v.model_type,v.year,v.engine_code,v.source_origin
      FROM ld_catalog.ld_vehicle_applications v
      JOIN public.elimfilters_catalog c ON c.sku=v.elimfilters_sku
      JOIN ld_catalog.ld_product_catalog p ON p.elimfilters_sku=v.elimfilters_sku
      WHERE nullif(regexp_replace(upper(coalesce(v.source_sku,'')),'[^A-Z0-9]','','g'),'') IS NOT NULL
        AND nullif(regexp_replace(upper(coalesce(p.source_sku,'')),'[^A-Z0-9]','','g'),'') IS NOT NULL
        AND regexp_replace(upper(coalesce(v.source_sku,'')),'[^A-Z0-9]','','g')
            <> regexp_replace(upper(coalesce(p.source_sku,'')),'[^A-Z0-9]','','g')
      ORDER BY v.elimfilters_sku,v.make,v.model_family,v.year
    `);

    const canonicalIdentity = await client.query(`
      SELECT elimfilters_sku AS sku,canonical_part_number
      FROM ld_catalog.ld_canonical_product_identity
      WHERE status='ACTIVE'
    `);
    const canonicalBySku = new Map();
    for (const row of canonicalIdentity.rows) {
      const key = String(row.sku || '');
      if (!canonicalBySku.has(key)) canonicalBySku.set(key, new Set());
      canonicalBySku.get(key).add(norm(row.canonical_part_number));
    }

    const resolverRows = await client.query(`
      SELECT code,sku,status
      FROM public.v_api_resolver_v7
      WHERE coalesce(status,'') ~* 'RESOLVED|CANONICAL'
    `);
    const resolverByCode = new Map();
    for (const row of resolverRows.rows) {
      const code = norm(row.code);
      if (!code) continue;
      if (!resolverByCode.has(code)) resolverByCode.set(code, new Set());
      resolverByCode.get(code).add(String(row.sku || ''));
    }

    const legitimate = [];
    const conflicts = [];
    const unsupported = [];
    for (const raw of sourceMismatch.rows) {
      const row = withOem(raw);
      const code = norm(raw.application_source_sku);
      const canonicalMatch = canonicalBySku.get(String(raw.sku || ''))?.has(code) || false;
      const resolverSkus = resolverByCode.get(code) || new Set();
      const resolverSame = resolverSkus.has(String(raw.sku || ''));
      const resolverOther = [...resolverSkus].some(sku => sku && sku !== String(raw.sku || ''));

      if (canonicalMatch || (resolverSame && !resolverOther)) {
        legitimate.push({
          ...row,
          identity_disposition: canonicalMatch ? 'CANONICAL_LD_MATCH' : 'RESOLVER_SAME_SKU'
        });
      } else if (resolverOther) {
        conflicts.push({
          ...row,
          identity_disposition: 'RESOLVER_OTHER_SKU',
          resolver_skus: [...resolverSkus].sort()
        });
      } else {
        unsupported.push({
          ...row,
          identity_disposition: 'UNSUPPORTED_REVIEW'
        });
      }
    }

    report.informational.application_source_identity_legitimate_alias = legitimate;
    report.categories.application_source_identity_conflict = conflicts;
    report.categories.application_source_identity_unsupported = unsupported;

    // C. Same vehicle/model/year/engine/service family points to multiple SKUs.
    // This is a high-value collision class: the bot can publish the wrong SKU or
    // an arbitrary primary if one application family contains stale ownership.
    const competingSku = await client.query(`
      WITH a AS (
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
      SELECT *
      FROM a
      WHERE sku_count > 1
      ORDER BY sku_count DESC,make,model_family,year,engine_code,filter_type
    `);
    const alternativeRows = await client.query(`
      SELECT sku,alternatives
      FROM public.elimfilters_catalog
      WHERE alternatives IS NOT NULL
        AND jsonb_typeof(alternatives)='array'
        AND jsonb_array_length(alternatives)>0
    `);
    const alternativesBySku = new Map();
    for (const row of alternativeRows.rows) {
      const key = String(row.sku || '').toUpperCase();
      alternativesBySku.set(
        key,
        new Set((Array.isArray(row.alternatives) ? row.alternatives : [])
          .map(alternativeSku)
          .filter(Boolean))
      );
    }

    const competingConflicts = [];
    const legitimateAlternatives = [];
    for (const row of competingSku.rows) {
      if (isMutualAlternativeGroup(row.skus, alternativesBySku)) {
        legitimateAlternatives.push({
          ...row,
          coexistence_disposition: 'MUTUAL_FUNCTIONAL_ALTERNATIVES'
        });
      } else {
        competingConflicts.push(row);
      }
    }
    report.informational.competing_skus_mutual_alternatives = legitimateAlternatives;
    report.categories.competing_skus_same_vehicle_engine_filter_type = competingConflicts;

    // D. Kit component is not represented in normalized applications for the
    // kit brand while sibling components are. This exposed the RAV4/CL120 class
    // where the kit and application graph diverge.
    const kitAppGap = await client.query(`
      WITH kit_rows AS (
        SELECT
          mk.kit_sku,mk.brand,mk.equipment_ref,kc.filter_sku,
          c.codigo_base,c.filter_type,c.oem_codes,
          (
            SELECT count(*)::int
            FROM ld_catalog.ld_vehicle_applications v
            WHERE v.elimfilters_sku=kc.filter_sku
              AND upper(coalesce(v.make,''))=upper(coalesce(mk.brand,''))
          ) AS brand_application_count
        FROM maintenance_kits mk
        JOIN kit_components kc ON kc.kit_sku=mk.kit_sku
        JOIN public.elimfilters_catalog c ON c.sku=kc.filter_sku
      ),
      scored AS (
        SELECT *,
          count(*) OVER (PARTITION BY kit_sku)::int AS component_count,
          count(*) FILTER (WHERE brand_application_count>0)
            OVER (PARTITION BY kit_sku)::int AS components_with_brand_app
        FROM kit_rows
      )
      SELECT *
      FROM scored
      WHERE component_count >= 2
        AND components_with_brand_app >= 1
        AND brand_application_count=0
      ORDER BY kit_sku,filter_type,filter_sku
    `);
    report.categories.kit_component_missing_brand_application = kitAppGap.rows.map(withOem);

    // E. Engine aliases/variants within the same make/model/year can fragment a
    // platform into parallel strings (e.g. S60 vs SERIES 60, DETROIT vs DETROIT
    // DIESEL SERIES 60). Surface them for review rather than silently merging.
    const engineFragmentation = await client.query(`
      WITH e AS (
        SELECT
          upper(coalesce(make,'')) AS make,
          upper(coalesce(model_family,'')) AS model_family,
          upper(coalesce(model_type,'')) AS model_type,
          coalesce(year,'') AS year,
          array_agg(DISTINCT upper(coalesce(engine_code,'')) ORDER BY upper(coalesce(engine_code,''))) AS engines,
          count(DISTINCT upper(coalesce(engine_code,'')))::int AS engine_variant_count,
          array_agg(DISTINCT elimfilters_sku ORDER BY elimfilters_sku) AS skus
        FROM ld_catalog.ld_vehicle_applications
        WHERE nullif(trim(coalesce(engine_code,'')),'') IS NOT NULL
        GROUP BY 1,2,3,4
      )
      SELECT *
      FROM e
      WHERE engine_variant_count > 1
      ORDER BY engine_variant_count DESC,make,model_family,year
    `);
    report.categories.engine_string_fragmentation = engineFragmentation.rows;

    // F. Prefix/type contradiction in application-bearing rows. This catches
    // product identities whose SKU family and filter_type are inconsistent.
    const prefixType = await client.query(`
      SELECT DISTINCT
        c.sku,c.codigo_base,c.filter_type,c.duty,c.oem_codes,
        v.make,v.model_family,v.model_type,v.year,v.engine_code
      FROM public.elimfilters_catalog c
      JOIN ld_catalog.ld_vehicle_applications v ON v.elimfilters_sku=c.sku
      WHERE
        (c.sku LIKE 'EL%' AND lower(coalesce(c.filter_type,'')) !~ 'oil|lube|transmission')
        OR (c.sku LIKE 'EA%' AND lower(coalesce(c.filter_type,'')) !~ 'air')
        OR (c.sku LIKE 'EC%' AND lower(coalesce(c.filter_type,'')) !~ 'cabin')
        OR (c.sku LIKE 'EW%' AND lower(coalesce(c.filter_type,'')) !~ 'coolant|water')
        OR (c.sku LIKE 'EH%' AND lower(coalesce(c.filter_type,'')) !~ 'hydraulic')
      ORDER BY c.sku,v.make,v.model_family,v.year
    `);
    report.categories.sku_prefix_filter_type_contradiction = prefixType.rows.map(withOem);

    for (const [name, rows] of Object.entries(report.categories)) {
      report.summary[name] = rows.length;
    }
    for (const [name, rows] of Object.entries(report.informational)) {
      report.informational_summary[name] = rows.length;
    }
    report.summary.total_flagged_rows = Object.values(report.summary)
      .reduce((sum, value) => sum + Number(value || 0), 0);

    const output = SUMMARY_ONLY
      ? {
          generated_at: report.generated_at,
          readonly: report.readonly,
          summary: report.summary,
          informational_summary: report.informational_summary
        }
      : report;
    console.log(JSON.stringify(output, null, 2));
  } finally {
    await client.end();
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
