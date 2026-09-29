#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {Pool}=require('pg');
const {normalizedApplication}=require('../../lib/catalog-application-governance.js');
const input=JSON.parse(fs.readFileSync(path.resolve('scripts/hermes/isuzu-us-application-batch-v154-ea16773.json'),'utf8'));
const key=x=>JSON.stringify(normalizedApplication(x));
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw new Error('DB URL required');
const local=/@(127\.0\.0\.1|localhost):/.test(cs);const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},max:1});
const db=await pool.connect();let out;
try{
 const item=input.skus[0],q=await db.query('select sku,codigo_base,duty,equipment_applications,vehicle_applications,enrichment_data from elimfilters_catalog where sku=$1',[item.sku]);
 if(q.rowCount!==1)throw new Error('EA16773 missing/nonunique');
 const r=q.rows[0],apps=r.equipment_applications||[],set=new Set(apps.map(key)),missing=item.applications.filter(x=>!set.has(key(x)));
 const h=(await db.query('select md5($1::jsonb::text) h',[JSON.stringify(apps)])).rows[0].h,g=r.enrichment_data?.application_governance||{};
 const ev=await db.query("select application_kind from catalog_application_evidence where sku=$1 and payload_hash=$2 and verified is true",[item.sku,h]);
 const kinds=[...new Set(ev.rows.map(x=>x.application_kind))].sort();
 const ok=r.codigo_base==='P636773'&&r.duty==='HEAVY_DUTY'&&missing.length===0&&(r.vehicle_applications||[]).length===0&&g.equipment_db_payload_hash===h&&g.engine_db_payload_hash===h&&kinds.includes('EQUIPMENT')&&kinds.includes('ENGINE');
 out={phase:'ISUZU_V154_EA16773_AUDIT',summary:{ok,missing_ranges:missing.length,vehicle_rows:(r.vehicle_applications||[]).length,hash_ok:g.equipment_db_payload_hash===h&&g.engine_db_payload_hash===h,evidence_kinds:kinds,equipment_count:apps.length}};
}finally{db.release();await pool.end()}
console.log(JSON.stringify(out.summary,null,2));if(!out.summary.ok)process.exit(2);
