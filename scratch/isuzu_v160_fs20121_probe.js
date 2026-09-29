'use strict';
const {Client}=require('pg');
(async()=>{
 const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});await c.connect();
 const tokens=['FS20121','5444245','5528103','BF46266-SPS','BF46266SPS'];
 const q=await c.query(`
 select sku,codigo_base,duty,filter_type,technology,canonical_source_brand,canonical_source_code,
        brand_crossrefs,oem_codes,competitor_codes
 from elimfilters_catalog
 where upper(coalesce(codigo_base,''))=any($1)
    or upper(coalesce(canonical_source_code,''))=any($1)
    or upper(coalesce(brand_crossrefs::text,'')) like any($2)
    or upper(coalesce(oem_codes::text,'')) like any($2)
    or upper(coalesce(competitor_codes::text,'')) like any($2)
 order by sku`,[tokens.map(x=>x.toUpperCase()),tokens.map(x=>'%'+x.toUpperCase()+'%')]);
 console.log(JSON.stringify(q.rows,null,2));await c.end();
})().catch(e=>{console.error(e);process.exit(1)});