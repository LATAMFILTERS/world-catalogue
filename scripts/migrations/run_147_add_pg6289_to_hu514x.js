'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const SKU='EL30514',BASE='HU514X',CODE='PG6289';
const URL='https://api.pgfilters.com/catalog/api/v1/products/PG6289/interchanges';
const HASH='488366763c2211084e99afa4ff879caeb983fca8ddf41d45538dca8eab848230';
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
async function run(){
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});const report={mode:APPLY?'apply':'dry-run',sku:SKU};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);if(q.rowCount!==1)throw new Error('SKU_NOT_FOUND');
  const row=q.rows[0];
  if(row.codigo_base!==BASE||row.filter_type!=='oil'||row.duty!=='LIGHT_DUTY'||row.enrichment_data?.codigo_base_governance?.state!=='CANONICAL_VERIFIED')throw new Error('IDENTITY_NOT_CANONICAL');
  const exists=(row.competitor_codes||[]).some(x=>norm(x.code)===CODE);
  const nextComp=exists?(row.competitor_codes||[]):[...(row.competitor_codes||[]),{manufacturer:'PREMIUM GUARD',code:CODE,classification:'AFTERMARKET',source_url:URL,evidence_hash:HASH,evidence_authority:'PREMIUM_GUARD_PUBLIC_API'}];
  if(!exists)report.reference_gateway=assertGovernedCatalogPatch(row,{competitor_codes:nextComp},{referenceEnrichment:true,enrichmentEvidence:{authority:'PREMIUM_GUARD_PUBLIC_API',source_url:URL,evidence_hash:HASH,reason:'Add PG6289 as reviewed alternate to canonical MANN HU514X LD family.'}});
  const old=row.enrichment_data&&typeof row.enrichment_data==='object'?row.enrichment_data:{};
  const nextEn={...old,codigo_base_governance:{...(old.codigo_base_governance||{}),competitor_code_count:nextComp.length},reference_governance_resolution:{...(old.reference_governance_resolution||{}),status:'RESOLVED_WITH_CANONICAL_PRIORITY_AND_PUBLIC_GOVERNANCE',governed_references:[...new Set([...(old.reference_governance_resolution?.governed_references||[]),CODE])],canonical_sku:SKU,verified_at:new Date().toISOString()}};
  report.governance_gateway=assertGovernedCatalogPatch(row,{enrichment_data:nextEn});
  report.preflight={exists,comp_before:(row.competitor_codes||[]).length,comp_after:nextComp.length};
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb,enrichment_data=$2::jsonb where sku=$3',[JSON.stringify(nextComp),JSON.stringify(nextEn),SKU]);
  if(!exists)await db.query('insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values($1,$2,$3,$4) on conflict do nothing',[SKU,BASE,'PREMIUM GUARD',CODE]);
  await db.query('select refresh_crossref_cache_sku($1)',[SKU]);
  const r=await db.query("select v.code,array_agg(distinct v.sku order by v.sku) skus from public.v_api_resolver_v5 v join public.elimfilters_catalog_active_v a on a.sku=v.sku where v.code=$1 group by v.code",[CODE]);
  report.route=r.rows;if(r.rowCount!==1||JSON.stringify(r.rows[0].skus)!==JSON.stringify([SKU]))throw new Error('ROUTE_FAILED');
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run147]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run147] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};