#!/usr/bin/env node
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const {Pool}=require('pg');
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;const pool=new Pool({connectionString:cs,ssl:false,max:1});const db=await pool.connect();
try{const q=await db.query(`select sku,duty,codigo_base,filter_type,technology,brand_crossrefs,oem_codes,competitor_codes,canonical_source_brand,canonical_source_code,canonical_source_status from elimfilters_catalog where sku='EA13930'`);console.log(JSON.stringify(q.rows[0],null,2));}finally{db.release();await pool.end();}
