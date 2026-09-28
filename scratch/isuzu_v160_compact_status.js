'use strict';
const {Client}=require('pg');
(async()=>{
 const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:false});await c.connect();
 const skus=['EF90390','EF91840','EF92427','ES91098','EA33930','EA13930','EF98204','ES90128','EF92599','EF93410','EF92564','EA14353','EA21938','EL80408','EL80428','EF93009'];
 const q=await c.query(`select sku,codigo_base,duty,filter_type,technology,canonical_source_brand,canonical_source_code,
 jsonb_array_length(coalesce(equipment_applications,'[]'::jsonb)) app_count,
 enrichment_data->'application_governance'->>'evidence_authority' authority
 from elimfilters_catalog where sku=any($1) order by sku`,[skus]);
 const found=new Set(q.rows.map(r=>r.sku));
 console.log(JSON.stringify({rows:q.rows,missing:skus.filter(s=>!found.has(s))},null,2));
 await c.end();
})().catch(e=>{console.error(e);process.exit(1)});