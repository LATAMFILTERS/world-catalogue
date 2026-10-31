#!/usr/bin/env node
// MANN USA European LD coverage. A US-market denominator must be an independent
// official vehicle/product enumeration, not the ELIMFILTERS candidate list.
// Offline; no network/SQL/catalogue writes and no certification.
import fs from 'node:fs';
import path from 'node:path';
const audit=path.resolve(process.argv[2]||'out/hermes-mann-audit');
const recovered=path.resolve(process.argv[3]||'out/hermes-mann-recovered-technical');
const baselineFile=process.argv[4]||null;
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const summary=read(path.join(audit,'technical-summary.json'));
const add=read(path.join(recovered,'technical-summary-integrated.json')).results;
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const sources=new Map();
for(const r of [...summary,...add]){
 if(sources.has(r.sku))throw Error('DUPLICATE_ELIM_SKU '+r.sku);
 sources.set(r.sku,r);
}
const us=url=>/^https:\/\/www\.mann-filter\.com\/us-(?:en|es)\//i.test(String(url||''));
const candidates=[...sources.values()].map(r=>({
 elimfilters_sku:r.sku,mann_code_claim:r.mann_part,
 mann_code_normalized:norm(r.mann_part),
 official_source_url:r.source_url||null,
 // Product evidence is not US availability unless its captured URL identifies the US market.
 source_market:r.source_url&&us(r.source_url)?'US':'UNCONFIRMED_US',
 has_european_application:r.european_applications>0,
 has_dimensions:r.dimension_fields>0,has_oem:r.oem_codes>0,
 equivalence:'UNVERIFIED',status:'REVIEW_REQUIRED'
}));
const index=new Map();
for(const r of candidates){
 const k=r.mann_code_normalized;if(!index.has(k))index.set(k,[]);
 index.get(k).push(r);
}
let baseline=[],missing=[],matched=[],ambiguous=[];
if(baselineFile){
 baseline=read(path.resolve(baselineFile));
 if(!Array.isArray(baseline))throw Error('BASELINE_MUST_BE_JSON_ARRAY');
 const seen=new Set();
 for(const row of baseline){
  if(!row.mann_code||!row.official_url||!row.european_vehicle_make||!row.usa_ld_source_evidence)throw Error('BASELINE_MISSING_REQUIRED_OFFICIAL_FIELDS');
  if(!us(row.official_url))throw Error('NON_US_BASELINE_URL '+row.mann_code);
  if(!/^https:\/\/www\.mann-filter\.com\/us-(?:en|es)\//i.test(row.usa_ld_source_evidence))throw Error('NON_US_FITMENT_SOURCE '+row.mann_code);
  const k=norm(row.mann_code);
  if(seen.has(k))continue;seen.add(k);
  const found=index.get(k)||[];
  if(found.length===1)matched.push({mann_code:row.mann_code,elimfilters_sku:found[0].elimfilters_sku,source:row.official_url,status:'MANN_CODE_PRESENT_EQUIVALENCE_UNVERIFIED'});
  else if(found.length===0)missing.push({mann_code:row.mann_code,source:row.official_url,status:'MISSING_FROM_ELIMFILTERS_CANDIDATES'});
  else ambiguous.push({mann_code:row.mann_code,skus:found.map(x=>x.elimfilters_sku),status:'MULTIPLE_INTERNAL_CANDIDATES'});
 }
}
const result={internal_ld_skus:candidates.length,internal_with_european_applications:candidates.filter(r=>r.has_european_application).length,
 baseline_us_european_ld_codes:baselineFile?matched.length+missing.length+ambiguous.length:null,
 code_present:baselineFile?matched.length:null,code_missing:baselineFile?missing.length:null,ambiguous:baselineFile?ambiguous.length:null,
 coverage_percent:baselineFile&&baseline.length&&ambiguous.length===0?Number((100*matched.length/(matched.length+missing.length)).toFixed(2)):null,
 baseline_is_complete:false,full_usa_ld_coverage_certified:false,sku_certified:0,status:'REVIEW_REQUIRED',postgres_writes:0,publication:false,
 note:'A valid 100% claim requires a complete independently enumerated US MANN European LD product baseline and independently verified ELIMFILTERS equivalences.'};
const dest=path.join(audit,'mann-usa-european-ld');
fs.mkdirSync(dest,{recursive:true});
for(const [name,data] of Object.entries({'internal-candidates.json':candidates,'missing-from-internal.json':missing,'matched-by-code-only.json':matched,'ambiguous.json':ambiguous,'coverage-summary.json':result}))
 fs.writeFileSync(path.join(dest,name),JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
