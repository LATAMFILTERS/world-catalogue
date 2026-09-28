#!/usr/bin/env node
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const {Pool}=require('pg');
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw Error('DB URL required');
const pool=new Pool({connectionString:cs,ssl:false,max:1});const db=await pool.connect();
try{
 const queries=[
  ['B67',"%ISUZU%","%B6.7%"],
  ['FTR4HK1',"%FTR%","%4HK1%"],
  ['NPRHD4HK1',"%NPR-HD%","%4HK1%"],
  ['NPRXD4HK1',"%NPR-XD%","%4HK1%"]
 ];
 for(const [name,equip,engine] of queries){
  const q=await db.query(`select sku,codigo_base,filter_type,technology,canonical_source_brand,canonical_source_code,canonical_source_status,
    jsonb_array_length(coalesce(equipment_applications,'[]'::jsonb)) app_count
    from elimfilters_catalog
    where equipment_applications::text ilike $1 and equipment_applications::text ilike $2
    order by filter_type,sku`,[equip,engine]);
  console.log('\n'+name+' '+q.rowCount);console.log(JSON.stringify(q.rows,null,2));
 }
}finally{db.release();await pool.end();}
