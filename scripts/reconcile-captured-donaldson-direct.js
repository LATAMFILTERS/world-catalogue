'use strict';

require('dotenv').config();
const fs=require('fs');
const crypto=require('crypto');
const {Client}=require('pg');
const {normalizeCode}=require('../lib/donaldson-official-evidence');
const {assertGovernedCatalogPatch}=require('../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const BLOCK=Number((process.argv.find(a=>a.startsWith('--block='))||'--block=1').split('=')[1]);
if(![1,2].includes(BLOCK)) throw new Error('BLOCK_MUST_BE_1_OR_2');

const ROOT='C:/Users/ELIMSERVER/world-catalogue-hold45';
const CAPTURE_ID='DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07';
const SOURCE_FILES={
  hydraulic:'scripts/donaldson_hydraulic_results.json',
  oil:'scripts/donaldson_lube_results.json',
  air_intake:'scripts/donaldson_air-intake_results.json',
  air:'scripts/donaldson_air_results.json',
  cabin:'scripts/donaldson_cabin_results.json',
  air_dryer:'scripts/donaldson_air-dryer_results.json',
  fuel:'scripts/donaldson_fuel_results.json'
};
function norm(v){return normalizeCode(String(v||''));}
function hashText(v){return crypto.createHash('sha256').update(v).digest('hex');}
function runtimeUrl(){
  const direct=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(direct)return direct;
  const runner=fs.readFileSync('C:/ELIMSERVER/state/run-search-cutover-user.ps1','utf8');
  const m=runner.match(/\$env:DATABASE_URL='([^']+)'/); if(!m)throw new Error('RUNTIME_DB_URL_NOT_FOUND');
  return m[1];
}
function flattenCodes(record){
  const out=[];
  const push=v=>{if(v!==null&&v!==undefined&&String(v).trim())out.push(String(v).trim());};
  for(const x of record.alternatives||[]) push(typeof x==='string'?x:(x.part_number||x.code||x.reference));
  for(const x of record.cross_references||[]){
    if(Array.isArray(x)){for(const y of x)push(y);}
    else if(typeof x==='string')push(x);
    else if(x&&typeof x==='object')push(x.part_number||x.code||x.reference);
  }
  for(const x of record.oem_codes||[]){
    if(typeof x==='string')push(x);
    else if(x&&typeof x==='object')push(x.part_number||x.code||x.reference);
  }
  for(const arr of Object.values(record.brand_crossrefs||{})){
    for(const x of Array.isArray(arr)?arr:[arr])push(x);
  }
  return [...new Set(out.map(norm).filter(Boolean))];
}
function loadUniverse(){
  const coverage=JSON.parse(fs.readFileSync(ROOT+'/scratch/pending_local_official_coverage.json','utf8'));
  const exact=coverage.filter(x=>x.exact_local_official).sort((a,b)=>a.sku.localeCompare(b.sku));
  const cut=Math.ceil(exact.length/2);
  return BLOCK===1?exact.slice(0,cut):exact.slice(cut);
}
function loadSource(sourceKey){
  const rel=SOURCE_FILES[sourceKey]; if(!rel)throw new Error('NO_SOURCE_FILE_FOR_'+sourceKey);
  const full=ROOT+'/'+rel;
  const raw=fs.readFileSync(full,'utf8');
  const arr=JSON.parse(raw);
  return {rel,full,file_hash:hashText(raw),byPart:new Map(arr.map(x=>[norm(x.part_number),x]))};
}
async function main(){
  const url=runtimeUrl(); const u=new URL(url);
  if(!['127.0.0.1','localhost'].includes(u.hostname)||!['5432','5441'].includes(u.port)||u.pathname!=='/catalogo_elimfilters')throw new Error('REFUSE_NON_CANONICAL_DB');
  const selected=loadUniverse();
  const sourceCache=new Map();
  for(const x of selected) if(!sourceCache.has(x.source_key)) sourceCache.set(x.source_key,loadSource(x.source_key));
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}}); await db.connect();
  const report={migration:'CAPTURED_DONALDSON_DIRECT_BLOCK_'+BLOCK,mode:EXECUTE?'execute':'dry-run',selected:selected.length,verified:0,unresolved:0,relations:{cross_reference:0,rejected_primary:0},mutations:{sku:0,codigo_base:0,alternates:0,canonical_authority:0,evidence:0,queue:0},details:[]};
  try{
    for(const item of selected){
      const src=sourceCache.get(item.source_key);
      const record=src.byPart.get(norm(item.current));
      if(!record){
        report.unresolved++; report.details.push({sku:item.sku,status:'UNRESOLVED',reason:'CAPTURE_RECORD_MISSING'}); continue;
      }
      const recordHash=hashText(JSON.stringify(record));
      const candidateCodes=flattenCodes(record);
      const relation=candidateCodes.includes(norm(item.candidate))?'OFFICIAL_CROSS_REFERENCE':'UNRESOLVED';
      const qr=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1',[item.sku]);
      if(qr.rowCount!==1)throw new Error('SKU_NOT_UNIQUE:'+item.sku);
      const before=qr.rows[0];
      const gov=before.enrichment_data?.codigo_base_governance||{};
      const candidates=Array.isArray(gov.observed_primary_candidates)?gov.observed_primary_candidates.map(String):[];
      const baseline=before.duty==='HEAVY_DUTY'&&String(before.canonical_source_status||'').toUpperCase()==='UNVERIFIED'&&norm(before.codigo_base)===norm(item.current)&&gov.state==='REVIEW_PRIMARY_CANDIDATE'&&candidates.some(c=>norm(c)===norm(item.candidate));
      if(!baseline){
        report.unresolved++; report.details.push({sku:item.sku,status:'UNRESOLVED',reason:'BASELINE_CHANGED'}); continue;
      }
      const now=new Date().toISOString();
      const evidenceUrl='https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(item.current);
      const rejected=[...new Set([...(Array.isArray(gov.rejected_primary_candidates)?gov.rejected_primary_candidates:[]),...candidates].map(String).filter(Boolean))];
      const nextGov={...gov,policy_version:'2026-10-03-v4.1',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',required_authority:'VERIFIED_DONALDSON',primary_manufacturer_verified:true,approved_manufacturer:'DONALDSON',approved_codigo_base:before.codigo_base,approved_source_column:'CODIGO_BASE',evidence_authority:CAPTURE_ID,evidence_kind:'OFFICIAL_AUTHENTICATED_CAPTURE',evidence_url:evidenceUrl,evidence_hash:recordHash,verified_at:now,observed_primary_candidates:[],observed_preferred_candidates:[],rejected_primary_candidates:rejected,rejected_primary_candidate_reason:'CURRENT_CANONICAL_VERIFIED_CANDIDATE_NOT_CANONICAL_AUTHORITY'};
      const nextData={...(before.enrichment_data||{}),codigo_base_governance:nextGov};
      if(relation==='OFFICIAL_CROSS_REFERENCE'){
        const rel=nextData.reference_relationships&&typeof nextData.reference_relationships==='object'&&!Array.isArray(nextData.reference_relationships)?nextData.reference_relationships:{};
        const prior=Array.isArray(rel.official_cross_references)?rel.official_cross_references:[];
        nextData.reference_relationships={...rel,policy_version:'2026-10-04-v1',official_cross_references:[...prior.filter(x=>norm(x?.part_number)!==norm(item.candidate)),{part_number:item.candidate,relationship:'OFFICIAL_CROSS_REFERENCE',manufacturer:'DONALDSON_CAPTURE',status:'VERIFIED',evidence_authority:CAPTURE_ID,evidence_kind:'OFFICIAL_AUTHENTICATED_CAPTURE',source_url:evidenceUrl,evidence_hash:recordHash,verified_at:now,canonical_target:item.current}]};
        report.relations.cross_reference++;
      } else report.relations.rejected_primary++;
      const canonicalEvidence={source:CAPTURE_ID,source_file:src.rel,source_file_hash:src.file_hash,record_hash:recordHash,reference_code:item.current,candidate:item.candidate,candidate_relation:relation};
      const patch={enrichment_data:nextData,canonical_source_brand:'DONALDSON',canonical_source_code:item.current,canonical_source_url:evidenceUrl,canonical_source_status:'VERIFIED',canonical_verified_at:now,canonical_evidence:canonicalEvidence};
      assertGovernedCatalogPatch(before,patch);
      report.verified++; report.details.push({sku:item.sku,status:'READY',current:item.current,candidate:item.candidate,relation,source_file:src.rel});
      if(!EXECUTE)continue;
      await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
      try{
        const locked=(await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',[item.sku])).rows[0];
        const lg=locked.enrichment_data?.codigo_base_governance||{};
        const lc=Array.isArray(lg.observed_primary_candidates)?lg.observed_primary_candidates.map(String):[];
        if(norm(locked.codigo_base)!==norm(item.current)||String(locked.canonical_source_status||'').toUpperCase()!=='UNVERIFIED'||lg.state!=='REVIEW_PRIMARY_CANDIDATE'||!lc.some(c=>norm(c)===norm(item.candidate)))throw new Error('EXECUTION_BASELINE_CHANGED:'+item.sku);
        assertGovernedCatalogPatch(locked,patch);
        const ev=await db.query("INSERT INTO public.catalog_codigo_base_evidence (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata) VALUES ($1,'OFFICIAL_AUTHENTICATED_CAPTURE',$2,'DONALDSON',$3,$4,$5,$6,$7,$8::jsonb) ON CONFLICT DO NOTHING RETURNING id",[item.sku,CAPTURE_ID,item.current,norm(item.current),evidenceUrl,recordHash,now,JSON.stringify(canonicalEvidence)]);
        const upd=await db.query("UPDATE public.elimfilters_catalog SET enrichment_data=$1::jsonb,canonical_source_brand='DONALDSON',canonical_source_code=$2,canonical_source_url=$3,canonical_source_status='VERIFIED',canonical_verified_at=$4,canonical_evidence=$5::jsonb WHERE sku=$6 AND codigo_base IS NOT DISTINCT FROM $7 AND canonical_source_status='UNVERIFIED' RETURNING sku",[JSON.stringify(nextData),item.current,evidenceUrl,now,JSON.stringify(canonicalEvidence),item.sku,locked.codigo_base]);
        if(upd.rowCount!==1)throw new Error('CATALOG_CAS_FAILED:'+item.sku);
        const qu=await db.query("UPDATE public.catalog_codigo_base_sanitation_queue SET governance_state='CANONICAL_VERIFIED',required_authority='DONALDSON',status='RESOLVED',last_error=NULL,updated_at=now() WHERE sku=$1 AND status='PENDING' AND governance_state='REVIEW_PRIMARY_CANDIDATE' RETURNING sku",[item.sku]);
        if(qu.rowCount!==1)throw new Error('QUEUE_CAS_FAILED:'+item.sku);
        report.mutations.canonical_authority++; report.mutations.evidence+=ev.rowCount; report.mutations.queue++;
        await db.query('COMMIT');
      }catch(e){await db.query('ROLLBACK');throw e;}
    }
    return report;
  }finally{await db.end();}
}
if(require.main===module)main().then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.stack||e.message);process.exit(1)});
module.exports={main};
