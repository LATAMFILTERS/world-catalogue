'use strict';

const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--apply');
const MIGRATION = '226_ISUZU_RD_GOVERNED_PRODUCTS_20261007';
const DONALDSON_KIT_GUIDE = 'https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/australasia/filter-kits/f111610/Fuel-and-Oil-Truck-Filter-Maintenance-Kits_Web.pdf';
const ISUZU_RD_BROCHURE = 'https://isuzu.com.do/wp-content/uploads/2022/08/Familia-Camiones-Isuzu-Reward.pdf';
const ISUZU_FTR_RD = 'https://www.isuzu-latam-caribbean.com/en/truck/ftr90sl-pds/';

const PRODUCTS = [
  {
    sku: 'EF95951',
    base: 'P505951',
    filter_type: 'fuel',
    sub_type: 'Fuel Filter',
    technology: 'SYNTAPORE™',
    oem: ['8971725490','8971725491'],
    competitors: [['FLEETGUARD','FF5394']],
    source_url: DONALDSON_KIT_GUIDE,
    source_note: 'Donaldson X903221 identifies P505951 in the Isuzu NPR71 4HG1 service-filter set.',
    applications: [
      { make:'ISUZU', model:'NPR71', engine:'4HG1', engine_displacement:'4.57L', fuel_type:'DIESEL', market:'DOMINICAN_REPUBLIC', platform:'N-SERIES', filter_position:'FUEL_PRIMARY', source_origin:'ISUZU_RD_PLUS_DONALDSON_X903221' }
    ],
  },
  {
    sku: 'EF98204',
    base: 'P848204',
    filter_type: 'fuel',
    sub_type: 'Primary Fuel Filter',
    technology: 'SYNTAPORE™',
    oem: ['8981653750'],
    competitors: [['FLEETGUARD','FS20128']],
    source_url: DONALDSON_KIT_GUIDE,
    source_note: 'Donaldson X900189 identifies P848204 in the Isuzu 4HK1-TCS 5.2L fuel-and-oil service-filter set.',
    applications: [
      { make:'ISUZU', model:'FTR90SL-PDS', year_from:2021, year_to:2021, engine:'4HK1-TCS', engine_displacement:'5.193L', fuel_type:'DIESEL', market:'DOMINICAN_REPUBLIC', platform:'F-SERIES', filter_position:'FUEL_PRIMARY', source_origin:'ISUZU_RD_FTR_PLUS_DONALDSON_X900189' }
    ],
  },
  {
    sku: 'EF92502',
    base: 'P502502',
    filter_type: 'fuel',
    sub_type: 'Fuel/Water Separator',
    technology: 'HYDROCORE™',
    oem: ['8980924811'],
    competitors: [['FLEETGUARD','FF5989']],
    source_url: DONALDSON_KIT_GUIDE,
    source_note: 'Donaldson X900189 identifies P502502 in the Isuzu 4HK1-TCS 5.2L service-filter set.',
    applications: [
      { make:'ISUZU', model:'FTR90SL-PDS', year_from:2021, year_to:2021, engine:'4HK1-TCS', engine_displacement:'5.193L', fuel_type:'DIESEL', market:'DOMINICAN_REPUBLIC', platform:'F-SERIES', filter_position:'FUEL_WATER_SEPARATOR', source_origin:'ISUZU_RD_FTR_PLUS_DONALDSON_X900189' }
    ],
  },
];

const JSON_COLUMNS = new Set([
  'oem_codes','competitor_codes','equipment_applications','vehicle_applications',
  'alternative_products','brand_crossrefs','alternatives','specs','enrichment_data',
  'canonical_evidence','duty_evidence'
]);

function normalize(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g,''); }
function sha(v) { return crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex'); }
function sslFor(url) {
  const host = new URL(url).hostname.toLowerCase();
  return ['127.0.0.1','localhost','::1'].includes(host) ? false : { rejectUnauthorized:false };
}
function sourceFor(p) {
  return p.base === 'P505951' ? ISUZU_RD_BROCHURE : ISUZU_FTR_RD;
}
function buildRow(p) {
  const evidenceHash = sha({sku:p.sku,base:p.base,oem:p.oem,competitors:p.competitors,applications:p.applications});
  return {
    sku:p.sku,
    codigo_base:p.base,
    filter_type:p.filter_type,
    sub_type:p.sub_type,
    technology:p.technology,
    duty:'HEAVY_DUTY',
    name:`ELIMFILTERS® ${p.sku} ${p.sub_type}`,
    description:`ELIMFILTERS® ${p.sku} ${p.sub_type}. Canonical Donaldson reference ${p.base}.`,
    oem_codes:p.oem.map(code=>({manufacturer:'ISUZU',code,classification:'OEM',source:'ISUZU_RD_DONALDSON_KIT_CLOSURE',source_url:sourceFor(p)})),
    competitor_codes:p.competitors.map(([manufacturer,code])=>({manufacturer,code,classification:'AFTERMARKET',source:'DONALDSON_KIT_CLOSURE',source_url:p.source_url})),
    equipment_applications:[],
    vehicle_applications:[],
    alternative_products:[],
    brand_crossrefs:{},
    alternatives:[],
    specs:{product_type:p.sub_type.toUpperCase().replace(/[^A-Z0-9]+/g,'_'), source_note:p.source_note},
    enrichment_data:{
      codigo_base_governance:{
        policy_version:'2026-10-06-v4.2',
        state:'CANONICAL_VERIFIED',
        governance_state:'CANONICAL_VERIFIED',
        required_authority:'DONALDSON_PRIMARY',
        approved_manufacturer:'DONALDSON',
        approved_codigo_base:p.base,
        current_codigo_base:p.base,
        approved_source_column:'CODIGO_BASE',
        primary_manufacturer_verified:true,
        verification_method:'ISUZU_RD_DONALDSON_OFFICIAL_KIT_20261007',
        evidence_authority:'DONALDSON_OFFICIAL_KIT_GUIDE',
        evidence_url:p.source_url,
        evidence_level:'OFFICIAL_DONALDSON_APPLICATION_KIT',
      },
      product_identity:{
        canonical_source_brand:'DONALDSON',
        canonical_source_part:p.base,
        technology:p.technology,
        market_scope:'DOMINICAN_REPUBLIC',
        migration:MIGRATION,
      },
    },
    canonical_source_brand:'DONALDSON',
    canonical_source_code:p.base,
    canonical_source_url:p.source_url,
    canonical_source_status:'VERIFIED',
    canonical_verified_at:new Date(),
    canonical_evidence:{
      authority:'DONALDSON_OFFICIAL_KIT_GUIDE',
      source_url:p.source_url,
      isuzu_market_source:sourceFor(p),
      evidence_hash:evidenceHash,
      confidence:'high',
    },
    duty_source_brand:'DONALDSON',
    duty_source_url:p.source_url,
    duty_validation_status:'VERIFIED',
    duty_verified_at:new Date(),
    duty_evidence:{duty:'HEAVY_DUTY',source:'DONALDSON_OFFICIAL_KIT_GUIDE',migration:MIGRATION},
  };
}

async function run() {
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const db = new Client({connectionString:databaseUrl,ssl:sslFor(databaseUrl)});
  const report = {migration:MIGRATION,mode:APPLY?'apply':'dry-run',products:[],applications:{}};
  await db.connect();
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    await db.query("SET LOCAL lock_timeout = '5s'");
    await db.query("SET LOCAL statement_timeout = '30s'");

    for (const p of PRODUCTS) {
      const row = buildRow(p);
      const gateway = assertCanonicalWrite(row,{applicationWrite:false});
      const conflicts = await db.query(
        "SELECT sku,codigo_base,canonical_source_code FROM public.elimfilters_catalog " +
        "WHERE upper(coalesce(sku,''))=upper($1) OR upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))=$2 " +
        "OR upper(regexp_replace(coalesce(canonical_source_code,''),'[^A-Z0-9]','','g'))=$2 FOR UPDATE",
        [p.sku,normalize(p.base)]
      );
      const incompatible = conflicts.rows.filter(r => r.sku !== p.sku || (normalize(r.codigo_base)!==normalize(p.base) && normalize(r.canonical_source_code)!==normalize(p.base)));
      if (incompatible.length) throw new Error('IDENTITY_COLLISION '+p.sku+' '+JSON.stringify(incompatible));

      report.products.push({sku:p.sku,base:p.base,gateway,existing:conflicts.rows.length>0});
      if (APPLY && conflicts.rows.length===0) {
        const cols = Object.keys(row);
        const values = cols.map(k=>JSON_COLUMNS.has(k)?JSON.stringify(row[k]):row[k]);
        const placeholders = cols.map((k,i)=>'$'+(i+1)+(JSON_COLUMNS.has(k)?'::jsonb':''));
        await db.query(
          'INSERT INTO public.elimfilters_catalog ('+cols.map(k=>'"'+k+'"').join(',')+') VALUES ('+placeholders.join(',')+')',
          values
        );
      }

      if (APPLY) {
        report.applications[p.sku] = await applyVerifiedApplications(db,{
          sku:p.sku,
          equipment_applications:[],
          vehicle_applications:p.applications,
          evidence:{
            authority:'ISUZU_RD_PLUS_DONALDSON_OFFICIAL_KIT',
            source_url:p.source_url,
            evidence_hash:sha(p.applications),
            metadata:{migration:MIGRATION,canonical_base:p.base,market:'DOMINICAN_REPUBLIC'}
          }
        });
        await db.query('SELECT refresh_crossref_cache_sku($1)',[p.sku]);
      }
    }

    if (APPLY) {
      const audit = await db.query(
        "SELECT sku,codigo_base,technology,canonical_source_brand,canonical_source_code FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) ORDER BY sku",
        [PRODUCTS.map(p=>p.sku)]
      );
      if (audit.rowCount !== PRODUCTS.length) throw new Error('POSTWRITE_AUDIT_INCOMPLETE');
      report.audit = audit.rows;
      await db.query('COMMIT');
      report.transaction='COMMIT';
    } else {
      await db.query('ROLLBACK');
      report.transaction='ROLLBACK';
    }
    return report;
  } catch (error) {
    try { await db.query('ROLLBACK'); } catch {}
    error.report=report;
    throw error;
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  run().then(r=>console.log('[isuzu-rd-governed-products]',JSON.stringify(r,null,2)))
    .catch(e=>{console.error('[isuzu-rd-governed-products] failed',JSON.stringify(e.report||{error:e.message},null,2));console.error(e.stack||e.message);process.exit(1);});
}

module.exports = { MIGRATION, PRODUCTS, buildRow, run };
