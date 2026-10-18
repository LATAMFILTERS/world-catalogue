import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.env.ELIMSERVER_ROOT||'C:\\ELIMSERVER';
const base=path.join(root,'state','catalogue-hermes');
const inbox=path.join(base,'inbox'),receipts=path.join(base,'receipts'),processing=path.join(base,'processing');
const id=x=>String(x||'').replace(/[^A-Za-z0-9._-]/g,'_').slice(0,120);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const writeExclusive=async(p,data)=>{try{await fs.writeFile(p,JSON.stringify(data),{flag:'wx',mode:0o600});return true;}catch(e){if(e.code==='EEXIST')return false;throw e;}};
export async function intakeHermesRequests({stateRoot=base,limit=10}={}){
 const inDir=path.join(stateRoot,'inbox'),ackDir=path.join(stateRoot,'receipts'),claimed=path.join(stateRoot,'processing');
 await Promise.all([inDir,ackDir,claimed].map(dir=>fs.mkdir(dir,{recursive:true})));
 const result=[];
 for(const name of (await fs.readdir(inDir)).filter(x=>/^[A-Za-z0-9._-]+__[-A-Za-z0-9._]+\.json$/.test(x)).sort().slice(0,limit)){
  const raw=await fs.readFile(path.join(inDir,name),'utf8');
  const entry=JSON.parse(raw),e=entry.envelope;
  if(entry.kind!=='HERMES_RESEARCH_REQUEST'||entry.schema_version!==1||
   entry.content_sha256!==hash(JSON.stringify(e))||e?.type!=='HERMES_RESEARCH_REQUEST'||
   e.caller!=='crm'||e.owner!=='world-catalogue'||e.mode!=='PROPOSE'||
   e.writeTarget||!e.requestId||!e.correlationId||
   name!==id(e.correlationId)+'__'+id(e.requestId)+'.json')throw Error('INVALID_HERMES_INTAKE_FILE');
  const ack=path.join(ackDir,name);
  const claim=path.join(claimed,name);
  const receipt={accepted:true,requestId:e.requestId,correlationId:e.correlationId,
    status:'RECEIVED_NOT_RESEARCHED',source:'HERMES_LOCAL_INTAKE',request_sha256:entry.content_sha256};
  const created=await writeExclusive(claim,{envelope:e,received_at:new Date().toISOString(),status:'RECEIVED_NOT_RESEARCHED'});
  if(created)await writeExclusive(ack,receipt);
  result.push({requestId:e.requestId,status:'RECEIVED_NOT_RESEARCHED',new:created});
 }
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===new URL(import.meta.url).pathname){
 console.log(JSON.stringify(await intakeHermesRequests()));
}
