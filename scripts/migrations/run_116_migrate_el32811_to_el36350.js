'use strict';
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const {
  applyVerifiedApplications,
  applyVerifiedRelationalVehicleApplications,
} = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--apply');
const OLD_SKU = 'EL32811';
const NEW_SKU = 'EL36350';
const BASE = 'CH12811';
const FRAM_EVIDENCE = 'elimfilters-vault/91-private-evidence/fram-usa-ld-catalog/fram-usa-ld-full-lube-20260911/products/CH12811.json';

function sha(v){ return crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex'); }
function sslFor(url){ const h=new URL(url).hostname.toLowerCase(); return ['127.0.0.1','localhost','::1'].includes(h)?false:{rejectUnauthorized:false}; }
const OEM_CODES = [
  ['HYUNDAI','26350-2S000'], ['HYUNDAI','26350-2S001'],
  ['KIA','26350-2S000'], ['KIA','26350-2S001'],
].map(([manufacturer,code])=>({manufacturer,code,classification:'OEM'}));

const COMPETITOR_CODES = [
  ['FRAM','COR12811ACC'], ['FRAM','FD12811'], ['FRAM','FF12811'],
  ['FRAM','FP12811BP'], ['FRAM','FE12811'], ['FRAM','FS12811'],
  ['FRAM','TG12811'], ['FRAM','XG12811'],
  ['WIX','WL10514'], ['ECOGARD','S11914'], ['K&N','HP-7064'],
  ['MOBIL 1','M1C-158A'], ['NAPA GOLD','100514'], ['BALDWIN','P40164'],
  ['MAHLE/KNECHT','OX1349'], ['LUBER-FINER','P1086'], ['CARQUEST','95329'],
  ['PREMIUM GUARD','PG99527EX'],
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
    make, model, equipment:make+' '+model, engine,
    year_from:String(from), year_to:String(to),
    year: from===to ? String(from) : from+'-'+to,
  }));
}

function normalizedGovernance(oldData){
  const gov = {...(oldData?.codigo_base_governance||{})};
  return {
    ...oldData,
    codigo_base_governance:{
      ...gov,
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
      evidence_note:'FRAM CH12811 remains canonical LD authority; operator-approved ELIMFILTERS SKU is EL36350 for Hyundai/Kia OEM 26350-2S000 family.',
    },
    sku_governance:{
      ...(oldData?.sku_governance||{}),
      canonical_sku:NEW_SKU,
      prior_sku:OLD_SKU,
      operator_rule:'26350-2S000 => EL36350',
      migrated_at:'2026-09-23T00:00:00.000Z',
    },
  };
}
async function run(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('Missing database URL');
  const c=new Client({connectionString:url,ssl:sslFor(url)});
  const report={mode:APPLY?'apply':'dry-run',old_sku:OLD_SKU,new_sku:NEW_SKU};
  await c.connect();
  try{
    await c.query('BEGIN');

    const source=await c.query('select * from public.elimfilters_catalog where sku=$1 for update',[OLD_SKU]);
    const target=await c.query('select sku from public.elimfilters_catalog where sku=$1',[NEW_SKU]);
    if(source.rowCount!==1) throw new Error('SOURCE_SKU_NOT_UNIQUE');
    if(target.rowCount!==0) throw new Error('TARGET_SKU_ALREADY_EXISTS');
    const row=source.rows[0];
    if(row.codigo_base!==BASE || row.duty!=='LIGHT_DUTY' || row.filter_type!=='oil' || row.technology!=='SYNTRAX™'){
      throw new Error('SOURCE_IDENTITY_MISMATCH');
    }

    const enrichment=normalizedGovernance(row.enrichment_data||{});
    const patch={sku:NEW_SKU,oem_codes:OEM_CODES,competitor_codes:COMPETITOR_CODES,enrichment_data:enrichment};
    report.gateway=assertGovernedCatalogPatch(row,patch);
    if(APPLY){
      const renamed=await c.query(
        'update public.elimfilters_catalog set sku=$1,oem_codes=$2::jsonb,competitor_codes=$3::jsonb,enrichment_data=$4::jsonb,description=$5,filter_media=$6 where sku=$7 returning sku,codigo_base',
        [NEW_SKU,JSON.stringify(OEM_CODES),JSON.stringify(COMPETITOR_CODES),JSON.stringify(enrichment),
         'ELIMFILTERS® EL36350 cartridge lube oil filter. Canonical source FRAM CH12811; OEM family Hyundai/Kia 26350-2S000 / 26350-2S001.',
         'Cellulose/Synthetic Blend',OLD_SKU]
      );
      if(renamed.rowCount!==1) throw new Error('PUBLIC_RENAME_FAILED');
      report.public=renamed.rows[0];

      const ldParent=await c.query(
        'update ld_catalog.ld_product_catalog set elimfilters_sku=$1,updated_at=now() where elimfilters_sku=$2 returning elimfilters_sku,source_sku,segment',
        [NEW_SKU,OLD_SKU]
      );
      if(ldParent.rowCount!==1) throw new Error('LD_PARENT_RENAME_FAILED');
      report.ld_parent=ldParent.rows[0];

      await c.query(
        "update ld_catalog.ld_canonical_product_identity set elimfilters_sku=$1,origin_group='NON_EUROPEAN',canonical_brand='FRAM',canonical_part_number=$2,filter_type='oil',status='ACTIVE',evidence_source='MIGRATION_116_EL36350_OPERATOR_SKU',updated_at=now() where elimfilters_sku=$3",
        [NEW_SKU,BASE,OLD_SKU]
      );
      for(const x of OEM_CODES){
        await c.query(
          'insert into ld_catalog.ld_oem_cross_references (elimfilters_sku,source_sku,oem_brand,oem_part_number) values ($1,$2,$3,$4) on conflict (elimfilters_sku,oem_brand,oem_part_number) do nothing',
          [NEW_SKU,BASE,x.manufacturer,x.code]
        );
      }
      for(const x of COMPETITOR_CODES){
        await c.query(
          'insert into ld_catalog.ld_competitor_cross_references (elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values ($1,$2,$3,$4) on conflict (elimfilters_sku,competitor_brand,competitor_part_number) do nothing',
          [NEW_SKU,BASE,x.manufacturer,x.code]
        );
      }

      await c.query('delete from ld_catalog.ld_vehicle_applications where elimfilters_sku=$1',[NEW_SKU]);
      const relApps=APPS.map(([make,model,year_from,year_to,engine])=>({
        make,model,year_from,year_to,engine,source_sku:BASE,
        source_origin:'FRAM_LD_MULTI_REGION_PLUS_VERIFIED_AFTERMARKET',
        fuel_type:engine.includes('Hybrid')?'HYBRID':'GASOLINE',
        filter_position:'LUBE_PRIMARY',
      }));
      report.relational_applications=await applyVerifiedRelationalVehicleApplications(c,{
        sku:NEW_SKU,
        source_sku:BASE,
        applications:relApps,
        evidence:{
          authority:'FRAM_LD_MULTI_REGION_PLUS_VERIFIED_AFTERMARKET',
          source_url:'https://www.pgfilters.com/es/adelantate/',
          evidence_hash:sha({apps:relApps,fram_capture:FRAM_EVIDENCE}),
          metadata:{fram_capture:FRAM_EVIDENCE,oem_family:['26350-2S000','26350-2S001']},
        },
      });
      report.public_applications=await applyVerifiedApplications(c,{
        sku:NEW_SKU,
        vehicle_applications:publicApps(),
        equipment_applications:[],
        evidence:{
          authority:'FRAM_LD_MULTI_REGION_PLUS_VERIFIED_AFTERMARKET',
          source_url:'https://www.pgfilters.com/es/adelantate/',
          evidence_hash:sha({apps:publicApps(),fram_capture:FRAM_EVIDENCE}),
          metadata:{fram_capture:FRAM_EVIDENCE},
        },
      });

      await c.query(
        "update ld_catalog.ld_production_readiness set has_oem=true,has_competitor=true,has_applications=true,has_specifications=true,updated_at=now() where elimfilters_sku=$1",
        [NEW_SKU]
      );
      await c.query('delete from public.crossref_resolved_cache where sku=$1',[OLD_SKU]);
      await c.query('select refresh_crossref_cache_sku($1)',[NEW_SKU]);
    }
    const final=await c.query(
      "select sku,codigo_base,duty,filter_type,technology,filter_media,canonical_source_brand,canonical_source_code,jsonb_array_length(oem_codes) oem_count,jsonb_array_length(competitor_codes) competitor_count,jsonb_array_length(vehicle_applications) app_count from public.elimfilters_catalog where sku=$1",
      [APPLY?NEW_SKU:OLD_SKU]
    );
    report.final_preview=final.rows[0]||null;

    if(APPLY){
      const audit=await c.query(
        "select (select count(*) from public.elimfilters_catalog where sku=$1) new_public,(select count(*) from public.elimfilters_catalog where sku=$2) old_public,(select count(*) from ld_catalog.ld_product_catalog where elimfilters_sku=$1) ld_parent,(select count(*) from ld_catalog.ld_vehicle_applications where elimfilters_sku=$1) apps,(select count(*) from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1) oem,(select count(*) from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1) comp,(select count(*) from ld_catalog.ld_product_specifications where elimfilters_sku=$1) specs,(select count(*) from ld_catalog.ld_canonical_product_identity where elimfilters_sku=$1 and canonical_brand='FRAM' and canonical_part_number=$3 and status='ACTIVE') identity",
        [NEW_SKU,OLD_SKU,BASE]
      );
      report.audit=audit.rows[0];
      const a=report.audit;
      if(Number(a.new_public)!==1||Number(a.old_public)!==0||Number(a.ld_parent)!==1||Number(a.apps)!==8||Number(a.identity)!==1){
        throw new Error('POSTWRITE_AUDIT_FAILED '+JSON.stringify(a));
      }
      await c.query('COMMIT');
    }else{
      await c.query('ROLLBACK');
    }
    report.transaction=APPLY?'COMMIT':'ROLLBACK';
    return report;
  }catch(e){
    try{await c.query('ROLLBACK')}catch{}
    throw e;
  }finally{
    await c.end();
  }
}
if(require.main===module){
  run().then(r=>console.log('[el36350-migration]',JSON.stringify(r,null,2)))
    .catch(e=>{console.error('[el36350-migration] failed',e.stack||e.message);process.exit(1);});
}

module.exports={run,OLD_SKU,NEW_SKU,BASE,OEM_CODES,COMPETITOR_CODES,APPS};
