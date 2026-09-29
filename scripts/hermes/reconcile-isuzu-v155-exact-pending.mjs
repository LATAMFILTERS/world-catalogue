#!/usr/bin/env node
import fs from 'node:fs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const src=read('scripts/hermes/isuzu-us-application-batch-v147.json');
const releasedFiles=[
 'scripts/hermes/isuzu-us-application-batch-v149-existing-skus-only.json',
 'scripts/hermes/isuzu-us-application-batch-v151-phase2.json',
 'scripts/hermes/isuzu-us-application-batch-v152-ef98204-correction.json',
 'scripts/hermes/isuzu-us-application-batch-v153-ea13614.json',
 'scripts/hermes/isuzu-us-application-batch-v154-ea16773.json'
].filter(fs.existsSync).map(read);

const aliasToSource={EA13930:'EA33930',ES90128:'EF98204'};
const expand=(sku,a)=>{
 const ys=a.year?[Number(a.year)]:Array.from({length:Number(a.year_to)-Number(a.year_from)+1},(_,i)=>Number(a.year_from)+i);
 return ys.map(year=>({sku,make:a.make,model:a.model,equipment:a.equipment,type:a.type,engine:a.engine,year}));
};
const k=x=>[x.sku,x.make,x.model,x.equipment,x.type,x.engine,x.year].join('|');

const source=[];
for(const s of src.skus||[]) for(const a of s.applications||[]) source.push(...expand(s.sku,a));

const released=new Set();
for(const doc of releasedFiles){
 for(const s of doc.skus||[]){
  const sourceSku=aliasToSource[s.sku]||s.sku;
  for(const a of s.applications||[]) for(const x of expand(sourceSku,a)) released.add(k(x));
 }
}

const pending=source.filter(x=>!released.has(k(x)));
const bySku=new Map();
for(const x of pending){
 if(!bySku.has(x.sku))bySku.set(x.sku,[]);
 bySku.get(x.sku).push(x);
}
const rows=[...bySku].map(([sku,items])=>({sku,exact_positions:items.length,items})).sort((a,b)=>b.exact_positions-a.exact_positions||a.sku.localeCompare(b.sku));
const out={source_positions:source.length,released_positions:source.length-pending.length,pending_positions:pending.length,pending_skus:rows.length,rows};
fs.writeFileSync('hermes/reports/isuzu-v155-exact-pending-reconciliation.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({source_positions:out.source_positions,released_positions:out.released_positions,pending_positions:out.pending_positions,pending_skus:out.pending_skus,skus:rows.map(x=>({sku:x.sku,exact_positions:x.exact_positions}))},null,2));
