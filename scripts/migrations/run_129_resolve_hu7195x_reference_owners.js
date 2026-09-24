'use strict';
const fs=require('fs');
const path=require('path');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const TARGET='EL37195';
const MANIFEST=path.resolve(__dirname,'../candidates/premium_guard_oil_phase3_block2_canonical_20260923.json');
const CODES=new Set(['725','L448','LF519']);
const BAD_OWNERS=new Set(['EA11114','EC17243','EL80580','EL39473','EL80485','EL84156']);
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const refCode=x=>norm(x?.code||x?.part_number||x?.reference);
async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const item=JSON.parse(fs.readFileSync(MANIFEST,'utf8')).find(x=>x.sku===TARGET);if(!item)throw new Error('HU7195X_MANIFEST_MISSING');
 const source=JSON.parse(fs.readFileSync('C:/Users/ELIMSERVER/hu7195x_head_manifest.json','utf8')).find(x=>x.sku===TARGET);
 if(!source)throw new Error('HU7195X_SOURCE_MANIFEST_MISSING');
 const approvedRefs=(source.competitor_codes||[]).filter(x=>CODES.has(refCode(x)));
 if(approvedRefs.length!==3)throw new Error('EXPECTED_THREE_APPROVED_REFS');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',target:TARGET};await db.connect();
 try{
  await db.query('BEGIN');
  const skus=[TARGET,...BAD_OWNERS];
  const q=await db.query('select * from public.elimfilters_catalog where sku=any($1::text[]) for update',[skus]);
  const by=new Map(q.rows.map(r=>[r.sku,r]));
  if(!by.has(TARGET))throw new Error('TARGET_MISSING');
  const corrections=[];
  for(const sku of BAD_OWNERS){
    const row=by.get(sku); if(!row) continue;
    const beforeComp=row.competitor_codes||[];
    const beforeOem=row.oem_codes||[];
    const removedComp=beforeComp.filter(x=>CODES.has(refCode(x)));
    const removedOem=beforeOem.filter(x=>CODES.has(refCode(x)));
    if(!removedComp.length&&!removedOem.length) continue;
    const nextComp=beforeComp.filter(x=>!CODES.has(refCode(x)));
    const nextOem=beforeOem.filter(x=>!CODES.has(refCode(x)));
    const validation=assertGovernedCatalogPatch(row,{competitor_codes:nextComp,oem_codes:nextOem},{
      referenceCorrection:true,
      correctionEvidence:{
        authority:'PREMIUM_GUARD_PUBLIC_API_PG5316',
        source_url:'https://api.pgfilters.com/catalog/api/v1/products/PG5316/interchanges',
        evidence_hash:'d4812da46a11f435b66b2b4892e5d581e993c370522a8617edb4b7e53e9a02b5',
        reason:'REMOVE_HU7195X_REFERENCES_FROM_INCOMPATIBLE_LEGACY_OWNER'
      }
    });
    corrections.push({sku,row,nextComp,nextOem,removedComp,removedOem,validation});
  }
  const target=by.get(TARGET);
  const existing=target.competitor_codes||[];
  const existingKeys=new Set(existing.map(x=>norm(x.manufacturer||x.brand)+'|'+refCode(x)));
  const add=approvedRefs.filter(x=>!existingKeys.has(norm(x.manufacturer||x.brand)+'|'+refCode(x)));
  const nextTarget=[...existing,...add];
  const oldEn=target.enrichment_data&&typeof target.enrichment_data==='object'?target.enrichment_data:{};
  const {reference_governance_hold,...withoutHold}=oldEn;
  const nextEn={...withoutHold,reference_governance_resolution:{
    status:'RESOLVED_CONTAMINATION_CLEANUP',
    resolved_codes:[...CODES].sort(),
    authority:'PREMIUM_GUARD_PUBLIC_API_PG5316',
    source_url:'https://api.pgfilters.com/catalog/api/v1/products/PG5316/interchanges',
    evidence_hash:'d4812da46a11f435b66b2b4892e5d581e993c370522a8617edb4b7e53e9a02b5',
    publication_rule:'EL37195_IS_APPROVED_LD_OWNER',
    resolved_at:new Date().toISOString()
  }};
  const targetValidation=assertGovernedCatalogPatch(target,{competitor_codes:nextTarget},{
    referenceEnrichment:true,requireReferenceEvidence:true
  });
  const resolutionValidation=assertGovernedCatalogPatch(target,{enrichment_data:nextEn});
  report.preflight={corrections:corrections.map(x=>({sku:x.sku,removed_comp:x.removedComp.map(r=>({brand:r.manufacturer||r.brand,code:r.code||r.part_number||r.reference})),removed_oem:x.removedOem.map(r=>({brand:r.manufacturer||r.brand,code:r.code||r.part_number||r.reference}))})),target_before:existing.length,target_after:nextTarget.length,target_added:add.map(r=>r.code),target_gateway:targetValidation,resolution_gateway:resolutionValidation};
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  for(const c of corrections){
    await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb,oem_codes=$2::jsonb where sku=$3',[JSON.stringify(c.nextComp),JSON.stringify(c.nextOem),c.sku]);
    await db.query(`delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g')=any($2::text[])`,[c.sku,[...CODES]]);
    await db.query(`delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(oem_part_number,'')),'[^A-Z0-9]','','g')=any($2::text[])`,[c.sku,[...CODES]]);
    await db.query('delete from public.crossref_resolved_cache where sku=$1 and code=any($2::text[])',[c.sku,[...CODES]]);
  }
  await db.query('update public.elimfilters_catalog set competitor_codes=$1::jsonb,enrichment_data=$2::jsonb where sku=$3',[JSON.stringify(nextTarget),JSON.stringify(nextEn),TARGET]);
  for(const x of approvedRefs) await db.query(
    'insert into ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number) values($1,$2,$3,$4) on conflict (elimfilters_sku,competitor_brand,competitor_part_number) do nothing',
    [TARGET,'HU719/5X',x.manufacturer,x.code]
  );
  for(const sku of [TARGET,...BAD_OWNERS]) await db.query('select refresh_crossref_cache_sku($1)',[sku]);
  const audit=await db.query(`select code,array_agg(distinct sku order by sku) skus from public.v_api_resolver_v5 where code=any($1::text[]) group by code order by code`,[[...CODES]]);
  report.audit=audit.rows;
  for(const code of CODES){
    const row=audit.rows.find(r=>r.code===code);
    if(!row||row.skus.length!==1||row.skus[0]!==TARGET)throw new Error('REFERENCE_OWNER_NOT_UNIQUE_'+code+':'+JSON.stringify(row?.skus||[]));
  }
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run129]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run129] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};
