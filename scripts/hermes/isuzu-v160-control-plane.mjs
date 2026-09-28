#!/usr/bin/env node
import fs from 'node:fs';

const ledgerPath='hermes/reports/isuzu-v160-decision-ledger.json';
if(!fs.existsSync(ledgerPath)) throw new Error('Run build/hydrate decision ledger first');
const ledger=JSON.parse(fs.readFileSync(ledgerPath,'utf8'));

const rows=(ledger.rows||[]).map(r=>{
  if(r.decision==='SATISFIED') return {...r,lane:'SATISFIED',write_allowed:false,
    action:'No write required; exact tuple already verified in governed catalog'};
  if(r.decision==='READY_TO_IMPLEMENT'||r.decision==='READY_REMAP') return {...r,lane:'READY_TO_IMPLEMENT',write_allowed:true,
    action:'Apply verified application through catalog application write service'};
  if(r.decision==='READY_MATERIALIZE') return {...r,lane:'READY_MATERIALIZE',write_allowed:false};
  if(r.decision==='RETIRED') return {...r,lane:'RETIRED',write_allowed:false};
  return {...r,write_allowed:false};
});
const queues={};
for(const r of rows){
  const q=r.write_allowed?'READY_TO_IMPLEMENT':r.lane;
  (queues[q]??=[]).push(r);
}
fs.mkdirSync('hermes/reports/isuzu-v160-queues',{recursive:true});
for(const [name,items] of Object.entries(queues)){
  fs.writeFileSync('hermes/reports/isuzu-v160-queues/'+name+'.json',
    JSON.stringify({queue:name,count:items.length,rows:items},null,2)+'\n');
}
const summary={
  total:rows.length,
  ready:(queues.READY_TO_IMPLEMENT||[]).length,
  blocked:rows.filter(x=>x.decision==='HOLD').length,
  satisfied:rows.filter(x=>x.decision==='SATISFIED').length,
  materialize:rows.filter(x=>x.decision==='READY_MATERIALIZE').length,
  retired:rows.filter(x=>x.decision==='RETIRED').length,
  lanes:Object.fromEntries(Object.entries(queues).map(([k,v])=>[k,v.length]))
};
fs.writeFileSync('hermes/reports/isuzu-v160-control-plane.json',
  JSON.stringify({summary,rows},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
