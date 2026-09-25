'use strict';
const fs=require('fs');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const {applyVerifiedApplications}=require('../../lib/catalog-application-write-service');
const APPLY=process.argv.includes('--apply');
const SKU='EL34967',BASE='PH4967',CODE='PG4476EX';
const IURL='https://api.pgfilters.com/catalog/api/v1/products/PG4476EX/interchanges';
const IHASH='39846c670830e8cc7801b99a39d585c6278fad88674f98876928c6174387b54e';
const AURL='https://api.pgfilters.com/catalog/api/v1/products/PG4476EX/applications?format=ranges';
const AHASH='11611d08a0162a543eb0d18f9f748650f8577d57bba5201379faa648620accc1';
function loadApps(){const t=fs.readFileSync('C:/Users/ELIMSERVER/pg4476ex_applications.json','utf8').replace(/^\uFEFF/,'');return JSON.parse(t).applications||[];}
async function run(){
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});
 const report={mode:APPLY?'apply':'dry-run',sku:SKU};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);if(q.rowCount!==1)throw new Error('SKU_NOT_FOUND');
  const row=q.rows[0];
  if(row.codigo_base!==BASE||row.filter_type!=='oil'||row.duty!=='LIGHT_DUTY')throw new Error('IDENTITY_MISMATCH');
  const exists=(row.competitor_codes||[]).some(x=>String(x.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'')===CODE);
  const nextComp=exists?(row.competitor_codes||[]):[...(row.competitor_codes||[]),{manufacturer:'PREMIUM GUARD',code:CODE,classification:'AFTERMARKET',source_url:IURL,evidence_hash:IHASH,evidence_authority:'PREMIUM_GUARD_PUBLIC_API'}];
  if(!exists)report.reference_gateway=assertGovernedCatalogPatch(row,{competitor_codes:nextComp},{referenceEnrichment:true,enrichmentEvidence:{authority:'PREMIUM_GUARD_PUBLIC_API',source_url:IURL,evidence_hash:IHASH,reason:'Add PG4476EX to canonical FRAM PH4967 LD family.'}});
  const apps=loadApps().map(a=>({make:a.make,model:a.model,equipment:[a.make,a.model].filter(Boolean).join(' '),engine:a.engine,year:a.year}));
  const old=row.enrichment_data&&typeof row.enrichment_data==='object'?row.enrichment_data:{};
  const nextEn={...old,codigo_base_governance:{...(old.codigo_base_governance||{}),competitor_code_count:nextComp.length,evidence_note:'FRAM PH4967 remains canonical LD authority; PG4476EX adds reviewed Premium Guard references and applications.'},reference_governance_resolution:{...(old.reference_governance_resolution||{}),status:'RESOLVED_WITH_CANONICAL_PRIORITY_AND_PUBLIC_GOVERNANCE',governed_references:[...new Set([...(old.reference_governance_resolution?.governed_references||[]),CODE])],canonical_sku:SKU,verified_at:new Date().toISOString()}};
  report.governance_gateway=assertGovernedCatalogPatch(row,{enrichment_data:nextEn});
  report.preflight={comp_before:(row.competitor_codes||[]).length,comp_after:nextComp.length,apps_before:(row.vehicle_applications||[]).length,apps_after:apps.length};
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  if(!exists)await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb,enrichment_data=$2::jsonb where sku=$3',[JSON.stringify(nextComp),JSON.stringify(nextEn),SKU]);
  else await db.query('update public.elimfilters_catalog set enrichment_data=$1::jsonb where sku=$2',[JSON.stringify(nextEn),SKU]);
  if(!exists)await db.query('insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values($1,$2,$3,$4) on conflict do nothing',[SKU,BASE,'PREMIUM GUARD',CODE]);
  report.application_write=await applyVerifiedApplications(db,{sku:SKU,vehicle_applications:apps,equipment_applications:[],evidence:{authority:'PREMIUM_GUARD_PUBLIC_API',source_url:AURL,evidence_hash:AHASH,metadata:{premium_guard_code:CODE,canonical_code:BASE}}});
  await db.query('select refresh_crossref_cache_sku($1)',[SKU]);
  const route=await db.query("select v.code,array_agg(distinct v.sku order by v.sku) skus from public.v_api_resolver_v5 v join public.elimfilters_catalog_active_v a on a.sku=v.sku where v.code=$1 group by v.code",[CODE]);
  report.route=route.rows;
  if(route.rowCount!==1||JSON.stringify(route.rows[0].skus)!==JSON.stringify([SKU]))throw new Error('ROUTE_FAILED');
  const a=(await db.query("select jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb)) app_count from public.elimfilters_catalog where sku=$1",[SKU])).rows[0];
  if(Number(a.app_count)!==apps.length)throw new Error('APP_COUNT_FAILED');
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run145]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run145] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};