#!/usr/bin/env node
// Resolve unclassified 2024 NA PDF pages only if both adjacent pages unequivocally
// report the same manufacturer. Never infer across a make transition.
import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('out/hermes-mann-audit/mann-usa-european-ld');
const get=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const save=(n,v)=>fs.writeFileSync(path.join(root,n),JSON.stringify(v,null,2)+'\n');
const pages=get('na-2024-header-page-classification.json');
const allCodes=get('na-2024-unclassified-all-page-evidence.json');
const byPage=new Map(pages.map(p=>[p.pdf_page,p]));
const updated=pages.map(p=>{
 if(p.group!=='UNRESOLVED')return {...p,resolution:'ORIGINAL_HEADER_CLASSIFICATION'};
 const prev=byPage.get(p.pdf_page-1),next=byPage.get(p.pdf_page+1);
 if(prev&&next&&prev.make&&prev.make===next.make&&prev.group===next.group){
  return {...p,make:prev.make,group:prev.group,
   resolution:'BOTH_IMMEDIATE_NEIGHBOR_HEADERS_AGREE_REVIEW_REQUIRED'};
 }
 return {...p,resolution:'UNRESOLVED_PAGE_REVIEW_REQUIRED'};
});
const makes=new Map(updated.map(p=>[p.pdf_page,p]));
const keys=new Map();
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
for(const e of allCodes){
 const pg=makes.get(e.pdf_page);
 if(pg?.group!=='EU')continue;
 const key=norm(e.code);
 if(!keys.has(key))keys.set(key,{mann_code:e.code,makes:new Set(),pages:new Set(),status:'PDF_TOKEN_NOT_VALIDATED'});
 const row=keys.get(key);row.makes.add(pg.make);row.pages.add(e.pdf_page);
}
const baseline=[...keys.values()].map(x=>({mann_code:x.mann_code,makes:[...x.makes].sort(),evidence_pages:[...x.pages].sort((a,b)=>a-b),status:x.status}));
const original=JSON.parse(fs.readFileSync(path.resolve('out/hermes-mann-audit/technical-summary.json'),'utf8'));
const recovered=JSON.parse(fs.readFileSync(path.resolve('out/hermes-mann-recovered-technical/technical-summary-integrated.json'),'utf8')).results;
const internal=new Map();
for(const r of [...original,...recovered]){
 const k=norm(r.mann_part);if(!internal.has(k))internal.set(k,[]);
 internal.get(k).push(r.sku);
}
const present=[],missing=[],ambiguous=[];
for(const b of baseline){
 const matches=internal.get(norm(b.mann_code))||[];
 const item={...b,elimfilters_skus:matches,equivalence:'UNVERIFIED'};
 if(matches.length===1)present.push(item);
 else if(!matches.length)missing.push(item);
 else ambiguous.push(item);
}
const unresolved=updated.filter(x=>x.group==='UNRESOLVED');
const report={pdf_pages_examined:updated.length,previously_unresolved:pages.filter(p=>p.group==='UNRESOLVED').length,
 neighbor_supported_pages:updated.filter(x=>x.resolution==='BOTH_IMMEDIATE_NEIGHBOR_HEADERS_AGREE_REVIEW_REQUIRED').length,
 still_unresolved:unresolved.length,european_pages:updated.filter(p=>p.group==='EU').length,
 unique_european_code_candidates:baseline.length,found_by_code_only:present.length,not_found_by_code_only:missing.length,
 ambiguous_code_matches:ambiguous.length,completeness_certified:false,
 source_row_validation_complete:false,coverage_percent:null,status:'REVIEW_REQUIRED',certified:0,postgres_writes:0,publication:false};
for(const [n,v] of Object.entries({'na-2024-resolved-page-classification.json':updated,
 'na-2024-unresolved-page-review.json':unresolved,
 'na-2024-reconciled-european-code-candidates.json':baseline,
 'na-2024-reconciled-missing-candidates.json':missing,
 'na-2024-reconciled-present-candidates.json':present,
 'na-2024-reconciled-summary.json':report}))save(n,v);
console.log(JSON.stringify(report,null,2));
