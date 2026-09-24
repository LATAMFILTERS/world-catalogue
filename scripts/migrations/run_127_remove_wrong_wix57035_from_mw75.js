'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const SKU='EL30075';
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',sku:SKU};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);
  if(q.rowCount!==1)throw new Error('SKU_NOT_FOUND');
  const row=q.rows[0];
  const nextComp=(row.competitor_codes||[]).filter(x=>!(norm(x.manufacturer||x.brand)==='WIX'&&norm(x.code)==='57035'));
  const oldEn=row.enrichment_data&&typeof row.enrichment_data==='object'?row.enrichment_data:{};
  const oldGov=oldEn.codigo_base_governance&&typeof oldEn.codigo_base_governance==='object'?oldEn.codigo_base_governance:{};
  const nextEn={...oldEn,codigo_base_governance:{...oldGov,competitor_code_count:nextComp.length},cross_reference_rejections:{...(oldEn.cross_reference_rejections||{}),WIX_57035:{status:'REJECTED_PHYSICAL_MISMATCH',reason:'WIX 57035 dimensions/bypass match MANN W77, not MANN MW75',wix_url:'https://www2.wixfilters.com/Lookup/PartDetails.aspx?Part=209331',mann_mw75_url:'https://www.mann-filter.com/us-en/catalog/search-results/product.html/mw75_mann-filter.html',mann_w77_url:'https://www.mann-filter.com/us-en/catalog/search-results/product.html/w77_mann-filter.html',verified_at:new Date().toISOString()}}};
  report.gateway=assertGovernedCatalogPatch(row,{competitor_codes:nextComp,enrichment_data:nextEn});
  report.before=(row.competitor_codes||[]).length;report.after=nextComp.length;
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb,enrichment_data=$2::jsonb where sku=$3',[JSON.stringify(nextComp),JSON.stringify(nextEn),SKU]);
  await db.query("delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(competitor_brand,'')),'[^A-Z0-9]','','g')='WIX' and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g')='57035'",[SKU]);
  await db.query('select refresh_crossref_cache_sku($1)',[SKU]);
  const a=(await db.query("select jsonb_array_length(coalesce(competitor_codes,'[]'::jsonb)) n from public.elimfilters_catalog where sku=$1",[SKU])).rows[0];
  report.audit=a;if(Number(a.n)!==30)throw new Error('COMPETITOR_COUNT_NOT_30');
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run127]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run127] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};