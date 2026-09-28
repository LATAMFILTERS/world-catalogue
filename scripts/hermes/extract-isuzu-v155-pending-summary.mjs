#!/usr/bin/env node
import fs from 'node:fs';
const src=JSON.parse(fs.readFileSync('scripts/hermes/isuzu-us-application-batch-v147.json','utf8'));
const already=new Set(['EA14353','EA17283','EA13930','ED41413','ED41466','EF90390','EF91840','EF92226','EF92564','EF92599','EF96095','EL80008','EL80408','EL80606','EL82042','EL88076','ES90128','EA13614','EA16773']);
const rows=[];
for(const x of src.skus||[]){
 if(already.has(x.sku)||x.sku==='EF98204')continue;
 const exact=(x.applications||[]).reduce((n,a)=>n+(a.year?1:(Number(a.year_to)-Number(a.year_from)+1)),0);
 rows.push({sku:x.sku,exact_positions:exact,applications:x.applications||[]});
}
fs.writeFileSync('hermes/reports/isuzu-v155-pending-summary.json',JSON.stringify({total_skus:rows.length,total_positions:rows.reduce((n,x)=>n+x.exact_positions,0),rows},null,2)+'\n');
console.log(JSON.stringify({total_skus:rows.length,total_positions:rows.reduce((n,x)=>n+x.exact_positions,0),skus:rows.map(x=>({sku:x.sku,exact_positions:x.exact_positions}))},null,2));
