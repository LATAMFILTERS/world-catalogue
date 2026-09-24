'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const SKU='EL30075';
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
function refCode(x){return norm(x?.code||x?.part_number||x?.reference);}
async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',sku:SKU};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);
  if(q.rowCount!==1)throw new Error('SKU_NOT_FOUND');
  const row=q.rows[0];
  const refs=[...(row.oem_codes||[]),...(row.competitor_codes||[])];
  const codes=[...new Set(refs.map(refCode).filter(Boolean))];
  const map=await db.query(`
    select v.code,array_agg(distinct v.sku order by v.sku) skus
    from public.v_api_resolver_v5 v
    join public.elimfilters_catalog_active_v a on a.sku=v.sku
    where v.code=any($1::text[])
    group by v.code`,[codes]);
  const ambiguous=new Map(map.rows.filter(r=>r.skus.length>1).map(r=>[r.code,r.skus]));
  const heldOem=(row.oem_codes||[]).filter(x=>ambiguous.has(refCode(x)));
  const heldComp=(row.competitor_codes||[]).filter(x=>ambiguous.has(refCode(x)));
  const nextOem=(row.oem_codes||[]).filter(x=>!ambiguous.has(refCode(x)));
  const nextComp=(row.competitor_codes||[]).filter(x=>!ambiguous.has(refCode(x)));
  const old=row.enrichment_data&&typeof row.enrichment_data==='object'?row.enrichment_data:{};
  const nextEn={
    ...old,
    reference_governance_hold:{
      status:'HELD_AMBIGUOUS_CROSS_REFERENCES',
      reason:'MULTI_ACTIVE_SKU_RESOLUTION',
      held_at:new Date().toISOString(),
      held_oem_codes:heldOem,
      held_competitor_codes:heldComp,
      held_code_owners:Object.fromEntries([...ambiguous.entries()]),
      publication_rule:'FAIL_CLOSED_UNTIL_SINGLE_CANONICAL_OWNER'
    }
  };
  report.gateway=assertGovernedCatalogPatch(row,{oem_codes:nextOem,competitor_codes:nextComp,enrichment_data:nextEn});
  report.preflight={oem_before:(row.oem_codes||[]).length,oem_after:nextOem.length,comp_before:(row.competitor_codes||[]).length,comp_after:nextComp.length,held_codes:[...ambiguous.keys()].sort(),held_oem:heldOem.length,held_comp:heldComp.length};
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}

  await db.query('update public.elimfilters_catalog set oem_codes=$1::jsonb,competitor_codes=$2::jsonb,enrichment_data=$3::jsonb where sku=$4',[JSON.stringify(nextOem),JSON.stringify(nextComp),JSON.stringify(nextEn),SKU]);
  if(ambiguous.size){
    const held=[...ambiguous.keys()];
    await db.query(`
      delete from ld_catalog.ld_oem_cross_references
      where elimfilters_sku=$1
        and regexp_replace(upper(coalesce(oem_part_number,'')),'[^A-Z0-9]','','g')=any($2::text[])`,[SKU,held]);
    await db.query(`
      delete from ld_catalog.ld_competitor_cross_references
      where elimfilters_sku=$1
        and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g')=any($2::text[])`,[SKU,held]);
  }
  await db.query('select refresh_crossref_cache_sku($1)',[SKU]);

  const after=(await db.query('select oem_codes,competitor_codes from public.elimfilters_catalog where sku=$1',[SKU])).rows[0];
  const afterCodes=[...new Set([...(after.oem_codes||[]),...(after.competitor_codes||[])].map(refCode).filter(Boolean))];
  const audit=await db.query(`
    select v.code,array_agg(distinct v.sku order by v.sku) skus
    from public.v_api_resolver_v5 v
    join public.elimfilters_catalog_active_v a on a.sku=v.sku
    where v.code=any($1::text[])
    group by v.code`,[afterCodes]);
  const failures=audit.rows.filter(r=>r.skus.length!==1||r.skus[0]!==SKU);
  report.audit={remaining_reference_count:afterCodes.length,failures};
  if(failures.length)throw new Error('MW75_REMAINING_REFERENCE_AMBIGUITY:'+JSON.stringify(failures));

  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run127]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run127] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};