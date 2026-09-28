#!/usr/bin/env node
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);const {Pool}=require('pg');
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;const pool=new Pool({connectionString:cs,ssl:false,max:1});const db=await pool.connect();
try{const q=await db.query(`select column_name,data_type from information_schema.columns where table_name='elimfilters_catalog' order by ordinal_position`);console.log(JSON.stringify(q.rows,null,2));}
finally{db.release();await pool.end();}
