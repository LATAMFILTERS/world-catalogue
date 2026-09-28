#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {Pool}=require('pg');
const {normalizedApplication}=require('../../lib/catalog-application-governance.js');
const input=JSON.parse(fs.readFileSync(path.resolve('scripts/hermes/isuzu-us-application-batch-v149-existing-skus-only.json'),'utf8'));
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
if(!cs) throw new Error('DB URL required');
const local=/@(127\.0\.0\.1|localhost):/.test(cs);
const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},max:1});
const key=x=>JSON.stringify(normalizedApplication(x));
const out={source:input.source,checked_at:new Date().toISOString(),skus:[],errors:[]};
const client=await pool.connect();
try{
 for(const item of input.skus){
  const q=await client.query('SELECT sku,duty,equipment_applications,vehicle_applications,enrichment_data FROM elimfilters_catalog WHERE sku=$1',[item.sku]);
  if(q.rowCount!==1){out.errors.push(`${item.sku}:missing_or_nonunique`);continue;}
  const row=q.rows[0], apps=Array.isArray(row.equipment_applications)?row.equipment_applications:[];
  const seen=new Set(apps.map(key));
  const missing=item.applications.filter(x=>!seen.has(key(x)));
  const dupCount=apps.length-new Set(apps.map(x=>JSON.stringify(x))).size;
  const gov=row.enrichment_data?.application_governance||{};
  const h=await client.query("select md5($1::jsonb::text) h",[JSON.stringify(apps)]);
  const dbHash=h.rows[0].h;
  const ev=await client.query("select application_kind,payload_hash,verified from catalog_application_evidence where sku=$1 and payload_hash=$2 and verified is true",[item.sku,dbHash]);
  const kinds=[...new Set(ev.rows.map(x=>x.application_kind))].sort();
  const ok=row.duty==='HEAVY_DUTY' && (row.vehicle_applications||[]).length===0 && missing.length===0 &&
    gov.equipment_db_payload_hash===dbHash && gov.engine_db_payload_hash===dbHash &&
    kinds.includes('EQUIPMENT') && kinds.includes('ENGINE');
  if(!ok) out.errors.push(`${item.sku}:postwrite_audit_failed`);
  out.skus.push({sku:item.sku,duty:row.duty,equipment_count:apps.length,vehicle_count:(row.vehicle_applications||[]).length,
    batch_apps:item.applications.length,missing_batch_apps:missing.length,duplicate_exact_rows:dupCount,
    db_hash_matches:gov.equipment_db_payload_hash===dbHash,engine_hash_matches:gov.engine_db_payload_hash===dbHash,
    evidence_kinds:kinds,ok});
 }
} finally {client.release();await pool.end();}
out.summary={total:out.skus.length,ok:out.skus.filter(x=>x.ok).length,errors:out.errors.length,
 total_missing:out.skus.reduce((n,x)=>n+x.missing_batch_apps,0),vehicle_rows:out.skus.reduce((n,x)=>n+x.vehicle_count,0)};
fs.mkdirSync('hermes/reports',{recursive:true});
const fn='hermes/reports/isuzu-us-v149-postwrite-audit.json';
fs.writeFileSync(fn,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out.summary,null,2));
console.log(fn);
if(out.errors.length) process.exit(2);
