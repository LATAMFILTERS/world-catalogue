#!/usr/bin/env node
import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {Pool}=require('pg');
const {normalizedApplication}=require('../../lib/catalog-application-governance.js');
const {applyVerifiedApplications}=require('../../lib/catalog-application-write-service.js');
const plan=JSON.parse(fs.readFileSync('hermes/reports/isuzu-v160-execution-plan.json','utf8'));
if(plan.errors?.length)throw Error('Execution plan has errors');
const apply=process.argv.includes('--apply');
const direct=[...(plan.ready||[]),...(plan.remap||[])];
const group=new Map();for(const r of direct){const sku=r.target_sku||r.sku;if(!group.has(sku))group.set(sku,[]);group.get(sku).push(r)}
const key=x=>JSON.stringify(normalizedApplication(x));
const appOf=r=>({make:r.make,model:r.model,equipment:r.equipment,type:r.type,engine:r.engine,year:String(r.year)});
const merge=(a,b)=>{const out=[...(a||[])],seen=new Set(out.map(key));for(const x of b){const k=key(x);if(!seen.has(k)){seen.add(k);out.push(x)}}return out};
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw Error('DB URL required');
const local=/@(127\.0\.0\.1|localhost):/.test(cs);const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},max:1});const db=await pool.connect();
const report={phase:'ISUZU_V160_MATRIX_RELEASE',apply,database_write:false,rows:[]};const backups=[];
try{await db.query('BEGIN');await db.query("SET LOCAL lock_timeout='5s'");await db.query("SET LOCAL statement_timeout='60s'");
 for(const [sku,rows] of group){const q=await db.query('select * from elimfilters_catalog where sku=$1 for update',[sku]);if(q.rowCount!==1)throw Error(sku+': missing/nonunique');
  const row=q.rows[0];if(String(row.duty).toUpperCase()!=='HEAVY_DUTY')throw Error(sku+': target is not HEAVY_DUTY');
  const expectedBases=[...new Set(rows.map(x=>x.target_codigo_base).filter(Boolean))];if(expectedBases.length===1&&row.codigo_base!==expectedBases[0])throw Error(sku+': base mismatch '+row.codigo_base+' != '+expectedBases[0]);
  backups.push(row);const apps=rows.map(appOf),merged=merge(row.equipment_applications||[],apps);
  const authorities=[...new Set(rows.map(x=>x.evidence_authority).filter(Boolean))];
  const refs=[...new Set(rows.map(x=>x.evidence_reference).filter(Boolean))];
  await applyVerifiedApplications(db,{sku,equipment_applications:merged,evidence:{authority:'ISUZU_V160_MATRIX:'+authorities.join('+'),source_url:rows.find(x=>x.evidence_url)?.evidence_url||null,metadata:{release:'ISUZU_V160_MATRIX_RELEASE',decision_ids:rows.map(x=>x.id),references:refs,exact_positions:rows.length}}});
  report.rows.push({sku,status:'READY',exact_positions:rows.length,added_ranges:merged.length-(row.equipment_applications||[]).length});
 }
 if(apply){fs.mkdirSync('hermes/backups/isuzu-v160',{recursive:true});const bp='hermes/backups/isuzu-v160/prewrite-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';fs.writeFileSync(bp,JSON.stringify(backups,null,2)+'\n',{flag:'wx'});report.backup_path=bp;await db.query('COMMIT');report.database_write=true}else await db.query('ROLLBACK');
}finally{db.release();await pool.end()}
report.summary={skus:report.rows.length,exact_positions:report.rows.reduce((n,x)=>n+x.exact_positions,0),database_write:report.database_write};
fs.mkdirSync('hermes/reports',{recursive:true});const fn='hermes/reports/isuzu-v160-matrix-release-'+(apply?'apply':'dry-run')+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';fs.writeFileSync(fn,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary,null,2));console.log(fn);
