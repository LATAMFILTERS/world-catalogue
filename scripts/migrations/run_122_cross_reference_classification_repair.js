'use strict';
const fs=require('fs'),path=require('path'),{Pool}=require('pg');
const { classifyReference, normalizeBrandKey }=require('../../lib/cross-reference-classification');
const { assertCrossReferenceReclassification }=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const ROOT='C:/Users/ELIMSERVER/world-catalogue-pg-gap';
const REPORT=path.join(ROOT,'scripts/candidates/cross_reference_classification_repair_20260927.json');
const codeOf=x=>String(x?.code||x?.reference||'').trim();
const keyOf=x=>normalizeBrandKey(x?.manufacturer||x?.brand)+'|'+codeOf(x).toUpperCase().replace(/[^A-Z0-9]/g,'');
function crossColumnDuplicateCount(oemCodes, competitorCodes){
 const normCode=ref=>codeOf(ref).toUpperCase().replace(/[^A-Z0-9]/g,'');
 const o=new Set((Array.isArray(oemCodes)?oemCodes:[]).map(normCode).filter(Boolean));
 const c=new Set((Array.isArray(competitorCodes)?competitorCodes:[]).map(normCode).filter(Boolean));
 let n=0;for(const code of o)if(c.has(code))n++;return n;
}
function classifyArrays(row){
 const groups=new Map();
 for(const [origin,arr] of [['OEM',row.oem_codes],['COMPETITOR',row.competitor_codes]]){
  for(const ref of (Array.isArray(arr)?arr:[])){
   const code=codeOf(ref).toUpperCase().replace(/[^A-Z0-9]/g,'');
   const groupKey=code||('__EMPTY__'+groups.size);
   if(!groups.has(groupKey))groups.set(groupKey,[]);
   groups.get(groupKey).push({origin,ref,cls:classifyReference(ref)});
  }
 }
 const oem=[],competitor=[],seenO=new Set(),seenC=new Set();
 let movedOemToComp=0,movedCompToOem=0,labeled=0,unknown=0,ambiguousGroups=0;
 for(const entries of groups.values()){
  const known=new Set(entries.map(x=>x.cls).filter(x=>x!=='UNKNOWN'));
  const hasUnknown=entries.some(x=>x.cls==='UNKNOWN');
  const origins=new Set(entries.map(x=>x.origin));
  const ambiguous=known.size>1 || (hasUnknown && origins.size>1);
  if(ambiguous) ambiguousGroups++;
  for(const entry of entries){
   let target=entry.origin;
   let out={...entry.ref};
   if(!ambiguous && entry.cls==='OEM'){target='OEM';out.classification='OEM';out.classification_source='CROSS_REFERENCE_BRAND_TAXONOMY_20260927';labeled++;}
   else if(!ambiguous && entry.cls==='AFTERMARKET'){target='COMPETITOR';out.classification='AFTERMARKET';out.classification_source='CROSS_REFERENCE_BRAND_TAXONOMY_20260927';labeled++;}
   else if(entry.cls==='UNKNOWN')unknown++;
   if(entry.origin==='OEM'&&target==='COMPETITOR')movedOemToComp++;
   if(entry.origin==='COMPETITOR'&&target==='OEM')movedCompToOem++;
   const k=keyOf(out);
   if(target==='OEM'){if(!seenO.has(k)){seenO.add(k);oem.push(out);}}
   else {if(!seenC.has(k)){seenC.add(k);competitor.push(out);}}
  }
 }
 return {oem,competitor,movedOemToComp,movedCompToOem,labeled,unknown,ambiguousGroups};
}
(async()=>{
 const pool=new Pool({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:1});
 const db=await pool.connect();
 const report={migration:'122_CROSS_REFERENCE_CLASSIFICATION_REPAIR',mode:APPLY?'apply':'dry-run',rows_scanned:0,rows_changed:0,moved_oem_to_competitor:0,moved_competitor_to_oem:0,known_refs_labeled:0,unknown_refs_preserved:0,ambiguous_code_groups_preserved:0,blocked:[],samples:[]};
 try{
  await db.query('BEGIN');
  const rows=(await db.query('select id,sku,duty,oem_codes,competitor_codes from elimfilters_catalog order by id')).rows;
  report.rows_scanned=rows.length;
  for(const row of rows){
   const x=classifyArrays(row);
   report.moved_oem_to_competitor+=x.movedOemToComp;report.moved_competitor_to_oem+=x.movedCompToOem;report.known_refs_labeled+=x.labeled;report.unknown_refs_preserved+=x.unknown;report.ambiguous_code_groups_preserved+=x.ambiguousGroups;
   const patch={oem_codes:x.oem,competitor_codes:x.competitor};
   const oldCross=crossColumnDuplicateCount(row.oem_codes,row.competitor_codes);
   const newCross=crossColumnDuplicateCount(x.oem,x.competitor);
   if(newCross>oldCross){report.blocked.push({sku:row.sku,reasons:['CROSS_COLUMN_DUPLICATES_WOULD_INCREASE'],old_cross:oldCross,new_cross:newCross});continue}
   try{assertCrossReferenceReclassification(row,patch);}catch(e){report.blocked.push({sku:row.sku,reasons:e.validation?.reasons||[e.message]});continue}
   const beforeO=JSON.stringify(Array.isArray(row.oem_codes)?row.oem_codes:[]),beforeC=JSON.stringify(Array.isArray(row.competitor_codes)?row.competitor_codes:[]);
   const afterO=JSON.stringify(x.oem),afterC=JSON.stringify(x.competitor);
   if(beforeO!==afterO||beforeC!==afterC){
    report.rows_changed++;
    if(report.samples.length<30)report.samples.push({sku:row.sku,moved_oem_to_competitor:x.movedOemToComp,moved_competitor_to_oem:x.movedCompToOem});
    if(APPLY)await db.query('update elimfilters_catalog set oem_codes=$1::jsonb,competitor_codes=$2::jsonb where id=$3',[afterO,afterC,row.id]);
   }
  }
  report.blocked_count=report.blocked.length;
  fs.writeFileSync(path.join(ROOT,'scripts/candidates/cross_reference_classification_blocked_20260927.json'),JSON.stringify(report.blocked,null,2)+'\n');
  if(APPLY)await db.query('COMMIT');else await db.query('ROLLBACK');
  report.transaction=APPLY?'COMMIT':'ROLLBACK';
  fs.writeFileSync(REPORT,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({...report,blocked:report.blocked.slice(0,20)},null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{};report.transaction='ROLLBACK';report.error=e.message;fs.writeFileSync(REPORT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));process.exitCode=1}
 finally{db.release();await pool.end()}
})();