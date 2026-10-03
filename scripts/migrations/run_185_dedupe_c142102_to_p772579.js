'use strict';
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const SOURCE='EA32102';
const TARGET='EA12579';
const ALT='C14210/2';
const BASE='P772579';
const EXPECTED_DUPES=868;
const EXPECTED_SOURCE_REMAINING=26;

async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('DB URL missing');
 const u=new URL(url);
 if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
 await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,alternate:ALT,base:BASE,pre:{},mutations:{},post:{}};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const s=(await db.query("SELECT sku,catalog_active,codigo_base,duty,filter_type FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE",[SOURCE])).rows[0];
  const t=(await db.query("SELECT sku,catalog_active,codigo_base,duty,filter_type,canonical_source_brand,canonical_source_code,canonical_source_status FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE",[TARGET])).rows[0];
  if(!s||s.catalog_active!==true||s.codigo_base!=='2102'||s.duty!=='LIGHT_DUTY'||s.filter_type!=='air') throw new Error('SOURCE_BASELINE_CHANGED');
  if(!t||t.catalog_active!==true||t.codigo_base!==BASE||t.duty!=='HEAVY_DUTY'||t.filter_type!=='air'||t.canonical_source_brand!=='DONALDSON'||t.canonical_source_code!==BASE||t.canonical_source_status!=='VERIFIED') throw new Error('TARGET_BASELINE_CHANGED');

  const a=await db.query("SELECT id,make,model_family,model_type,year,coalesce(engine_code,'') engine_code FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",[TARGET,'C153007/1']);
  const b=await db.query("SELECT id,make,model_family,model_type,year,coalesce(engine_code,'') engine_code FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",[SOURCE,ALT]);
  if(a.rowCount!==EXPECTED_DUPES||b.rowCount!==EXPECTED_DUPES) throw new Error('DUPLICATE_SET_SIZE_CHANGED');
  const key=r=>[r.make,r.model_family,r.model_type,r.year,r.engine_code].map(v=>String(v||'')).join('\u001f');
  const ak=new Set(a.rows.map(key)), bk=new Set(b.rows.map(key));
  if(ak.size!==bk.size||[...bk].some(k=>!ak.has(k))) throw new Error('APPLICATION_SETS_NOT_IDENTICAL');

  const other=await db.query("SELECT source_sku,count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part($2) GROUP BY source_sku ORDER BY source_sku",[SOURCE,ALT]);
  if(other.rowCount!==1||other.rows[0].n!==EXPECTED_SOURCE_REMAINING||norm(other.rows[0].source_sku)!==norm('C12102')) throw new Error('SOURCE_REMAINDER_CHANGED '+JSON.stringify(other.rows));

  const xref=await db.query("SELECT elimfilters_sku FROM ld_catalog.ld_competitor_cross_references WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($1)",[ALT]);
  if(xref.rowCount) throw new Error('ALT_XREF_CONFLICT '+JSON.stringify(xref.rows));

  report.pre.duplicate_rows=b.rowCount;
  report.pre.source_remaining=other.rows[0].n;

  if(EXECUTE){
   const xr=await db.query("INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at) VALUES($1,$2,'MANN-FILTER',$3,now()) RETURNING id",[TARGET,BASE,ALT]);
   if(xr.rowCount!==1) throw new Error('ALT_XREF_INSERT_FAILED');
   report.mutations.alt_xref_inserted=1;

   const del=await db.query("DELETE FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) RETURNING id",[SOURCE,ALT]);
   if(del.rowCount!==EXPECTED_DUPES) throw new Error('DUPLICATE_DELETE_FAILED '+del.rowCount);
   report.mutations.duplicate_rows_deleted=del.rowCount;

   await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])',[[TARGET,SOURCE]]);
   await db.query('SELECT public.refresh_crossref_cache_sku($1)',[TARGET]);
   report.mutations.cache_refreshed=1;
  }

  const post=await db.query(`
   SELECT
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) source_alt_rows,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1) source_remaining,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('C153007/1')) target_rows,
    (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($3)) alt_xref,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$2) alt_resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku<>$2) alt_other
  `,[SOURCE,TARGET,ALT]);
  report.post=post.rows[0];

  if(EXECUTE){
   if(report.post.source_alt_rows!==0||report.post.source_remaining!==EXPECTED_SOURCE_REMAINING||report.post.target_rows!==EXPECTED_DUPES||report.post.alt_xref!==1||report.post.alt_resolves!==1||report.post.alt_other!==0) throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
   await db.query('COMMIT');report.transaction='COMMIT';
  }else{await db.query('ROLLBACK');report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{} console.error(e.stack||e);process.exitCode=1;}
 finally{await db.end();}
}
function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
if(require.main===module) main();
