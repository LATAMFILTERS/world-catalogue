'use strict';

const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const {applyVerifiedApplications,applyVerifiedRelationalVehicleApplications}=require('../../lib/catalog-application-write-service');

const APPLY=process.argv.includes('--apply');
const MANIFEST=path.resolve(__dirname,'../candidates/premium_guard_oil_phase3_block2_canonical_20260923.json');
const SKU='EL30075', BASE='MW75';
const MANN_URL='https://www.mann-filter.com/us-en/catalog/search-results/product.html/mw75_mann-filter.html';
const MANN_HASH='cf912a52ab331d126caca7729efd419d1d2c2dc5790816f0e207f7518d46b3f1';

function evidenceHash(item){
  return crypto.createHash('sha256').update([MANN_HASH,item.application_evidence_hash].join('|')).digest('hex');
}
function appRows(){
  return [
    {make:'BMW',model:'i3',year:'2014-2021',engine:'W20K06A · L2 0.6L 647cc',equipment:'BMW i3'},
    {make:'BMW',model:'i3s',year:'2018-2021',engine:'W20K06A · L2 0.6L 647cc',equipment:'BMW i3s'},
  ];
}
function splitYear(v){
  const m=String(v||'').match(/^(\d{4})-(\d{4})$/); if(m)return {year:null,year_from:+m[1],year_to:+m[2]};
  const y=Number(v); return Number.isFinite(y)?{year:y,year_from:y,year_to:y}:null;
}

async function run(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('Missing database URL');
  const item=JSON.parse(fs.readFileSync(MANIFEST,'utf8')).find(x=>x.sku===SKU);
  if(!item) throw new Error('MW75_MANIFEST_MISSING');
  const db=new Client({connectionString:url,ssl:false});
  const report={mode:APPLY?'apply':'dry-run',sku:SKU,base:BASE};
  await db.connect();
  try{
    await db.query('BEGIN');
    let q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);
    if(q.rowCount!==1) throw new Error('SKU_NOT_FOUND');
    let row=q.rows[0];
    if(String(row.codigo_base).toUpperCase()!==BASE || row.duty!=='LIGHT_DUTY' || row.filter_type!=='oil') throw new Error('IDENTITY_MISMATCH');

    const apps=appRows();
    const hash=evidenceHash(item);
    if(APPLY){
      report.public_apps=await applyVerifiedApplications(db,{
        sku:SKU,vehicle_applications:apps,equipment_applications:[],
        evidence:{
          authority:'MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD',
          source_url:MANN_URL,
          evidence_hash:hash,
          metadata:{mann_engine_code:'W20K06A',mann_displacement_cc:647,premium_guard_code:item.premium_guard_code,premium_guard_application_url:item.application_source_url}
        }
      });
      q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);
      row=q.rows[0];
    }

    const old=row.enrichment_data||{};
    const enrichment={
      ...old,
      codigo_base_governance:{
        ...(old.codigo_base_governance||{}),
        policy_version:'2026-08-29-regional-v3.2',
        state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',
        origin_group:'EUROPEAN',approved_manufacturer:'MANN-FILTER',approved_codigo_base:BASE,
        approved_source_column:'CANONICAL_POLICY',current_codigo_base:BASE,
        primary_manufacturer_verified:true,required_authority:'VERIFIED_MANN_FILTER',
        evidence_note:'MANN-FILTER MW75 canonical LD European oil authority; Premium Guard supplements cross-references and year ranges.'
      },
      premium_guard_reference_enrichment:{
        premium_guard_code:item.premium_guard_code,source_url:item.application_source_url,
        evidence_hash:item.application_evidence_hash,verified_at:new Date().toISOString()
      },
      mann_application_validation:{
        source_url:MANN_URL,evidence_hash:MANN_HASH,engine_code:'W20K06A',displacement_cc:647,
        verified_models:['i3','i3s'],verified_at:new Date().toISOString()
      }
    };

    report.gateway=assertGovernedCatalogPatch(row,{
      oem_codes:item.oem_codes,competitor_codes:item.competitor_codes,enrichment_data:enrichment
    });
    report.expected={oem:item.oem_codes.length,competitors:item.competitor_codes.length,applications:apps.length};

    if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}

    const s=item.specs||{};
    await db.query(`
      update public.elimfilters_catalog set
        codigo_base=($1::text)::varchar,filter_type='oil',duty='LIGHT_DUTY',technology='SYNTRAX™',
        height_mm=$2,outer_diameter_mm=$3,gasket_od_mm=$4,gasket_id_mm=$5,thread_size=$6,
        bypass_valve_psi=$7,sub_type=$8::text,installation_type=($8::text)::varchar,
        oem_codes=$9::jsonb,competitor_codes=$10::jsonb,enrichment_data=$11::jsonb,specs=$12::jsonb,
        canonical_source_brand='MANN-FILTER',canonical_source_code=$1::text,canonical_source_url=$13,
        canonical_source_status='VERIFIED',canonical_verified_at=now(),
        canonical_evidence=$14::jsonb,duty_source_brand='MANN-FILTER',duty_validation_status='VERIFIED',
        duty_verified_at=now(),duty_evidence=$15::jsonb
      where sku=$16
    `,[
      BASE,s.height_mm,s.outer_diameter_mm,s.gasket_od_mm,s.gasket_id_mm,s.thread_size,s.bypass_setting_psi,s.style,
      JSON.stringify(item.oem_codes),JSON.stringify(item.competitor_codes),JSON.stringify(enrichment),JSON.stringify(s),
      MANN_URL,JSON.stringify({authority:'MANN-FILTER',code:BASE,evidence_hash:MANN_HASH}),
      JSON.stringify({duty:'LIGHT_DUTY',source:'MANN_FILTER_OFFICIAL',authority:BASE}),SKU
    ]);

    await db.query('delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1',[SKU]);
    await db.query('delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1',[SKU]);
    await db.query('delete from ld_catalog.ld_product_specifications where elimfilters_sku=$1',[SKU]);

    for(const x of item.oem_codes) await db.query(
      'insert into ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number) values($1,$2,$3,$4) on conflict (elimfilters_sku,oem_brand,oem_part_number) do nothing',
      [SKU,BASE,x.manufacturer,x.code]);
    for(const x of item.competitor_codes) await db.query(
      'insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values($1,$2,$3,$4) on conflict (elimfilters_sku,competitor_brand,competitor_part_number) do nothing',
      [SKU,BASE,x.manufacturer,x.code]);
    for(const [key,value] of Object.entries(s)){
      if(value==null||value==='') continue;
      const unit=/_mm$/.test(key)?'mm':/_in$/.test(key)?'in':/_psi$/.test(key)?'psi':null;
      await db.query(
        'insert into ld_catalog.ld_product_specifications(elimfilters_sku,source_sku,spec_key,spec_value,spec_unit) values($1,$2,$3,$4,$5) on conflict (elimfilters_sku,spec_key) do update set source_sku=excluded.source_sku,spec_value=excluded.spec_value,spec_unit=excluded.spec_unit',
        [SKU,BASE,key,String(value),unit]);
    }

    await db.query(`
      insert into ld_catalog.ld_canonical_product_identity
        (elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source)
      values($1,'EUROPEAN','MANN-FILTER',$2,'oil','ACTIVE','MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD')
      on conflict (elimfilters_sku) do update set
        origin_group='EUROPEAN',canonical_brand='MANN-FILTER',canonical_part_number=excluded.canonical_part_number,
        filter_type='oil',status='ACTIVE',evidence_source=excluded.evidence_source,updated_at=now()
    `,[SKU,BASE]);

    await db.query('delete from ld_catalog.ld_vehicle_applications where elimfilters_sku=$1',[SKU]);
    const rel=apps.map(a=>{const y=splitYear(a.year);return {...a,...y,source_sku:BASE,source_origin:'MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD'};});
    report.relational_apps=await applyVerifiedRelationalVehicleApplications(db,{
      sku:SKU,source_sku:BASE,applications:rel,
      evidence:{authority:'MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD',source_url:MANN_URL,evidence_hash:hash,
        metadata:{premium_guard_application_url:item.application_source_url}}
    });

    await db.query('select refresh_crossref_cache_sku($1)',[SKU]);

    const audit=(await db.query(`
      select sku,codigo_base,canonical_source_brand,canonical_source_code,
        height_mm,outer_diameter_mm,gasket_od_mm,gasket_id_mm,thread_size,bypass_valve_psi,
        jsonb_array_length(coalesce(oem_codes,'[]'::jsonb)) oem_count,
        jsonb_array_length(coalesce(competitor_codes,'[]'::jsonb)) competitor_count,
        jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb)) vehicle_count
      from public.elimfilters_catalog where sku=$1`,[SKU])).rows[0];
    report.audit=audit;
    if(+audit.oem_count!==item.oem_codes.length||+audit.competitor_count!==item.competitor_codes.length||+audit.vehicle_count!==apps.length) throw new Error('POST_WRITE_COUNT_MISMATCH');

    await db.query('COMMIT');report.transaction='COMMIT';return report;
  }catch(e){
    try{await db.query('ROLLBACK')}catch(_){}
    e.report=report;throw e;
  }finally{await db.end();}
}
if(require.main===module){
 run().then(r=>console.log('[run126]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run126] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});
}
module.exports={run};