'use strict';
const fs=require('fs'),path=require('path');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const MANIFEST=path.resolve(__dirname,'../candidates/premium_guard_oil_phase3_block2_canonical_20260923.json');
const SKU='EL37195';
async function run(){
 const item=JSON.parse(fs.readFileSync(MANIFEST,'utf8')).find(x=>x.sku===SKU);
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!item||!url)throw new Error('MISSING_INPUT');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',sku:SKU};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);if(q.rowCount!==1)throw new Error('SKU_NOT_FOUND');
  const row=q.rows[0];
  report.gateway=assertGovernedCatalogPatch(row,{competitor_codes:item.competitor_codes});
  report.expected=item.competitor_codes.length;
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb where sku=$2',[JSON.stringify(item.competitor_codes),SKU]);
  for(const x of item.competitor_codes) await db.query(
   'insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values($1,$2,$3,$4) on conflict (elimfilters_sku,competitor_brand,competitor_part_number) do nothing',
   [SKU,'HU719/5X',x.manufacturer,x.code]);
  await db.query('select refresh_crossref_cache_sku($1)',[SKU]);
  const a=(await db.query("select jsonb_array_length(coalesce(competitor_codes,'[]'::jsonb))::int n from public.elimfilters_catalog where sku=$1",[SKU])).rows[0].n;
  report.audit={competitor_count:a};if(a!==item.competitor_codes.length)throw new Error('COUNT_MISMATCH');
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run127]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run127] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};