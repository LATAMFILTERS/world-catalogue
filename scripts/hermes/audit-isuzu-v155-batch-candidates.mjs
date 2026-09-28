#!/usr/bin/env node
import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {Pool}=require('pg');
const rec=JSON.parse(fs.readFileSync('hermes/reports/isuzu-v155-exact-pending-reconciliation.json','utf8'));
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw new Error('DB URL required');
const local=/@(127\.0\.0\.1|localhost):/.test(cs);const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},max:1});
const db=await pool.connect();const rows=[];
try{
 for(const x of rec.rows){
  const q=await db.query('select sku,codigo_base,duty,technology,filter_type,sub_type,equipment_applications,vehicle_applications,enrichment_data from elimfilters_catalog where sku=$1',[x.sku]);
  if(q.rowCount===0){rows.push({sku:x.sku,pending_positions:x.exact_positions,status:'MISSING'});continue}
  if(q.rowCount>1){rows.push({sku:x.sku,pending_positions:x.exact_positions,status:'DUPLICATE',rows:q.rowCount});continue}
  const r=q.rows[0],g=r.enrichment_data?.codigo_base_governance||{};
  rows.push({
    sku:x.sku,pending_positions:x.exact_positions,status:'EXISTS',
    codigo_base:r.codigo_base,duty:r.duty,technology:r.technology,filter_type:r.filter_type,sub_type:r.sub_type,
    equipment_count:(r.equipment_applications||[]).length,vehicle_count:(r.vehicle_applications||[]).length,
    approved_manufacturer:g.approved_manufacturer||null,approved_codigo_base:g.approved_codigo_base||null,
    primary_manufacturer_verified:g.primary_manufacturer_verified??null,
    donaldson_absence_verified:g.donaldson_absence_verified??null,
    fallback_manufacturer_verified:g.fallback_manufacturer_verified??null,
    fallback_commercial_code_verified:g.fallback_commercial_code_verified??null
  });
 }
}finally{db.release();await pool.end()}
const summary={
 total_skus:rows.length,
 exists:rows.filter(x=>x.status==='EXISTS').length,
 missing:rows.filter(x=>x.status==='MISSING').length,
 duplicate:rows.filter(x=>x.status==='DUPLICATE').length,
 pending_positions:rows.reduce((n,x)=>n+(x.pending_positions||0),0),
 hd_existing:rows.filter(x=>x.status==='EXISTS'&&x.duty==='HEAVY_DUTY').length,
 non_hd:rows.filter(x=>x.status==='EXISTS'&&x.duty!=='HEAVY_DUTY').map(x=>x.sku)
};
fs.writeFileSync('hermes/reports/isuzu-v155-batch-candidate-audit.json',JSON.stringify({summary,rows},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
console.table(rows.map(x=>({sku:x.sku,pending:x.pending_positions,status:x.status,base:x.codigo_base||'',duty:x.duty||'',tech:x.technology||'',equip:x.equipment_count??'',vehicle:x.vehicle_count??''})));
