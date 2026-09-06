#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT=process.env.ELIMSERVER_ROOT||'C:\\ELIMSERVER';
const REPO=process.env.ELIMSERVER_REPO||path.join(ROOT,'repos','world-catalogue');
const OPS=path.join(ROOT,'state','operations');
const INSTANCES=path.join(OPS,'workflows');
const EVENTS=path.join(OPS,'events.ndjson');
const APPROVALS=path.join(OPS,'approvals');
for(const d of [OPS,INSTANCES,APPROVALS]) fs.mkdirSync(d,{recursive:true});
const policy=JSON.parse(fs.readFileSync(path.join(REPO,'config','elimserver','workflows.json'),'utf8'));
const agents=JSON.parse(fs.readFileSync(path.join(REPO,'config','elimserver','agents.json'),'utf8'));

const now=()=>new Date().toISOString();
const id=()=>crypto.randomUUID();
const emit=(event)=>fs.appendFileSync(EVENTS,JSON.stringify({...event,at:now()})+'\n');
const save=(x)=>fs.writeFileSync(path.join(INSTANCES,`${x.id}.json`),JSON.stringify(x,null,2));
const load=(workflowId)=>JSON.parse(fs.readFileSync(path.join(INSTANCES,`${workflowId}.json`),'utf8'));
const approvalRequired=(transition)=>{
  const sensitive=new Set(['account_activation','price_exception','exclusive_distribution','sensitive_outreach','new_supplier','material_commercial_commitment','exception_to_approved_terms','refund','credit_exception','payment_terms_exception','canonical_publication','new_technology_claim','material_spec_change','policy_change','automatic_publication_enablement']);
  return sensitive.has(transition);
};

function create(type,reference,owner='chief-governance-intelligence'){
  const states=policy.workflows[type]; if(!states) throw new Error(`Unknown workflow ${type}`);
  const x={id:id(),type,reference:reference||null,owner,state:states[0],index:0,status:'OPEN',createdAt:now(),updatedAt:now(),history:[]};
  x.history.push({from:null,to:x.state,at:x.createdAt,actor:'SYSTEM'});save(x);emit({kind:'WORKFLOW_CREATED',workflowId:x.id,type,reference,state:x.state,owner});return x;
}
function transition(workflowId,to,actor='SYSTEM',approvedBy=null){
  const x=load(workflowId);const states=policy.workflows[x.type];const expected=states[x.index+1];
  if(to!==expected) throw new Error(`Invalid transition ${x.state} -> ${to}; expected ${expected||'END'}`);
  if(approvalRequired(to)&&!approvedBy){
    const request={id:id(),workflowId:x.id,requestedTransition:to,status:'PENDING',requestedAt:now(),actor,decisionAuthority:agents.decision_authority};
    fs.writeFileSync(path.join(APPROVALS,`${request.id}.json`),JSON.stringify(request,null,2));emit({kind:'APPROVAL_REQUIRED',...request});return {workflow:x,approval:request};
  }
  const from=x.state;x.index+=1;x.state=to;x.updatedAt=now();x.history.push({from,to,at:x.updatedAt,actor,approvedBy});if(x.index===states.length-1)x.status='CLOSED';save(x);emit({kind:'WORKFLOW_TRANSITION',workflowId:x.id,type:x.type,from,to,actor,approvedBy,status:x.status});return {workflow:x};
}
function approve(approvalId,approver){
  const p=path.join(APPROVALS,`${approvalId}.json`);const a=JSON.parse(fs.readFileSync(p,'utf8'));if(a.status!=='PENDING')throw new Error('Approval is not pending');a.status='APPROVED';a.approvedAt=now();a.approvedBy=approver;fs.writeFileSync(p,JSON.stringify(a,null,2));emit({kind:'APPROVAL_APPROVED',approvalId,workflowId:a.workflowId,approver});return transition(a.workflowId,a.requestedTransition,a.actor,approver);
}
function status(workflowId){return load(workflowId)}

const [cmd,...args]=process.argv.slice(2);
try{
  let out;
  if(cmd==='create')out=create(args[0],args[1],args[2]);
  else if(cmd==='transition')out=transition(args[0],args[1],args[2],args[3]);
  else if(cmd==='approve')out=approve(args[0],args[1]||agents.decision_authority);
  else if(cmd==='status')out=status(args[0]);
  else throw new Error('Usage: workflow-engine.mjs create <type> [reference] [owner] | transition <id> <nextState> [actor] [approvedBy] | approve <approvalId> [approver] | status <id>');
  console.log(JSON.stringify(out,null,2));
}catch(e){console.error(`[workflow-engine] ${e.message}`);process.exitCode=1;}
