#!/usr/bin/env node
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const {Pool}=require('pg');
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw Error('DB URL required');
const pool=new Pool({connectionString:cs,ssl:false,max:1});const db=await pool.connect();
const find=async(model,engine,year)=>{
 const q=await db.query(`
 select distinct c.sku,c.codigo_base,c.filter_type,c.technology,c.canonical_source_brand,c.canonical_source_code,c.canonical_source_status
 from elimfilters_catalog c cross join lateral jsonb_array_elements(coalesce(c.equipment_applications,'[]'::jsonb)) a
 where upper(coalesce(a->>'make','ISUZU')) like '%ISUZU%'
   and upper(coalesce(a->>'model',a->>'equipment','')) like $1
   and upper(coalesce(a->>'engine','')) like $2
   and (
    nullif(a->>'year','')::int=$3 or
    (nullif(a->>'year_from','')::int <= $3 and nullif(a->>'year_to','')::int >= $3)
   )
 order by c.filter_type,c.sku`,['%'+model.toUpperCase()+'%','%'+engine.toUpperCase()+'%',year]);
 console.log('\n'+model+' '+engine+' '+year+' => '+q.rowCount);console.log(JSON.stringify(q.rows,null,2));
};
try{
 const refs=['FF63041NN','P553009','LF3970','P550428'];
 for(const ref of refs){
  const q=await db.query(`select sku,codigo_base,filter_type,technology,canonical_source_status from elimfilters_catalog where codigo_base=$1 or brand_crossrefs::text ilike $2 or competitor_codes::text ilike $2 order by sku`,[ref,'%'+ref+'%']);
  console.log('\nREF '+ref);console.log(JSON.stringify(q.rows,null,2));
 }
 await find('FTR','B6.7',2022);await find('FVR','B6.7',2022);await find('FVR DERATE','B6.7',2022);
 await find('FTR','4HK1',2018);await find('NPR-HD','4HK1',2022);await find('NPR-XD','4HK1',2022);
}finally{db.release();await pool.end();}
