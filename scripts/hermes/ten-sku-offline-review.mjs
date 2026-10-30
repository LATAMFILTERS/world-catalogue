#!/usr/bin/env node
// Offline analysis of evidence captured by ten-sku-readonly-research.mjs.
// No database, network, publication or approval side effects.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {parseMannSummary,parseMannOeNumbers}=require('../../lib/mann-official-spec-verifier.js');
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
    if(!make||!model||!/^(19|20)\d{2}$/.test(year||'')||!/^\d{8,20}$/.test(id||'')){skipped.push('INCOMPLETE_SOURCE_ROW');unresolved.push({source_record:sourceRecord,reason:'SOURCE_FIELDS_NOT_IN_EXPECTED_FORMAT',status:'REVIEW_REQUIRED'});continue;}
    const engines=String(eng||'').split(',').map(x=>x.trim()).filter(Boolean);
    const row={make,year:Number(year),model,vehicle_type_id:id,engine_code_literal:eng||null,engine_codes:engines,engine_status:!engines.length?'ENGINE_NOT_PUBLISHED':engines.every(x=>/^[A-Z][A-Z0-9]{3,16}$/.test(x))?'ENGINE_CODES_PUBLISHED':'ENGINE_CODES_PARTIAL',source_url:entry.evidence.url,source_sha256:entry.evidence.sha256,status:'REVIEW_REQUIRED'};
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
  const result={sku:entry.sku,mann_part:entry.canonical_base_claim,source_title:title,evidence:entry.evidence,source_page_identity_observed:true,elimfilters_equivalence_verified:false,applications_certified:0,publication_authorized:false,database_write_authorized:false,status:'REVIEW_REQUIRED',application_rows:[...fitments.values()],application_rows_count:fitments.size,engine_missing_or_partial:[...fitments.values()].filter(x=>x.engine_status!=='ENGINE_CODES_PUBLISHED').length,application_source_warnings:skipped.length,application_links_observed:applicationLinks,unresolved_source_rows:unresolved,source_application_coverage:fitments.size?'PARTIAL_SOURCE_ROWS_CAPTURED':applicationLinks?'APPLICATION_LINKS_UNRESOLVED':'NO_STRUCTURED_APPLICATION_LINKS_OBSERVED',source_makes:[...makeSet],raw_structured_application_records:[...sourceLinks.values()],dimensions:technicalAxes.specifications,oem_codes:technicalAxes.oem_codes,competitor_codes:technicalAxes.competitor_codes,vehicle_applications_governance:technicalAxes.ld_vehicle_applications,technical_completeness:'INCOMPLETE_PENDING_CROSS_BRAND_AND_MARKET_VERIFICATION'};
  const out=path.join(dir,entry.sku+'.technical-review-v4.json');
  fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  results.push({sku:entry.sku,mann_part:entry.canonical_base_claim,applications:fitments.size,incomplete_engine:result.engine_missing_or_partial,warnings:skipped.length,dimension_fields:Object.keys(dimensionsParsed.values).length,oem_codes:oeParsed.length,competitor_codes_verified:0,application_links:applicationLinks,source_coverage:result.source_application_coverage,report:path.basename(out)});
}
const output={status:'REVIEW_REQUIRED',captured_skus:results.length,certified:0,postgres_writes:0,publication:false,results};
fs.writeFileSync(path.join(dir,'technical-summary-v4.json'),JSON.stringify(output,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(output,null,2));
if(results.length!==10)process.exitCode=2;
