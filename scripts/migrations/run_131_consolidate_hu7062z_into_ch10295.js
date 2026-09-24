'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const APPLY=process.argv.includes('--apply');
const TARGET='EL30295', DUP='EL37062', LEGACY='EL37041';
const MANN_URL='https://www.mann-filter.com/mea-en/catalogue/search-results/product.html/hu7062z_mann-filter.html';
const MANN_HASH='b6eaab650fc940a1ecea4520b3d3a9fb92ca9f23892e02df9f81c8e77392f337';
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const key=x=>norm(x.manufacturer||x.brand)+'|'+norm(x.code||x.part_number||x.reference);

function mergeRefs(current,incoming){
 const out=[...(current||[])],seen=new Set(out.map(key));
 for(const x of incoming){const k=key(x);if(k&&!seen.has(k)){out.push(x);seen.add(k);}}
 return out;
}

async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run'};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=any($1::text[]) for update',[[TARGET,DUP,LEGACY]]);
  const by=new Map(q.rows.map(r=>[r.sku,r]));const target=by.get(TARGET),dup=by.get(DUP),legacy=by.get(LEGACY);
  if(!target||!dup||!legacy)throw new Error('ROWS_MISSING');
  if(norm(target.codigo_base)!=='CH10295'||norm(dup.codigo_base)!=='W7062'||norm(legacy.codigo_base)!=='W7041')throw new Error('IDENTITY_GUARD_FAILED');

  const add=[{manufacturer:'MANN-FILTER',code:'HU7062Z',classification:'AFTERMARKET',source_url:MANN_URL,evidence_hash:MANN_HASH,evidence_authority:'MANN_FILTER_OFFICIAL'}];
  const targetComp=mergeRefs(target.competitor_codes,add);
  const targetOld=target.enrichment_data&&typeof target.enrichment_data==='object'?target.enrichment_data:{};
  const targetEn={...targetOld,regional_canonical_consolidation:{
    status:'VERIFIED',legacy_sku:DUP,canonical_sku:TARGET,canonical_base:'CH10295',
    equivalent_brand:'MANN-FILTER',equivalent_code:'HU7062Z',
    reason:'LD_NON_EUROPEAN_FRAM_CANONICAL_POLICY',
    evidence_url:MANN_URL,evidence_hash:MANN_HASH,verified_at:new Date().toISOString()
  }};
  const legacyComp=(legacy.competitor_codes||[]).filter(x=>!(norm(x.code||x.part_number||x.reference)==='7041'&&norm(x.manufacturer||x.brand)==='LEGACYOTHERBASE'));
  if(legacyComp.length===(legacy.competitor_codes||[]).length)throw new Error('LEGACY_7041_ALIAS_NOT_FOUND');

  report.target_gateway=assertGovernedCatalogPatch(target,{competitor_codes:targetComp,enrichment_data:targetEn});
  report.dup_gateway=assertGovernedCatalogPatch(dup,{catalog_active:false});
  report.legacy_gateway=assertGovernedCatalogPatch(legacy,{competitor_codes:legacyComp});
  report.preflight={target_comp_before:(target.competitor_codes||[]).length,target_comp_after:targetComp.length,dup_active_before:dup.catalog_active,legacy_comp_before:(legacy.competitor_codes||[]).length,legacy_comp_after:legacyComp.length};

  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}

  await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb,enrichment_data=$2::jsonb where sku=$3',[JSON.stringify(targetComp),JSON.stringify(targetEn),TARGET]);
  await db.query("insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values($1,'CH10295','MANN-FILTER','HU7062Z') on conflict (elimfilters_sku,competitor_brand,competitor_part_number) do nothing",[TARGET]);

  await db.query('update public.elimfilters_catalog set catalog_active=false where sku=$1',[DUP]);
  await db.query('delete from public.crossref_resolved_cache where sku=$1',[DUP]);

  await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb where sku=$2',[JSON.stringify(legacyComp),LEGACY]);
  await db.query(`delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g')='7041'`,[LEGACY]);

  await db.query('select refresh_crossref_cache_sku($1)',[TARGET]);
  await db.query('select refresh_crossref_cache_sku($1)',[LEGACY]);

  const audit=await db.query(`
    select v.code,array_agg(distinct v.sku order by v.sku) skus
    from public.v_api_resolver_v5 v
    join public.elimfilters_catalog_active_v a on a.sku=v.sku
    where v.code=any($1::text[])
    group by v.code order by v.code`,[['57041','7041','HU7062Z']]);
  report.v5=audit.rows;
  const expected=new Map([['57041',TARGET],['7041',TARGET],['HU7062Z',TARGET]]);
  for(const [code,sku] of expected){
    const row=audit.rows.find(r=>r.code===code);
    if(!row||row.skus.length!==1||row.skus[0]!==sku)throw new Error('RESOLVER_NOT_UNIQUE_'+code+':'+JSON.stringify(row||null));
  }
  const states=await db.query('select sku,catalog_active from public.elimfilters_catalog where sku=any($1::text[]) order by sku',[[TARGET,DUP,LEGACY]]);
  report.states=states.rows;

  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run131]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run131] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};