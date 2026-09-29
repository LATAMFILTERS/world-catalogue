#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require=createRequire(import.meta.url); const {Pool}=require('pg');
const {normalizedApplication}=require('../../lib/catalog-application-governance.js');
const {applyVerifiedApplications}=require('../../lib/catalog-application-write-service.js');
const input=JSON.parse(fs.readFileSync(path.resolve('scripts/hermes/isuzu-us-application-batch-v149-existing-skus-only.json'),'utf8'));
const apply=process.argv.includes('--apply'); const key=x=>JSON.stringify(normalizedApplication(x));
const merge=(a,b)=>{const out=[...(Array.isArray(a)?a:[])];const seen=new Set(out.map(key));for(const x of (Array.isArray(b)?b:[])){const k=key(x);if(!seen.has(k)){seen.add(k);out.push(x);}}return out;};
const cs=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw new Error('A catalogue database URL is required');
const local=/@(127\.0\.0\.1|localhost):/.test(cs); const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},application_name:'hermes-isuzu-v147-finalizer',max:1});
const report={schema_version:'1.0.0',source:input.source,generated_at:new Date().toISOString(),apply,database_write:false,rows:[]}; const backups=[];
const client=await pool.connect(); try{await client.query('BEGIN'); await client.query("SET LOCAL lock_timeout='5s'"); await client.query("SET LOCAL statement_timeout='60s'");
const unresolved=[];
for(const item of input.skus){const q=await client.query('SELECT * FROM elimfilters_catalog WHERE sku=$1 FOR UPDATE',[item.sku]);
if(q.rowCount!==1){
  const suffix=String(item.sku).match(/(\d{4})$/)?.[1]||null;
  const candidates=await client.query(`SELECT sku,codigo_base,duty,technology FROM elimfilters_catalog WHERE ($1::text IS NOT NULL AND regexp_replace(coalesce(sku,''),'\\D','','g') LIKE '%'||$1) OR ($1::text IS NOT NULL AND regexp_replace(coalesce(codigo_base,''),'\\D','','g') LIKE '%'||$1) ORDER BY sku LIMIT 25`,[suffix]);
  const refs=await client.query(`SELECT sku,brand,part_number,reference_type FROM exact_part_reference WHERE upper(part_number)=upper($1) OR upper(sku)=upper($1) ORDER BY id DESC LIMIT 25`,[item.sku]).catch(()=>({rows:[]}));
  unresolved.push({sku:item.sku,row_count:q.rowCount,suffix,candidates:candidates.rows,exact_references:refs.rows});
  continue;
}
const row=q.rows[0];
if(String(row.duty).toUpperCase()!=='HEAVY_DUTY'){unresolved.push({sku:item.sku,row_count:q.rowCount,reason:'ISUZU_BATCH_REQUIRES_HEAVY_DUTY',database_duty:row.duty});continue;}
backups.push(row);const field='equipment_applications',merged=merge(row[field],item.applications);
if(merged.length<(row[field]||[]).length)throw new Error(`${item.sku}: additive invariant violated`);
const params={
  sku:item.sku,
  evidence:{
    authority:input.source,
    source_url:null,
    evidence_hash:null,
    metadata:{release:'ISUZU_US_V148_REVALIDATED_ONLY',position_count:item.applications?.length||0}
  }
};
params[field]=merged;
await applyVerifiedApplications(client,params);
report.rows.push({sku:item.sku,status:'READY',field,before:(row[field]||[]).length,after:merged.length,added:merged.length-(row[field]||[]).length});}
if(unresolved.length){report.unresolved=unresolved;console.error('=== UNRESOLVED SKU DIAGNOSTIC ===');console.error(JSON.stringify(unresolved,null,2));await client.query('ROLLBACK');throw Object.assign(new Error(`UNRESOLVED_SKUS: ${unresolved.map(x=>x.sku).join(',')}`),{unresolved});}
if(apply){fs.mkdirSync('hermes/backups/isuzu-v147',{recursive:true});const bp=`hermes/backups/isuzu-v147/prewrite-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;fs.writeFileSync(bp,JSON.stringify(backups,null,2)+'\n',{flag:'wx'});report.backup_path=bp;await client.query('COMMIT');report.database_write=true;}else await client.query('ROLLBACK');
}catch(e){try{await client.query('ROLLBACK');}catch{} report.error=e.message; throw e;}finally{client.release();await pool.end();}
report.summary={total:report.rows.length,ready:report.rows.filter(x=>x.status==='READY').length,added:report.rows.reduce((n,x)=>n+x.added,0),database_write:report.database_write};
fs.mkdirSync('hermes/reports',{recursive:true});const fn=`hermes/reports/isuzu-us-v147-${apply?'apply':'dry-run'}-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;fs.writeFileSync(fn,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.summary,null,2)); console.log(fn);
