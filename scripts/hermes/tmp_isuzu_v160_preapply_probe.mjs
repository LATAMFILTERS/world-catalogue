#!/usr/bin/env node
import fs from 'node:fs';import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const {Pool}=require('pg');
const ledger=JSON.parse(fs.readFileSync('hermes/reports/isuzu-v160-decision-ledger.json','utf8'));
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;const pool=new Pool({connectionString:cs,ssl:false,max:1});const db=await pool.connect();
try{
 console.log('EA33930 tuples');console.log(JSON.stringify(ledger.rows.filter(r=>r.sku==='EA33930').map(r=>({id:r.id,model:r.model,engine:r.engine,year:r.year})),null,2));
 for(const sku of ['EA13930','EL80408','EF96095','EL80428','EF93009','EF92427','EA13614']){
  const q=await db.query(`select sku,duty,codigo_base,filter_type,technology,canonical_source_brand,canonical_source_code,canonical_source_status,
   jsonb_array_length(coalesce(equipment_applications,'[]'::jsonb)) apps
   from elimfilters_catalog where sku=$1`,[sku]);
  console.log('\n'+sku);console.log(JSON.stringify(q.rows[0]||null,null,2));
 }
}finally{db.release();await pool.end();}
