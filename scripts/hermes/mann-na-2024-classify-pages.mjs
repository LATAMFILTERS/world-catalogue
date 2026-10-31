#!/usr/bin/env node
// Conservative read-only classification of PDF page evidence. No certifications.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('out/hermes-mann-audit/mann-usa-european-ld');
const load=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8'));
const pages=load('na-2024-full-page-audit.json');
const evidence=load('na-2024-unclassified-all-page-evidence.json');
const euro='ALFA ROMEO|ASTON MARTIN|AUDI|BENTLEY|BMW|BUGATTI|CITROEN|CITROËN|CUPRA|FERRARI|FIAT|JAGUAR|LAMBORGHINI|LAND ROVER|LOTUS|MASERATI|MERCEDES BENZ|MERCEDES-BENZ|MINI|OPEL|PEUGEOT|POLESTAR|PORSCHE|RENAULT|ROLLS ROYCE|ROLLS-ROYCE|SAAB|SEAT|SKODA|SMART|VOLKSWAGEN|VOLVO|VAUXHALL'.split('|');
const other='ACURA|BUICK|CADILLAC|CHEVROLET|CHRYSLER|DODGE|FORD|GMC|HONDA|HYUNDAI|INFINITI|ISUZU|JEEP|KIA|LEXUS|LINCOLN|MAZDA|MITSUBISHI|NISSAN|RAM|SCION|SUBARU|SUZUKI|TOYOTA'.split('|');
const all=[...euro.map(name=>({name,group:'EU'})),...other.map(name=>({name,group:'NON_EU'}))].sort((a,b)=>b.name.length-a.name.length);
const normalize=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const pageMap=new Map();
for(const p of pages){
 const lines=String(p.header_excerpt||'').toUpperCase().split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,12);
 const hits=new Map();
 for(const line of lines)for(const item of all){
  if(line===item.name||line.startsWith(item.name+' ')||line.startsWith(item.name+'\t'))hits.set(item.name,item);
 }
 const found=[...hits.values()];
 const assigned=found.length===1?found[0]:null;
 pageMap.set(p.pdf_page,{pdf_page:p.pdf_page,make:assigned?.name||null,group:assigned?.group||'UNRESOLVED',header_excerpt:p.header_excerpt,code_candidates:p.code_candidates,status:'REVIEW_REQUIRED'});
}
const codes=new Map();
for(const e of evidence){
 const pg=pageMap.get(e.pdf_page);
 if(pg?.group!=='EU')continue;
 const key=normalize(e.code);
 if(!codes.has(key))codes.set(key,{mann_code:e.code,makes:new Set(),evidence_pages:new Set()});
 codes.get(key).makes.add(pg.make);codes.get(key).evidence_pages.add(e.pdf_page);
}
const baseline=[...codes.values()].map(x=>({mann_code:x.mann_code,makes:[...x.makes],evidence_pages:[...x.evidence_pages].sort((a,b)=>a-b),status:'HEADER_CANDIDATE_NOT_VALIDATED'}));
const audit=path.resolve('out/hermes-mann-audit');
const originals=JSON.parse(fs.readFileSync(path.join(audit,'technical-summary.json'),'utf8'));
const additional=JSON.parse(fs.readFileSync(path.resolve('out/hermes-mann-recovered-technical/technical-summary-integrated.json'),'utf8')).results;
const internal=new Map();
for(const row of [...originals,...additional]){
 const k=normalize(row.mann_part);if(!internal.has(k))internal.set(k,[]);
 internal.get(k).push(row.sku);
}
const missing=[],found=[],ambiguous=[];
for(const b of baseline){
 const matches=internal.get(normalize(b.mann_code))||[];
 const row={...b,elimfilters_skus:matches};
 if(!matches.length)missing.push(row);else if(matches.length===1)found.push(row);else ambiguous.push(row);
}
const classified=[...pageMap.values()];
const report={pdf_pages_examined:pages.length,classified_european_pages:classified.filter(x=>x.group==='EU').length,
 classified_non_european_pages:classified.filter(x=>x.group==='NON_EU').length,
 unresolved_pages:classified.filter(x=>x.group==='UNRESOLVED').length,
 preliminary_european_unique_codes:baseline.length,code_present_candidates:found.length,
 code_missing_candidates:missing.length,ambiguous_matches:ambiguous.length,
 catalog_coverage_percent:null,reason:'Unresolved pages and unverified header classification prevent a complete denominator',
 complete_inventory:false,physical_equivalence_verified:0,certified:0,status:'REVIEW_REQUIRED',postgres_writes:0,publication:false};
for(const [file,data] of Object.entries({'na-2024-header-page-classification.json':classified,'na-2024-header-european-candidates.json':baseline,
 'na-2024-header-missing-candidates.json':missing,'na-2024-header-present-candidates.json':found,'na-2024-header-classification-summary.json':report}))
 fs.writeFileSync(path.join(root,file),JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
