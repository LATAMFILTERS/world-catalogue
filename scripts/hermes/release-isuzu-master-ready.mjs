#!/usr/bin/env node
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {Pool}=require('pg');
const {normalizedApplication}=require('../../lib/catalog-application-governance.js');
const {applyVerifiedApplications}=require('../../lib/catalog-application-write-service.js');

const apply=process.argv.includes('--apply');
const control='hermes/reports/isuzu-v160-control-plane.json';
if(!fs.existsSync(control)) throw new Error('Run isuzu-v160-control-plane.mjs first');
const doc=JSON.parse(fs.readFileSync(control,'utf8'));
const ready=doc.rows.filter(x=>x.write_allowed===true&&x.lane==='READY_TO_IMPLEMENT');
if(!ready.length) throw new Error('No READY_TO_IMPLEMENT tuples');

const key=x=>JSON.stringify(normalizedApplication(x));
const groups=new Map();
for(const r of ready){
 if(!groups.has(r.sku)) groups.set(r.sku,{base:r.base,rows:[],release:r.release});
 groups.get(r.sku).rows.push(r);
}
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
if(!cs) throw new Error('DB URL required');
const local=/@(127\.0\.0\.1|localhost):/.test(cs);
const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},max:1});
const db=await pool.connect();
const report={phase:'ISUZU_MASTER_READY',apply,database_write:false,rows:[]};
const backups=[];
try{
 await db.query('BEGIN');
 await db.query("SET LOCAL lock_timeout='5s'");
 await db.query("SET LOCAL statement_timeout='60s'");
 for(const [sku,g] of groups){
  const q=await db.query('select * from elimfilters_catalog where sku=$1 for update',[sku]);
  if(q.rowCount!==1) throw new Error(sku+': missing/nonunique');
  const row=q.rows[0];
  if(row.codigo_base!==g.base||row.duty!=='HEAVY_DUTY') throw new Error(sku+': canonical mismatch');
  backups.push(row);
  const existing=Array.isArray(row.equipment_applications)?row.equipment_applications:[];
  const seen=new Set(existing.map(key));
  const adds=g.rows.map(r=>({make:r.make,model:r.model,equipment:r.equipment,type:r.type,engine:r.engine,year:String(r.year)}));
  const merged=[...existing];
  let added=0;
  for(const x of adds){const k=key(x);if(!seen.has(k)){seen.add(k);merged.push(x);added++;}}
  await applyVerifiedApplications(db,{sku,equipment_applications:merged,evidence:{
   authority:g.release||'ISUZU_MASTER_MATRIX',
   source_url:'https://www.isuzucv.com/en/fseries/fseries_specifications',
   metadata:{release:g.release||'ISUZU_MASTER_MATRIX',exact_positions:g.rows.length,canonical_base:g.base}
  }});
  report.rows.push({sku,ready_positions:g.rows.length,added_ranges:added});
 }
 if(apply){
  fs.mkdirSync('hermes/backups/isuzu-master',{recursive:true});
  const bp='hermes/backups/isuzu-master/prewrite-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';
  fs.writeFileSync(bp,JSON.stringify(backups,null,2)+'\n',{flag:'wx'});
  report.backup_path=bp;await db.query('COMMIT');report.database_write=true;
 }else await db.query('ROLLBACK');
}finally{db.release();await pool.end()}
report.summary={skus:report.rows.length,ready_positions:ready.length,added_ranges:report.rows.reduce((n,x)=>n+x.added_ranges,0),database_write:report.database_write};
fs.mkdirSync('hermes/reports',{recursive:true});
const fn='hermes/reports/isuzu-master-ready-'+(apply?'apply':'dry-run')+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';
fs.writeFileSync(fn,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.summary,null,2));
console.log(fn);
