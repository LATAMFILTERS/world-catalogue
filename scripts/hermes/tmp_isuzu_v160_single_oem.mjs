#!/usr/bin/env node
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const {Pool}=require('pg');
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;const pool=new Pool({connectionString:cs,ssl:false,max:1});const db=await pool.connect();
try{
 for(const code of ['8982373410','8981772710','29007N0000']){
  const q=await db.query(`select sku,codigo_base,filter_type,technology,duty,canonical_source_brand,canonical_source_code,canonical_source_status
  from elimfilters_catalog where oem_codes::text ilike $1 or brand_crossrefs::text ilike $1 or competitor_codes::text ilike $1 order by filter_type,sku`,['%'+code+'%']);
  console.log(code+' '+q.rowCount);console.log(JSON.stringify(q.rows,null,2));
 }
}finally{db.release();await pool.end();}
