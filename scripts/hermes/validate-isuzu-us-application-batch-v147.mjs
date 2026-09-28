#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require=createRequire(import.meta.url); const {Pool}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway.js');
const {APPLICATION_POLICY_VERSION,applicationPayloadHash,normalizedApplication}=require('../../lib/catalog-application-governance.js');
const input=JSON.parse(fs.readFileSync(path.resolve('scripts/hermes/isuzu-us-application-batch-v147.json'),'utf8'));
const key=(x)=>JSON.stringify(normalizedApplication(x)); const merge=(a,b)=>{const m=new Map(); for(const x of [...(a||[]),...(b||[])])m.set(key(x),x); return [...m.values()];};
const cs=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL; if(!cs)throw new Error('A catalogue database URL is required');
const pool=new Pool({connectionString:cs,ssl:{rejectUnauthorized:false},application_name:'hermes-isuzu-v147-dry-run',max:1});
const report={schema_version:'1.0.0',source:input.source,generated_at:new Date().toISOString(),database_write:false,rows:[]};
try{for(const item of input.skus){const q=await pool.query('SELECT * FROM elimfilters_catalog WHERE sku=$1',[item.sku]); if(q.rowCount!==1){report.rows.push({sku:item.sku,status:'BLOCKED',reasons:['SKU_NOT_UNIQUE_OR_MISSING']});continue;}
const row=q.rows[0], field=String(row.duty).toUpperCase()==='LIGHT_DUTY'?'vehicle_applications':'equipment_applications', merged=merge(row[field],item.applications);
const gov={...(row.enrichment_data?.application_governance||{}),policy_version:APPLICATION_POLICY_VERSION,evidence_recorded:true,evidence_authority:input.source,engine_verified:true,engine_payload_hash:applicationPayloadHash(merged)};
if(field==='equipment_applications'){gov.equipment_verified=true;gov.equipment_payload_hash=applicationPayloadHash(merged);}else{gov.vehicle_verified=true;gov.vehicle_payload_hash=applicationPayloadHash(merged);}
const enrichment_data={...(row.enrichment_data||{}),application_governance:gov}; const patch={[field]:merged,enrichment_data};
try{const validation=assertGovernedCatalogPatch(row,patch,{applicationWrite:true});report.rows.push({sku:item.sku,status:'READY',duty:row.duty,field,existing:(row[field]||[]).length,after:merged.length,validation});}
catch(e){report.rows.push({sku:item.sku,status:'BLOCKED',duty:row.duty,field,reasons:e.validation?.reasons||[e.message]});}}
}finally{await pool.end();}
report.summary={total:report.rows.length,ready:report.rows.filter(x=>x.status==='READY').length,blocked:report.rows.filter(x=>x.status==='BLOCKED').length};
fs.mkdirSync('hermes/reports',{recursive:true}); fs.writeFileSync('hermes/reports/isuzu-us-application-dry-run-v147.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.summary,null,2)); if(report.summary.blocked)process.exitCode=1;
