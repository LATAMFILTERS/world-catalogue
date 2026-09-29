'use strict';
const { Client } = require('pg');
(async()=>{
  const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
  await c.connect(); await c.query("SET statement_timeout='20s'");
  const cols=(await c.query(`SELECT c.table_schema,c.table_name,c.column_name FROM information_schema.columns c JOIN information_schema.tables t USING(table_schema,table_name) WHERE c.column_name='elimfilters_sku' AND t.table_type='BASE TABLE' ORDER BY c.table_schema,c.table_name`)).rows;
  const out=[];
  for(const x of cols){
    const q=`SELECT count(*)::int n FROM ${x.table_schema}.${x.table_name} WHERE elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)'`;
    const n=(await c.query(q)).rows[0].n; if(n) out.push({...x,n});
  }
  console.log(JSON.stringify(out,null,2));
  await c.end();
})().catch(e=>{console.error(e);process.exit(1)});