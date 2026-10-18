#!/usr/bin/env node
// Run locally as the SAME Windows identity that executes CRM.
// Verifies dedicated credentials and effective catalog privileges without writes.
// Never prints connection strings, usernames other than fixed role, or secrets.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const file=path.join(process.env.ELIMSERVER_ROOT || 'C:\\ELIMSERVER','secrets','catalogue-intelligence-reader.env');
const role='catalogue_intelligence_reader';
let client;
try {
  const lines=fs.readFileSync(file,'utf8').split(/\r?\n/);
  const vars=Object.fromEntries(lines.filter(l=>/^[A-Z_]+=/.test(l)).map(l=>{
    const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1)];
  }));
  if(!vars.CATALOG_DATABASE_URL)throw Error('READER_CONFIG_INCOMPLETE');
  const uri=new URL(vars.CATALOG_DATABASE_URL);
  if(uri.hostname!=='127.0.0.1'||uri.port!=='5440'||uri.pathname!=='/catalogo_elimfilters'||decodeURIComponent(uri.username)!==role) {
    throw Error('READER_CONFIG_TARGET_MISMATCH');
  }
  client=new pg.Client({connectionString:vars.CATALOG_DATABASE_URL,ssl:false,connectionTimeoutMillis:5000});
  await client.connect();
  await client.query('BEGIN READ ONLY');
  const r=await client.query(`SELECT
    current_database() AS db,
    current_user AS rol,
    current_setting('port') AS port,
    current_setting('transaction_read_only') AS txn_read_only,
    (SELECT rolcanlogin AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolreplication AND NOT rolbypassrls
     FROM pg_roles WHERE rolname=current_user) AS role_restricted,
    has_table_privilege(current_user,'public.elimfilters_catalog','SELECT') AS can_read,
    has_table_privilege(current_user,'public.elimfilters_catalog','INSERT') AS can_insert,
    has_table_privilege(current_user,'public.elimfilters_catalog','UPDATE') AS can_update,
    has_table_privilege(current_user,'public.elimfilters_catalog','DELETE') AS can_delete,
    has_database_privilege(current_user,current_database(),'CREATE') AS can_create_database_objects,
    has_schema_privilege(current_user,'public','CREATE') AS can_create_schema_objects`);
  const v=r.rows[0];
  if(v.db!=='catalogo_elimfilters'||v.rol!==role||v.port!=='5440'||v.txn_read_only!=='on'||
    !v.role_restricted||!v.can_read||v.can_insert||v.can_update||v.can_delete||
    v.can_create_database_objects||v.can_create_schema_objects)throw Error('READER_PRIVILEGES_INVALID');
  const sample=await client.query('SELECT sku FROM public.elimfilters_catalog ORDER BY sku LIMIT 1');
  await client.query('ROLLBACK');
  console.log(JSON.stringify({status:'PASS',database:v.db,port:v.port,role:v.rol,
    restricted:true,read_only:true,catalogue_access:true,sample_rows:sample.rowCount},null,2));
}catch(error){
  console.error('BLOCKED:',error.code||(
    /^(READER_|ENOENT|EACCES)/.test(error.message||'')?error.message:'READ_ONLY_PREFLIGHT_FAILED'
  ));
  process.exitCode=1;
}finally{
  if(client){await client.query('ROLLBACK').catch(()=>{});await client.end().catch(()=>{});}
}
