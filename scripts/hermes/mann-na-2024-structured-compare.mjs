#!/usr/bin/env node
// Compare latest structured 2024 MANN North America PDF extraction to existing
// ELIMFILTERS MANN claims. Never infer equivalence, 2026 availability, or coverage.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('out/hermes-mann-audit/mann-usa-european-ld');
const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const extracted=load(path.join(root,'na-2024-structured-european-candidates.json'));
const pages=load(path.join(root,'na-2024-structured-page-audit.json'));
const original=load(path.resolve('out/hermes-mann-audit/technical-summary.json'));
const recovered=load(path.resolve('out/hermes-mann-recovered-technical/technical-summary-integrated.json')).results;
const claims=new Map();
for(const r of [...original,...recovered]){
 const key=norm(r.mann_part);
 if(!key)continue;
 const prev=claims.get(key)||[];
 prev.push({sku:r.sku,mann_code_claim:r.mann_part});
 claims.set(key,prev);
}
const checked=[],missing=[],ambiguous=[],duplicates=new Set();
for(const r of extracted){
 const key=norm(r.mann_code);
 if(duplicates.has(key))throw Error('DUPLICATED_EXTRACTED_MANN_CODE '+r.mann_code);
 duplicates.add(key);
 const found=claims.get(key)||[];
 const row={...r,matched_elimfilters_skus:found.map(x=>x.sku),
    match_status:found.length===1?'CODE_STRING_FOUND_ONLY':found.length?'MULTIPLE_INTERNAL_CLAIMS':'CODE_NOT_FOUND_IN_INTERNAL_CLAIMS',
    physical_equivalence:'NOT_VERIFIED',usa_2026_presence:'NOT_VERIFIED'};
 if(found.length===1)checked.push(row);
 else if(found.length===0)missing.push(row);
 else ambiguous.push(row);
}
const unresolved=pages.filter(p=>p.group==='UNRESOLVED'||p.group==='CONFLICT');
const report={extracted_historical_na_european_code_candidates:extracted.length,
 matching_internal_mann_code_strings:checked.length,not_matching_internal_code_strings:missing.length,
 ambiguous_internal_code_strings:ambiguous.length,unresolved_catalog_pages:unresolved.length,
 missing_list_is_certified:false,usa_2026_inventory_complete:false,full_european_ld_coverage_percent:null,
 physical_equivalences_verified:0,status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false};
for(const [name,v] of Object.entries({
 'na-2024-structured-present-by-code.json':checked,
 'na-2024-structured-unmatched-codes.json':missing,
 'na-2024-structured-ambiguous-codes.json':ambiguous,
 'na-2024-structured-unresolved-pages.json':unresolved,
 'na-2024-structured-compare-summary.json':report
}))fs.writeFileSync(path.join(root,name),JSON.stringify(v,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
