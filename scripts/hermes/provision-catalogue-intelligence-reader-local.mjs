#!/usr/bin/env node
// One-time local administrator action, launched only through the existing
// run-catalog-local-governed.ps1 credential boundary. No secrets in stdout/git.
import pg from 'pg';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const adminUrl=process.env.CATALOG_DATABASE_URL;
if(!adminUrl) throw new Error('GOVERNED_CATALOG_DATABASE_URL_REQUIRED');
const admin=new pg.Client({connectionString:adminUrl,connectionTimeoutMillis:5000});
const role='catalogue_intelligence_reader';
const secret=crypto.randomBytes(32).toString('hex');
const escaped=secret.replace(/'/g,"''");
const credentialFile=path.join(process.env.ELIMSERVER_ROOT||'C:\\ELIMSERVER','secrets','catalogue-intelligence-reader.env');
let committed=false;
let credentialCreated=false;
try{
 await admin.connect();
 await admin.query('BEGIN');
 const info=await admin.query('SELECT current_database() AS db,current_setting(\'port\') AS port');
 if(info.rows[0].db!=='catalogo_elimfilters'||info.rows[0].port!=='5440')throw Error('UNEXPECTED_CANONICAL_DATABASE');
 const exists=await admin.query('SELECT 1 FROM pg_roles WHERE rolname=$1',[role]);
 if(exists.rowCount)throw Error('READER_ROLE_ALREADY_EXISTS_MANUAL_REVIEW_REQUIRED');
 await admin.query(`CREATE ROLE ${role} LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD '${escaped}'`);
 await admin.query(`ALTER ROLE ${role} SET default_transaction_read_only=on`);
 await admin.query(`GRANT CONNECT ON DATABASE catalogo_elimfilters TO ${role}`);
 await admin.query(`GRANT USAGE ON SCHEMA public TO ${role}`);
 await admin.query(`GRANT SELECT ON TABLE public.elimfilters_catalog TO ${role}`);
 const check=await admin.query(`SELECT
 has_table_privilege($1,'public.elimfilters_catalog','SELECT') AS can_read,
 has_table_privilege($1,'public.elimfilters_catalog','INSERT') AS can_insert,
 has_table_privilege($1,'public.elimfilters_catalog','UPDATE') AS can_update,
 has_table_privilege($1,'public.elimfilters_catalog','DELETE') AS can_delete,
 has_database_privilege($1,'catalogo_elimfilters','CREATE') AS can_create,
 has_schema_privilege($1,'public','CREATE') AS can_create_schema_objects`,[role]);
 const c=check.rows[0];
 if(!c.can_read||c.can_insert||c.can_update||c.can_delete||c.can_create||c.can_create_schema_objects)throw Error('LEAST_PRIVILEGE_VALIDATION_FAILED');
 // Store only in a local OS-owned secrets directory; never commit this file.
 fs.mkdirSync(path.dirname(credentialFile),{recursive:true});
 if(fs.existsSync(credentialFile))throw Error('CREDENTIAL_FILE_EXISTS_MANUAL_REVIEW_REQUIRED');
 const temp=credentialFile+'.tmp';
 const url=new URL(adminUrl);
 url.username=role;
 url.password=secret;
 url.hostname='127.0.0.1';
 url.port='5440';
 url.pathname='/catalogo_elimfilters';
 fs.writeFileSync(temp,`CATALOG_DATABASE_URL=${url.toString()}\nCATALOG_DB_SSL=false\n`,{encoding:'utf8',flag:'wx',mode:0o600});
 if(process.platform==='win32'){
  const {execFileSync}=await import('node:child_process');
  // Restrict credentials to the current service account; fail before commit.
  const identity=`${process.env.USERDOMAIN}\\${process.env.USERNAME}`;
  if(!process.env.USERNAME)throw Error('WINDOWS_IDENTITY_UNAVAILABLE');
  execFileSync('icacls',[temp,'/inheritance:r','/grant:r',identity+':R','/remove:g','Users','Authenticated Users'],{stdio:'ignore'});
 }
 fs.renameSync(temp,credentialFile);
 credentialCreated=true;
 await admin.query('COMMIT');committed=true;
 console.log(JSON.stringify({status:'PROVISIONED',role,database:'catalogo_elimfilters',port:5440,select_only:true,credential_file_written:true}));
}catch(error){
 if(!committed){
  await admin.query('ROLLBACK').catch(()=>{});
  if(credentialCreated)fs.rmSync(credentialFile,{force:true});
 }
 fs.rmSync(credentialFile+'.tmp',{force:true});
 console.error('BLOCKED:',error.code||error.message);process.exitCode=1;
}finally{await admin.end().catch(()=>{});}
