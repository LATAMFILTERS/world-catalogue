#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT=process.env.ELIMSERVER_ROOT||'C:\\ELIMSERVER';
const REPO=process.env.ELIMSERVER_REPO||path.join(ROOT,'repos','world-catalogue');
const OPS=path.join(ROOT,'state','operations');
const INBOX=path.join(OPS,'inbox');
const DONE=path.join(OPS,'processed');
const EXEC=path.join(OPS,'agent-executions.ndjson');
for(const d of [OPS,INBOX,DONE]) fs.mkdirSync(d,{recursive:true});
const cfg=JSON.parse(fs.readFileSync(path.join(REPO,'config','elimserver','agents.json'),'utf8'));
const byId=new Map(cfg.agents.map(a=>[a.id,a]));
const now=()=>new Date().toISOString();
const append=e=>fs.appendFileSync(EXEC,JSON.stringify({...e,at:now()})+'\n');
const route=(task)=>{
  if(task.agentId&&byId.has(task.agentId))return byId.get(task.agentId);
  const kind=String(task.kind||'').toLowerCase();
  if(/supplier|production|logistics/.test(kind))return byId.get('chief-operating-supply-chain');
  if(/product|technology|technical|knowledge/.test(kind))return byId.get('chief-product-technology');
  if(/market|distributor|commercial|account/.test(kind))return byId.get('chief-commercial-markets');
  if(/finance|payment|receipt|credit/.test(kind))return byId.get('chief-finance');
  return byId.get('chief-governance-intelligence');
};
const sensitive=(agent,task)=>agent.approval_required.some(x=>String(task.action||task.kind||'').includes(x));

let processed=0;
for(const file of fs.readdirSync(INBOX).filter(f=>f.endsWith('.json')).sort()){
  const p=path.join(INBOX,file);let task;
  try{task=JSON.parse(fs.readFileSync(p,'utf8'));}catch(e){append({status:'INVALID',file,error:e.message});fs.renameSync(p,path.join(DONE,file));continue;}
  const agent=route(task);const execution={executionId:crypto.randomUUID(),taskId:task.id||path.basename(file,'.json'),agentId:agent.id,kind:task.kind||'UNSPECIFIED',action:task.action||null,status:'ROUTED',approvalRequired:sensitive(agent,task),payload:task.payload||null};
  if(execution.approvalRequired) execution.status='AWAITING_CEO_APPROVAL';
  append(execution);
  const out={...task,runtime:execution,processedAt:now()};fs.writeFileSync(path.join(DONE,file),JSON.stringify(out,null,2));fs.unlinkSync(p);processed++;
}
console.log(JSON.stringify({processed,agents:cfg.agents.length,inbox:INBOX,executions:EXEC},null,2));
