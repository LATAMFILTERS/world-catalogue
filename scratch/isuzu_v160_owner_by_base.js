'use strict';
const {Client}=require('pg');
(async()=>{
 const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});await c.connect();
 const vals=['P821938','P502427','P551840','P134353','P552564','P550390','P502599','FS20128','8982373410'];
 const q=await c.query(`select sku,codigo_base,duty,filter_type,technology,canonical_source_brand,canonical_source_code
 from elimfilters_catalog where upper(coalesce(codigo_base,''))=any($1)
 or upper(coalesce(canonical_source_code,''))=any($1)
 order by codigo_base,sku`,[vals.map(x=>x.toUpperCase())]);
 console.log(JSON.stringify(q.rows,null,2));await c.end();
})().catch(e=>{console.error(e);process.exit(1)});