#!/usr/bin/env node
// HERMES: bounded autonomous research of 10 active LD MANN-backed SKUs.
// Read-only PostgreSQL via installed psql + pgpass; HTTP GET official MANN only.
// Creates review evidence locally; NEVER updates the catalogue or approves records.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { originGroupOf } from './ld-origin-group.mjs';

const root=process.cwd();
const cli=process.argv.slice(2);
const arg=name=>{const i=cli.indexOf(name);return i<0?null:cli[i+1]||null;};
const auditAll=cli.includes('--audit-mann-candidates');
const europeanBatch=cli.includes('--european-batch')||auditAll;
const count=europeanBatch?Math.min(100,Math.max(1,Number(arg('--limit')||25))):10;
const offset=europeanBatch?Math.max(0,Number(arg('--offset')||0)):0;
if(!Number.isSafeInteger(count)||!Number.isSafeInteger(offset))throw Error('INVALID_BATCH_BOUNDS');
const classificationFile=arg('--from-classification');
const csvFile=arg('--from-csv');
const autoOrigin=europeanBatch&&!classificationFile;
const folder=path.resolve(root,auditAll?('out/hermes-mann-audit/batch-'+offset+'-'+count):europeanBatch?('out/hermes-european-ld/batch-'+offset+'-'+count):'out/hermes-ten-sku');
fs.mkdirSync(folder,{recursive:true});
const psql=process.env.PSQL_PATH || (process.platform==='win32' ? 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' : 'psql');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const validSku=s=>/^(EA3|EL3|EF3|EC3)[A-Z0-9]{3,20}$/.test(s);
const codeNorm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const urlFor=(code,locale)=>'https://www.mann-filter.com/'+locale+'/catalog/search-results/product.html/'+encodeURIComponent(String(code).toLowerCase().replace(/\s+/g,'')).replace(/%2F/gi,'/')+'_mann-filter.html';
const shapeClause=auditAll?'true':"upper(codigo_base) ~ '^(C|CU|CUK|HU|W|WK|PU|FP|LX|E)[A-Z0-9/ ]{2,25}$'";
const sql="BEGIN READ ONLY; COPY (SELECT sku, codigo_base, vehicle_applications::text, canonical_source_brand FROM public.elimfilters_catalog WHERE catalog_active = true AND duty = 'LIGHT_DUTY' AND left(upper(sku),3) IN ('EA3','EL3','EF3','EC3') AND codigo_base IS NOT NULL AND upper(coalesce(canonical_source_brand,'')) LIKE 'MANN%' AND ("+shapeClause+") ORDER BY sku) TO STDOUT WITH (FORMAT csv); ROLLBACK;";
const csvLine=row=>{const fields=[];let value='',quoted=false;for(let i=0;i<row.length;i++){const c=row[i];if(c==='"'){if(quoted&&row[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){fields.push(value);value='';}else value+=c;}fields.push(value);return fields;};
let pairs;
if(csvFile){
  const csv=fs.readFileSync(path.resolve(csvFile),'utf8').replace(/^\\uFEFF/,'');
  const lines=csv.split(/\\r?\\n/).filter(Boolean);
  const cols=csvLine(lines.shift()).map(x=>x.trim().toLowerCase());
  const skuIndex=cols.indexOf('sku'),codeIndex=cols.indexOf('codigo_base');
  if(skuIndex<0||codeIndex<0)throw Error('CSV_REQUIRES_SKU_AND_CODIGO_BASE');
  pairs=lines.map(csvLine).map(fields=>({sku:fields[skuIndex],code:fields[codeIndex],origin:{group:'UNKNOWN'},brand:'MANN_CANDIDATE'})).filter(x=>validSku(x.sku)&&x.code);
}else{
  const p=spawnSync(psql,['-h','127.0.0.1','-p','5432','-U',process.env.PGUSER||'postgres','-d','catalogo_elimfilters','-w','-X','-A','-q','-v','ON_ERROR_STOP=1'],{input:sql,encoding:'utf8',timeout:90000,maxBuffer:64*1024*1024,env:{...process.env,PGCONNECT_TIMEOUT:'5'}});
  if(p.status!==0)throw Error('PSQL_READ_ONLY_FAILED status='+p.status+' signal='+p.signal+' error='+String(p.error?.message||'')+' stderr='+String(p.stderr||'').slice(0,500));
  pairs=p.stdout.split(/\\r?\\n/).map(x=>x.trim()).filter(x=>x&&x!=='BEGIN'&&x!=='ROLLBACK').map(row=>{const fields=csvLine(row);if(fields.length!==4)return null;let apps=[];try{apps=JSON.parse(fields[2]||'[]');}catch{}return {sku:fields[0],code:fields[1],origin:originGroupOf(apps),brand:fields[3]};}).filter(Boolean).filter(x=>validSku(x.sku));
}
if(!pairs.length)throw Error('NO_ACTIVE_LD_CANDIDATES');
let selected=pairs;
if(europeanBatch){
  if(auditAll)selected=pairs;
  else if(classificationFile){const classification=JSON.parse(fs.readFileSync(path.resolve(classificationFile),'utf8'));if(!Array.isArray(classification.rows))throw Error('INVALID_CLASSIFICATION');const europe=new Set(classification.rows.filter(r=>['MANN_SAME_DIGITS','MANN_OTHER_DIGITS'].includes(r.cls)).map(r=>r.sku));selected=pairs.filter(r=>europe.has(r.sku));}
  else selected=pairs.filter(r=>/^MANN/i.test(r.brand||'')&&r.origin.group==='EUROPEAN');
  selected=selected.slice(offset,offset+count);
}
const results=[];
for(const entry of selected){
  // Do not silently associate several source identities with one SKU.
  const {sku,code}=entry;
  const family=sku.slice(0,3);
  const item={sku,origin_group_from_unverified_catalog:entry.origin?.group||'UNKNOWN',origin_provisional:true,canonical_base_claim:code,result:'REVIEW_REQUIRED',identity_verified:false,application_certified:false,publication_authorized:false,database_write:false,attempts:[]};
  if(!/^[A-Z0-9 /()-]{2,35}$/i.test(code)){item.result='INVALID_MANN_CODE_SHAPE';results.push(item);fs.writeFileSync(path.join(folder,sku+'.review.json'),JSON.stringify(item,null,2)+'\n');continue;}
  for(const locale of ['us-en','en']){
    const url=urlFor(code,locale);
    try{
      const ctrl=new AbortController();
      const timer=setTimeout(()=>ctrl.abort(),12000);
      let res;
      try{res=await fetch(url,{signal:ctrl.signal,headers:{'user-agent':'Mozilla/5.0 (compatible; HERMES-readonly/1.0)','accept':'text/html'}});}
      finally{clearTimeout(timer);}
      item.attempts.push({url,http_status:res.status});
      if(!res.ok)continue;
      const body=await res.text();
      const title=/<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1]?.replace(/<[^>]*>/g,' ').trim()||'';
      if(!/MANN.FILTER/i.test(title)||!codeNorm(title).includes(codeNorm(code))){item.result='SOURCE_IDENTITY_MISMATCH';continue;}
      const familyOk=family==='EL3'?/oil filter/i.test(title):
        family==='EF3'?/fuel filter/i.test(title):
        family==='EC3'?/cabin|interior/i.test(title):
        /air filter/i.test(title)&&!/cabin|interior/i.test(title);
      if(!familyOk){item.result='FAMILY_MISMATCH';continue;}
      const stored=path.join(folder,sku+'.mann.html');
      fs.writeFileSync(stored,body,{flag:'wx'});
      item.result='EVIDENCE_CAPTURED';
      item.identity_verified=false; // Product page does NOT prove ELIMFILTERS equivalence.
      item.evidence={url,sha256:sha(body),bytes:Buffer.byteLength(body),title,file:path.basename(stored),captured_at:new Date().toISOString()};
      break;
    }catch(e){item.attempts.push({url,error:String(e.message||e)});}
    finally{await sleep(350);}
  }
  results.push(item);
  fs.writeFileSync(path.join(folder,sku+'.review.json'),JSON.stringify(item,null,2)+'\n',{flag:'wx'});
}
const manifest={eligible_source_brand_candidates:pairs.length,verified_mann_product_pages:results.filter(r=>r.result==='EVIDENCE_CAPTURED').length,audit_scope:auditAll?'ALL_MANN_BRAND_CANDIDATES':null,origin_selection_basis:csvFile?'CSV_MANN_CANDIDATES_ORIGIN_UNKNOWN':autoOrigin?'PROVISIONAL_CATALOG_APPLICATIONS':'EXISTING_CLASSIFICATION',eligible_provisional_count:europeanBatch?pairs.filter(r=>/^MANN/i.test(r.brand||'')&&r.origin.group==='EUROPEAN').length:null,classification_source:europeanBatch?classificationFile:null,selection:auditAll?'ALL_MANN_BRAND_LD_CANDIDATES':europeanBatch?'EUROPEAN_CLASSIFIED_MANN_ONLY':'PILOT',offset,created_at:new Date().toISOString(),mode:'READ_ONLY_RESEARCH',target:count,captured:results.filter(r=>r.result==='EVIDENCE_CAPTURED').length,attempted:results.length,approved:0,published:0,postgres_writes:0,records:results};
fs.writeFileSync(path.join(folder,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({target:count,total_mann_brand_candidates:pairs.length,captured:manifest.captured,attempted:manifest.attempted,report:path.join(folder,'manifest.json')},null,2));
if(manifest.attempted!==selected.length)process.exitCode=2;
