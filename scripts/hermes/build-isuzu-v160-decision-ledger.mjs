#!/usr/bin/env node
import fs from 'node:fs';
const src='hermes/reports/isuzu-v160-master-closure-tuples.json';
const out='hermes/reports/isuzu-v160-decision-ledger.json';
const matrix=JSON.parse(fs.readFileSync(src,'utf8'));
const rows=matrix.rows.map((r,i)=>({
  id:`ISUZU-${String(i+1).padStart(4,'0')}`,
  ...r,
  decision:'HOLD',
  target_sku:r.sku,
  target_codigo_base:r.base||null,
  evidence_authority:null,
  evidence_url:null,
  evidence_reference:null,
  evidence_verified:false,
  reviewer_note:r.action||null
}));
const doc={schema_version:'1.0.0',source:src,total:rows.length,allowed_decisions:[
'HOLD','READY_TO_IMPLEMENT','READY_REMAP','READY_MATERIALIZE','RETIRED'
],rows};
fs.writeFileSync(out,JSON.stringify(doc,null,2)+'\n');
console.log(JSON.stringify({output:out,total:rows.length,hold:rows.length},null,2));
