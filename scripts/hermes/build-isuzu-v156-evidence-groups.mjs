#!/usr/bin/env node
import fs from 'node:fs';

const rec=JSON.parse(fs.readFileSync('hermes/reports/isuzu-v155-exact-pending-reconciliation.json','utf8'));
const aud=JSON.parse(fs.readFileSync('hermes/reports/isuzu-v155-batch-candidate-audit.json','utf8'));
const bySku=new Map(aud.rows.map(x=>[x.sku,x]));
const groups=new Map();

for(const row of rec.rows){
  const a=bySku.get(row.sku)||{};
  const cls = a.status!=='EXISTS' ? 'MISSING'
    : a.duty!=='HEAVY_DUTY' ? 'NON_HD'
    : 'HD_EXISTING';
  const key=[cls,a.codigo_base||'',a.technology||'',a.filter_type||'',a.sub_type||''].join('|');
  if(!groups.has(key))groups.set(key,{class:cls,codigo_base:a.codigo_base||null,technology:a.technology||null,filter_type:a.filter_type||null,sub_type:a.sub_type||null,skus:[],positions:0});
  const g=groups.get(key);g.skus.push(row.sku);g.positions+=row.exact_positions;
}

const out=[...groups.values()].sort((a,b)=>b.positions-a.positions);
fs.writeFileSync('hermes/reports/isuzu-v156-evidence-groups.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
