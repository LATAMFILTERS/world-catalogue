#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {Pool}=require('pg');
const {normalizedApplication}=require('../../lib/catalog-application-governance.js');

const input=JSON.parse(fs.readFileSync(path.resolve('scripts/hermes/isuzu-us-application-batch-v157-multi.json'),'utf8'));
const expected={EL80428:'P550428',EF93009:'P553009',EL82597:'P502597'};
const key=x=>JSON.stringify(normalizedApplication(x));
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw new Error('DB URL required');
const local=/@(127\.0\.0\.1|localhost):/.test(cs);const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},max:1});
const db=await pool.connect();const rows=[];
try{
 for(const item of input.skus){
  const q=await db.query('select sku,codigo_base,duty,equipment_applications,vehicle_applications,enrichment_data from elimfilters_catalog where sku=$1',[item.sku]);
  if(q.rowCount!==1){rows.push({sku:item.sku,ok:false,error:'missing/nonunique'});continue}
  const r=q.rows[0],apps=r.equipment_applications||[],set=new Set(apps.map(key)),missing=item.applications.filter(x=>!set.has(key(x)));
  const h=(await db.query('select md5($1::jsonb::text) h',[JSON.stringify(apps)])).rows[0].h,g=r.enrichment_data?.application_governance||{};
  const ev=await db.query("select application_kind from catalog_application_evidence where sku=$1 and payload_hash=$2 and verified is true",[item.sku,h]);
  const kinds=[...new Set(ev.rows.map(x=>x.application_kind))].sort();
  const hashOk=g.equipment_db_payload_hash===h&&g.engine_db_payload_hash===h;
  const ok=r.codigo_base===expected[item.sku]&&r.duty==='HEAVY_DUTY'&&missing.length===0&&(r.vehicle_applications||[]).length===0&&hashOk&&kinds.includes('EQUIPMENT')&&kinds.includes('ENGINE');
  rows.push({sku:item.sku,ok,missing_ranges:missing.length,vehicle_rows:(r.vehicle_applications||[]).length,hash_ok:hashOk,evidence_kinds:kinds,equipment_count:apps.length});
 }
}finally{db.release();await pool.end()}
const summary={total:rows.length,ok:rows.filter(x=>x.ok).length,errors:rows.filter(x=>!x.ok).length,total_missing:rows.reduce((n,x)=>n+(x.missing_ranges||0),0),vehicle_rows:rows.reduce((n,x)=>n+(x.vehicle_rows||0),0),rows};
console.log(JSON.stringify(summary,null,2));if(summary.errors)process.exit(2);
