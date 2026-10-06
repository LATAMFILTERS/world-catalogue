'use strict';

require('dotenv').config();
const fs=require('fs');
const crypto=require('crypto');
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const ROOT='C:/Users/ELIMSERVER/world-catalogue-hold45';
const SOURCE='scripts/donaldson_crossref_flat.csv';
const AUTH='DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07';
const ROWS=[
  {sku:'EL80668',current:'LF668',candidate:'P550140'},
  {sku:'EL80717',current:'LF717',candidate:'P550232'},
  {sku:'EL80741',current:'LF741',candidate:'P551142'},
  {sku:'EL84146',current:'LF4146',candidate:'P550694'}
];
function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function runtimeUrl(){
  const direct=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(direct)return direct;
  const runner=fs.readFileSync('C:/ELIMSERVER/state/run-search-cutover-user.ps1','utf8');
  const m=runner.match(/\$env:DATABASE_URL='([^']+)'/);
  if(!m)throw new Error('RUNTIME_DB_URL_NOT_FOUND');
  return m[1];
}
async function main(){
  const raw=fs.readFileSync(ROOT+'/'+SOURCE,'utf8');
  const sourceHash=crypto.createHash('sha256').update(raw).digest('hex');
  const pairs=new Set();
  for(const line of raw.split(/\r?\n/).slice(1)){
    const a=line.split(',');
    if(a.length<6)continue;
    if(norm(a[3])==='FLEETGUARD'&&norm(a[5])==='CROSSREF')pairs.add(norm(a[2])+'|'+norm(a[4]));
  }
  const url=runtimeUrl(); const u=new URL(url);
  if(!['127.0.0.1','localhost'].includes(u.hostname)||!['5432','5441'].includes(u.port)||u.pathname!=='/catalogo_elimfilters')throw new Error('REFUSE_NON_CANONICAL_DB');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}}); await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',selected:ROWS.length,verified:0,unresolved:0,mutations:{sku:0,codigo_base:0,alternates:0,evidence:0,queue_marked:0},details:[]};
  try{
    for(const row of ROWS){
      if(!pairs.has(norm(row.candidate)+'|'+norm(row.current))){
        report.unresolved++; report.details.push({...row,status:'UNRESOLVED',reason:'PAIR_NOT_IN_CAPTURE'}); continue;
      }
      const q=(await db.query("SELECT q.status,q.governance_state,q.last_error,c.enrichment_data->'codigo_base_governance'->'observed_primary_candidates' AS candidates FROM public.catalog_codigo_base_sanitation_queue q JOIN public.elimfilters_catalog c ON c.sku=q.sku WHERE q.sku=$1",[row.sku])).rows[0];
      const candidates=Array.isArray(q?.candidates)?q.candidates.map(String):[];
      if(!q||q.status!=='PENDING'||q.governance_state!=='REVIEW_PRIMARY_CANDIDATE'||candidates.length!==1||norm(candidates[0])!==norm(row.candidate)){
        report.unresolved++; report.details.push({...row,status:'UNRESOLVED',reason:'BASELINE_CHANGED'}); continue;
      }
      report.verified++; report.details.push({...row,status:'CROSS_REFERENCE_ONLY'});
      if(!EXECUTE)continue;
      await db.query('BEGIN');
      try{
        const metadata={relation:'OFFICIAL_CROSS_REFERENCE',current_fleetguard_code:row.current,source_file:SOURCE,source_file_hash:sourceHash,capture_id:AUTH};
        const ev=await db.query("INSERT INTO public.catalog_codigo_base_evidence (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata) VALUES ($1,'OFFICIAL_CROSS_REFERENCE',$2,'DONALDSON',$3,$4,$5,$6,now(),$7::jsonb) ON CONFLICT DO NOTHING RETURNING id",[row.sku,AUTH,row.candidate,norm(row.candidate),'https://shop.donaldson.com/store/en-us/search?Ntt='+encodeURIComponent(row.candidate),sourceHash,JSON.stringify(metadata)]);
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
