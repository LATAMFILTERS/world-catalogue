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
const CRM_OUTBOX=path.join(ROOT,'state','crm-bridge','outbox');
for(const d of [OPS,INBOX,DONE,CRM_OUTBOX]) fs.mkdirSync(d,{recursive:true});
const cfg=JSON.parse(fs.readFileSync(path.join(REPO,'config','elimserver','agents.json'),'utf8'));
const byId=new Map(cfg.agents.map(a=>[a.id,a]));
const now=()=>new Date().toISOString();
const append=e=>fs.appendFileSync(EXEC,JSON.stringify({...e,at:now()})+'\n');
const crmOwned=(task)=>/supplier|production|logistics|market|distributor|commercial|account|finance|payment|receipt|credit|requisition/i.test(String(task.kind||'')+' '+String(task.action||''));
const route=(task)=>{
  if(task.agentId&&byId.has(task.agentId))return byId.get(task.agentId);
  const kind=String(task.kind||'').toLowerCase();
  if(/product|technology|technical|knowledge/.test(kind))return byId.get('chief-product-technology');
  return byId.get('chief-governance-intelligence');
};
const sensitive=(agent,task)=>agent?.approval_required?.some(x=>String(task.action||task.kind||'').includes(x))||false;

let processed=0, redirectedToCrm=0;
for(const file of fs.readdirSync(INBOX).filter(f=>f.endsWith('.json')).sort()){
  const p=path.join(INBOX,file);let task;
  try{task=JSON.parse(fs.readFileSync(p,'utf8'));}catch(e){append({status:'INVALID',file,error:e.message});fs.renameSync(p,path.join(DONE,file));continue;}
  if(crmOwned(task)){
    const bridge={...task,bridgeId:crypto.randomUUID(),source:'ELIMSERVER',destination:'ELIMFILTERS_CRM',status:'QUEUED_FOR_CRM',queuedAt:now()};
    fs.writeFileSync(path.join(CRM_OUTBOX,`${bridge.bridgeId}.json`),JSON.stringify(bridge,null,2));
    append({executionId:bridge.bridgeId,taskId:task.id||path.basename(file,'.json'),status:'REDIRECTED_TO_CRM',destination:'ELIMFILTERS_CRM',kind:task.kind||'UNSPECIFIED'});
    fs.writeFileSync(path.join(DONE,file),JSON.stringify({...task,runtime:{status:'REDIRECTED_TO_CRM',bridgeId:bridge.bridgeId},processedAt:now()},null,2));
    fs.unlinkSync(p);processed++;redirectedToCrm++;continue;
  }
  const agent=route(task);const execution={executionId:crypto.randomUUID(),taskId:task.id||path.basename(file,'.json'),agentId:agent.id,kind:task.kind||'UNSPECIFIED',action:task.action||null,status:'ROUTED',approvalRequired:sensitive(agent,task),payload:task.payload||null};
  if(execution.approvalRequired) execution.status='AWAITING_CEO_APPROVAL';
  append(execution);
  const out={...task,runtime:execution,processedAt:now()};fs.writeFileSync(path.join(DONE,file),JSON.stringify(out,null,2));fs.unlinkSync(p);processed++;
}
console.log(JSON.stringify({processed,redirectedToCrm,agents:cfg.agents.length,inbox:INBOX,crmOutbox:CRM_OUTBOX,executions:EXEC},null,2));
