'use strict';

const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const {
  applyVerifiedApplications,
  applyVerifiedRelationalVehicleApplications,
} = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--apply');
const SKU = 'EL88076';
const BASE = 'P848076';
const DONALDSON_URL = 'https://shop.donaldson.com/store/en-us/product/P848076/prod320266';
const ISUZU_URL = 'https://www.isuzucv.com/en/app/site/pdf?file=FVGenuineCrossRef.pdf';
const PHASE3_SOURCE = 'DONALDSON_OFFICIAL_PRODUCT_TITLE_AND_DISTRIBUTOR_CORROBORATION_2026_09_24';

const OEM_CODES = [
  { manufacturer: 'ISUZU', code: '2906544040', classification: 'OEM', source: 'ISUZU_FV_GENUINE_CROSSREF', source_url: ISUZU_URL },
  { manufacturer: 'ISUZU', code: '8982984040', classification: 'OEM', source: 'ISUZU_FV_GENUINE_CROSSREF', source_url: ISUZU_URL },
];

const APPS = [
  { make:'ISUZU', model:'NPR-HD', year_from:2011, year_to:2026, engine:'4HK1-TC', engine_displacement:'5.2L', fuel_type:'DIESEL', market:'USA', platform:'N-SERIES', filter_position:'LUBE_PRIMARY' },
  { make:'ISUZU', model:'NPR-XD', year_from:2015, year_to:2026, engine:'4HK1-TC', engine_displacement:'5.2L', fuel_type:'DIESEL', market:'USA', platform:'N-SERIES', filter_position:'LUBE_PRIMARY' },
  { make:'ISUZU', model:'NQR', year_from:2011, year_to:2024, engine:'4HK1-TC', engine_displacement:'5.2L', fuel_type:'DIESEL', market:'USA', platform:'N-SERIES', filter_position:'LUBE_PRIMARY' },
  { make:'ISUZU', model:'NRR', year_from:2011, year_to:2026, engine:'4HK1-TC', engine_displacement:'5.2L', fuel_type:'DIESEL', market:'USA', platform:'N-SERIES', filter_position:'LUBE_PRIMARY' },
  { make:'ISUZU', model:'NRR DERATE', year_from:2025, year_to:2026, engine:'4HK1-TC', engine_displacement:'5.2L', fuel_type:'DIESEL', market:'USA', platform:'N-SERIES', filter_position:'LUBE_PRIMARY', model_variant:'DERATE' },
  { make:'ISUZU', model:'FTR', year_from:2018, year_to:2021, engine:'4HK1-TC', engine_displacement:'5.2L', fuel_type:'DIESEL', market:'USA', platform:'F-SERIES', filter_position:'LUBE_PRIMARY' },
];

function sha(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function publicEquipmentApps() {
  return APPS.map((a) => ({
    make: a.make,
    model: a.model,
    equipment: a.make + ' ' + a.model,
    type: 'TRUCK',
    engine: a.engine + ' ' + a.engine_displacement,
    year_from: String(a.year_from),
    year_to: String(a.year_to),
    year: a.year_from === a.year_to ? String(a.year_from) : String(a.year_from) + '-' + String(a.year_to),
    market: a.market,
    platform: a.platform,
    filter_position: a.filter_position,
  }));
}

function buildRow() {
  return {
    sku: SKU,
    codigo_base: BASE,
    filter_type: 'oil',
    sub_type: 'Spin-On Combination',
    technology: 'SYNTRAX™',
    duty: 'HEAVY_DUTY',
    description: 'ELIMFILTERS® EL88076 heavy-duty spin-on combination lube filter. Canonical source Donaldson P848076.',
    name: 'ELIMFILTERS® EL88076 Lube Filter',
    installation_type: 'Spin-On',
    thread_size: null,
    height_mm: 122.03,
    outer_diameter_mm: 121,
    gasket_od_mm: null,
    gasket_id_mm: 98.9,
    micron_rating: null,
    bypass_valve_psi: null,
    nominal_efficiency: null,
    filter_media: null,
    oem_codes: OEM_CODES,
    competitor_codes: [],
    equipment_applications: [],
    vehicle_applications: [],
    alternative_products: [],
    brand_crossrefs: {},
    alternatives: [],
    specs: {
      product_type: 'LUBE_FILTER',
      product_subtype: 'SPIN_ON_COMBINATION',
      evidence_note: 'Thread, efficiency and bypass setting remain unpublished because no verified source was found.',
    },
    enrichment_data: {
      codigo_base_governance: {
        policy_version: '2026-08-19-v3.1',
        state: 'CANONICAL_VERIFIED',
        governance_state: 'CANONICAL_VERIFIED',
        required_authority: 'DONALDSON_PRIMARY',
        approved_manufacturer: 'DONALDSON',
        approved_codigo_base: BASE,
        current_codigo_base: BASE,
        approved_source_column: 'CODIGO_BASE',
        primary_manufacturer_verified: true,
        verification_method: 'ISUZU_PHASE3_P848076_20260924',
        evidence_authority: PHASE3_SOURCE,
        evidence_url: DONALDSON_URL,
        evidence_level: 'OFFICIAL_PRODUCT_IDENTITY_PLUS_DISTRIBUTOR_OE_CROSS',
      },
      product_identity: {
        canonical_source_brand: 'DONALDSON',
        canonical_source_part: BASE,
        product_type: 'LUBE_FILTER',
        product_subtype: 'SPIN_ON_COMBINATION',
        technology: 'SYNTRAX™',
        source_manifest: 'config/vehicle-platform-closure/isuzu-us-diesel-phase3-aftermarket.json',
      },
    },
    canonical_source_brand: 'DONALDSON',
    canonical_source_code: BASE,
    canonical_source_url: DONALDSON_URL,
    canonical_source_status: 'VERIFIED',
    canonical_verified_at: new Date(),
    canonical_evidence: {
      authority: PHASE3_SOURCE,
      donaldson_product_url: DONALDSON_URL,
      isuzu_oen_source: ISUZU_URL,
      oem_refs: ['2906544040','8982984040'],
      confidence: 'medium',
    },
    duty_source_brand: 'DONALDSON',
    duty_source_url: DONALDSON_URL,
    duty_validation_status: 'VERIFIED',
    duty_verified_at: new Date(),
    duty_evidence: { duty:'HEAVY_DUTY', source:PHASE3_SOURCE },
  };
}

async function run() {
  const db = new Client();
  const report = { mode: APPLY ? 'apply' : 'dry-run', sku: SKU, base: BASE };
  await db.connect();
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    await db.query("SET LOCAL lock_timeout = '5s'");
    await db.query("SET LOCAL statement_timeout = '30s'");

    const conflicts = await db.query(
      "SELECT sku,codigo_base,canonical_source_brand,canonical_source_code FROM public.elimfilters_catalog " +
      "WHERE upper(coalesce(sku,''))=upper($1) OR upper(coalesce(codigo_base,''))=upper($2) " +
      "OR upper(coalesce(canonical_source_code,''))=upper($2) OR oem_codes::text ILIKE $3 OR oem_codes::text ILIKE $4",
      [SKU,BASE,'%2906544040%','%8982984040%']
    );
    const ldOemConflicts = await db.query(
      "SELECT elimfilters_sku,oem_brand,oem_part_number FROM ld_catalog.ld_oem_cross_references " +
      "WHERE upper(regexp_replace(oem_part_number,'[^A-Z0-9]','','g'))=ANY($1::text[])",
      [['2906544040','8982984040']]
    );

    report.preflight = { public_conflicts: conflicts.rows, ld_oem_conflicts: ldOemConflicts.rows };
    if (conflicts.rowCount || ldOemConflicts.rowCount) {
      throw new Error('LIVE_IDENTITY_CONFLICT ' + JSON.stringify(report.preflight));
    }

    const row = buildRow();
    report.gateway = assertCanonicalWrite(row, { applicationWrite: false });

    if (APPLY) {
      const inserted = await db.query(
        "INSERT INTO public.elimfilters_catalog (" +
        "sku,codigo_base,filter_type,sub_type,technology,duty,description,name,installation_type," +
        "thread_size,height_mm,outer_diameter_mm,gasket_od_mm,gasket_id_mm,micron_rating,bypass_valve_psi," +
        "nominal_efficiency,filter_media,oem_codes,competitor_codes,equipment_applications,vehicle_applications," +
        "alternative_products,brand_crossrefs,alternatives,specs,enrichment_data," +
        "canonical_source_brand,canonical_source_code,canonical_source_url,canonical_source_status,canonical_verified_at," +
        "canonical_evidence,duty_source_brand,duty_source_url,duty_validation_status,duty_verified_at,duty_evidence,created_at" +
        ") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb," +
        "$23::jsonb,$24::jsonb,$25::jsonb,$26::jsonb,$27::jsonb,$28,$29,$30,$31,$32,$33::jsonb,$34,$35,$36,$37,$38::jsonb,now()) " +
        "RETURNING id,sku,codigo_base",
        [
          row.sku,row.codigo_base,row.filter_type,row.sub_type,row.technology,row.duty,row.description,row.name,row.installation_type,
          row.thread_size,row.height_mm,row.outer_diameter_mm,row.gasket_od_mm,row.gasket_id_mm,row.micron_rating,row.bypass_valve_psi,
          row.nominal_efficiency,row.filter_media,JSON.stringify(row.oem_codes),JSON.stringify(row.competitor_codes),
          JSON.stringify(row.equipment_applications),JSON.stringify(row.vehicle_applications),JSON.stringify(row.alternative_products),
          JSON.stringify(row.brand_crossrefs),JSON.stringify(row.alternatives),JSON.stringify(row.specs),JSON.stringify(row.enrichment_data),
          row.canonical_source_brand,row.canonical_source_code,row.canonical_source_url,row.canonical_source_status,row.canonical_verified_at,
          JSON.stringify(row.canonical_evidence),row.duty_source_brand,row.duty_source_url,row.duty_validation_status,row.duty_verified_at,
          JSON.stringify(row.duty_evidence),
        ]
      );
      report.public_insert = inserted.rows[0];

      await db.query(
        "INSERT INTO ld_catalog.ld_product_catalog (elimfilters_sku,source_sku,segment,created_at,updated_at) " +
        "VALUES ($1,$2,'Oil Filter',now(),now()) ON CONFLICT (elimfilters_sku) DO NOTHING",
        [SKU,BASE]
      );

      for (const x of OEM_CODES) {
        await db.query(
          "INSERT INTO ld_catalog.ld_oem_cross_references (elimfilters_sku,source_sku,oem_brand,oem_part_number) " +
          "VALUES ($1,$2,$3,$4) ON CONFLICT (elimfilters_sku,oem_brand,oem_part_number) DO NOTHING",
          [SKU,BASE,x.manufacturer,x.code]
        );
      }
      const specRows = [
        ['length_mm','122.03','mm'],
        ['outer_diameter_mm','121','mm'],
        ['gasket_id_mm','98.9','mm'],
        ['product_type','LUBE_FILTER',null],
        ['product_subtype','SPIN_ON_COMBINATION',null],
        ['technology','SYNTRAX™',null],
      ];
      for (const [key,value,unit] of specRows) {
        await db.query(
          "INSERT INTO ld_catalog.ld_product_specifications (elimfilters_sku,source_sku,spec_key,spec_value,spec_unit) " +
          "VALUES ($1,$2,$3,$4,$5) ON CONFLICT (elimfilters_sku,spec_key) DO UPDATE SET " +
          "source_sku=EXCLUDED.source_sku,spec_value=EXCLUDED.spec_value,spec_unit=EXCLUDED.spec_unit",
          [SKU,BASE,key,value,unit]
        );
      }

      const evidenceHash = sha({
        phase2_rows:['P2-N-LUBE-2011-ON','P2-F-LUBE-2018-2021'],
        source:ISUZU_URL,
        applications:APPS,
      });
      report.relational_applications = await applyVerifiedRelationalVehicleApplications(db,{
        sku:SKU,
        source_sku:BASE,
        applications:APPS.map((a)=>Object.assign({},a,{source_sku:BASE,source_origin:'ISUZU_PHASE1_PHASE2_GOVERNED'})),
        evidence:{
          authority:'ISUZU_PHASE1_PHASE2_GOVERNED',
          source_url:ISUZU_URL,
          evidence_hash:evidenceHash,
          metadata:{phase2_rows:['P2-N-LUBE-2011-ON','P2-F-LUBE-2018-2021'],phase3_part:BASE},
        },
      });
      report.public_applications = await applyVerifiedApplications(db,{
        sku:SKU,
        equipment_applications:publicEquipmentApps(),
        vehicle_applications:[],
        evidence:{
          authority:'ISUZU_PHASE1_PHASE2_GOVERNED',
          source_url:ISUZU_URL,
          evidence_hash:evidenceHash,
          metadata:{phase2_rows:['P2-N-LUBE-2011-ON','P2-F-LUBE-2018-2021'],phase3_part:BASE},
        },
      });

      await db.query(
        "INSERT INTO ld_catalog.ld_production_readiness " +
        "(elimfilters_sku,source_sku,segment,has_oem,has_competitor,has_applications,has_specifications,production_tier,updated_at) " +
        "VALUES ($1,$2,'Oil Filter',true,false,true,true,'ISUZU_P3_GOVERNED',now()) " +
        "ON CONFLICT (elimfilters_sku) DO UPDATE SET source_sku=EXCLUDED.source_sku,segment=EXCLUDED.segment," +
        "has_oem=true,has_applications=true,has_specifications=true,production_tier='ISUZU_P3_GOVERNED',updated_at=now()",
        [SKU,BASE]
      );

      await db.query('select refresh_crossref_cache_sku($1)',[SKU]);

      const audit = await db.query(
        "SELECT " +
        "(SELECT count(*)::int FROM public.elimfilters_catalog WHERE sku=$1 AND codigo_base=$2 AND canonical_source_brand='DONALDSON' AND canonical_source_code=$2) public_product," +
        "(SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 AND source_sku=$2) ld_parent," +
        "(SELECT count(*)::int FROM ld_catalog.ld_oem_cross_references WHERE elimfilters_sku=$1) oem_refs," +
        "(SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1) applications," +
        "(SELECT count(*)::int FROM ld_catalog.ld_product_specifications WHERE elimfilters_sku=$1) specs," +
        "(SELECT count(*)::int FROM public.crossref_resolved_cache WHERE sku=$1) cache_rows",
        [SKU,BASE]
      );
      report.audit = audit.rows[0];
      if (Number(report.audit.public_product)!==1 || Number(report.audit.ld_parent)!==1 ||
          Number(report.audit.oem_refs)!==2 || Number(report.audit.applications)!==6 ||
          Number(report.audit.specs)!==6) {
        throw new Error('POSTWRITE_AUDIT_FAILED ' + JSON.stringify(report.audit));
      }

      await db.query('COMMIT');
    } else {
      await db.query('ROLLBACK');
    }
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    return report;
  } catch (error) {
    try { await db.query('ROLLBACK'); } catch {}
    error.report = report;
    throw error;
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  run().then((r)=>console.log('[el88076-publication]',JSON.stringify(r,null,2)))
    .catch((e)=>{console.error('[el88076-publication] failed',JSON.stringify(e.report||{error:e.message},null,2));console.error(e.stack||e.message);process.exit(1);});
}

module.exports = { run, SKU, BASE, OEM_CODES, APPS, buildRow };
