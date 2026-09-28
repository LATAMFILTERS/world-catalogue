#!/usr/bin/env node
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const {Pool}=require('pg');
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;const pool=new Pool({connectionString:cs,ssl:false,max:1});const db=await pool.connect();
const refs=['P506095','P551855','P550408','P502042','P821938','P903042','P848204','P502502','P533930','P903500','P550390','P543614'];
try{for(const ref of refs){const q=await db.query(`
select sku,codigo_base,filter_type,technology,duty,canonical_source_brand,canonical_source_code,canonical_source_status
from elimfilters_catalog where codigo_base=$1 or brand_crossrefs::text ilike $2 or competitor_codes::text ilike $2 or oem_codes::text ilike $2 order by sku`,[ref,'%'+ref+'%']);console.log('\n'+ref);console.log(JSON.stringify(q.rows,null,2));}}finally{db.release();await pool.end();}
