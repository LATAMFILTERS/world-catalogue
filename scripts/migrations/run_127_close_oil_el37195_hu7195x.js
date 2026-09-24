'use strict';
const fs=require('fs');
const path=require('path');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const {applyVerifiedApplications,applyVerifiedRelationalVehicleApplications}=require('../../lib/catalog-application-write-service');
const APPLY=process.argv.includes('--apply');
const MANIFEST=path.resolve(__dirname,'../candidates/premium_guard_oil_phase3_block2_canonical_20260923.json');
const SKU='EL37195',BASE='HU719/5X';
const MANN_URL='https://www.mann-filter.com/en/catalog/search-results/product.html/hu719/5x_mann-filter.html';
const MANN_HASH='f2fbe026e65a911b5c6510d53a3d15c180f5f717e40e377ac4a8d9c574cc72c1';
const norm=(v='')=>String(v).toUpperCase().replace(/[^A-Z0-9]/g,'');
function splitYear(v){const s=String(v||'').trim();const m=s.match(/^(\d{4})-(\d{4})$/);if(m)return{year_from:+m[1],year_to:+m[2],year:null};const y=+s;return{year_from:y,year_to:y,year:y};}
function pubApps(item){return (item.vehicle_applications||[]).map(a=>({make:a.make,model:a.model,equipment:a.make+' '+a.model,engine:a.engine,year:a.year}));}
function governance(oldData){const old=oldData&&typeof oldData==='object'?oldData:{};return {...old,codigo_base_governance:{...(old.codigo_base_governance||{}),policy_version:'2026-08-29-regional-v3.2',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',origin_group:'EUROPEAN',approved_manufacturer:'MANN-FILTER',approved_codigo_base:BASE,approved_source_column:'CANONICAL_POLICY',current_codigo_base:BASE,primary_manufacturer_verified:true,required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',evidence_note:'MANN-FILTER HU719/5X canonical LD European oil authority; Premium Guard enriches fitment and cross-reference evidence.'},premium_guard_reference_enrichment:{premium_guard_code:'PG5316',canonical_brand:'MANN-FILTER',verified_at:new Date().toISOString()}};}
async function removeCollision(db){const sku='EL37197',brand='ACDelco',code='PF1708';await db.query(`update public.elimfilters_catalog c set competitor_codes=coalesce((select jsonb_agg(j) from jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) j where not (regexp_replace(upper(coalesce(j->>'manufacturer',j->>'brand','')),'[^A-Z0-9]','','g')=$2 and regexp_replace(upper(coalesce(j->>'code',j->>'part_number',j->>'reference','')),'[^A-Z0-9]','','g')=$3)),'[]'::jsonb) where sku=$1`,[sku,norm(brand),norm(code)]);await db.query(`delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(competitor_brand,'')),'[^A-Z0-9]','','g')=$2 and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g')=$3`,[sku,norm(brand),norm(code)]);}
async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const item=JSON.parse(fs.readFileSync(MANIFEST,'utf8')).find(x=>x.sku===SKU);if(!item)throw new Error('HU7195X_MANIFEST_MISSING');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',sku:SKU,base:BASE};await db.connect();
 try{
  await db.query('BEGIN');
  let q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);if(q.rowCount!==1)throw new Error('HU7195X_SKU_NOT_FOUND');let current=q.rows[0];
  const apps=pubApps(item);
  report.public_application_write=await applyVerifiedApplications(db,{sku:SKU,vehicle_applications:apps,equipment_applications:[],evidence:{authority:'MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD',source_url:item.application_source_url,evidence_hash:item.application_evidence_hash,metadata:{canonical_brand:'MANN-FILTER',canonical_code:BASE,premium_guard_code:item.premium_guard_code,mann_url:MANN_URL,mann_hash:MANN_HASH}}});
  q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);current=q.rows[0];
  const enrich=governance(current.enrichment_data);
  report.gateway=assertGovernedCatalogPatch(current,{codigo_base:BASE,duty:'LIGHT_DUTY',oem_codes:item.oem_codes,competitor_codes:item.competitor_codes,enrichment_data:enrich});
  report.expected={oem:item.oem_codes.length,competitors:item.competitor_codes.length,applications:apps.length,specs:Object.keys(item.specs||{}).length,collision_cleanup:1};
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await removeCollision(db);
  const s=item.specs||{};
  await db.query(`update public.elimfilters_catalog set codigo_base=($1::text)::varchar,filter_type='oil',duty='LIGHT_DUTY',technology='SYNTRAX™',height_mm=$2,outer_diameter_mm=$3,gasket_od_mm=$4,gasket_id_mm=$5,thread_size=null,anti_drainback_valve=$6,filter_media=$7,sub_type=$8::text,installation_type=($8::text)::varchar,oem_codes=$9::jsonb,competitor_codes=$10::jsonb,enrichment_data=$11::jsonb,specs=$12::jsonb,canonical_source_brand='MANN-FILTER',canonical_source_code=$1::text,canonical_source_url=$13,canonical_source_status='VERIFIED',canonical_verified_at=now(),canonical_evidence=$14::jsonb,duty_source_brand='MANN-FILTER',duty_validation_status='VERIFIED',duty_verified_at=now(),duty_evidence=$15::jsonb where sku=$16`,[BASE,s.height_mm??null,s.outer_diameter_mm??null,s.gasket_od_mm??null,s.gasket_id_mm??null,false,s.filter_media??null,s.style??'Cartridge',JSON.stringify(item.oem_codes),JSON.stringify(item.competitor_codes),JSON.stringify(enrich),JSON.stringify(s),MANN_URL,JSON.stringify({authority:'MANN-FILTER',code:BASE,evidence_hash:MANN_HASH,premium_guard_code:item.premium_guard_code,premium_guard_application_hash:item.application_evidence_hash}),JSON.stringify({duty:'LIGHT_DUTY',source:'MANN_FILTER_OFFICIAL',authority:BASE}),SKU]);
  await db.query("insert into ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment) values($1,$2,'Oil Filter') on conflict (elimfilters_sku) do update set source_sku=excluded.source_sku,segment=excluded.segment",[SKU,BASE]);
  await db.query("insert into ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source) values($1,'EUROPEAN','MANN-FILTER',$2,'oil','ACTIVE','MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD') on conflict (elimfilters_sku) do update set origin_group='EUROPEAN',canonical_brand='MANN-FILTER',canonical_part_number=excluded.canonical_part_number,filter_type='oil',status='ACTIVE',evidence_source=excluded.evidence_source,updated_at=now()",[SKU,BASE]);
  await db.query('delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1',[SKU]);
  await db.query('delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1',[SKU]);
  await db.query('delete from ld_catalog.ld_product_specifications where elimfilters_sku=$1',[SKU]);
  for(const x of item.oem_codes||[])await db.query('insert into ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number) values($1,$2,$3,$4) on conflict (elimfilters_sku,oem_brand,oem_part_number) do nothing',[SKU,BASE,x.manufacturer,x.code]);
  for(const x of item.competitor_codes||[])await db.query('insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values($1,$2,$3,$4) on conflict (elimfilters_sku,competitor_brand,competitor_part_number) do nothing',[SKU,BASE,x.manufacturer,x.code]);
  for(const [key,value] of Object.entries(s)){if(value==null||value==='')continue;const unit=/_mm$/.test(key)?'mm':/_in$/.test(key)?'in':/_psi$/.test(key)?'psi':null;await db.query('insert into ld_catalog.ld_product_specifications(elimfilters_sku,source_sku,spec_key,spec_value,spec_unit) values($1,$2,$3,$4,$5) on conflict (elimfilters_sku,spec_key) do update set source_sku=excluded.source_sku,spec_value=excluded.spec_value,spec_unit=excluded.spec_unit',[SKU,BASE,key,String(value),unit]);}
  await db.query('delete from ld_catalog.ld_vehicle_applications where elimfilters_sku=$1',[SKU]);
  const relational=(item.vehicle_applications||[]).map(a=>{const y=splitYear(a.year);return{make:a.make,model:a.model,year:y.year,year_from:y.year_from,year_to:y.year_to,engine:a.engine,source_sku:BASE,source_origin:a.source||'MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD'};});
  report.relational_application_write=await applyVerifiedRelationalVehicleApplications(db,{sku:SKU,source_sku:BASE,applications:relational,evidence:{authority:'MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD',source_url:item.application_source_url,evidence_hash:item.application_evidence_hash,metadata:{canonical_code:BASE,mann_url:MANN_URL,mann_hash:MANN_HASH,premium_guard_code:item.premium_guard_code}}});
  for(const sku of [SKU,'EL37197'])await db.query('select refresh_crossref_cache_sku($1)',[sku]);
  const audit=(await db.query("select sku,codigo_base,canonical_source_brand,canonical_source_code,height_mm,outer_diameter_mm,gasket_id_mm,thread_size,jsonb_array_length(coalesce(oem_codes,'[]'::jsonb)) oem_count,jsonb_array_length(coalesce(competitor_codes,'[]'::jsonb)) competitor_count,jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb)) vehicle_count from public.elimfilters_catalog where sku=$1",[SKU])).rows[0];
  report.audit=audit;
  if(audit.codigo_base!==BASE||audit.canonical_source_code!==BASE||audit.canonical_source_brand!=='MANN-FILTER')throw new Error('HU7195X_CANONICAL_AUDIT_FAILED');
  if(Number(audit.oem_count)!==item.oem_codes.length||Number(audit.competitor_count)!==item.competitor_codes.length||Number(audit.vehicle_count)!==apps.length)throw new Error('HU7195X_COUNT_AUDIT_FAILED');
  const v5=await db.query("select code,sku,manufacturer from public.v_api_resolver_v5 where code=any($1::text[]) order by code,sku",[['PG5316','PF1708']]);report.v5=v5.rows;
  for(const code of ['PG5316','PF1708'])if(!v5.rows.some(r=>r.code===norm(code)&&r.sku===SKU))throw new Error('HU7195X_V5_MISSING_'+code);
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run127]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run127] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};