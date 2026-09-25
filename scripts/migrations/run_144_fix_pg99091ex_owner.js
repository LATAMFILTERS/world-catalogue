'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const CODE='PG99091EX',OLD='EL39265',NEW='EL31018';
const SOURCE='https://api.pgfilters.com/catalog/api/v1/products/PG99091EX/interchanges';
const HASH='6a22620332e884a13d157b7e1c119b0956ae190a7bc8d128e8dc998c33dc9b4b';
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const refCode=x=>norm(x?.code||x?.part_number||x?.reference);
async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run'};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=any($1::text[]) for update',[[OLD,NEW]]);
  const by=new Map(q.rows.map(r=>[r.sku,r]));const old=by.get(OLD),neu=by.get(NEW);
  if(!old||!neu)throw new Error('SKU_MISSING');
  const oldComp=(old.competitor_codes||[]).filter(x=>refCode(x)!==CODE);
  const ref={manufacturer:'PREMIUM GUARD',code:CODE,classification:'AFTERMARKET',source_url:SOURCE,evidence_hash:HASH,evidence_authority:'PREMIUM_GUARD_PUBLIC_API',verified_at:new Date().toISOString()};
  const newComp=[...(neu.competitor_codes||[])];if(!newComp.some(x=>refCode(x)===CODE))newComp.push(ref);
  report.remove_gateway=assertGovernedCatalogPatch(old,{competitor_codes:oldComp},{referenceCorrection:true,correctionEvidence:{authority:'PREMIUM_GUARD_PLUS_FRAM_CH11018',source_url:SOURCE,evidence_hash:HASH,reason:'Move PG99091EX from incorrect queue target EL39265 to verified FRAM CH11018 owner EL31018'}});
  report.add_gateway=assertGovernedCatalogPatch(neu,{competitor_codes:newComp},{referenceEnrichment:true,requireReferenceEvidence:true});
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb where sku=$2',[JSON.stringify(oldComp),OLD]);
  await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb where sku=$2',[JSON.stringify(newComp),NEW]);
  await db.query(`delete from ld_catalog.ld_competitor_cross_references
    where elimfilters_sku=$1 and upper(regexp_replace(competitor_part_number,'[^A-Z0-9]','','g'))=$2`,[OLD,CODE]);
  const parent=await db.query('select 1 from ld_catalog.ld_product_catalog where elimfilters_sku=$1',[NEW]);
  if(parent.rowCount){
    await db.query(`insert into ld_catalog.ld_competitor_cross_references
      (elimfilters_sku,source_sku,competitor_brand,competitor_part_number)
      values($1,$2,'PREMIUM GUARD',$3)
      on conflict (elimfilters_sku,competitor_brand,competitor_part_number) do nothing`,[NEW,neu.codigo_base,CODE]);
  }
  await db.query('select refresh_crossref_cache_sku($1)',[OLD]);
  await db.query('select refresh_crossref_cache_sku($1)',[NEW]);
  const v=await db.query('select code,sku,status from public.v_api_resolver_v5 where code=$1',[CODE]);
  report.v5=v.rows;
  if(v.rowCount!==1||v.rows[0].sku!==NEW)throw new Error('V5_OWNER_MISMATCH:'+JSON.stringify(v.rows));
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run144]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run144] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};