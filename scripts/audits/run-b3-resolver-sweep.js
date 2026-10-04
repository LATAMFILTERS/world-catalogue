'use strict';

const {spawnSync}=require('child_process');

const EXECUTE=process.argv.includes('--execute');
const dbUrl=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
if(!dbUrl) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL is required');

const u=new URL(dbUrl);
if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters'){
  throw new Error('REFUSE_NON_CANONICAL_DB');
}

function runNode(args,label){
  const r=spawnSync(process.execPath,args,{
    cwd:process.cwd(),
    env:process.env,
    encoding:'utf8',
    stdio:['ignore','pipe','pipe']
  });
  const stdout=String(r.stdout||'').trim();
  const stderr=String(r.stderr||'').trim();
  if(r.status!==0){
    const e=new Error(label+' failed with exit '+r.status);
    e.stdout=stdout;
    e.stderr=stderr;
    throw e;
  }
  return {stdout,stderr};
}

function parseLastJson(text){
  const trimmed=String(text||'').trim();
  if(!trimmed) return null;
  const starts=[];
  for(let i=0;i<trimmed.length;i++) if(trimmed[i]==='{') starts.push(i);
  for(let i=starts.length-1;i>=0;i--){
    try{return JSON.parse(trimmed.slice(starts[i]));}catch{}
  }
  return null;
}

function summarizeB3(report){
  const pairs=Array.isArray(report?.pairs)?report.pairs:[];
  const resolver=pairs.filter(x=>x.automation_lane==='RESOLVER_COLLISION');
  const actions={};
  const peersByAction={};
  for(const row of resolver){
    const a=row.lane_action||'UNCLASSIFIED';
    actions[a]=(actions[a]||0)+1;
    if(!peersByAction[a]) peersByAction[a]=new Set();
    peersByAction[a].add(row.peer);
  }
  return {
    b3_pairs:report?.b3_pairs??pairs.length,
    resolver_pairs:resolver.length,
    resolver_peers:new Set(resolver.map(x=>x.peer)).size,
    resolver_by_action:actions,
    resolver_unique_peers_by_action:Object.fromEntries(
      Object.entries(peersByAction).map(([k,v])=>[k,v.size])
    )
  };
}

const result={
  mode:EXECUTE?'execute':'dry-run',
  canonical_database:true,
  stages:[]
};

try{
  const pre=runNode([
    'scripts/migrations/run_212_reown_hermes_confirmed_resolver_duplicates.js'
  ],'run_212 dry-run');
  const preJson=parseLastJson(pre.stdout);
  if(!preJson||preJson.transaction!=='ROLLBACK'){
    throw new Error('run_212 dry-run did not finish with ROLLBACK');
  }
  result.stages.push({
    stage:'run_212_dry_run',
    matched:preJson.matched,
    ready_count:Array.isArray(preJson.ready)?preJson.ready.length:0,
    skipped_count:Array.isArray(preJson.skipped)?preJson.skipped.length:0,
    ready:preJson.ready||[],
    skipped:preJson.skipped||[]
  });

  if(EXECUTE){
    const exec=runNode([
      'scripts/migrations/run_212_reown_hermes_confirmed_resolver_duplicates.js',
      '--execute'
    ],'run_212 execute');
    const execJson=parseLastJson(exec.stdout);
    if(!execJson||execJson.transaction!=='COMMIT'){
      throw new Error('run_212 execute did not finish with COMMIT');
    }
    result.stages.push({
      stage:'run_212_execute',
      matched:execJson.matched,
      ready_count:Array.isArray(execJson.ready)?execJson.ready.length:0,
      skipped_count:Array.isArray(execJson.skipped)?execJson.skipped.length:0,
      mutations:execJson.mutations||{},
      transaction:execJson.transaction
    });
  }

  const audit=runNode([
    'scripts/audits/audit-competing-sku-application-evidence-b3.js'
  ],'B3 audit');
  const auditJson=parseLastJson(audit.stdout);
  if(!auditJson) throw new Error('B3 audit did not emit JSON');
  result.stages.push({
    stage:'b3_audit',
    summary:summarizeB3(auditJson)
  });

  console.log(JSON.stringify(result,null,2));
}catch(error){
  result.error={
    message:error.message,
    stdout:error.stdout||null,
    stderr:error.stderr||null
  };
  console.error(JSON.stringify(result,null,2));
  process.exit(1);
}
