'use strict';
const {Client}=require('pg');
(async()=>{
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
 const c=new Client({connectionString:url,ssl:false}); await c.connect();
 const skus=['EA13930','EA33930','EL80428','EL80606','ES90128','EF93009','EF93410','EA21938','EA33655','ES91098'];
 const q=await c.query(`select sku,codigo_base,duty,technology,filter_type,sub_type,
   equipment_applications,vehicle_applications,enrichment_data
   from elimfilters_catalog where sku=any($1) order by sku`,[skus]);
 console.log(JSON.stringify(q.rows.map(r=>({
   sku:r.sku,codigo_base:r.codigo_base,duty:r.duty,technology:r.technology,
   filter_type:r.filter_type,sub_type:r.sub_type,
   equipment_count:(r.equipment_applications||[]).length,
   vehicle_count:(r.vehicle_applications||[]).length,
   apps:r.equipment_applications||[],
   governance:r.enrichment_data?.application_governance||null
 })),null,2));
 await c.end();
})().catch(e=>{console.error(e);process.exit(1)});