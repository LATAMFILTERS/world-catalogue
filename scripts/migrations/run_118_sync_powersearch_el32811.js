'use strict';
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--apply');
const SKU = 'EL32811';
const BASE = 'CH12811';

function sha(v){ return crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex'); }
function sslFor(url){ const h=new URL(url).hostname.toLowerCase(); return ['127.0.0.1','localhost','::1'].includes(h)?false:{rejectUnauthorized:false}; }

const OEM_CODES = [
  ['HYUNDAI','26350-2S000'], ['HYUNDAI','26350-2S001'],
  ['KIA','26350-2S000'], ['KIA','26350-2S001'],
].map(([manufacturer,code])=>({manufacturer,code,classification:'OEM'}));

const COMPETITOR_CODES = [
  ['FRAM','COR12811ACC'], ['FRAM','FD12811'], ['FRAM','FE12811'], ['FRAM','FF12811'],
  ['FRAM','FP12811BP'], ['FRAM','FS12811'], ['FRAM','TG12811'], ['FRAM','XG12811'],
  ['WIX','WL10514'], ['ECOGARD','S11914'], ['K&N','HP-7064'], ['MOBIL 1','M1C-158A'],
  ['NAPA GOLD','100514'], ['BALDWIN','P40164'], ['MAHLE/KNECHT','OX1349'],
  ['LUBER-FINER','P1086'], ['CARQUEST','95329'], ['PREMIUM GUARD','PG99527EX'],
].map(([manufacturer,code])=>({manufacturer,code,classification:'AFTERMARKET'}));

const APPS = [
  ['HYUNDAI','TUCSON',2022,2026,'2.5L L4 Gas'],
  ['HYUNDAI','SANTA FE',2021,2026,'2.5L L4 Gas'],
  ['HYUNDAI','SONATA',2020,2026,'2.5L L4 Gas'],
  ['HYUNDAI','SANTA CRUZ',2022,2026,'2.5L L4 Gas'],
  ['HYUNDAI','PALISADE',2026,2026,'2.5L L4 Hybrid'],
  ['KIA','SORENTO',2021,2026,'2.5L L4 Gas'],
  ['KIA','SPORTAGE',2023,2026,'2.5L L4 Gas'],
  ['KIA','K5',2021,2026,'2.5L L4 Gas'],
];
function publicApps(){
  return APPS.map(([make,model,from,to,engine])=>({
    make,model,equipment:make+' '+model,engine,
    year_from:String(from),year_to:String(to),year:from===to?String(from):from+'-'+to,
  }));
}

function governance(oldData){
  return {
    ...(oldData||{}),
    codigo_base_governance:{
      ...((oldData||{}).codigo_base_governance||{}),
      policy_version:'2026-08-29-regional-v3.2',
      state:'CANONICAL_VERIFIED',
      governance_state:'CANONICAL_VERIFIED',
      origin_group:'NON_EUROPEAN',
      approved_manufacturer:'FRAM',
      approved_codigo_base:BASE,
      approved_source_column:'CANONICAL_POLICY',
      current_codigo_base:BASE,
      primary_manufacturer_verified:true,
      required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',
      evidence_note:'FRAM CH12811 is canonical for LD non-European Hyundai/Kia 26350-2S000 / 26350-2S001 family.',
    },
    sku_governance:{
      ...((oldData||{}).sku_governance||{}),
      canonical_sku:SKU,
      governing_rule:'LD_NON_EUROPEAN_FRAM_CANONICAL_BASE_LAST4',
      canonical_base:BASE,
      canonical_suffix:'2811',
      verified_at:'2026-09-23T00:00:00.000Z',
    },
  };
}
async function run(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('Missing database URL');
  const db=new Client({connectionString:url,ssl:sslFor(url)});
  const report={mode:APPLY?'apply':'dry-run',sku:SKU};
  await db.connect();
  try{
    await db.query('BEGIN');
    const src=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);
    if(src.rowCount!==1) throw new Error('EL32811_NOT_UNIQUE');
    const row=src.rows[0];
    if(row.codigo_base!==BASE || row.duty!=='LIGHT_DUTY' || row.filter_type!=='oil' || row.technology!=='SYNTRAX™'){
      throw new Error('EL32811_IDENTITY_MISMATCH');
    }
    const enrich=governance(row.enrichment_data);
    report.gateway=assertGovernedCatalogPatch(row,{oem_codes:OEM_CODES,competitor_codes:COMPETITOR_CODES,enrichment_data:enrich});

    const ff=await db.query(
      "select count(*)::int n from ld_catalog.ld_competitor_cross_references where elimfilters_sku='EF30814' and upper(competitor_brand)='FLEETGUARD' and upper(competitor_part_number)='FF5112'"
    );
    report.ff5112_legacy_rows=ff.rows[0].n;
    if(APPLY){
      await db.query(
        'update public.elimfilters_catalog set oem_codes=$1::jsonb,competitor_codes=$2::jsonb,enrichment_data=$3::jsonb,description=$4 where sku=$5',
        [JSON.stringify(OEM_CODES),JSON.stringify(COMPETITOR_CODES),JSON.stringify(enrich),
         'ELIMFILTERS® EL32811 cartridge lube oil filter. Canonical source FRAM CH12811; Hyundai/Kia OEM family 26350-2S000 / 26350-2S001.',SKU]
      );

      for(const x of OEM_CODES){
        await db.query(
          'insert into ld_catalog.ld_oem_cross_references (elimfilters_sku,source_sku,oem_brand,oem_part_number) values ($1,$2,$3,$4) on conflict (elimfilters_sku,oem_brand,oem_part_number) do nothing',
          [SKU,BASE,x.manufacturer,x.code]
        );
      }
      for(const x of COMPETITOR_CODES){
        await db.query(
          'insert into ld_catalog.ld_competitor_cross_references (elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values ($1,$2,$3,$4) on conflict (elimfilters_sku,competitor_brand,competitor_part_number) do nothing',
          [SKU,BASE,x.manufacturer,x.code]
        );
      }

      await db.query('delete from ld_catalog.ld_vehicle_applications where elimfilters_sku=$1',[SKU]);
      for(const [make,model,year_from,year_to,engine] of APPS){
        await db.query(
          'insert into ld_catalog.ld_vehicle_applications (elimfilters_sku,source_sku,make,model_family,model_type,year,engine_code,source_origin) values ($1,$2,$3,$4,$5,$6,$7,$8)',
          [SKU,BASE,make,model,'2.5L',year_from===year_to?String(year_from):year_from+'-'+year_to,engine,'FRAM_LD_MULTI_REGION_PLUS_OPERATOR_VERIFIED_OEM']
        );
      }
      report.relational_apps={inserted:APPS.length,schema:'legacy_ld_vehicle_applications'};
      report.public_apps=await applyVerifiedApplications(db,{
        sku:SKU,vehicle_applications:publicApps(),equipment_applications:[],
        evidence:{authority:'FRAM_LD_MULTI_REGION_PLUS_OPERATOR_VERIFIED_OEM',source_url:'https://www.pgfilters.com/es/adelantate/',evidence_hash:sha(publicApps()),metadata:{oem_family:['26350-2S000','26350-2S001']}}
      });

      const removed=await db.query(
        "delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku='EF30814' and upper(competitor_brand)='FLEETGUARD' and upper(competitor_part_number)='FF5112'"
      );
      report.ff5112_legacy_removed=removed.rowCount;
      if(ff.rows[0].n!==removed.rowCount) throw new Error('FF5112_LEGACY_DELETE_MISMATCH');

      await db.query('select refresh_crossref_cache_sku($1)',[SKU]);

      const audit=await db.query(
        "select jsonb_array_length(oem_codes)::int oem,jsonb_array_length(competitor_codes)::int comp,jsonb_array_length(vehicle_applications)::int apps from public.elimfilters_catalog where sku=$1",
        [SKU]
      );
      report.audit=audit.rows[0];
      if(report.audit.oem!==4 || report.audit.comp!==18 || report.audit.apps!==8) throw new Error('EL32811_POSTWRITE_COUNT_MISMATCH');

      const v5=await db.query(
        "select code,sku from public.v_api_resolver_v5 where code=any($1::text[]) order by code",
        [['263502S000','263502S001','WL10514']]
      );
      report.v5=v5.rows;
      for(const code of ['263502S000','263502S001','WL10514']){
        if(!v5.rows.some(r=>r.code===code && r.sku===SKU)) throw new Error('V5_MISSING_'+code);
      }

      await db.query('COMMIT');
    }else{
      await db.query('ROLLBACK');
    }
    report.transaction=APPLY?'COMMIT':'ROLLBACK';
    return report;
  }catch(e){
    try{await db.query('ROLLBACK')}catch{}
    throw Object.assign(e,{report});
  }finally{await db.end();}
}
if(require.main===module){
  run().then(r=>console.log('[powersearch-el32811]',JSON.stringify(r,null,2)))
    .catch(e=>{console.error('[powersearch-el32811] failed',JSON.stringify(e.report||{error:e.message},null,2));console.error(e.stack||e.message);process.exit(1)});
}
module.exports={run,SKU,BASE,OEM_CODES,COMPETITOR_CODES,APPS};
