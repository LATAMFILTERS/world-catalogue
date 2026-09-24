'use strict';

const fs=require('fs');
const path=require('path');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const {applyVerifiedApplications,applyVerifiedRelationalVehicleApplications}=require('../../lib/catalog-application-write-service');

const APPLY=process.argv.includes('--apply');
const MANIFEST=path.resolve(__dirname,'../candidates/ch10295_pg5702ex_canonical_20260924.json');

function splitYear(v){
  const s=String(v||'').trim();const m=s.match(/^(\d{4})-(\d{4})$/);
  if(m)return {year_from:Number(m[1]),year_to:Number(m[2]),year:null};
  const y=Number(s);return Number.isFinite(y)&&y>1900?{year_from:y,year_to:y,year:y}:null;
}
function publicApps(m){
  return (m.vehicle_applications||[]).map(a=>({make:a.make,model:a.model,equipment:[a.make,a.model].filter(Boolean).join(' '),engine:a.engine,year:a.year}));
}
async function run(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
  const m=JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
  const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',sku:m.sku,base:m.codigo_base};await db.connect();
  try{
    await db.query('BEGIN');
    let q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[m.sku]);
    if(q.rowCount!==1)throw new Error('SKU_NOT_FOUND');
    let row=q.rows[0];
    const apps=publicApps(m);

    if(APPLY){
      report.public_application_write=await applyVerifiedApplications(db,{
        sku:m.sku,vehicle_applications:apps,equipment_applications:[],
        evidence:{authority:'FRAM_PLUS_PREMIUM_GUARD',source_url:m.application_source_url,evidence_hash:m.application_evidence_hash,metadata:{canonical_brand:'FRAM',canonical_code:m.codigo_base,premium_guard_code:m.premium_guard_code}}
      });
      q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[m.sku]);row=q.rows[0];
    }

    const old=row.enrichment_data&&typeof row.enrichment_data==='object'?row.enrichment_data:{};
    const enrich={...old,
      codigo_base_governance:{...(old.codigo_base_governance||{}),policy_version:'2026-08-29-regional-v3.2',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',origin_group:'NON_EUROPEAN',approved_manufacturer:'FRAM',approved_codigo_base:m.codigo_base,approved_source_column:'CANONICAL_POLICY',current_codigo_base:m.codigo_base,primary_manufacturer_verified:true,required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',evidence_note:'FRAM CH10295 canonical LD non-European oil authority; Premium Guard PG5702EX enriches physical specs, references and fitment.'},
      premium_guard_reference_enrichment:{premium_guard_code:m.premium_guard_code,canonical_brand:'FRAM',evidence_hash:m.application_evidence_hash,source_url:m.application_source_url,verified_at:new Date().toISOString()}
    };

    report.gateway=assertGovernedCatalogPatch(row,{codigo_base:m.codigo_base,duty:'LIGHT_DUTY',oem_codes:m.oem_codes,competitor_codes:m.competitor_codes,enrichment_data:enrich});
    report.expected={oem:m.oem_codes.length,competitors:m.competitor_codes.length,applications:apps.length,specs:Object.keys(m.specs||{}).length};
    if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}

    const s=m.specs||{};
    await db.query(`
      update public.elimfilters_catalog set
        codigo_base=($1::text)::varchar,filter_type='oil',duty='LIGHT_DUTY',technology='SYNTRAX™',
        height_mm=$2,outer_diameter_mm=$3,gasket_od_mm=$4,gasket_id_mm=$5,thread_size=$6,
        bypass_valve_psi=$7,burst_pressure_psi=$8,anti_drainback_valve=$9,filter_media=$10,
        sub_type=$11::text,installation_type=($11::text)::varchar,
        oem_codes=$12::jsonb,competitor_codes=$13::jsonb,enrichment_data=$14::jsonb,specs=$15::jsonb,
        canonical_source_brand='FRAM',canonical_source_code=$1::text,canonical_source_url=$16,
        canonical_source_status='VERIFIED',canonical_verified_at=now(),
        canonical_evidence=$17::jsonb,duty_source_brand='FRAM',duty_validation_status='VERIFIED',duty_verified_at=now(),duty_evidence=$18::jsonb
      where sku=$19
    `,[
      m.codigo_base,s.height_mm??null,s.outer_diameter_mm??null,s.gasket_od_mm??null,s.gasket_id_mm??null,s.thread_size??null,
      s.bypass_setting_psi??null,s.burst_pressure_psi??null,s.anti_drainback_valve??null,s.media_type??null,s.style??null,
      JSON.stringify(m.oem_codes),JSON.stringify(m.competitor_codes),JSON.stringify(enrich),JSON.stringify(s),m.canonical_source_url,
      JSON.stringify({authority:'FRAM',code:m.codigo_base,evidence_hash:m.canonical_evidence_hash,premium_guard_code:m.premium_guard_code}),
      JSON.stringify({duty:'LIGHT_DUTY',source:'FRAM_LD_MULTI_REGION',authority:m.codigo_base}),m.sku
    ]);

    await db.query('delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1',[m.sku]);
    await db.query('delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1',[m.sku]);
    await db.query('delete from ld_catalog.ld_product_specifications where elimfilters_sku=$1',[m.sku]);
    for(const x of m.oem_codes||[])await db.query('insert into ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number) values($1,$2,$3,$4) on conflict (elimfilters_sku,oem_brand,oem_part_number) do nothing',[m.sku,m.codigo_base,x.manufacturer,x.code]);
    for(const x of m.competitor_codes||[])await db.query('insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values($1,$2,$3,$4) on conflict (elimfilters_sku,competitor_brand,competitor_part_number) do nothing',[m.sku,m.codigo_base,x.manufacturer,x.code]);
    for(const [key,value] of Object.entries(s)){if(value==null||value==='')continue;const unit=/_mm$/.test(key)?'mm':/_in$/.test(key)?'in':/_psi$/.test(key)?'psi':null;await db.query('insert into ld_catalog.ld_product_specifications(elimfilters_sku,source_sku,spec_key,spec_value,spec_unit) values($1,$2,$3,$4,$5) on conflict (elimfilters_sku,spec_key) do update set source_sku=excluded.source_sku,spec_value=excluded.spec_value,spec_unit=excluded.spec_unit',[m.sku,m.codigo_base,key,String(value),unit]);}

    await db.query(`
      insert into ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source)
      values($1,'NON_EUROPEAN','FRAM',$2,'oil','ACTIVE','FRAM_PLUS_PREMIUM_GUARD')
      on conflict (elimfilters_sku) do update set origin_group='NON_EUROPEAN',canonical_brand='FRAM',canonical_part_number=excluded.canonical_part_number,filter_type='oil',status='ACTIVE',evidence_source=excluded.evidence_source,updated_at=now()
    `,[m.sku,m.codigo_base]);

    await db.query('delete from ld_catalog.ld_vehicle_applications where elimfilters_sku=$1',[m.sku]);
    const relational=(m.vehicle_applications||[]).map(a=>{const y=splitYear(a.year);if(!y)throw new Error('INVALID_YEAR:'+a.year);return {make:a.make,model:a.model,year:y.year,year_from:y.year_from,year_to:y.year_to,engine:a.engine,source_sku:m.codigo_base,source_origin:a.source||'FRAM_PLUS_PREMIUM_GUARD'};});
    report.relational_application_write=await applyVerifiedRelationalVehicleApplications(db,{sku:m.sku,source_sku:m.codigo_base,applications:relational,evidence:{authority:'FRAM_PLUS_PREMIUM_GUARD',source_url:m.application_source_url,evidence_hash:m.application_evidence_hash,metadata:{canonical_code:m.codigo_base,premium_guard_code:m.premium_guard_code}}});

    await db.query('select refresh_crossref_cache_sku($1)',[m.sku]);
    const audit=(await db.query(`
      select sku,codigo_base,canonical_source_brand,canonical_source_code,
        jsonb_array_length(coalesce(oem_codes,'[]'::jsonb)) oem_count,
        jsonb_array_length(coalesce(competitor_codes,'[]'::jsonb)) competitor_count,
        jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb)) vehicle_count,
        height_mm,outer_diameter_mm,gasket_od_mm,gasket_id_mm,filter_media
      from public.elimfilters_catalog where sku=$1`,[m.sku])).rows[0];
    report.audit=audit;
    if(Number(audit.oem_count)!==m.oem_codes.length||Number(audit.competitor_count)!==m.competitor_codes.length||Number(audit.vehicle_count)!==apps.length)throw new Error('POST_WRITE_COUNT_MISMATCH');
    await db.query('COMMIT');report.transaction='COMMIT';return report;
  }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run130]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run130] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};