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
  for(const item of manifest.candidates){
   await db.query('BEGIN');
   try{
    const row=(await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[item.sku])).rows[0];
    const identity=(await db.query('select * from ld_catalog.ld_canonical_product_identity where elimfilters_sku=$1',[item.sku])).rows[0];
    if(!row||!identity) throw new Error('ROW_OR_IDENTITY_MISSING');
    if(!close(row.outer_diameter_mm,item.official.a_mm)||!close(row.height_mm,item.official.h_mm)) throw new Error('OFFICIAL_GEOMETRY_MISMATCH');
    const gov=row.enrichment_data?.codigo_base_governance||{};
    if(row.duty!=='LIGHT_DUTY'||row.filter_type!=='air'||row.catalog_active!==true) throw new Error('SCOPE_MISMATCH');
    if(row.codigo_base!==item.code) throw new Error('BASE_MISMATCH');
    if(identity.status!=='ACTIVE'||identity.origin_group!=='EUROPEAN'||identity.canonical_brand!=='MANN-FILTER'||identity.canonical_part_number!==item.code) throw new Error('IDENTITY_MISMATCH');
    if(gov.state!=='CANONICAL_VERIFIED'||gov.primary_manufacturer_verified!==true||gov.approved_manufacturer!=='MANN-FILTER'||gov.approved_codigo_base!==item.code) throw new Error('GOVERNANCE_MISMATCH');
    const patch={canonical_source_brand:'MANN-FILTER',canonical_source_code:item.code,canonical_source_url:item.source_url,canonical_source_status:'VERIFIED'};
    const gateway=assertGovernedCatalogPatch(row,patch,{skipApplicationValidation:true});
    if(!gateway.valid) throw new Error('GATEWAY_BLOCKED:'+gateway.reasons.join(','));

    const previous={canonical_source_brand:row.canonical_source_brand,canonical_source_code:row.canonical_source_code,canonical_source_url:row.canonical_source_url,canonical_source_status:row.canonical_source_status,canonical_verified_at:row.canonical_verified_at,canonical_evidence:row.canonical_evidence};
    if(APPLY){
     await db.query(`update public.elimfilters_catalog
      set canonical_source_brand='MANN-FILTER',canonical_source_code=$1,canonical_source_url=$2,
          canonical_source_status='VERIFIED',canonical_verified_at=now(),canonical_evidence=$3::jsonb
      where sku=$4`,[item.code,item.source_url,JSON.stringify({
        authority:'MANN-FILTER',code:item.code,source_url:item.source_url,official:item.official,
        selection_model:manifest.selection_model}),item.sku]);
     const a=(await db.query('select sku,codigo_base,canonical_source_brand,canonical_source_code,canonical_source_status from public.elimfilters_catalog where sku=$1',[item.sku])).rows[0];
     if(!a||a.codigo_base!==item.code||a.canonical_source_brand!=='MANN-FILTER'||a.canonical_source_code!==item.code||a.canonical_source_status!=='VERIFIED') throw new Error('POST_WRITE_AUDIT_FAILED');
     await db.query('COMMIT');
    }else await db.query('ROLLBACK');
    report.complete.push({sku:item.sku,code:item.code,gateway,previous});
   }catch(e){
    try{await db.query('ROLLBACK')}catch(_){}
    report.blocked.push({sku:item.sku,code:item.code,reason:e.message});
   }
  }
  report.transaction=APPLY?'PER_SKU_COMMIT':'PER_SKU_ROLLBACK';
  return report;
 }finally{await db.end()}
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
 return report;
}

async function restorePartSearchFailures(syncReport,failed){
 if(!failed.length)return;
 const failedSet=new Set(failed.map(x=>x.sku));
 const db=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});
 await db.connect();
 try{
  for(const x of syncReport.complete.filter(x=>failedSet.has(x.sku))){
   const p=x.previous||{};
   await db.query(`update public.elimfilters_catalog set canonical_source_brand=$1,canonical_source_code=$2,canonical_source_url=$3,canonical_source_status=$4,canonical_verified_at=$5,canonical_evidence=$6::jsonb where sku=$7`,[
    p.canonical_source_brand||null,p.canonical_source_code||null,p.canonical_source_url||null,p.canonical_source_status||null,p.canonical_verified_at||null,p.canonical_evidence?JSON.stringify(p.canonical_evidence):null,x.sku]);
  }
 }finally{await db.end()}
}

function writeTerminals(manifest,blocked=[],reverify=[]){
 for(const x of manifest.candidates){
  const out={sku:x.sku,codigo_base:x.code,filter_type:'air',duty:'LIGHT_DUTY',terminal_state:'COMPLETE',
   canonical_identity:{brand:'MANN-FILTER',code:x.code,origin_group:'EUROPEAN'},
   resolution:'LIVE_PRIORITY_V2_POOL200_AUTO_FIRST_STRICT_GEOMETRY',
   catalog_action:'CANONICAL_METADATA_SYNC_COMMIT',part_search_validated:true,
   official:x.official,source_url:x.source_url,closed_at:CLOSED_AT};
  fs.writeFileSync(path.join(ROOT,'candidates',`ld_air_${x.sku.toLowerCase()}_complete_${DATE}.json`),JSON.stringify(out,null,2)+'\n');
 }
 for(const x of blocked){
  const out={sku:x.sku,codigo_base:x.code,filter_type:'air',duty:'LIGHT_DUTY',terminal_state:'BLOCKED_WITH_REASON',reason:x.reason,closed_at:CLOSED_AT};
  fs.writeFileSync(path.join(ROOT,'candidates',`ld_air_${x.sku.toLowerCase()}_blocked_${DATE}.json`),JSON.stringify(out,null,2)+'\n');
 }
 const out={batch:'LD_AIR_'+BATCH,selection_model:manifest.selection_model,scope:'LIGHT_DUTY_AIR',
  terminal_state:'COMPLETE',counts:{COMPLETE:manifest.candidates.length,BLOCKED_WITH_REASON:blocked.length,REVERIFY:reverify.length},
  catalog_writes:manifest.candidates.map(x=>x.sku),
  candidates:[...manifest.candidates.map(x=>({sku:x.sku,terminal_state:'COMPLETE',canonical_code:x.code})),
   ...blocked.map(x=>({sku:x.sku,terminal_state:'BLOCKED_WITH_REASON',reason:x.reason}))],
  reverify:reverify.map(x=>({sku:x.sku,code:x.code,reason:'PART_SEARCH_FAILED'})),closed_at:CLOSED_AT};
 fs.writeFileSync(terminalPath,JSON.stringify(out,null,2)+'\n');
}

function writeCycleAudit(){
 const n=Number(BATCH.replace(/\D/g,''));
 if(!n||n%10!==0)return null;
 const rows=[];
 for(let i=n-9;i<=n;i++){
  const fp=path.join(ROOT,'candidates',`ld_air_b${String(i).padStart(2,'0')}_terminal_${DATE}.json`);
  if(fs.existsSync(fp)){try{rows.push(JSON.parse(fs.readFileSync(fp,'utf8')))}catch(_){}}
 }
 const totals=rows.reduce((a,x)=>{a.complete+=x.counts?.COMPLETE||0;a.blocked+=x.counts?.BLOCKED_WITH_REASON||0;a.reverify+=x.counts?.REVERIFY||0;return a},{complete:0,blocked:0,reverify:0});
 const audit={cycle_end:BATCH,batches_found:rows.length,totals,audit_state:rows.length===10?'PASS':'REVIEW_REQUIRED',generated_at:new Date().toISOString()};
 const fp=path.join(ROOT,'candidates',`ld_air_cycle_audit_b${String(n-9).padStart(2,'0')}_b${String(n).padStart(2,'0')}_${DATE}.json`);
 fs.writeFileSync(fp,JSON.stringify(audit,null,2)+'\n');return fp;
}

async function main(){
 const manifest=buildManifest();
 const sync=await syncCatalog(manifest);
 if(!APPLY){console.log(JSON.stringify({batch:BATCH,candidates:manifest.candidates.length,sync},null,2));return}
 const synced=new Set(sync.complete.map(x=>x.sku));
 const committed={...manifest,candidates:manifest.candidates.filter(x=>synced.has(x.sku))};
 const partSearch=await validatePartSearch(committed);
 await restorePartSearchFailures(sync,partSearch.failed);
 const passed=new Set(partSearch.results.filter(x=>x.ok).map(x=>x.sku));
 const closed={...manifest,candidates:committed.candidates.filter(x=>passed.has(x.sku))};
 writeTerminals(closed,sync.blocked,partSearch.failed);
 const cycleAudit=writeCycleAudit();
 console.log(JSON.stringify({batch:BATCH,candidates:manifest.candidates.length,sync:{transaction:sync.transaction,complete:sync.complete.length,blocked:sync.blocked.length},part_search:{passed:partSearch.passed,failed:partSearch.failed.length},closed:closed.candidates.length,cycle_audit:cycleAudit,manifest:manifestPath,terminal:terminalPath},null,2));
}
main().catch(e=>{console.error('[ld-air-live-batch-close]',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});
