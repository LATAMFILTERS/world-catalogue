#!/usr/bin/env node
// HERMES: bounded autonomous research of 10 active LD MANN-backed SKUs.
// Read-only PostgreSQL via installed psql + pgpass; HTTP GET official MANN only.
// Creates review evidence locally; NEVER updates the catalogue or approves records.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const cli=process.argv.slice(2);
const arg=name=>{const i=cli.indexOf(name);return i<0?null:cli[i+1]||null;};
const europeanBatch=cli.includes('--european-batch');
const count=europeanBatch?Math.min(100,Math.max(1,Number(arg('--limit')||25))):10;
const offset=europeanBatch?Math.max(0,Number(arg('--offset')||0)):0;
if(!Number.isSafeInteger(count)||!Number.isSafeInteger(offset))throw Error('INVALID_BATCH_BOUNDS');
const classificationFile=arg('--from-classification');
if(europeanBatch&&!classificationFile)throw Error('EUROPEAN_BATCH_REQUIRES_LD_CLASSIFICATION');
const folder=path.resolve(root,europeanBatch?('out/hermes-european-ld/batch-'+offset+'-'+count):'out/hermes-ten-sku');
fs.mkdirSync(folder,{recursive:true});
const psql=process.env.PSQL_PATH || (process.platform==='win32' ? 'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe' : 'psql');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const validSku=s=>/^(EA3|EL3|EF3|EC3)[A-Z0-9]{3,20}$/.test(s);
const codeNorm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const urlFor=(code,locale)=>'https://www.mann-filter.com/'+locale+'/catalog/search-results/product.html/'+encodeURIComponent(String(code).toLowerCase().replace(/\s+/g,'')).replace(/%2F/gi,'/')+'_mann-filter.html';
const sql="BEGIN READ ONLY; COPY (SELECT sku, codigo_base FROM public.elimfilters_catalog WHERE catalog_active = true AND duty = 'LIGHT_DUTY' AND left(upper(sku),3) IN ('EA3','EL3','EF3','EC3') AND codigo_base IS NOT NULL AND upper(codigo_base) ~ '^(C|CU|CUK|HU|W|WK|PU|FP|LX|E)[A-Z0-9/ ]{2,25}$' ORDER BY sku) TO STDOUT WITH (FORMAT csv); ROLLBACK;";
const p=spawnSync(psql,['-h','127.0.0.1','-p','5432','-U',process.env.PGUSER||'postgres','-d','catalogo_elimfilters','-w','-X','-A','-q','-v','ON_ERROR_STOP=1'],{input:sql,encoding:'utf8',timeout:30000,maxBuffer:8*1024*1024,env:{...process.env,PGCONNECT_TIMEOUT:'5'}});
if(p.status!==0)throw Error('PSQL_READ_ONLY_FAILED: '+String(p.stderr).slice(0,350));
const pairs=p.stdout.split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&x!=='BEGIN'&&x!=='ROLLBACK').map(row=>{const m=/^"?(EA3|EL3|EF3|EC3)[A-Z0-9]{3,20}"?,("[^"]+"|[^,]+)$/.exec(row);return m?{sku:row.split(',')[0].replaceAll('"',''),code:m[2].replace(/^"|"$/g,'')}:null}).filter(Boolean).filter(x=>validSku(x.sku));
if(!pairs.length)throw Error('NO_ACTIVE_LD_CANDIDATES');
let selected=pairs;
if(europeanBatch){
  const classification=JSON.parse(fs.readFileSync(path.resolve(classificationFile),'utf8'));
  if(!Array.isArray(classification.rows))throw Error('INVALID_CLASSIFICATION');
  const europe=new Set(classification.rows.filter(r=>['MANN_SAME_DIGITS','MANN_OTHER_DIGITS'].includes(r.cls)).map(r=>r.sku));
  selected=pairs.filter(r=>europe.has(r.sku)).slice(offset);
}
const results=[];
for(const entry of selected){
  if(results.filter(r=>r.result==='EVIDENCE_CAPTURED').length>=count)break;
  // Do not silently associate several source identities with one SKU.
  const {sku,code}=entry;
  const family=sku.slice(0,3);
  const item={sku,canonical_base_claim:code,result:'REVIEW_REQUIRED',identity_verified:false,application_certified:false,publication_authorized:false,database_write:false,attempts:[]};
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
const manifest={classification_source:europeanBatch?classificationFile:null,selection:europeanBatch?'EUROPEAN_CLASSIFIED_MANN_ONLY':'PILOT',offset,created_at:new Date().toISOString(),mode:'READ_ONLY_RESEARCH',target:count,captured:results.filter(r=>r.result==='EVIDENCE_CAPTURED').length,attempted:results.length,approved:0,published:0,postgres_writes:0,records:results};
fs.writeFileSync(path.join(folder,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({target:count,captured:manifest.captured,attempted:manifest.attempted,report:path.join(folder,'manifest.json')},null,2));
if(manifest.captured<count)process.exitCode=2;
