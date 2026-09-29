#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {Pool}=require('pg');
const {normalizedApplication}=require('../../lib/catalog-application-governance.js');
const {applyVerifiedApplications}=require('../../lib/catalog-application-write-service.js');
const input=JSON.parse(fs.readFileSync(path.resolve('scripts/hermes/isuzu-us-application-batch-v158-official-oem.json'),'utf8'));
const apply=process.argv.includes('--apply');
const expected={EF92599:'P502599',EF92564:'P552564',EF92427:'P502427'};
const key=x=>JSON.stringify(normalizedApplication(x));
const merge=(a,b)=>{const out=[...(Array.isArray(a)?a:[])],seen=new Set(out.map(key));for(const x of(b||[])){const k=key(x);if(!seen.has(k)){seen.add(k);out.push(x)}}return out};
const count=a=>(a||[]).reduce((n,x)=>n+(x.year?1:Number(x.year_to)-Number(x.year_from)+1),0);
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw Error('DB URL required');
const local=/@(127\.0\.0\.1|localhost):/.test(cs);const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},max:1});const db=await pool.connect();
const report={phase:'ISUZU_V158_OFFICIAL_OEM_WINDOW_REVALIDATION',apply,database_write:false,rows:[]};const backups=[];
try{
 await db.query('BEGIN');await db.query("SET LOCAL lock_timeout='5s'");await db.query("SET LOCAL statement_timeout='60s'");
 for(const item of input.skus){
  const q=await db.query('select * from elimfilters_catalog where sku=$1 for update',[item.sku]);if(q.rowCount!==1)throw Error(item.sku+': missing/nonunique');
  const row=q.rows[0],want=expected[item.sku];if(row.codigo_base!==want||String(row.duty).toUpperCase()!=='HEAVY_DUTY')throw Error(item.sku+': canonical mismatch');
  backups.push(row);const merged=merge(row.equipment_applications,item.applications);
  await applyVerifiedApplications(db,{sku:item.sku,equipment_applications:merged,evidence:{authority:input.source,source_url:'https://www.isuzucv.com/en/app/site/pdf?file=FVGenuineCrossRef.pdf',metadata:{release:'ISUZU_V158_OFFICIAL_OEM_WINDOW_REVALIDATION',codigo_base:want,isuzu_oem:input.evidence[item.sku].isuzu_oem,official_window:input.evidence[item.sku].official_window,exact_positions:count(item.applications)}}});
  report.rows.push({sku:item.sku,status:'READY',added_ranges:merged.length-(row.equipment_applications||[]).length,exact_positions:count(item.applications)});
 }
 if(apply){fs.mkdirSync('hermes/backups/isuzu-v158',{recursive:true});const bp='hermes/backups/isuzu-v158/prewrite-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';fs.writeFileSync(bp,JSON.stringify(backups,null,2)+'\n',{flag:'wx'});report.backup_path=bp;await db.query('COMMIT');report.database_write=true}else await db.query('ROLLBACK');
}finally{db.release();await pool.end()}
report.summary={total:report.rows.length,ready:report.rows.length,added_ranges:report.rows.reduce((n,x)=>n+x.added_ranges,0),exact_positions:report.rows.reduce((n,x)=>n+x.exact_positions,0),database_write:report.database_write};
fs.mkdirSync('hermes/reports',{recursive:true});const fn='hermes/reports/isuzu-v158-official-oem-'+(apply?'apply':'dry-run')+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';fs.writeFileSync(fn,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary,null,2));console.log(fn);
