#!/usr/bin/env node
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {Pool}=require('pg');
const {normalizedApplication}=require('../../lib/catalog-application-governance.js');

const doc=JSON.parse(fs.readFileSync('hermes/reports/isuzu-v160-control-plane.json','utf8'));
const ready=doc.rows.filter(x=>x.write_allowed===true&&x.lane==='READY_TO_IMPLEMENT');
const bySku=new Map();
for(const r of ready){if(!bySku.has(r.sku))bySku.set(r.sku,[]);bySku.get(r.sku).push(r);}
const key=x=>JSON.stringify(normalizedApplication(x));
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
if(!cs) throw new Error('DB URL required');
const local=/@(127\.0\.0\.1|localhost):/.test(cs);
const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},max:1});
const db=await pool.connect();const rows=[];
try{
 for(const [sku,want] of bySku){
  const q=await db.query('select sku,codigo_base,duty,equipment_applications,vehicle_applications,enrichment_data from elimfilters_catalog where sku=$1',[sku]);
  if(q.rowCount!==1){rows.push({sku,ok:false,error:'missing/nonunique'});continue}
  const r=q.rows[0],apps=r.equipment_applications||[],set=new Set(apps.map(key));
  const missing=want.filter(x=>!set.has(key({make:x.make,model:x.model,equipment:x.equipment,type:x.type,engine:x.engine,year:String(x.year)})));
  const h=(await db.query('select md5($1::jsonb::text) h',[JSON.stringify(apps)])).rows[0].h;
  const g=r.enrichment_data?.application_governance||{};
  const ev=await db.query("select application_kind from catalog_application_evidence where sku=$1 and payload_hash=$2 and verified is true",[sku,h]);
  const kinds=[...new Set(ev.rows.map(x=>x.application_kind))].sort();
  const base=want[0]?.base;
  const hashOk=g.equipment_db_payload_hash===h&&g.engine_db_payload_hash===h;
  const ok=r.codigo_base===base&&r.duty==='HEAVY_DUTY'&&missing.length===0&&(r.vehicle_applications||[]).length===0&&hashOk&&kinds.includes('ENGINE')&&kinds.includes('EQUIPMENT');
  rows.push({sku,ok,ready_positions:want.length,missing:missing.length,vehicle_rows:(r.vehicle_applications||[]).length,hash_ok:hashOk,evidence_kinds:kinds,equipment_count:apps.length});
 }
}finally{db.release();await pool.end()}
const summary={
 total_skus:rows.length,
 ok:rows.filter(x=>x.ok).length,
 errors:rows.filter(x=>!x.ok).length,
 ready_positions:ready.length,
 missing:rows.reduce((n,x)=>n+(x.missing||0),0),
 vehicle_rows:rows.reduce((n,x)=>n+(x.vehicle_rows||0),0),
 rows
};
console.log(JSON.stringify(summary,null,2));
if(summary.errors)process.exit(2);
