'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const {applyVerifiedApplications,applyVerifiedRelationalVehicleApplications}=require('../../lib/catalog-application-write-service');
const APPLY=process.argv.includes('--apply');
const TARGET='EL37012',AIR='EA37012',BASE='HU7012Z';
const MANIFEST=path.resolve(__dirname,'../candidates/premium_guard_oil_hu7012z_el37012_strict_20260924.json');
const MURL='https://www.mann-filter.com/es-es/catalogo/resultados-de-la-busqueda/producto.html/hu7012z_mann-filter.html';
const MH='5dc60b9a9b92fa5d754c8416cf804abd2478638503496313eb791b5b735ac63d';
const PGURL='https://api.pgfilters.com/catalog/api/v1/products/PG99496EX/interchanges';
const PGH='4bc77072a5c8c67c8f2ed0daf4c6539eb93cb8a859a1789489f8f1a55350850c';
const BAD=['059115561G','059198405B','E219HD330','L1075','OX1076D'];
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const refCode=x=>norm(x?.code||x?.part_number||x?.reference);
function years(v){const s=String(v||'');let m=s.match(/(\d{4})-(\d{4})/);if(m)return{year:null,year_from:+m[1],year_to:+m[2]};m=s.match(/(\d{4})-/);if(m)return{year:null,year_from:+m[1],year_to:9999};m=s.match(/(\d{4})/);return m?{year:+m[1],year_from:+m[1],year_to:+m[1]}:{year:null,year_from:null,year_to:null};}
function pubApps(m){return m.vehicle_applications.map(a=>({make:a.make,model:a.model,equipment:[a.make,a.model].filter(Boolean).join(' '),engine:a.engine,year:a.year}));}
async function run(){
 const m=JSON.parse(fs.readFileSync(MANIFEST,'utf8'));const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',target:TARGET};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=any($1::text[]) for update',[[TARGET,AIR]]);
  const by=new Map(q.rows.map(r=>[r.sku,r]));const target=by.get(TARGET),air=by.get(AIR);if(!target||!air)throw new Error('ROWS_MISSING');
  if(target.filter_type!=='oil'||target.duty!=='LIGHT_DUTY'||air.filter_type!=='air')throw new Error('FAMILY_MISMATCH');
  const airOem=(air.oem_codes||[]).filter(x=>!BAD.includes(refCode(x)));
  const airComp=(air.competitor_codes||[]).filter(x=>!BAD.includes(refCode(x)));
  const removed=(air.oem_codes||[]).length-airOem.length+(air.competitor_codes||[]).length-airComp.length;if(!removed)throw new Error('AIR_CONTAMINATION_NOT_FOUND');
  report.air_gateway=assertGovernedCatalogPatch(air,{oem_codes:airOem,competitor_codes:airComp},{referenceCorrection:true,correctionEvidence:{
    authority:'MANN_FILTER_HU7012Z_PLUS_PREMIUM_GUARD_PG99496EX',source_url:MURL,evidence_hash:MH,
    reason:'Remove HU7012Z oil-family references from incompatible air sibling EA37012.'
  }});
  const old=target.enrichment_data&&typeof target.enrichment_data==='object'?target.enrichment_data:{};
  const nextEn={...old,codigo_base_governance:{...(old.codigo_base_governance||{}),
    policy_version:'2026-08-29-regional-v3.2',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',origin_group:'EUROPEAN',
    approved_manufacturer:'MANN-FILTER',approved_codigo_base:BASE,approved_source_column:'CANONICAL_POLICY',current_codigo_base:BASE,
    primary_manufacturer_verified:true,required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',
    oem_code_count:m.oem_codes.length,competitor_code_count:m.competitor_codes.length,observed_primary_candidates:[],
    evidence_note:'MANN-FILTER HU7012Z is canonical European LD oil authority; Premium Guard PG99496EX supplies reviewed aftermarket references and Amarok/Touareg fitment.'
  },cross_category_cleanup:{status:'VERIFIED',wrong_sku:AIR,removed_codes:BAD,verified_at:new Date().toISOString()}};
  const patch={codigo_base:BASE,height_mm:123,outer_diameter_mm:64,gasket_id_mm:31,oem_codes:m.oem_codes,competitor_codes:m.competitor_codes,enrichment_data:nextEn};
  report.target_gateway=assertGovernedCatalogPatch(target,patch);
  report.preflight={oem:m.oem_codes.length,competitors:m.competitor_codes.length,applications:m.vehicle_applications.length,air_removed:removed};
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('update public.elimfilters_catalog set oem_codes=$1::jsonb,competitor_codes=$2::jsonb where sku=$3',[JSON.stringify(airOem),JSON.stringify(airComp),AIR]);
  await db.query("delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(oem_part_number,'')),'[^A-Z0-9]','','g')=any($2::text[])",[AIR,BAD]);
  await db.query("delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g')=any($2::text[])",[AIR,BAD]);
  await db.query(`update public.elimfilters_catalog set codigo_base=($1::text)::varchar,height_mm=123,outer_diameter_mm=64,gasket_id_mm=31,
    sub_type='Cartridge',installation_type='Cartridge',oem_codes=$2::jsonb,competitor_codes=$3::jsonb,enrichment_data=$4::jsonb,
    specs=$5::jsonb,canonical_source_brand='MANN-FILTER',canonical_source_code=$1::text,canonical_source_url=$6,
    canonical_source_status='VERIFIED',canonical_verified_at=now(),canonical_evidence=$7::jsonb,
    duty_source_brand='MANN-FILTER',duty_validation_status='VERIFIED',duty_verified_at=now(),duty_evidence=$8::jsonb where sku=$9`,
    [BASE,JSON.stringify(m.oem_codes),JSON.stringify(m.competitor_codes),JSON.stringify(nextEn),JSON.stringify(m.specs),MURL,
     JSON.stringify({authority:'MANN-FILTER',code:BASE,source_url:MURL,evidence_hash:MH,gtin:'4011558056841',premium_guard_code:'PG99496EX'}),
     JSON.stringify({duty:'LIGHT_DUTY',source:'MANN_FILTER_OFFICIAL',authority:BASE}),TARGET]);
  await db.query("insert into ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment) values($1,$2,'Oil Filter') on conflict(elimfilters_sku) do update set source_sku=excluded.source_sku,segment=excluded.segment",[TARGET,BASE]);
  await db.query(`insert into ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source)
    values($1,'EUROPEAN','MANN-FILTER',$2,'oil','ACTIVE','MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD')
    on conflict(elimfilters_sku) do update set origin_group='EUROPEAN',canonical_brand='MANN-FILTER',canonical_part_number=excluded.canonical_part_number,filter_type='oil',status='ACTIVE',evidence_source=excluded.evidence_source,updated_at=now()`,[TARGET,BASE]);
  await db.query('delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1',[TARGET]);
  await db.query('delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1',[TARGET]);
  await db.query('delete from ld_catalog.ld_product_specifications where elimfilters_sku=$1',[TARGET]);
  for(const x of m.oem_codes)await db.query('insert into ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number) values($1,$2,$3,$4) on conflict do nothing',[TARGET,BASE,x.manufacturer,x.code]);
  for(const x of m.competitor_codes)await db.query('insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values($1,$2,$3,$4) on conflict do nothing',[TARGET,BASE,x.manufacturer,x.code]);
  for(const [k,v] of Object.entries(m.specs)){if(v==null||v==='')continue;const u=/_mm$/.test(k)?'mm':null;await db.query('insert into ld_catalog.ld_product_specifications(elimfilters_sku,source_sku,spec_key,spec_value,spec_unit) values($1,$2,$3,$4,$5) on conflict(elimfilters_sku,spec_key) do update set source_sku=excluded.source_sku,spec_value=excluded.spec_value,spec_unit=excluded.spec_unit',[TARGET,BASE,k,String(v),u]);}
  const manifestHash=crypto.createHash('sha256').update(fs.readFileSync(MANIFEST)).digest('hex');
  const apps=pubApps(m);
  report.public_application_write=await applyVerifiedApplications(db,{sku:TARGET,vehicle_applications:apps,equipment_applications:[],evidence:{
    authority:'MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD',source_url:MURL,evidence_hash:manifestHash,
    metadata:{canonical_code:BASE,premium_guard_code:'PG99496EX',pg_interchange_url:PGURL,pg_interchange_hash:PGH}
  }});
  await db.query('delete from ld_catalog.ld_vehicle_applications where elimfilters_sku=$1',[TARGET]);
  const rel=m.vehicle_applications.map(a=>{const y=years(a.year);return{make:a.make,model:a.model,year:y.year,year_from:y.year_from,year_to:y.year_to,engine:a.engine,source_sku:BASE,source_origin:a.source||'MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD'};});
  report.relational_application_write=await applyVerifiedRelationalVehicleApplications(db,{sku:TARGET,source_sku:BASE,applications:rel,evidence:{
    authority:'MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD',source_url:MURL,evidence_hash:manifestHash,
    metadata:{canonical_code:BASE,premium_guard_code:'PG99496EX'}
  }});
  for(const sku of [TARGET,AIR])await db.query('select refresh_crossref_cache_sku($1)',[sku]);
  const audit=(await db.query("select sku,codigo_base,canonical_source_brand,canonical_source_code,height_mm,outer_diameter_mm,gasket_id_mm,jsonb_array_length(coalesce(oem_codes,'[]'::jsonb)) oem_count,jsonb_array_length(coalesce(competitor_codes,'[]'::jsonb)) comp_count,jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb)) app_count from public.elimfilters_catalog where sku=$1",[TARGET])).rows[0];
  const refs=await db.query("select code,array_agg(distinct sku order by sku) skus from public.v_api_resolver_v5 where code=any($1::text[]) group by code order by code",[['PG99496EX','059115561G','059198405B','E219HD330','L1075','OX1076D']]);
  report.audit=audit;report.v5=refs.rows;
  if(audit.codigo_base!==BASE||audit.canonical_source_brand!=='MANN-FILTER'||Number(audit.oem_count)!==m.oem_codes.length||Number(audit.comp_count)!==m.competitor_codes.length||Number(audit.app_count)!==m.vehicle_applications.length)throw new Error('TARGET_AUDIT_FAILED');
  const owners=Object.fromEntries(refs.rows.map(r=>[r.code,r.skus]));
  for(const code of ['PG99496EX','059115561G','059198405B','E219HD330','L1075','OX1076D'])if(JSON.stringify(owners[code])!==JSON.stringify([TARGET]))throw new Error('ROUTE_'+code+':'+JSON.stringify(owners[code]||[]));
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run138]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run138] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};
