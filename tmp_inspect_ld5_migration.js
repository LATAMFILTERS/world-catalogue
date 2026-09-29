'use strict';
const {Client}=require('pg');
(async()=>{const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();
for(const t of ['ld_canonical_backfill_candidates','ld_product_catalog']){
 const cols=(await c.query(`SELECT column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema='ld_catalog' AND table_name=$1 ORDER BY ordinal_position`,[t])).rows;
 const cons=(await c.query(`SELECT conname,pg_get_constraintdef(oid) def FROM pg_constraint WHERE conrelid=$1::regclass ORDER BY conname`,[`ld_catalog.${t}`])).rows;
 console.log('\n'+t,JSON.stringify({cols,cons},null,2));}
const q=await c.query(`WITH m AS (SELECT elimfilters_sku src, CASE left(elimfilters_sku,3) WHEN 'EA5' THEN 'EA3'||substring(elimfilters_sku from 4) WHEN 'EC5' THEN 'EC3'||substring(elimfilters_sku from 4) WHEN 'EF5' THEN 'EF3'||substring(elimfilters_sku from 4) WHEN 'EL5' THEN 'EL3'||substring(elimfilters_sku from 4) END dst FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)') SELECT count(*)::int total, count(*) FILTER (WHERE t.elimfilters_sku IS NULL)::int rename_direct, count(*) FILTER (WHERE t.elimfilters_sku IS NOT NULL)::int merge_needed, count(*) FILTER (WHERE p.sku IS NOT NULL)::int public_target FROM m LEFT JOIN ld_catalog.ld_product_catalog t ON t.elimfilters_sku=m.dst LEFT JOIN public.elimfilters_catalog p ON p.sku=m.dst`);console.log('\nCLASS',JSON.stringify(q.rows[0],null,2));
await c.end();})().catch(e=>{console.error(e);process.exit(1)});