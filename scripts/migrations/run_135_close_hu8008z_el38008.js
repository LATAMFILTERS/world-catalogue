'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const SKU='EL38008', BASE='HU8008Z';
const MANN_URL='https://www.mann-filter.com/en/catalog/search-results/product.html/hu8008z_mann-filter.html';
const MANN_HASH='dd94dc12ec4e78a7f29c0e7c6e8c43f126b2c3d889c88aa7368b68bd64201b1e';
const OE=new Map([
 ['8W936A692AC',{manufacturer:'FORD',code:'8W93-6A692-AC'}],
 ['C2D3670',{manufacturer:'JAGUAR',code:'C2D 3670'}],
 ['AJ812351',{manufacturer:'JAGUAR',code:'AJ8 12351'}],
 ['LR011279',{manufacturer:'LAND ROVER',code:'LR 011279'}],
 ['LR019477',{manufacturer:'LAND ROVER',code:'LR019477'}],
]);
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const refCode=x=>norm(x?.code||x?.part_number||x?.reference);
const refBrand=x=>norm(x?.manufacturer||x?.brand);
function buildRefs(row){
 const oem=[...OE.values()].map(x=>({...x,classification:'OEM',source_url:MANN_URL,evidence_hash:MANN_HASH,evidence_authority:'MANN_FILTER_OFFICIAL'}));
 const out=[]; const seen=new Set();
 for(const x of [...(row.competitor_codes||[]),...(row.oem_codes||[])]){
  if(OE.has(refCode(x))||refCode(x)===BASE) continue;
  const k=refBrand(x)+'|'+refCode(x); if(!refCode(x)||seen.has(k))continue; seen.add(k);
  out.push({...x,manufacturer:x.manufacturer||x.brand||'UNKNOWN',classification:'AFTERMARKET'});
 }
 return {oem,competitors:out};
}
async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',sku:SKU,base:BASE};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);if(q.rowCount!==1)throw new Error('SKU_NOT_FOUND');
  const row=q.rows[0]; if(row.filter_type!=='oil'||row.duty!=='LIGHT_DUTY')throw new Error('FAMILY_MISMATCH');
  const refs=buildRefs(row);
  const old=row.enrichment_data&&typeof row.enrichment_data==='object'?row.enrichment_data:{};
  const nextEn={...old,codigo_base_governance:{...(old.codigo_base_governance||{}),
   policy_version:'2026-08-29-regional-v3.2',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',
   origin_group:'EUROPEAN',approved_manufacturer:'MANN-FILTER',approved_codigo_base:BASE,approved_source_column:'CANONICAL_POLICY',
   current_codigo_base:BASE,primary_manufacturer_verified:true,required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',
   oem_code_count:refs.oem.length,competitor_code_count:refs.competitors.length,observed_primary_candidates:[],
   evidence_note:'MANN-FILTER HU8008Z is the canonical European LD oil authority. Official dimensions are 71 x 136 mm with C=26 mm; Jaguar/Land Rover/Ford OE references are classified from the official MANN catalog.'
  },reference_reclassification:{status:'VERIFIED',authority:'MANN_FILTER_OFFICIAL',source_url:MANN_URL,evidence_hash:MANN_HASH,verified_at:new Date().toISOString()}};
  const patch={codigo_base:BASE,height_mm:136,outer_diameter_mm:71,gasket_id_mm:26,oem_codes:refs.oem,competitor_codes:refs.competitors,enrichment_data:nextEn};
  report.gateway=assertGovernedCatalogPatch(row,patch);
  report.preflight={oem_before:(row.oem_codes||[]).length,oem_after:refs.oem.length,comp_before:(row.competitor_codes||[]).length,comp_after:refs.competitors.length,apps:(row.vehicle_applications||[]).length};
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query(`update public.elimfilters_catalog set codigo_base=($1::text)::varchar,height_mm=136,outer_diameter_mm=71,gasket_id_mm=26,
   sub_type='Cartridge',installation_type='Cartridge',oem_codes=$2::jsonb,competitor_codes=$3::jsonb,enrichment_data=$4::jsonb,
   specs=$5::jsonb,canonical_source_brand='MANN-FILTER',canonical_source_code=$1::text,canonical_source_url=$6,
   canonical_source_status='VERIFIED',canonical_verified_at=now(),canonical_evidence=$7::jsonb,
   duty_source_brand='MANN-FILTER',duty_validation_status='VERIFIED',duty_verified_at=now(),duty_evidence=$8::jsonb where sku=$9`,
   [BASE,JSON.stringify(refs.oem),JSON.stringify(refs.competitors),JSON.stringify(nextEn),
    JSON.stringify({style:'Cartridge',height_mm:136,outer_diameter_mm:71,inner_diameter_mm:26,with_gasket:true}),
    MANN_URL,JSON.stringify({authority:'MANN-FILTER',code:BASE,source_url:MANN_URL,evidence_hash:MANN_HASH,gtin:'4011558023454'}),
    JSON.stringify({duty:'LIGHT_DUTY',source:'MANN_FILTER_OFFICIAL',authority:BASE}),SKU]);
  await db.query("insert into ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment) values($1,$2,'Oil Filter') on conflict(elimfilters_sku) do update set source_sku=excluded.source_sku,segment=excluded.segment",[SKU,BASE]);
  await db.query(`insert into ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source)
   values($1,'EUROPEAN','MANN-FILTER',$2,'oil','ACTIVE','MANN_FILTER_OFFICIAL_PLUS_PREMIUM_GUARD')
   on conflict(elimfilters_sku) do update set origin_group='EUROPEAN',canonical_brand='MANN-FILTER',canonical_part_number=excluded.canonical_part_number,filter_type='oil',status='ACTIVE',evidence_source=excluded.evidence_source,updated_at=now()`,[SKU,BASE]);
  await db.query('delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1',[SKU]);
  await db.query('delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1',[SKU]);
  for(const x of refs.oem)await db.query('insert into ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number) values($1,$2,$3,$4) on conflict do nothing',[SKU,BASE,x.manufacturer,x.code]);
  for(const x of refs.competitors)await db.query('insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values($1,$2,$3,$4) on conflict do nothing',[SKU,BASE,x.manufacturer,x.code]);
  await db.query('delete from ld_catalog.ld_product_specifications where elimfilters_sku=$1',[SKU]);
  for(const [k,v,u] of [['height_mm','136','mm'],['outer_diameter_mm','71','mm'],['inner_diameter_mm','26','mm'],['style','Cartridge',null],['with_gasket','true',null]])
   await db.query('insert into ld_catalog.ld_product_specifications(elimfilters_sku,source_sku,spec_key,spec_value,spec_unit) values($1,$2,$3,$4,$5) on conflict(elimfilters_sku,spec_key) do update set source_sku=excluded.source_sku,spec_value=excluded.spec_value,spec_unit=excluded.spec_unit',[SKU,BASE,k,v,u]);
  await db.query('select refresh_crossref_cache_sku($1)',[SKU]);
  const audit=(await db.query("select sku,codigo_base,canonical_source_brand,canonical_source_code,height_mm,outer_diameter_mm,gasket_id_mm,jsonb_array_length(oem_codes) oem_count,jsonb_array_length(competitor_codes) comp_count,jsonb_array_length(vehicle_applications) app_count from public.elimfilters_catalog where sku=$1",[SKU])).rows[0];
  const v5=await db.query("select code,array_agg(distinct sku order by sku) skus from public.v_api_resolver_v5 where code=$1 group by code",['PG6290EX']);
  report.audit=audit;report.v5=v5.rows;
  if(audit.codigo_base!==BASE||audit.canonical_source_brand!=='MANN-FILTER'||Number(audit.oem_count)!==5||Number(audit.app_count)!==300)throw new Error('POST_WRITE_AUDIT_FAILED');
  const pg=v5.rows.find(x=>x.code==='PG6290EX');if(!pg||pg.skus.length!==1||pg.skus[0]!==SKU)throw new Error('REFERENCE_ROUTE_PG6290EX');
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run135]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run135] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};
