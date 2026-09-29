'use strict';
const { Client } = require('pg');
(async()=>{
 const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL,ssl:{rejectUnauthorized:false}}); await c.connect();
 const q=await c.query(`WITH p AS (
 SELECT elimfilters_sku,source_sku,segment,
 CASE WHEN elimfilters_sku LIKE 'EA5%' THEN 'EA3'||substring(elimfilters_sku from 4)
      WHEN elimfilters_sku LIKE 'EC5%' THEN 'EC3'||substring(elimfilters_sku from 4)
      WHEN elimfilters_sku LIKE 'EF5%' THEN 'EF3'||substring(elimfilters_sku from 4)
      WHEN elimfilters_sku LIKE 'EL5%' THEN 'EL3'||substring(elimfilters_sku from 4) END target
 FROM ld_catalog.ld_product_catalog
 WHERE elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)'
 ) SELECT substring(elimfilters_sku from 1 for 3) prefix,count(*)::int n,
 count(*) FILTER(WHERE EXISTS(SELECT 1 FROM public.elimfilters_catalog c WHERE c.sku=p.target))::int public_target_exists,
 count(*) FILTER(WHERE EXISTS(SELECT 1 FROM ld_catalog.ld_product_catalog x WHERE x.elimfilters_sku=p.target))::int ld_target_exists
 FROM p GROUP BY 1 ORDER BY 1`);
 const total=await c.query(`SELECT count(*)::int n FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)'`);
 console.log(JSON.stringify({total:total.rows[0].n,by_prefix:q.rows},null,2)); await c.end();
})().catch(e=>{console.error(e);process.exit(1)});