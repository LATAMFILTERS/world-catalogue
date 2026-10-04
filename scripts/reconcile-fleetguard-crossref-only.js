'use strict';

require('dotenv').config();
const fs=require('fs');
const crypto=require('crypto');
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const BLOCK=Number((process.argv.find(a=>a.startsWith('--block='))||'--block=1').split('=')[1]);
if(![1,2].includes(BLOCK))throw new Error('BLOCK_MUST_BE_1_OR_2');
const ROOT='C:/Users/ELIMSERVER/world-catalogue-hold45';
const CAPTURE_ID='DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07';

function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function hashText(v){return crypto.createHash('sha256').update(v).digest('hex');}
function runtimeUrl(){
 const direct=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
 if(direct)return direct;
 const runner=fs.readFileSync('C:/ELIMSERVER/state/run-search-cutover-user.ps1','utf8');
 const m=runner.match(/\$env:DATABASE_URL='([^']+)'/); if(!m)throw new Error('RUNTIME_DB_URL_NOT_FOUND');
 return m[1];
}
function flattenCodes(record){
 const out=[]; const push=v=>{if(v!==null&&v!==undefined&&String(v).trim())out.push(norm(v));};
 for(const x of record.alternatives||[])push(typeof x==='string'?x:(x.part_number||x.code||x.reference));
 for(const x of record.cross_references||[]){
   if(Array.isArray(x)){for(const y of x)push(y);}
   else if(typeof x==='string')push(x);
   else if(x&&typeof x==='object')push(x.part_number||x.code||x.reference);
 }
 for(const x of record.oem_codes||[]){
   if(typeof x==='string')push(x);
   else if(x&&typeof x==='object')push(x.part_number||x.code||x.reference);
 }
 for(const arr of Object.values(record.brand_crossrefs||{}))for(const x of Array.isArray(arr)?arr:[arr])push(x);
 return new Set(out.filter(Boolean));
}
function loadCapture(file){
 const full=ROOT+'/scripts/'+file; const raw=fs.readFileSync(full,'utf8'); const arr=JSON.parse(raw);
 return {file:'scripts/'+file,file_hash:hashText(raw),byPart:new Map(arr.map(x=>[norm(x.part_number),x]))};
}
async function main(){
 const url=runtimeUrl(); const u=new URL(url);
 if(!['127.0.0.1','localhost'].includes(u.hostname)||!['5432','5441'].includes(u.port)||u.pathname!=='/catalogo_elimfilters')throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}}); await db.connect();
 const q=await db.query(
   "SELECT q.sku,q.current_codigo_base,c.filter_type,c.enrichment_data->'codigo_base_governance'->'observed_primary_candidates' AS candidates"+
   " FROM public.catalog_codigo_base_sanitation_queue q JOIN public.elimfilters_catalog c ON c.sku=q.sku"+
   " WHERE q.status='PENDING' AND q.attempts<3 AND q.governance_state='REVIEW_PRIMARY_CANDIDATE'"+
   " AND c.duty='HEAVY_DUTY'"+
   " AND jsonb_array_length(coalesce(c.enrichment_data->'codigo_base_governance'->'observed_primary_candidates','[]'::jsonb))=1"+
   " AND (q.current_codigo_base LIKE 'HF%' OR q.current_codigo_base LIKE 'LF%')"+
   " ORDER BY q.sku"
 );
 const all=q.rows; const cut=Math.ceil(all.length/2); const selected=BLOCK===1?all.slice(0,cut):all.slice(cut);
 const hyd=loadCapture('donaldson_hydraulic_results.json'); const lube=loadCapture('donaldson_lube_results.json');
 const report={migration:'REVIEW_FLEETGUARD_CROSSREF_BLOCK_'+BLOCK,mode:EXECUTE?'execute':'dry-run',selected:selected.length,cross_reference_only:0,unresolved:0,mutations:{sku:0,codigo_base:0,alternates:0,evidence:0,queue_marked:0},details:[]};
 try{
  for(const row of selected){
   const candidate=(row.candidates||[])[0]||null;
   const src=row.filter_type==='hydraulic'?hyd:lube;
   const record=src.byPart.get(norm(candidate));
   if(!record){
     report.unresolved++; report.details.push({sku:row.sku,current:row.current_codigo_base,candidate,status:'UNRESOLVED',reason:'DONALDSON_CANDIDATE_NOT_IN_CAPTURE'}); continue;
   }
   const codes=flattenCodes(record);
   if(!codes.has(norm(row.current_codigo_base))){
     report.unresolved++; report.details.push({sku:row.sku,current:row.current_codigo_base,candidate,status:'UNRESOLVED',reason:'FLEETGUARD_CODE_NOT_IN_DONALDSON_CAPTURE_RELATION'}); continue;
   }
   const recordHash=hashText(JSON.stringify(record));
   const evidenceUrl='https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(candidate);
   const metadata={relation:'OFFICIAL_CROSS_REFERENCE',current_fleetguard_code:row.current_codigo_base,source_file:src.file,source_file_hash:src.file_hash,candidate_record_hash:recordHash,capture_id:CAPTURE_ID};
   report.cross_reference_only++; report.details.push({sku:row.sku,current:row.current_codigo_base,candidate,status:'CROSS_REFERENCE_ONLY'});
   if(!EXECUTE)continue;
   await db.query('BEGIN');
   try{
     const locked=(await db.query("SELECT q.status,q.governance_state,q.last_error,c.enrichment_data->'codigo_base_governance'->'observed_primary_candidates' AS candidates FROM public.catalog_codigo_base_sanitation_queue q JOIN public.elimfilters_catalog c ON c.sku=q.sku WHERE q.sku=$1 FOR UPDATE",[row.sku])).rows[0];
     const lc=Array.isArray(locked?.candidates)?locked.candidates.map(String):[];
     if(!locked||locked.status!=='PENDING'||locked.governance_state!=='REVIEW_PRIMARY_CANDIDATE'||lc.length!==1||norm(lc[0])!==norm(candidate))throw new Error('EXECUTION_BASELINE_CHANGED:'+row.sku);
     const ev=await db.query("INSERT INTO public.catalog_codigo_base_evidence (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata) VALUES ($1,'OFFICIAL_CROSS_REFERENCE',$2,'DONALDSON',$3,$4,$5,$6,now(),$7::jsonb) ON CONFLICT DO NOTHING RETURNING id",[row.sku,CAPTURE_ID,candidate,norm(candidate),evidenceUrl,recordHash,JSON.stringify(metadata)]);
     const qu=await db.query("UPDATE public.catalog_codigo_base_sanitation_queue SET last_error='CROSS_REFERENCE_ONLY_NOT_CANONICAL_AUTHORITY',updated_at=now() WHERE sku=$1 AND status='PENDING' AND governance_state='REVIEW_PRIMARY_CANDIDATE' RETURNING sku",[row.sku]);
     if(qu.rowCount!==1)throw new Error('QUEUE_CAS_FAILED:'+row.sku);
     report.mutations.evidence+=ev.rowCount; report.mutations.queue_marked++;
     await db.query('COMMIT');
   }catch(e){await db.query('ROLLBACK');throw e;}
  }
  return report;
 }finally{await db.end();}
}
if(require.main===module)main().then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.stack||e.message);process.exit(1)});
module.exports={main};
