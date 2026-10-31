#!/usr/bin/env node
// Offline analysis of evidence captured by ten-sku-readonly-research.mjs.
// No database, network, publication or approval side effects.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {parseMannSummary,parseMannOeNumbers}=require('../../lib/mann-official-spec-verifier.js');
import { assessDossier, canonicalRoleForDossier } from './catalogue-dossier-core.mjs';
import { isEuropeanMake } from './ld-origin-group.mjs';
const dir=path.resolve(process.argv[2]||'out/hermes-ten-sku');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const decode=s=>String(s||'').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;/g,"'").replace(/&nbsp;/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const results=[];
for(const entry of manifest.records.filter(r=>r.result==='EVIDENCE_CAPTURED')){
  const file=entry.evidence?.file;
  if(!file||file!==entry.sku+'.mann.html')throw Error('UNSAFE_EVIDENCE_FILE '+entry.sku);
  const html=fs.readFileSync(path.join(dir,file),'utf8');
  if(sha(html)!==entry.evidence.sha256||Buffer.byteLength(html)!==entry.evidence.bytes)throw Error('EVIDENCE_HASH_MISMATCH '+entry.sku);
  const title=decode((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)||[])[1]);
  if(!/MANN.FILTER/i.test(title)||!norm(title).includes(norm(entry.canonical_base_claim)))throw Error('SOURCE_IDENTITY_MISMATCH '+entry.sku);
  const makeSet=new Set(),fitments=new Map(),skipped=[],unresolved=[];
  const sourceLinks=new Map();
  let applicationLinks=0;
  const re=/<a\b([^>]*data-g-binding-params="([^"]+)"[^>]*)>([\s\S]*?)<\/a>/gi;
  for(const m of html.matchAll(re)){
    if(!/data-g-binding-application-link\b/.test(m[1]))continue;
    applicationLinks++;
    let p;
    try{p=new URLSearchParams(decodeURIComponent(m[2].replace(/&amp;/gi,'&')).replace(/^\?/,''));}catch{skipped.push('MALFORMED_PARAMS');continue;}
    if(p.get('mode')!=='application')continue;
    const sourceRecord=Object.fromEntries(p.entries());
    sourceLinks.set(JSON.stringify(sourceRecord),sourceRecord);
    const make=p.get('vehicleMake'),year=p.get('vehicleModel'),model=p.get('vehicleName'),id=p.get('vehicleTypeId'),eng=p.get('engineCode');
    if(make)makeSet.add(make);
    if(!make||!model){skipped.push('INCOMPLETE_SOURCE_ROW');unresolved.push({source_record:sourceRecord,reason:'SOURCE_FIELDS_NOT_IN_EXPECTED_FORMAT',status:'REVIEW_REQUIRED'});continue;}
    const engines=String(eng||'').split(',').map(x=>x.trim()).filter(Boolean);
    const row={make,year:/^(19|20)\d{2}$/.test(year||'')?Number(year):null,source_year_literal:year||null,model,vehicle_type_id:id||null,source_fields_complete:Boolean(/^(19|20)\d{2}$/.test(year||'')&&id),origin_is_european:isEuropeanMake(make),engine_code_literal:eng||null,engine_codes:engines,engine_status:!engines.length?'ENGINE_NOT_PUBLISHED':engines.every(x=>/^[A-Z][A-Z0-9]{3,16}$/.test(x))?'ENGINE_CODES_PUBLISHED':'ENGINE_CODES_PARTIAL',source_url:entry.evidence.url,source_sha256:entry.evidence.sha256,status:'REVIEW_REQUIRED'};
    fitments.set([make,year,model,id,eng].join('|'),row);
  }
  const dimensionsParsed=parseMannSummary(html);
  const oeParsed=parseMannOeNumbers(html);
  const technicalAxes={
    specifications:{status:Object.keys(dimensionsParsed.values).length?'SOURCE_REPORTED':'REVIEW_REQUIRED',values:dimensionsParsed.values,summary:dimensionsParsed.summary||null,source_url:entry.evidence.url,source_sha256:entry.evidence.sha256},
    oem_codes:{status:oeParsed.length?'SOURCE_REPORTED':'REVIEW_REQUIRED',records:oeParsed,source_url:entry.evidence.url,source_sha256:entry.evidence.sha256},
    competitor_codes:{status:'REVIEW_REQUIRED',records:[],required_sources:['official manufacturer cross-reference catalogues'],note:'MANN product identity or OEM number alone does not verify competing brand equivalence'},
    ld_vehicle_applications:{status:fitments.size?'SOURCE_REPORTED':'REVIEW_REQUIRED',authority_by_vehicle_market:{EUROPEAN:'MANN-FILTER',NON_EUROPEAN:'FRAM'},mann_records_are_mann_only:true,fram_verification_required_for_non_european:true,market_unresolved:'REVIEW_REQUIRED'}
  };
  const sourceUrl=entry.evidence.url;
  const axis=(records,hasEvidence)=>({status:hasEvidence?'VERIFIED':'UNRESOLVED',records,source_urls:[sourceUrl],checked_sources:[sourceUrl]});
  const structuredDossier={
    identity:{status:'VERIFIED',manufacturer:'MANN-FILTER',source_code:entry.canonical_base_claim,product_name:title,product_type:title.match(/(air filter|oil filter|fuel filter|cabin filter|interior filter)/i)?.[1]||'UNRESOLVED',market_segment:'LIGHT_DUTY',records:[{title,source_part:entry.canonical_base_claim}],source_urls:[sourceUrl],checked_sources:[sourceUrl]},
    dimensions:axis(Object.entries(dimensionsParsed.values).filter(([k])=>k!=='thread_size').map(([field,value])=>({field,value,unit:'mm'})),Object.keys(dimensionsParsed.values).some(k=>k!=='thread_size')),
    technical_specs:axis(Object.entries(dimensionsParsed.values).map(([field,value])=>({field,value})),Object.keys(dimensionsParsed.values).length>0),
    oem_codes:axis(oeParsed,oeParsed.length>0),
    cross_references:axis([],false),
    applications:axis([...fitments.values()].filter(r=>r.origin_is_european&&r.source_fields_complete),fitments.size>0&&[...fitments.values()].some(r=>r.origin_is_european&&r.source_fields_complete)),
    provenance:{sources:[{url:sourceUrl,authority:'MANN-FILTER',source_type:'official product page',supports:['identity','dimensions','technical_specs','oem_codes','applications']}]},
    consistency:{status:'UNRESOLVED',conflicts:[],notes:['ELIMFILTERS equivalence and FRAM/non-European fitments not independently verified']}
  };
  const dossierAssessment=assessDossier(structuredDossier);
  const sourceRole=canonicalRoleForDossier({duty:'LIGHT_DUTY'},structuredDossier);
  const result={sku:entry.sku,mann_part:entry.canonical_base_claim,source_title:title,evidence:entry.evidence,integrated_dossier:structuredDossier,dossier_assessment:dossierAssessment,canonical_source_role:sourceRole,source_page_identity_observed:true,elimfilters_equivalence_verified:false,applications_certified:0,publication_authorized:false,database_write_authorized:false,status:'REVIEW_REQUIRED',application_rows:[...fitments.values()],application_rows_count:fitments.size,european_application_rows:[...fitments.values()].filter(r=>r.origin_is_european).length,partial_application_rows:[...fitments.values()].filter(r=>!r.source_fields_complete).length,engine_missing_or_partial:[...fitments.values()].filter(x=>x.engine_status!=='ENGINE_CODES_PUBLISHED').length,application_source_warnings:skipped.length,application_links_observed:applicationLinks,unresolved_source_rows:unresolved,source_application_coverage:fitments.size?'PARTIAL_SOURCE_ROWS_CAPTURED':applicationLinks?'APPLICATION_LINKS_UNRESOLVED':'NO_STRUCTURED_APPLICATION_LINKS_OBSERVED',source_makes:[...makeSet],raw_structured_application_records:[...sourceLinks.values()],dimensions:technicalAxes.specifications,oem_codes:technicalAxes.oem_codes,competitor_codes:technicalAxes.competitor_codes,vehicle_applications_governance:technicalAxes.ld_vehicle_applications,technical_completeness:'INCOMPLETE_PENDING_CROSS_BRAND_AND_MARKET_VERIFICATION'};
  const out=path.join(dir,entry.sku+'.technical-review-integrated.json');
  fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'w'});
  results.push({sku:entry.sku,mann_part:entry.canonical_base_claim,applications:fitments.size,european_applications:[...fitments.values()].filter(r=>r.origin_is_european).length,partial_applications:[...fitments.values()].filter(r=>!r.source_fields_complete).length,incomplete_engine:result.engine_missing_or_partial,warnings:skipped.length,dossier_complete:dossierAssessment.complete,unresolved_axes:dossierAssessment.unresolved_axes,dimension_fields:Object.keys(dimensionsParsed.values).length,oem_codes:oeParsed.length,competitor_codes_verified:0,application_links:applicationLinks,source_coverage:result.source_application_coverage,report:path.basename(out)});
}
const output={status:'REVIEW_REQUIRED',captured_skus:results.length,certified:0,postgres_writes:0,publication:false,results};
fs.writeFileSync(path.join(dir,'technical-summary-integrated.json'),JSON.stringify(output,null,2)+'\n',{flag:'w'});
console.log(JSON.stringify(output,null,2));
if(results.length!==manifest.records.filter(r=>r.result==='EVIDENCE_CAPTURED').length)process.exitCode=2;
