'use strict';
const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'../..');
const GAP_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-gap-analysis');
const OUT_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-final-disposition');
const latest=fs.readdirSync(GAP_DIR)
  .filter(f=>/^fram-ld-gap-.*\.json$/.test(f))
  .map(f=>path.join(GAP_DIR,f))
  .sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs)[0];
if(!latest) throw new Error('No FRAM gap report');
const gap=JSON.parse(fs.readFileSync(latest,'utf8'));
const reasonMap={
  SKU_COLLISION_EXISTING:'Proposed ELIMFILTERS SKU is already occupied; no strong technical identity proof. Current policy forbids inventing a replacement number.',
  FRAM_SKU_COLLISION:'Two or more distinct FRAM authorities collapse to the same 4-digit ELIMFILTERS namespace. Not safe to merge.',
  INSUFFICIENT_EXISTING:'Existing-product evidence is insufficient to prove identity without ambiguity.',
  AMBIGUOUS_EXISTING:'More than one existing ELIMFILTERS candidate remains plausible; no single candidate is proven.',
  CROSS_FAMILY_DIRECT_CONFLICT:'Direct reference conflicts across filter families; automatic resolution prohibited.'
};
const rows=(gap.results||[]).map(r=>{
  const resolved=['EXISTING_DIRECT','EXISTING_MULTI_CROSS'].includes(r.status);
  return {
    authority:r.authority,
    family:r.family,
    proposed_sku:r.proposedSku||null,
    analyzer_status:r.status,
    final_disposition:resolved?'RESOLVED':'QUARANTINE_FINAL',
    final_reason:resolved?'Already covered by an existing ELIMFILTERS product under current FRAM evidence.':(reasonMap[r.status]||'No safe automatic resolution under current canonical rules.'),
    candidate_count:Array.isArray(r.candidates)?r.candidates.length:0,
    candidates:(r.candidates||[]).map(x=>x.sku),
    source_file:r.file||null
  };
});
const pending=rows.filter(r=>r.final_disposition==='QUARANTINE_FINAL');
const resolved=rows.filter(r=>r.final_disposition==='RESOLVED');
const counts={}; for(const r of pending) counts[r.analyzer_status]=(counts[r.analyzer_status]||0)+1;
const family={}; for(const r of pending){family[r.family]=(family[r.family]||0)+1;}
fs.mkdirSync(OUT_DIR,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const jsonPath=path.join(OUT_DIR,`fram-ld-final-matrix-${stamp}.json`);
const payload={
  generated_at:new Date().toISOString(),
  source_gap_report:latest,
  harvested:gap.harvested,
  covered:gap.existing_covered,
  pending_final:pending.length,
  pending_by_status:counts,
  pending_by_family:family,
  policy:'All unresolved rows are final quarantine unless a future explicit namespace-policy change is approved.',
  rows
};
fs.writeFileSync(jsonPath,JSON.stringify(payload,null,2));
const esc=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const csvPath=jsonPath.replace(/\.json$/,'.csv');
const header=['authority','family','proposed_sku','analyzer_status','final_disposition','candidate_count','candidates','final_reason'];
const lines=[header.join(',')];
for(const r of rows) lines.push([r.authority,r.family,r.proposed_sku,r.analyzer_status,r.final_disposition,r.candidate_count,r.candidates.join(';'),r.final_reason].map(esc).join(','));
fs.writeFileSync(csvPath,lines.join('\r\n'));
console.log(JSON.stringify({json:jsonPath,csv:csvPath,harvested:gap.harvested,covered:gap.existing_covered,pending_final:pending.length,pending_by_status:counts,pending_by_family:family},null,2));
