'use strict';
/* EL33593 — FRAM TG3593A controlled OEM + aftermarket reconciliation.
 * Runs in ELIMSERVER; source CSV must coexist with this script or be in C:\ELIMSERVER\el33593.
 * DRY_RUN by default. COMMIT requires --commit --confirm EL33593.
 */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {createRequire}=require('module');
const args=process.argv.slice(2);const has=x=>args.includes(x);
const get=x=>{const i=args.indexOf(x);return i>=0?args[i+1]:null};
const stop=x=>{throw new Error('STOP_REVIEW: '+x)};
const norm=x=>String(x??'').trim().replace(/\s+/g,' ');
const part=x=>norm(x).toUpperCase().replace(/[^A-Z0-9]/g,'');
const brand=x=>norm(x).toUpperCase().replace(/[^A-Z0-9]/g,'');
const key=x=>brand(x.manufacturer||x.brand)+'|'+part(x.code||x.part_number||x.reference);
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function csv(input){const output=[];let row=[],field='',quoted=false;for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quoted&&input[i+1]==='"'){field+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(field);field=''}else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&input[i+1]==='\n')i++;row.push(field);if(row.some(x=>norm(x)))output.push(row);row=[];field=''}else field+=c}if(quoted)stop('Malformed CSV quote');if(row.length||field){row.push(field);output.push(row)}return output}
(async()=>{
const repo=get('--repo')||'C:\\ELIMSERVER\\repos\\world-catalogue';const base='C:\\ELIMSERVER\\el33593';const input=get('--csv')||path.join(base,'TG3593A_interchanges.csv');const html=path.join(base,'fram_tg3593a.html');
if(!fs.existsSync(input)||!fs.existsSync(html))stop('FRAM official source CSV or HTML missing');
const htmlRaw=fs.readFileSync(html),csvRaw=fs.readFileSync(input);
if(!/TG3593A/i.test(htmlRaw.toString('utf8'))||!/competitorTable/i.test(htmlRaw.toString('utf8')))stop('FRAM TG3593A source identity not established');
const parsed=csv(csvRaw.toString('utf8').replace(/^\ufeff/,''));const header=parsed.shift().map(x=>norm(x).toLowerCase());if(header.join('|')!=='brand|partnumber')stop('Unexpected CSV columns '+header.join(','));
const req=createRequire(path.join(repo,'package.json'));
const {classifyReference}=req('./lib/cross-reference-classification.js');
const {assertGovernedCatalogPatch}=req('./lib/catalog-write-gateway');
const {Client}=req('pg');
const newO=[],newC=[],unknown=[],seen=new Set();
for(const row of parsed){if(row.length!==2)stop('Malformed reference row '+JSON.stringify(row));const maker=norm(row[0]),code=norm(row[1]);if(!maker||!code)continue;const e={manufacturer:maker,code,classification_source:'FRAM_TG3593A_OFFICIAL_INTERCHANGE_TABLE'};const k=key(e);if(seen.has(k))continue;seen.add(k);const type=classifyReference({manufacturer:maker});if(type==='OEM')newO.push({...e,classification:'OEM'});else if(type==='AFTERMARKET')newC.push({...e,classification:'COMPETITOR'});else unknown.push(e)}
const audit={sku:'EL33593',source_html_sha256:sha(htmlRaw),source_csv_sha256:sha(csvRaw),raw_rows:parsed.length,unique_pairs:seen.size,classified_oem:newO.length,classified_competitor:newC.length,unclassified:unknown.length,unclassified_brands:[...new Set(unknown.map(x=>x.manufacturer))].sort()};
fs.writeFileSync(path.join(base,'EL33593_interchange_classification_report.json'),JSON.stringify({...audit,unclassified_rows:unknown},null,2));
if(!process.env.PGPASSWORD)stop('PGPASSWORD missing');const commit=has('--commit')&&get('--confirm')==='EL33593';if(has('--commit')&&!commit)stop('Commit requires --commit --confirm EL33593');
const db=new Client({host:process.env.PGHOST||'localhost',port:Number(process.env.PGPORT||5432),user:process.env.PGUSER||'postgres',password:process.env.PGPASSWORD,database:process.env.PGDATABASE||'catalogo_elimfilters'});
let complete=false;const report={...audit,mode:commit?'COMMIT':'DRY_RUN_ROLLBACK'};
await db.connect();try{await db.query('BEGIN');const data=await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 AND id=$2 FOR UPDATE',['EL33593',63749]);if(data.rowCount!==1)stop('SKU id mismatch');const old=data.rows[0];if(old.codigo_base!=='PH3593A'||old.duty!=='LIGHT_DUTY'||!old.catalog_active||old.technology!=='SYNTRAX™')stop('Identity guard failed');if(!Array.isArray(old.vehicle_applications)||old.vehicle_applications.length!==600)stop('600 verified applications prerequisite failed');
const existingO=Array.isArray(old.oem_codes)?old.oem_codes:[],existingC=Array.isArray(old.competitor_codes)?old.competitor_codes:[];
if(existingC.length<10)stop('Existing competitor references unexpectedly missing');
const merge=(existing,candidates)=>{const out=[...existing],keys=new Set(existing.map(key));for(const e of candidates){const k=key(e);if(!keys.has(k)){out.push(e);keys.add(k)}}return out};
const nextO=merge(existingO,newO),nextC=merge(existingC,newC);
const oldKeys=[...existingO,...existingC].map(key);const all=new Set([...nextO,...nextC].map(key));if(oldKeys.some(k=>!all.has(k)))stop('Existing references would be lost');
const overlap=new Set(nextO.map(key));if(nextC.some(x=>overlap.has(key(x))))stop('OEM/competitor duplicate pair requires review');
const patch={oem_codes:nextO,competitor_codes:nextC};
assertGovernedCatalogPatch(old,patch);
const snapshot=path.join(base,'EL33593_refs_before_'+sha(csvRaw).slice(0,12)+'.json');fs.writeFileSync(snapshot,JSON.stringify({sku:'EL33593',source_csv_sha256:sha(csvRaw),before:{oem_codes:existingO,competitor_codes:existingC},after:patch},null,2));
const q=await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$1::jsonb, competitor_codes=$2::jsonb WHERE id=63749 RETURNING oem_codes,competitor_codes,vehicle_applications,technology',[JSON.stringify(nextO),JSON.stringify(nextC)]);const n=q.rows[0];
if(n.oem_codes.length!==nextO.length||n.competitor_codes.length!==nextC.length||n.vehicle_applications.length!==600||n.technology!=='SYNTRAX™')stop('Post-write integrity validation failed');
report.before={oem:existingO.length,competitor:existingC.length,applications:600};report.after={oem:nextO.length,competitor:nextC.length,applications:n.vehicle_applications.length};report.added={oem:nextO.length-existingO.length,competitor:nextC.length-existingC.length};report.snapshot=snapshot;
await db.query(commit?'COMMIT':'ROLLBACK');complete=true;report.status=commit?'COMMITTED':'VALIDATED_NO_CHANGE';
}catch(e){if(!complete)await db.query('ROLLBACK').catch(()=>{});report.status='BLOCKED_ROLLBACK';report.error=e.message;process.exitCode=1}finally{await db.end()}console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error('BLOCKED: '+e.message);process.exitCode=1});