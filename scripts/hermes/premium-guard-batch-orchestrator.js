'use strict';
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {Client}=require('pg');

const arg=(name,fallback=null)=>{const p='--'+name+'=';const v=process.argv.find(x=>x.startsWith(p));return v?v.slice(p.length):fallback;};
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const sha=v=>crypto.createHash('sha256').update(String(v||'')).digest('hex');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function terminalIndex(candidateDir){
  const out=new Map();
  for(const file of fs.readdirSync(candidateDir)){
    if(!file.endsWith('.json'))continue;
    let j;try{j=JSON.parse(fs.readFileSync(path.join(candidateDir,file),'utf8'));}catch{continue;}
    const rows=Array.isArray(j)?j:[j];
    for(const x of rows){
      if(!x||typeof x!=='object')continue;
      const pg=norm(x.premium_guard_code||x.reference_governance?.premium_guard_code);
      const state=x.terminal_state||x.reference_governance?.status;
      if(pg&&state&&(/COMPLETE|BLOCKED/.test(state)))out.set(pg,{state,file,sku:x.sku||x.queue_target_sku||x.reference_governance?.canonical_sku||null});
    }
  }
  return out;
}
async function fetchJson(url,attempts=3){
  let last;
  for(let i=1;i<=attempts;i++){
    try{
      const r=await fetch(url,{headers:{accept:'application/json','user-agent':'ELIMFILTERS-HERMES-PremiumGuardBatch/1.0'}});
      const text=await r.text();
      if(!r.ok)throw new Error('HTTP_'+r.status);
      return {url,body:JSON.parse(text),sha256:sha(text)};
    }catch(e){last=e;if(i<attempts)await sleep(400*i);}
  }
  throw last;
}

async function dbSnapshot(client,item){
  const target=(await client.query(
    "select sku,catalog_active,codigo_base,filter_type,duty,technology,canonical_source_brand,canonical_source_code,height_mm,outer_diameter_mm,thread_size from public.elimfilters_catalog where sku=$1",
    [item.target_sku]
  )).rows[0]||null;
  const refs=[norm(item.premium_guard_code),norm(item.authority_code)].filter(Boolean);
  const owners=(await client.query(
    "select v.code,v.sku,v.manufacturer,a.filter_type,a.duty,a.codigo_base,a.catalog_active from public.v_api_resolver_v5 v join public.elimfilters_catalog a on a.sku=v.sku where v.code=any($1::text[]) order by v.code,v.sku",
    [refs]
  )).rows;
  return {target,owners};
}
async function familyOwners(client,codes){
  const unique=[...new Set(codes.map(norm).filter(Boolean))];
  if(!unique.length)return [];
  return (await client.query(
    "select v.code,v.sku,v.manufacturer,a.filter_type,a.duty,a.codigo_base,a.catalog_active from public.v_api_resolver_v5 v join public.elimfilters_catalog a on a.sku=v.sku where v.code=any($1::text[]) and a.catalog_active=true order by v.code,v.sku",
    [unique]
  )).rows;
}

function classifyAudit({target,owners,authorityCode}){
  const auth=norm(authorityCode);
  const authorityOil=(owners||[]).filter(x=>x.filter_type==='oil'&&x.code===auth);
  const uniqueAuthority=[...new Map(authorityOil.map(x=>[x.sku,x])).values()];
  if(uniqueAuthority.length===1){
    const owner=uniqueAuthority[0];
    if(owner.sku!==target?.sku)return owner.duty==='HEAVY_DUTY'?'HD_REASSIGN_CANDIDATE':'TARGET_MISMATCH_REVIEW';
    return owner.duty==='HEAVY_DUTY'?'HD_TARGET_CONFIRMED':'READY_LD_PREFLIGHT';
  }
  if(uniqueAuthority.length>1)return 'AUTHORITY_MULTI_OWNER_REVIEW';
  const duties=[...new Set((owners||[]).filter(x=>x.filter_type==='oil').map(x=>x.duty).filter(Boolean))];
  if(target?.duty==='HEAVY_DUTY'||duties.includes('HEAVY_DUTY'))return 'HD_REVIEW';
  if(target?.duty==='LIGHT_DUTY'||duties.includes('LIGHT_DUTY'))return 'READY_LD_PREFLIGHT';
  return 'REVIEW_NO_SEGMENT_EVIDENCE';
}

async function auditOne(client,item,terminal){
  const pg=norm(item.premium_guard_code);
  if(terminal)return {premium_guard_code:item.premium_guard_code,target_sku:item.target_sku,state:'TERMINAL_REUSED',terminal};
  const base='https://api.pgfilters.com/catalog/api/v1/products/'+encodeURIComponent(item.premium_guard_code);
  const [refs,apps,snapshot]=await Promise.all([
    fetchJson(base+'/interchanges'),
    fetchJson(base+'/applications?format=ranges'),
    dbSnapshot(client,item)
  ]);
  const interchanges=refs.body?.product||[];
  const interchangeCodes=interchanges.map(x=>x.partIntPartNumber||x.part_number||x.code).filter(Boolean);
  const owners=await familyOwners(client,[item.premium_guard_code,item.authority_code,...interchangeCodes]);
  return {
    premium_guard_code:item.premium_guard_code,
    target_sku:item.target_sku,
    authority_brand:item.authority_brand,
    authority_code:item.authority_code,
    target:snapshot.target,
    state:classifyAudit({target:snapshot.target,owners,authorityCode:item.authority_code}),
    authority_owners:[...new Map(owners.filter(x=>x.filter_type==='oil'&&x.code===norm(item.authority_code)).map(x=>[x.sku,x])).values()],
    existing_owner_duties:[...new Set(owners.map(x=>x.duty).filter(Boolean))].sort(),
    existing_owners:owners,
    interchanges_count:interchanges.length,
    applications_count:(apps.body?.applications||[]).length,
    interchange_codes:[...new Set(interchangeCodes.map(norm).filter(Boolean))].sort(),
    evidence:{
      interchanges:{url:refs.url,sha256:refs.sha256},
      applications:{url:apps.url,sha256:apps.sha256}
    }
  };
}

async function main(){
  const databaseUrl=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!databaseUrl)throw new Error('Missing database URL');
  const queuePath=path.resolve(arg('queue'));
  const batchSize=Math.max(1,Math.min(20,Number(arg('batch-size','10'))));
  const batchIndex=Math.max(1,Number(arg('batch-index','1')));
  const concurrency=Math.max(1,Math.min(3,Number(arg('concurrency','2'))));
  const queue=JSON.parse(fs.readFileSync(queuePath,'utf8'));
  if(!Array.isArray(queue))throw new Error('queue must be an array');
  const start=(batchIndex-1)*batchSize;
  const slice=queue.slice(start,start+batchSize);
  const batchKey='PREMIUM_GUARD_BATCH:'+sha(queuePath).slice(0,12)+':'+batchIndex;
  const client=new Client({connectionString:databaseUrl,ssl:false});
  await client.connect();
  await client.query('BEGIN');
  const lock=(await client.query('select pg_try_advisory_xact_lock(hashtext($1)) acquired',[batchKey])).rows[0]?.acquired;
  if(!lock){await client.query('ROLLBACK');await client.end();throw new Error('BATCH_ALREADY_ACTIVE '+batchKey);}
  const terminals=terminalIndex(path.resolve(__dirname,'../candidates'));
  const results=new Array(slice.length);let cursor=0;
  async function worker(){
    while(true){
      const i=cursor++;if(i>=slice.length)return;
      const item=slice[i];const terminal=terminals.get(norm(item.premium_guard_code))||null;
      try{results[i]=await auditOne(client,item,terminal);}
      catch(e){results[i]={premium_guard_code:item.premium_guard_code,target_sku:item.target_sku,state:'BLOCKED_FETCH_OR_AUDIT',error:e.message};}
    }
  }
  await Promise.all(Array.from({length:Math.min(concurrency,slice.length)},()=>worker()));
  const counts={};for(const r of results)counts[r.state]=(counts[r.state]||0)+1;
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const reportDir=path.resolve(__dirname,'../../elimfilters-vault/91-private-evidence/premium-guard-batch',`B${String(batchIndex).padStart(2,'0')}-${stamp}`);
  fs.mkdirSync(reportDir,{recursive:true});
  const summary={
    batch_key:batchKey,
    batch_index:batchIndex,
    batch_size:batchSize,
    concurrency,
    queue_source:queuePath,
    queue_start_index:start,
    queue_end_index:start+slice.length-1,
    candidates:slice.length,
    counts,
    catalog_writes:false,
    terminal_state:Object.keys(counts).some(k=>k.startsWith('BLOCKED_'))?'AUDIT_COMPLETE_WITH_BLOCKERS':'AUDIT_COMPLETE',
    generated_at:new Date().toISOString()
  };
  fs.writeFileSync(path.join(reportDir,'summary.json'),JSON.stringify(summary,null,2));
  fs.writeFileSync(path.join(reportDir,'results.json'),JSON.stringify(results,null,2));
  await client.query('COMMIT');
  await client.end();
  console.log('[premium-guard-batch] SUMMARY '+JSON.stringify(summary));
  console.log('[premium-guard-batch] REPORT_DIR '+reportDir);
}

if(require.main===module)main().catch(e=>{console.error('[premium-guard-batch] FAILED',e.stack||e.message);process.exit(1);});
module.exports={classifyAudit,terminalIndex};