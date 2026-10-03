'use strict';
const {Client}=require('pg');
const EXECUTE=process.argv.includes('--execute');
const SOURCE='EL39084', TARGET='EL82051', MANN='W9084', DONALDSON='P502051', EXPECTED_ROWS=164;
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
 const u=new URL(url); if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}}); await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,mann:MANN,donaldson:DONALDSON,pre:{},mutations:{parent_inserted:0,crossref_inserted:0,applications_reowned:0},post:{}};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const products=await db.query(`
   SELECT sku,codigo_base,filter_type,duty,height_mm,outer_diameter_mm,thread_size,canonical_source_brand,canonical_source_code,canonical_source_status,catalog_active
   FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) ORDER BY sku FOR UPDATE
  `,[[SOURCE,TARGET]]);
  if(products.rowCount!==2) throw new Error('SOURCE_OR_TARGET_PRODUCT_MISSING');
  const by=new Map(products.rows.map(r=>[r.sku,r])), s=by.get(SOURCE), t=by.get(TARGET);
  if(s.filter_type!=='oil'||s.duty!=='LIGHT_DUTY'||norm(s.codigo_base)!=='9084') throw new Error('SOURCE_IDENTITY_CHANGED');
  if(t.filter_type!=='oil'||t.duty!=='HEAVY_DUTY'||norm(t.codigo_base)!==norm(DONALDSON)||norm(t.canonical_source_code)!==norm(DONALDSON)||String(t.canonical_source_brand||'').toUpperCase()!=='DONALDSON'||String(t.canonical_source_status||'').toUpperCase()!=='VERIFIED'||t.catalog_active!==true) throw new Error('TARGET_IDENTITY_CHANGED');
  if(Math.abs(Number(t.height_mm)-100)>0.5||Math.abs(Number(t.outer_diameter_mm)-83.9)>0.5||norm(t.thread_size)!=='M20X15') throw new Error('TARGET_GEOMETRY_CHANGED');

  const sp=await db.query(`SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1`,[SOURCE]);
  if(sp.rowCount!==1||norm(sp.rows[0].source_sku)!=='PH5046') throw new Error('SOURCE_PARENT_CHANGED');

  const tp=await db.query(`SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)`,[TARGET,DONALDSON]);
  if(tp.rowCount!==0) throw new Error('TARGET_PARENT_OR_P502051_ALREADY_OWNED');

  const rows=await db.query(`SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id`,[SOURCE,MANN]);
  if(rows.rowCount!==EXPECTED_ROWS) throw new Error(`W9084 rows ${rows.rowCount} != ${EXPECTED_ROWS}`);

  const other=await db.query(`SELECT source_sku,count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part($2) GROUP BY source_sku`,[SOURCE,MANN]);
  if(other.rowCount!==0) throw new Error(`SOURCE_HAS_OTHER_APPLICATIONS ${JSON.stringify(other.rows)}`);

  const ta=await db.query(`SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1`,[TARGET]);
  if(ta.rows[0].n!==0) throw new Error('TARGET_APPLICATIONS_CHANGED');

  const claim=await db.query(`SELECT elimfilters_sku FROM ld_catalog.ld_competitor_cross_references WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($1)`,[MANN]);
  if(claim.rowCount!==0) throw new Error('W9084_ALREADY_CLAIMED');

  report.pre={source_rows:rows.rowCount,source_other_application_groups:other.rowCount,target_application_rows:ta.rows[0].n,existing_claimants:claim.rowCount,target_parent_absent:true};

  if(EXECUTE){
   const p=await db.query(`INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1::varchar,$2::varchar,'Oil Filter',now(),now()) RETURNING elimfilters_sku`,[TARGET,DONALDSON]);
   if(p.rowCount!==1) throw new Error('TARGET_PARENT_INSERT_FAILED'); report.mutations.parent_inserted=1;
   const x=await db.query(`INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at) VALUES($1::varchar,$2::varchar,'MANN-FILTER',$3::varchar,now()) RETURNING id`,[TARGET,DONALDSON,MANN]);
   if(x.rowCount!==1) throw new Error('W9084_CROSSREF_INSERT_FAILED'); report.mutations.crossref_inserted=1;
   const m=await db.query(`UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)`,[TARGET,SOURCE,rows.rows.map(r=>r.id),MANN]);
   if(m.rowCount!==EXPECTED_ROWS) throw new Error(`W9084 moved ${m.rowCount} != ${EXPECTED_ROWS}`); report.mutations.applications_reowned=m.rowCount;
  }

  const post=await db.query(`SELECT
   (SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_parent,
   (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=$1 AND upper(regexp_replace(competitor_brand,'[^A-Z0-9]','','g'))='MANNFILTER' AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($4)) target_xref,
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) source_rows,
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) target_rows,
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications) global_total
  `,[TARGET,SOURCE,DONALDSON,MANN]); report.post=post.rows[0];

  if(EXECUTE){
   if(report.post.target_parent!==1||report.post.target_xref!==1||report.post.source_rows!==0||report.post.target_rows!==EXPECTED_ROWS) throw new Error('POSTCHECK_FAILED');
   await db.query('COMMIT'); report.transaction='COMMIT';
  }else{await db.query('ROLLBACK'); report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{};console.error(e.stack||e);process.exitCode=1}finally{await db.end()}
}
if(require.main===module) main();