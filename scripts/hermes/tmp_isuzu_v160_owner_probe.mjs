#!/usr/bin/env node
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const {Pool}=require('pg');
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw Error('DB URL required');
const pool=new Pool({connectionString:cs,ssl:false,max:1});const db=await pool.connect();
const skus=['EL80606','EL80428','EF93009','EA33655','ES91098','EF98204','EF93410','EA21938','EA33930','EA13930'];
try{
 for(const sku of skus){
  const q=await db.query(`select sku,duty,codigo_base,filter_type,technology,oem_codes,competitor_codes,brand_crossrefs,canonical_source_brand,canonical_source_code,canonical_source_status,equipment_applications
    from elimfilters_catalog where sku=$1`,[sku]);
  console.log('\nSKU '+sku);console.log(JSON.stringify(q.rows[0]||null,null,2));
 }
 const refs=['LF606','LF3970','P550428','P553009','FS20128','P502427','P502599'];
 for(const ref of refs){
  const q=await db.query(`select sku,duty,codigo_base,filter_type,technology from elimfilters_catalog
    where codigo_base=$1 or oem_codes::text ilike $2 or competitor_codes::text ilike $2 or brand_crossrefs::text ilike $2 order by sku`,[ref,'%'+ref+'%']);
  console.log('\nREF '+ref);console.log(JSON.stringify(q.rows,null,2));
 }
}finally{db.release();await pool.end();}
