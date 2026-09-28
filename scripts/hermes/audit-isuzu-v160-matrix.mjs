#!/usr/bin/env node
import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {Pool}=require('pg');const {normalizedApplication}=require('../../lib/catalog-application-governance.js');
const plan=JSON.parse(fs.readFileSync('hermes/reports/isuzu-v160-execution-plan.json','utf8'));const rows=[...(plan.ready||[]),...(plan.remap||[])];
const by=new Map();for(const r of rows){const sku=r.target_sku||r.sku;if(!by.has(sku))by.set(sku,[]);by.get(sku).push(r)}
const key=x=>JSON.stringify(normalizedApplication(x));const appOf=r=>({make:r.make,model:r.model,equipment:r.equipment,type:r.type,engine:r.engine,year:String(r.year)});
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw Error('DB URL required');const local=/@(127\.0\.0\.1|localhost):/.test(cs);
const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},max:1});const db=await pool.connect();const out=[];
try{for(const [sku,items] of by){const q=await db.query('select sku,duty,codigo_base,equipment_applications,vehicle_applications,enrichment_data from elimfilters_catalog where sku=$1',[sku]);if(q.rowCount!==1){out.push({sku,ok:false,error:'missing/nonunique'});continue}
 const r=q.rows[0],apps=r.equipment_applications||[],set=new Set(apps.map(key)),missing=items.filter(x=>!set.has(key(appOf(x))));
 const h=(await db.query('select md5($1::jsonb::text) h',[JSON.stringify(apps)])).rows[0].h,g=r.enrichment_data?.application_governance||{};const ev=await db.query("select application_kind from catalog_application_evidence where sku=$1 and payload_hash=$2 and verified is true",[sku,h]);const kinds=[...new Set(ev.rows.map(x=>x.application_kind))].sort();
 const hashOk=g.equipment_db_payload_hash===h&&g.engine_db_payload_hash===h;const ok=r.duty==='HEAVY_DUTY'&&missing.length===0&&(r.vehicle_applications||[]).length===0&&hashOk&&kinds.includes('ENGINE')&&kinds.includes('EQUIPMENT');
 out.push({sku,ok,missing_positions:missing.length,vehicle_rows:(r.vehicle_applications||[]).length,hash_ok:hashOk,evidence_kinds:kinds,equipment_count:apps.length});}}
finally{db.release();await pool.end()}
const summary={total:out.length,ok:out.filter(x=>x.ok).length,errors:out.filter(x=>!x.ok).length,total_missing:out.reduce((n,x)=>n+(x.missing_positions||0),0),vehicle_rows:out.reduce((n,x)=>n+(x.vehicle_rows||0),0),rows:out};
fs.writeFileSync('hermes/reports/isuzu-v160-matrix-audit.json',JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));if(summary.errors)process.exit(2);
