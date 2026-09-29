'use strict'; const {Client}=require('pg');
(async()=>{const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();
const r=await c.query(`SELECT b.* FROM ld_catalog.ld_canonical_backfill_candidates b LEFT JOIN ld_catalog.ld_product_catalog p USING(elimfilters_sku) WHERE b.elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)' AND p.elimfilters_sku IS NULL ORDER BY b.elimfilters_sku`);
console.log(JSON.stringify(r.rows,null,2));await c.end();})().catch(e=>{console.error(e);process.exit(1)});