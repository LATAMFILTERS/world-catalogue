'use strict';
const {Client}=require('pg');
(async()=>{
  const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL,ssl:{rejectUnauthorized:false}});
  await c.connect();
  const tables=['ld_canonical_product_identity','ld_product_catalog','ld_production_readiness'];
  for(const t of tables){
    const cols=await c.query(`SELECT column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema='ld_catalog' AND table_name=$1 ORDER BY ordinal_position`,[t]);
    const cons=await c.query(`SELECT conname,pg_get_constraintdef(oid) def FROM pg_constraint WHERE conrelid=('ld_catalog.'||$1)::regclass ORDER BY conname`,[t]);
    console.log('\nTABLE',t); console.log(JSON.stringify(cols.rows,null,2)); console.log(JSON.stringify(cons.rows,null,2));
  }
  const trig=await c.query(`SELECT tgname,pg_get_triggerdef(oid) def FROM pg_trigger WHERE tgrelid='public.elimfilters_catalog'::regclass AND NOT tgisinternal ORDER BY tgname`);
  console.log('\nPUBLIC_TRIGGERS',JSON.stringify(trig.rows,null,2));
  await c.end();
})().catch(e=>{console.error(e.stack||e.message);process.exit(1)});
