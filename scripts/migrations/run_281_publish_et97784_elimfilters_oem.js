'use strict';

/**
 * Publish ET97784 TURBOCORE™ as an ELIMFILTERS proprietary/OEM product.
 *
 * Requires run_280_elimfilters_oem_product_authority.js to be installed live.
 * Dry-run by default. Pass --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const SKU = 'ET97784';
const BASE = 'ET97784';
const VERIFIED_AT = '2026-10-14T00:00:00.000Z';
const SOURCE_URL = 'https://github.com/LATAMFILTERS/world-catalogue/blob/main/scripts/candidates/et97784_turbocore_assembly.json';
const POLICY_MARKER = 'ELIMFILTERS_OEM_PRODUCT_AUTHORITY_V43';
const CERT_POLICY = '2026-10-14-hd-cert-elimfilters-oem-v1';

const COMPETITOR_CODES = [
  {
    manufacturer: 'FUEL MANAGER / DIRECTION PLUS',
    code: 'FM628DPK',
    classification: 'COMPETITOR',
    product_scope: 'COMPLETE_KIT',
    source_url: 'https://directionplus.com.au/installation-guides/vehicle-fitment-guides/fuel-manager-pre-filter-fitment-guide/',
  },
  {
    manufacturer: 'FUEL MANAGER',
    code: 'KFM035',
    classification: 'COMPETITOR',
    product_scope: 'COMPLETE_KIT',
    source_url: 'https://hdi.com.pe/productos/kit-filtro-fuel-manager-para-toyota-hilux-30micras/',
  },
];

function sha(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function buildRow() {
  return {
    sku: SKU,
    codigo_base: BASE,
    catalog_active: true,
    filter_type: 'fuel',
    sub_type: 'Assembly',
    technology: 'TURBOCORE™',
    duty: 'HEAVY_DUTY',
    name: 'ELIMFILTERS® ET97784 Fuel/Water Separator Assembly',
    description: 'Elimfilters® ET97784, fuel filter/water separator assembly. Elimfilters offers a one stop shop of filters and service products, covering the widest scope of engine applications in the on and off highway markets.',
    installation_type: 'Fuel/Water Separator Assembly',
    thread_size: '1/4-18 NPT',
    height_mm: null,
    outer_diameter_mm: null,
    gasket_od_mm: null,
    gasket_id_mm: null,
    micron_rating: 15,
    bypass_valve_psi: null,
    nominal_efficiency: '15 micron',
    filter_media: null,
    oem_codes: [],
    competitor_codes: COMPETITOR_CODES,
    equipment_applications: [],
    vehicle_applications: [],
    alternative_products: [],
    brand_crossrefs: {},
    alternatives: [],
    specs: {
      product_type: 'FUEL_WATER_SEPARATOR_ASSEMBLY',
      product_scope: 'COMPLETE_ASSEMBLY',
      fuel_line_size_mm: 10,
      fuel_inlet_port: '1/4-18 NPT',
      fuel_outlet_port: '1/4-18 NPT',
      water_collection: 'Transparent bowl',
      drain_type: 'Manual',
      mounting: 'Vehicle-specific engine-bay bracket',
      system_position: 'Upstream of OE fuel filter / low-pressure diesel supply circuit',
      service_element_sku: 'ES91434',
      service_element_technology: 'HYDROCORE™',
      application_targets: [
        { manufacturer: 'TOYOTA', model: 'HILUX', engine: '2GD-FTV', displacement_l: 2.4, fuel_system: 'COMMON RAIL' },
        { manufacturer: 'TOYOTA', model: 'HILUX', engine: '1GD-FTV', displacement_l: 2.8, fuel_system: 'COMMON RAIL' },
      ],
      identity_separation: 'Assembly references only. Element-only references belong to ES91434.',
    },
    enrichment_data: {
      codigo_base_governance: {
        policy_version: '2026-10-14-v4.3',
        state: 'CANONICAL_VERIFIED',
        governance_state: 'CANONICAL_VERIFIED',
        required_authority: 'VERIFIED_ELIMFILTERS_OEM_PRODUCT',
        identity_type: 'ELIMFILTERS_OEM_PRODUCT',
        internal_product_identity_verified: true,
        primary_manufacturer_verified: true,
        approved_manufacturer: 'ELIMFILTERS',
        approved_codigo_base: BASE,
        current_codigo_base: BASE,
        approved_source_column: 'INTERNAL_PRODUCT_IDENTITY',
        verification_method: 'ELIMFILTERS_OPERATOR_PRODUCT_DEFINITION',
        evidence_url: SOURCE_URL,
        verified_at: VERIFIED_AT,
      },
      product_identity: {
        manufacturer: 'ELIMFILTERS',
        canonical_source_brand: 'ELIMFILTERS',
        canonical_source_part: SKU,
        product_type: 'FUEL_WATER_SEPARATOR_ASSEMBLY',
        technology: 'TURBOCORE™',
        service_element_sku: 'ES91434',
      },
      identity_separation: {
        assembly_sku: SKU,
        service_element_sku: 'ES91434',
        prohibited_element_only_references_on_assembly: ['P551434', 'BF7784D', 'FS19826', 'FS19977'],
      },
    },
    canonical_source_brand: 'ELIMFILTERS',
    canonical_source_code: SKU,
    canonical_source_url: SOURCE_URL,
    canonical_source_status: 'VERIFIED',
    canonical_verified_at: VERIFIED_AT,
    canonical_evidence: {
      authority: 'ELIMFILTERS_INTERNAL_PRODUCT_IDENTITY',
      source_url: SOURCE_URL,
      product_scope: 'COMPLETE_ASSEMBLY',
      decision_date: '2026-10-14',
      evidence_hash: sha({ sku: SKU, codigo_base: BASE, technology: 'TURBOCORE™', service_element: 'ES91434' }),
    },
    duty_source_brand: 'ELIMFILTERS',
    duty_source_url: SOURCE_URL,
    duty_validation_status: 'VERIFIED',
    duty_verified_at: VERIFIED_AT,
    duty_evidence: {
      duty: 'HEAVY_DUTY',
      authority: 'ELIMFILTERS_INTERNAL_PRODUCT_IDENTITY',
      product_scope: 'COMPLETE_FUEL_WATER_SEPARATOR_ASSEMBLY',
    },
  };
}

async function main() {
  const url =
    process.env.CATALOG_DATABASE_URL ||
    process.env.ELIMFILTERS_DATABASE_URL ||
    process.env.SEARCH_DB_URL ||
    process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');

  const local = /@(127\\.0\\.0\\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU, codigo_base: BASE };

  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    await db.query("SET LOCAL lock_timeout = '5s'");
    await db.query("SET LOCAL statement_timeout = '45s'");

    const policy = (
      await db.query(
        "SELECT pg_get_functiondef('public.enforce_elimfilters_codigo_base_policy()'::regprocedure) AS definition"
      )
    ).rows[0]?.definition || '';
    if (!policy.includes(POLICY_MARKER)) {
      throw new Error('RUN_280_REQUIRED_ELIMFILTERS_OEM_AUTHORITY_NOT_INSTALLED');
    }

    const clash = await db.query(
      `SELECT sku,codigo_base,canonical_source_brand,canonical_source_code
       FROM public.elimfilters_catalog
       WHERE upper(regexp_replace(coalesce(sku,''),'[^A-Z0-9]','','g'))=$1
          OR upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))=$1
          OR upper(regexp_replace(coalesce(canonical_source_code,''),'[^A-Z0-9]','','g'))=$1
       FOR UPDATE`,
      [BASE]
    );
    if (clash.rowCount) throw new Error('ET97784_IDENTITY_ALREADY_EXISTS ' + JSON.stringify(clash.rows));

    const element = await db.query(
      "SELECT sku,codigo_base,technology,catalog_active FROM public.elimfilters_catalog WHERE sku='ES91434'"
    );
    if (element.rowCount !== 1) throw new Error('SERVICE_ELEMENT_ES91434_MISSING');
    report.service_element = element.rows[0];

    const row = buildRow();
    report.gateway = assertCanonicalWrite(row, { validateApplications: false });
    const verdict = evaluateCodigoBase(row);
    if (!verdict.valid || verdict.authority !== 'VERIFIED_ELIMFILTERS_OEM_PRODUCT') {
      throw new Error('ELIMFILTERS_OEM_POLICY_REJECTED ' + JSON.stringify(verdict));
    }
    report.policy = verdict;

    const jsonCols = new Set([
      'oem_codes','competitor_codes','equipment_applications','vehicle_applications',
      'alternative_products','brand_crossrefs','alternatives','specs','enrichment_data',
      'canonical_evidence','duty_evidence'
    ]);
    const cols = Object.keys(row);
    const inserted = await db.query(
      `INSERT INTO public.elimfilters_catalog (${cols.map((c) => '"' + c + '"').join(',')})
       VALUES (${cols.map((c, i) => '$' + (i + 1) + (jsonCols.has(c) ? '::jsonb' : '')).join(',')})
       RETURNING id,sku,codigo_base,catalog_active,filter_type,sub_type,technology,duty,thread_size,micron_rating,canonical_source_brand,canonical_source_code,canonical_source_status`,
      cols.map((c) => jsonCols.has(c) ? JSON.stringify(row[c]) : row[c])
    );
    if (inserted.rowCount !== 1) throw new Error('ET97784_INSERT_FAILED');
    report.inserted = inserted.rows[0];

    await db.query(
      `INSERT INTO public.catalog_codigo_base_evidence
         (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata)
       VALUES ($1,'INTERNAL_PRODUCT_IDENTITY','ELIMFILTERS','ELIMFILTERS',$2,$2,$3,$4,$5,$6::jsonb)
       ON CONFLICT DO NOTHING`,
      [
        SKU,
        BASE,
        SOURCE_URL,
        sha({ authority: 'ELIMFILTERS_INTERNAL_PRODUCT_IDENTITY', sku: SKU, base: BASE }),
        VERIFIED_AT,
        JSON.stringify({ migration: 'run_281_publish_et97784_elimfilters_oem', identity_type: 'ELIMFILTERS_OEM_PRODUCT' }),
      ]
    );

    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);

    const resolver = await db.query(
      `SELECT code,sku,manufacturer,score,status
       FROM public.v_api_resolver_v7
       WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)
       ORDER BY code,sku`,
      [SKU]
    );
    report.resolver = resolver.rows;
    const resolverSkus = [...new Set(resolver.rows.map((r) => r.sku))];
    if (resolverSkus.length !== 1 || resolverSkus[0] !== SKU) {
      throw new Error('ET97784_NOT_UNIQUELY_RESOLVED ' + JSON.stringify(resolver.rows));
    }

    const integrity = (
      await db.query(
        `SELECT
           (SELECT count(DISTINCT sku)::int FROM public.elimfilters_catalog
             WHERE upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))=$2) AS base_sku_count,
           (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) AS exact_conflicts,
           (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) AS classification_conflicts,
           (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) AS quarantine_rows`,
        [SKU, BASE]
      )
    ).rows[0];
    report.integrity = integrity;
    if (Number(integrity.base_sku_count) !== 1 ||
        Number(integrity.exact_conflicts) !== 0 ||
        Number(integrity.classification_conflicts) !== 0 ||
        Number(integrity.quarantine_rows) !== 0) {
      throw new Error('ET97784_CERTIFICATION_INTEGRITY_FAILED ' + JSON.stringify(integrity));
    }

    await db.query(
      `INSERT INTO public.catalog_sku_certification AS t (
         sku,duty,filter_type,codigo_base,certification_state,policy_version,
         canonical_governance_ok,regional_policy_ok,canonical_identity_ok,
         base_code_unique,resolver_unique,exact_reference_conflict_free,
         classification_conflict_free,quarantine_free,application_domain_consistent,
         blocker_count,blockers,evidence,certified_at,audited_at
       ) VALUES (
         $1,'HEAVY_DUTY','fuel',$2,'CERTIFIED',$3,
         true,true,true,true,true,true,true,true,true,
         0,ARRAY[]::text[],$4::jsonb,now(),now()
       )
       ON CONFLICT (sku) DO UPDATE SET
         duty=EXCLUDED.duty,
         filter_type=EXCLUDED.filter_type,
         codigo_base=EXCLUDED.codigo_base,
         certification_state='CERTIFIED',
         policy_version=EXCLUDED.policy_version,
         canonical_governance_ok=true,
         regional_policy_ok=true,
         canonical_identity_ok=true,
         base_code_unique=true,
         resolver_unique=true,
         exact_reference_conflict_free=true,
         classification_conflict_free=true,
         quarantine_free=true,
         application_domain_consistent=true,
         blocker_count=0,
         blockers=ARRAY[]::text[],
         evidence=EXCLUDED.evidence,
         certified_at=coalesce(t.certified_at,now()),
         audited_at=now()`,
      [
        SKU,
        BASE,
        CERT_POLICY,
        JSON.stringify({
          governance_state: 'CANONICAL_VERIFIED',
          authority: 'VERIFIED_ELIMFILTERS_OEM_PRODUCT',
          base_sku_count: Number(integrity.base_sku_count),
          resolver_v7_sku_count: resolverSkus.length,
          resolver_v7_only_sku: resolverSkus[0],
          exact_conflicts: Number(integrity.exact_conflicts),
          classification_conflicts: Number(integrity.classification_conflicts),
          quarantine_rows: Number(integrity.quarantine_rows),
        }),
      ]
    );

    const post = (
      await db.query(
        `SELECT c.sku,c.codigo_base,c.catalog_active,c.description,c.thread_size,c.micron_rating,
                c.canonical_source_brand,c.canonical_source_code,c.canonical_source_status,
                s.certification_state,s.blocker_count
         FROM public.elimfilters_catalog c
         LEFT JOIN public.catalog_sku_certification s ON s.sku=c.sku
         WHERE c.sku=$1`,
        [SKU]
      )
    ).rows[0];
    report.postcheck = post;
    if (!post || post.catalog_active !== true || post.certification_state !== 'CERTIFIED' || Number(post.blocker_count) !== 0) {
      throw new Error('ET97784_POSTCHECK_FAILED ' + JSON.stringify(post));
    }

    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    try { await db.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.stack || error);
    process.exit(1);
  });
}

module.exports = { SKU, BASE, COMPETITOR_CODES, buildRow, main };
