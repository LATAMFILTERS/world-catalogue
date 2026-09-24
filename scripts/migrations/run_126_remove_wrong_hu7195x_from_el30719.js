'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const LEGACY='EL30719', TARGET='EL37195';
const norm=(v='')=>String(v).toUpperCase().replace(/[^A-Z0-9]/g,'');
async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run'};
 await db.connect();
 try{
  await db.query('BEGIN');
  const t=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[TARGET]);
  if(t.rowCount!==1)throw new Error('TARGET_NOT_FOUND');
  const target=t.rows[0];
  if(norm(target.codigo_base)!=='HU7195X'||target.canonical_source_brand!=='MANN-FILTER')throw new Error('TARGET_CANONICAL_IDENTITY_MISMATCH');
  report.target_gateway=assertGovernedCatalogPatch(target,{competitor_codes:target.competitor_codes});

  const owners=await db.query(`
    select sku
    from public.elimfilters_catalog c
    where sku<>$1 and exists(
      select 1 from jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) x
      where regexp_replace(upper(coalesce(x->>'code',x->>'part_number',x->>'reference','')),'[^A-Z0-9]','','g')='HU7195X'
    ) order by sku`,[TARGET]);
  report.owners=owners.rows.map(r=>r.sku);
  if(report.owners.length!==1||report.owners[0]!==LEGACY)throw new Error('UNEXPECTED_HU7195X_OWNERS');

  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}

  await db.query(`
    update public.elimfilters_catalog c
    set competitor_codes=coalesce((
      select jsonb_agg(x)
      from jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) x
      where regexp_replace(upper(coalesce(x->>'code',x->>'part_number',x->>'reference','')),'[^A-Z0-9]','','g')<>'HU7195X'
    ),'[]'::jsonb)
    where sku=$1`,[LEGACY]);

  await db.query(`
    delete from ld_catalog.ld_competitor_cross_references
    where elimfilters_sku=$1
      and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g')='HU7195X'`,[LEGACY]);

  await db.query('select refresh_crossref_cache_sku($1)',[LEGACY]);
  await db.query('select refresh_crossref_cache_sku($1)',[TARGET]);

  const base=await db.query(`
    select sku,codigo_base
    from public.elimfilters_catalog
    where regexp_replace(upper(coalesce(codigo_base,'')),'[^A-Z0-9]','','g')='HU7195X'
    order by sku`);
  report.base=base.rows;
  if(base.rowCount!==1||base.rows[0].sku!==TARGET)throw new Error('HU7195X_BASE_NOT_UNIQUE_TO_TARGET');

  const stale=await db.query(`
    select sku,code,manufacturer
    from public.crossref_resolved_cache
    where sku=$1
      and regexp_replace(upper(coalesce(code,'')),'[^A-Z0-9]','','g')='HU7195X'`,[LEGACY]);
  report.stale_cache=stale.rows;
  if(stale.rowCount)throw new Error('LEGACY_HU7195X_CACHE_REMAINS');

  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run126]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run126] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};