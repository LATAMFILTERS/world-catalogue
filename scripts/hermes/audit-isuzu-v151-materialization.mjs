#!/usr/bin/env node
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {Pool}=require('pg');
const expected=[
 ['ED41466','P781466','DRYCORE™','DONALDSON'],
 ['EF96095','P506095','SYNTAPORE™','DONALDSON'],
 ['EL80408','P550408','SYNTRAX™','DONALDSON'],
 ['ES90128','FS20128','HYDROCORE™','FLEETGUARD']
];
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw new Error('DB URL required');
const local=/@(127\.0\.0\.1|localhost):/.test(cs);const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},max:1});
const db=await pool.connect();const rows=[];let errors=0;
try{
 for(const [sku,base,tech,manufacturer] of expected){
  const q=await db.query('select sku,codigo_base,duty,technology,equipment_applications,vehicle_applications,enrichment_data from elimfilters_catalog where sku=$1',[sku]);
  if(q.rowCount!==1){rows.push({sku,ok:false,reason:'MISSING_OR_NONUNIQUE'});errors++;continue}
  const r=q.rows[0],g=r.enrichment_data?.codigo_base_governance||{};
  const ok=r.codigo_base===base&&r.duty==='HEAVY_DUTY'&&r.technology===tech&&(r.equipment_applications||[]).length===0&&(r.vehicle_applications||[]).length===0&&g.approved_codigo_base===base&&g.approved_manufacturer===manufacturer;
  if(!ok)errors++;
  rows.push({sku,codigo_base:r.codigo_base,duty:r.duty,technology:r.technology,equipment_count:(r.equipment_applications||[]).length,vehicle_count:(r.vehicle_applications||[]).length,approved_manufacturer:g.approved_manufacturer,approved_codigo_base:g.approved_codigo_base,ok});
 }
}finally{db.release();await pool.end()}
const out={phase:'ISUZU_V151_MATERIALIZATION_AUDIT',rows,summary:{total:rows.length,ok:rows.filter(x=>x.ok).length,errors}};
console.log(JSON.stringify(out.summary,null,2));
console.log(JSON.stringify(out.rows,null,2));
if(errors)process.exit(2);
