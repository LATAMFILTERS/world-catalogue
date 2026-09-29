'use strict';
const {Client}=require('pg');
(async()=>{
 const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});await c.connect();
 const vals=['FS1098','FS20121','FS20081','FF63041NN','FF63054NN'];
 const q=await c.query(`select sku,codigo_base,duty,filter_type,technology,canonical_source_brand,canonical_source_code,
 brand_crossrefs,oem_codes,competitor_codes
 from elimfilters_catalog
 where upper(coalesce(codigo_base,''))=any($1)
 or upper(coalesce(canonical_source_code,''))=any($1)
 or brand_crossrefs::text ~* $2
 order by sku`,[vals.map(v=>v.toUpperCase()),vals.join('|')]);
 console.log(JSON.stringify(q.rows,null,2));await c.end();
})().catch(e=>{console.error(e);process.exit(1)});