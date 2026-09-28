#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const aud=JSON.parse(fs.readFileSync('hermes/reports/isuzu-v155-batch-candidate-audit.json','utf8'));
const candidates=aud.rows.filter(x=>x.status==='EXISTS'&&x.duty==='HEAVY_DUTY');

const evidenceFiles=[
 'scripts/donaldson_air_results.json',
 'scripts/donaldson_import_ready.jsonl',
 'elimfilters-vault/91-private-evidence/fram-usa-ld-catalog/fram-usa-ld-full-air-20260911/products/CA8466.json',
 'fleetguard_air_942.txt',
 'fleetguard_empty.json',
 'fleetguard_empty_backup_after_cleanup.json'
].filter(fs.existsSync);

const texts=evidenceFiles.map(f=>({file:f,text:fs.readFileSync(f,'utf8').toUpperCase()}));

const tokensFor=r=>{
 const t=new Set([r.sku,r.codigo_base]);
 const g=r.approved_codigo_base;if(g)t.add(g);
 return [...t].filter(Boolean).map(x=>String(x).toUpperCase());
};

const rows=[];
for(const r of candidates){
 const tokens=tokensFor(r);
 const hits=[];
 for(const f of texts){
   const matched=tokens.filter(t=>f.text.includes(t));
   if(matched.length)hits.push({file:f.file,tokens:matched});
 }
 rows.push({
   sku:r.sku,
   pending_positions:r.pending_positions,
   codigo_base:r.codigo_base,
   technology:r.technology,
   filter_type:r.filter_type,
   approved_manufacturer:r.approved_manufacturer,
   approved_codigo_base:r.approved_codigo_base,
   primary_manufacturer_verified:r.primary_manufacturer_verified,
   donaldson_absence_verified:r.donaldson_absence_verified,
   fallback_manufacturer_verified:r.fallback_manufacturer_verified,
   fallback_commercial_code_verified:r.fallback_commercial_code_verified,
   local_evidence_files:hits.length,
   hits,
   provisional_class:hits.length>=1?'EVIDENCE_PRESENT':'HOLD_EVIDENCE'
 });
}

const missing=aud.rows.filter(x=>x.status==='MISSING').map(x=>({
 sku:x.sku,pending_positions:x.pending_positions,provisional_class:'REMAP_REQUIRED'
}));
const nonHd=aud.rows.filter(x=>x.status==='EXISTS'&&x.duty!=='HEAVY_DUTY').map(x=>({
 sku:x.sku,pending_positions:x.pending_positions,codigo_base:x.codigo_base,duty:x.duty,provisional_class:'REMAP_REQUIRED'
}));

const summary={
 hd_candidates:rows.length,
 evidence_present:rows.filter(x=>x.provisional_class==='EVIDENCE_PRESENT').length,
 hold_evidence:rows.filter(x=>x.provisional_class==='HOLD_EVIDENCE').length,
 remap_required:[...missing,...nonHd].length,
 positions_evidence_present:rows.filter(x=>x.provisional_class==='EVIDENCE_PRESENT').reduce((n,x)=>n+x.pending_positions,0),
 positions_hold_evidence:rows.filter(x=>x.provisional_class==='HOLD_EVIDENCE').reduce((n,x)=>n+x.pending_positions,0),
 positions_remap_required:[...missing,...nonHd].reduce((n,x)=>n+x.pending_positions,0)
};

fs.writeFileSync('hermes/reports/isuzu-v156-local-evidence-audit.json',JSON.stringify({summary,rows,remap_required:[...missing,...nonHd]},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
console.table(rows.map(x=>({sku:x.sku,pending:x.pending_positions,base:x.codigo_base,evidence_files:x.local_evidence_files,class:x.provisional_class})));
console.table([...missing,...nonHd].map(x=>({sku:x.sku,pending:x.pending_positions,class:x.provisional_class,base:x.codigo_base||'',duty:x.duty||''})));
