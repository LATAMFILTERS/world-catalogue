'use strict';
const fs=require('fs'),path=require('path');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const APPLY=process.argv.includes('--apply');
const arg=name=>process.argv.find(x=>x.startsWith('--'+name+'='))?.split('=').slice(1).join('=');
const BATCH=String(arg('batch')||'').toUpperCase();
if(!/^B\d+$/.test(BATCH)) throw new Error('Usage: --batch=B26 [--apply]');
const DATE=(arg('date')||new Date().toISOString().slice(0,10).replace(/-/g,''));
const CLOSED_AT=DATE.length===8?DATE.slice(0,4)+'-'+DATE.slice(4,6)+'-'+DATE.slice(6,8):DATE;
const ROOT=path.resolve(__dirname,'..');
const CURRENT=path.join(ROOT,'candidates','ld_air_live_candidates_current.json');
const slug=BATCH.toLowerCase();
const manifestPath=path.join(ROOT,'candidates',`ld_air_${slug}_live_verified_${DATE}.json`);
const searchPath=path.join(ROOT,'candidates',`ld_air_${slug}_part_search_validation_${DATE}.json`);
const terminalPath=path.join(ROOT,'candidates',`ld_air_${slug}_terminal_${DATE}.json`);
const hasNum=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isFinite(Number(v));
const close=(a,b,t=1.5)=>hasNum(a)&&hasNum(b)&&Math.abs(Number(a)-Number(b))<=t;

function buildManifest(){
 const current=JSON.parse(fs.readFileSync(CURRENT,'utf8'));
 const rows=current?.lanes?.AUTO_CLOSE||[];
 if(!rows.length) throw new Error('NO_AUTO_CLOSE_CANDIDATES');
 const candidates=rows.map(x=>{
  if(!x.official?.family_ok||!x.official?.geometry_complete||!x.official?.geometry_ok||!x.official?.url_ok)
   throw new Error('INVALID_AUTO_CLOSE:'+x.sku);
  return {sku:x.sku,code:x.identity?.canonical_part_number||x.codigo_base,
   source_url:x.official.source_url,
   official:{a_mm:x.official.a_mm,h_mm:x.official.h_mm,scope:(x.makes||[]).join(' / ')}};
 });
 const manifest={batch:'LD_AIR_'+BATCH+'_LIVE',
  selection_model:'LD_AIR_LIVE_PRIORITY_V2_POOL200_AUTO_FIRST_STRICT_GEOMETRY',
  candidates};
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 return manifest;
}

async function syncCatalog(manifest){
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});
 const report={mode:APPLY?'apply':'dry-run',complete:[],blocked:[]};
 await db.connect();

 try{
  await db.query('BEGIN');
  for(const item of manifest.candidates){
   const row=(await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[item.sku])).rows[0];
   const identity=(await db.query('select * from ld_catalog.ld_canonical_product_identity where elimfilters_sku=$1',[item.sku])).rows[0];
   if(!row||!identity) throw new Error('ROW_OR_IDENTITY_MISSING:'+item.sku);
   if(!close(row.outer_diameter_mm,item.official.a_mm)||!close(row.height_mm,item.official.h_mm))
    throw new Error('OFFICIAL_GEOMETRY_MISMATCH:'+item.sku);
   const gov=row.enrichment_data?.codigo_base_governance||{};
   if(row.duty!=='LIGHT_DUTY'||row.filter_type!=='air'||row.catalog_active!==true) throw new Error('SCOPE_MISMATCH:'+item.sku);
   if(row.codigo_base!==item.code) throw new Error('BASE_MISMATCH:'+item.sku);
   if(identity.status!=='ACTIVE'||identity.origin_group!=='EUROPEAN'||identity.canonical_brand!=='MANN-FILTER'||identity.canonical_part_number!==item.code)
    throw new Error('IDENTITY_MISMATCH:'+item.sku);
   if(gov.state!=='CANONICAL_VERIFIED'||gov.primary_manufacturer_verified!==true||gov.approved_manufacturer!=='MANN-FILTER'||gov.approved_codigo_base!==item.code)
    throw new Error('GOVERNANCE_MISMATCH:'+item.sku);
   const patch={canonical_source_brand:'MANN-FILTER',canonical_source_code:item.code,canonical_source_url:item.source_url,canonical_source_status:'VERIFIED'};
   const gateway=assertGovernedCatalogPatch(row,patch,{skipApplicationValidation:true});
   report.complete.push({sku:item.sku,code:item.code,gateway});

   if(APPLY) await db.query(`update public.elimfilters_catalog
    set canonical_source_brand='MANN-FILTER',canonical_source_code=$1,canonical_source_url=$2,
        canonical_source_status='VERIFIED',canonical_verified_at=now(),canonical_evidence=$3::jsonb
    where sku=$4`,[item.code,item.source_url,JSON.stringify({
      authority:'MANN-FILTER',code:item.code,source_url:item.source_url,official:item.official,
      selection_model:manifest.selection_model}),item.sku]);
  }
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  for(const x of report.complete){
   const a=(await db.query('select sku,codigo_base,canonical_source_brand,canonical_source_code,canonical_source_status from public.elimfilters_catalog where sku=$1',[x.sku])).rows[0];
   if(!a||a.codigo_base!==x.code||a.canonical_source_brand!=='MANN-FILTER'||a.canonical_source_code!==x.code||a.canonical_source_status!=='VERIFIED')
    throw new Error('POST_WRITE_AUDIT_FAILED:'+x.sku);
  }
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e}
 finally{await db.end()}
}

async function validatePartSearch(manifest){
 const results=[];
 async function one(x){
  const url='https://part-search.elimfilters.com/api/search?q='+encodeURIComponent(x.code);
  try{const r=await fetch(url);const o=await r.json();const skus=(o.results||[]).map(y=>y.elimfilters_sku);
   return {sku:x.sku,code:x.code,http:r.status,ok:r.ok&&skus.includes(x.sku),results:skus};}
  catch(e){return {sku:x.sku,code:x.code,http:0,ok:false,error:e.message}}
 }
 for(let i=0;i<manifest.candidates.length;i+=10)
  results.push(...await Promise.all(manifest.candidates.slice(i,i+10).map(one)));
 const report={batch:'LD_AIR_'+BATCH,total:results.length,passed:results.filter(x=>x.ok).length,
  failed:results.filter(x=>!x.ok),results};
 fs.writeFileSync(searchPath,JSON.stringify(report,null,2)+'\n');
 if(report.failed.length) throw new Error('PART_SEARCH_VALIDATION_FAILED:'+report.failed.length);
 return report;
}

function writeTerminals(manifest){
 for(const x of manifest.candidates){
  const out={sku:x.sku,codigo_base:x.code,filter_type:'air',duty:'LIGHT_DUTY',terminal_state:'COMPLETE',
   canonical_identity:{brand:'MANN-FILTER',code:x.code,origin_group:'EUROPEAN'},

   resolution:'LIVE_PRIORITY_V2_POOL200_AUTO_FIRST_STRICT_GEOMETRY',
   catalog_action:'CANONICAL_METADATA_SYNC_COMMIT',part_search_validated:true,
   official:x.official,source_url:x.source_url,closed_at:CLOSED_AT};
  fs.writeFileSync(path.join(ROOT,'candidates',`ld_air_${x.sku.toLowerCase()}_complete_${DATE}.json`),
   JSON.stringify(out,null,2)+'\n');
 }
 const out={batch:'LD_AIR_'+BATCH,selection_model:manifest.selection_model,scope:'LIGHT_DUTY_AIR',
  terminal_state:'COMPLETE',counts:{COMPLETE:manifest.candidates.length,BLOCKED_WITH_REASON:0},
  catalog_writes:manifest.candidates.map(x=>x.sku),
  candidates:manifest.candidates.map(x=>({sku:x.sku,terminal_state:'COMPLETE',canonical_code:x.code})),
  closed_at:CLOSED_AT};
 fs.writeFileSync(terminalPath,JSON.stringify(out,null,2)+'\n');
}

async function main(){
 const manifest=buildManifest();
 const sync=await syncCatalog(manifest);
 if(!APPLY){console.log(JSON.stringify({batch:BATCH,candidates:manifest.candidates.length,sync},null,2));return}
 const partSearch=await validatePartSearch(manifest);
 writeTerminals(manifest);
 console.log(JSON.stringify({batch:BATCH,candidates:manifest.candidates.length,sync:{transaction:sync.transaction,complete:sync.complete.length},part_search:{passed:partSearch.passed,failed:partSearch.failed.length},manifest:manifestPath,terminal:terminalPath},null,2));
}
main().catch(e=>{console.error('[ld-air-live-batch-close]',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});
