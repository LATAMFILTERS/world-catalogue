'use strict';

const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');

const TARGET='EL30075';
const W77='EL30077';
const HD='EL82024';
const norm=(v='')=>String(v).toUpperCase().replace(/[^A-Z0-9]/g,'');

function removeRef(list,brand,code){
  const b=norm(brand),c=norm(code);
  return (list||[]).filter(x=>!(norm(x.manufacturer||x.brand)===b && norm(x.code||x.part_number||x.reference)===c));
}
async function run(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('Missing database URL');
  const db=new Client({connectionString:url,ssl:false});
  const report={mode:APPLY?'apply':'dry-run'};
  await db.connect();
  try{
    await db.query('BEGIN');
    const q=await db.query('select * from public.elimfilters_catalog where sku=any($1::text[]) for update',[[TARGET,W77,HD]]);
    const by=new Map(q.rows.map(r=>[r.sku,r]));
    const mw=by.get(TARGET),w77=by.get(W77),hd=by.get(HD);
    if(!mw||!w77||!hd) throw new Error('ROWS_MISSING');

    const mwOem=removeRef(mw.oem_codes,'John Deere','AM125424');
    const hdOem=removeRef(removeRef(hd.oem_codes,'JOHN-DEERE','AM125424'),'JOHN DEERE','AM125424');
    const hdComp=removeRef(removeRef(removeRef(hd.competitor_codes,'FRAM','PH8170'),'JOHN-DEERE','AM125424'),'JOHN DEERE','AM125424');

    report.target_gateway=assertGovernedCatalogPatch(mw,{oem_codes:mwOem});
    report.preflight={
      mw75_oem_before:(mw.oem_codes||[]).length,
      mw75_oem_after:mwOem.length,
      hd_oem_before:(hd.oem_codes||[]).length,
      hd_oem_after:hdOem.length,
      hd_comp_before:(hd.competitor_codes||[]).length,
      hd_comp_after:hdComp.length
    };

    const w77Has=(w77.oem_codes||[]).some(x=>norm(x.code)==='AM125424');
    const mwHasPh=(mw.competitor_codes||[]).some(x=>norm(x.code)==='PH8170');
    if(!w77Has) throw new Error('W77_AM125424_MISSING');
    if(!mwHasPh) throw new Error('MW75_PH8170_MISSING');

    if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}

    await db.query('update public.elimfilters_catalog set oem_codes=$1::jsonb where sku=$2',[JSON.stringify(mwOem),TARGET]);

    await db.query(`
      update public.elimfilters_catalog
      set oem_codes=$1::jsonb, competitor_codes=$2::jsonb
      where sku=$3`,[JSON.stringify(hdOem),JSON.stringify(hdComp),HD]);

    await db.query(`
      delete from ld_catalog.ld_oem_cross_references
      where elimfilters_sku=$1
        and regexp_replace(upper(coalesce(oem_part_number,'')),'[^A-Z0-9]','','g')='AM125424'
    `,[TARGET]);
    await db.query(`
      delete from ld_catalog.ld_oem_cross_references
      where elimfilters_sku=$1
        and regexp_replace(upper(coalesce(oem_part_number,'')),'[^A-Z0-9]','','g')='AM125424'
    `,[HD]);
    await db.query(`
      delete from ld_catalog.ld_competitor_cross_references
      where elimfilters_sku=$1
        and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g') in ('AM125424','PH8170')
    `,[HD]);

    await db.query('select refresh_crossref_cache_sku($1)',[TARGET]);
    await db.query('select refresh_crossref_cache_sku($1)',[W77]);
    await db.query('select refresh_crossref_cache_sku($1)',[HD]);

    const v5=await db.query("select code,sku,manufacturer from public.v_api_resolver_v5 where code=any($1::text[]) order by code,sku,manufacturer",[['AM125424','PH8170']]);
    report.v5=v5.rows;

    const amSkus=[...new Set(v5.rows.filter(r=>r.code==='AM125424').map(r=>r.sku))];
    const phSkus=[...new Set(v5.rows.filter(r=>r.code==='PH8170').map(r=>r.sku))];
    if(amSkus.length!==1||amSkus[0]!==W77) throw new Error('AM125424_NOT_UNIQUE_W77:'+JSON.stringify(amSkus));
    if(phSkus.length!==1||phSkus[0]!==TARGET) throw new Error('PH8170_NOT_UNIQUE_MW75:'+JSON.stringify(phSkus));

    await db.query('COMMIT'); report.transaction='COMMIT'; return report;
  }catch(e){
    try{await db.query('ROLLBACK')}catch(_){}
    e.report=report; throw e;
  }finally{await db.end();}
}
if(require.main===module){
  run().then(r=>console.log('[run126]',JSON.stringify(r,null,2)))
    .catch(e=>{console.error('[run126] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});
}
module.exports={run};