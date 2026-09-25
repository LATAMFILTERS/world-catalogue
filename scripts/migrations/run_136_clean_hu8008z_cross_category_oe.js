'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const TARGET='EL38008', WRONG=['EA38008','EF38008'];
const CODES=['8W936A692AC','C2D3670','AJ812351','LR011279','LR019477'];
const URL='https://www.mann-filter.com/en/catalog/search-results/product.html/hu8008z_mann-filter.html';
const HASH='dd94dc12ec4e78a7f29c0e7c6e8c43f126b2c3d889c88aa7368b68bd64201b1e';
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const code=x=>norm(x?.code||x?.part_number||x?.reference);
async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',target:TARGET};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=any($1::text[]) for update',[[TARGET,...WRONG]]);
  const by=new Map(q.rows.map(r=>[r.sku,r]));const target=by.get(TARGET);if(!target)throw new Error('TARGET_MISSING');
  if(target.codigo_base!=='HU8008Z'||target.filter_type!=='oil')throw new Error('TARGET_IDENTITY_MISMATCH');
  const fixes=[];
  for(const sku of WRONG){
   const row=by.get(sku);if(!row)throw new Error('WRONG_SKU_MISSING_'+sku);
   const nextOem=(row.oem_codes||[]).filter(x=>!CODES.includes(code(x)));
   const nextComp=(row.competitor_codes||[]).filter(x=>!CODES.includes(code(x)));
   const removed=(row.oem_codes||[]).length-nextOem.length+(row.competitor_codes||[]).length-nextComp.length;
   if(!removed)continue;
   const validation=assertGovernedCatalogPatch(row,{oem_codes:nextOem,competitor_codes:nextComp},{referenceCorrection:true,correctionEvidence:{
    authority:'MANN_FILTER_OFFICIAL_HU8008Z',source_url:URL,evidence_hash:HASH,
    reason:'Remove HU8008Z oil OE references from incompatible air/fuel sibling SKU.'
   }});
   fixes.push({sku,row,nextOem,nextComp,removed,validation});
  }
  if(!fixes.length)throw new Error('NO_CONTAMINATION_TO_REMOVE');
  report.preflight=fixes.map(x=>({sku:x.sku,filter_type:x.row.filter_type,removed:x.removed}));
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  for(const f of fixes){
   await db.query('update public.elimfilters_catalog set oem_codes=$1::jsonb,competitor_codes=$2::jsonb where sku=$3',[JSON.stringify(f.nextOem),JSON.stringify(f.nextComp),f.sku]);
   await db.query(`delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(oem_part_number,'')),'[^A-Z0-9]','','g')=any($2::text[])`,[f.sku,CODES]);
   await db.query(`delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g')=any($2::text[])`,[f.sku,CODES]);
   await db.query('select refresh_crossref_cache_sku($1)',[f.sku]);
  }
  await db.query('select refresh_crossref_cache_sku($1)',[TARGET]);
  const v5=await db.query(`select code,array_agg(distinct sku order by sku) skus from public.v_api_resolver_v5 where code=any($1::text[]) group by code order by code`,[CODES]);
  report.v5=v5.rows;
  for(const c of CODES){const r=v5.rows.find(x=>x.code===c);if(!r||r.skus.length!==1||r.skus[0]!==TARGET)throw new Error('OE_ROUTE_'+c+':'+JSON.stringify(r?.skus||[]));}
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run136]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run136] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};
