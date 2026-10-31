#!/usr/bin/env node
// Independent historical PDF codes versus documented ELIMFILTERS MANN candidates.
// Code matching is NOT product equivalence and is NOT current US market proof.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('out/hermes-mann-audit/mann-usa-european-ld');
const audit=path.resolve('out/hermes-mann-audit');
const recovered=path.resolve('out/hermes-mann-recovered-technical');
const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const normalize=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const baseline=load(path.join(root,'na-2024-european-ld-candidates.json'));
const internal=[...load(path.join(audit,'technical-summary.json')),...load(path.join(recovered,'technical-summary-integrated.json')).results];
const index=new Map();
for(const row of internal){
 const key=normalize(row.mann_part);
 if(!key)continue;
 const rows=index.get(key)||[];
 rows.push({elimfilters_sku:row.sku,mann_code_claim:row.mann_part});
 index.set(key,rows);
}
const present=[],missing=[],ambiguous=[];
for(const row of baseline){
 const refs=index.get(normalize(row.mann_code))||[];
 const item={mann_code:row.mann_code,makes:row.makes,families:row.families,evidence_pages:row.evidence_pages,
  match_type:'MANN_CODE_STRING_ONLY',status:'REVIEW_REQUIRED'};
 if(refs.length===1)present.push({...item,elimfilters_sku:refs[0].elimfilters_sku});
 else if(refs.length===0)missing.push(item);
 else ambiguous.push({...item,internal_candidates:refs});
}
for(const [filename,content] of [['na-2024-matched-code-only.json',present],['na-2024-missing-code-candidates.json',missing],['na-2024-ambiguous-code.json',ambiguous]])
 fs.writeFileSync(path.join(root,filename),JSON.stringify(content,null,2)+'\n');
const report={historical_candidate_unique_codes:baseline.length,
 matched_by_mann_code_only:present.length,not_in_internal_mann_claims:missing.length,ambiguous:ambiguous.length,
 provisional_code_presence_percent:baseline.length?+(100*present.length/baseline.length).toFixed(2):null,
 denominator_certified:false,document_page_validation_complete:false,usa_current_catalogue_validated:false,
 physical_equivalence_verified:0,coverage_100_percent_certified:false,certified:0,
 status:'REVIEW_REQUIRED',postgres_writes:0,publication:false};
fs.writeFileSync(path.join(root,'na-2024-coverage-comparison.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
