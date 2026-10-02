'use strict';
const {Client}=require('pg');
const EXECUTE=process.argv.includes('--execute');
const SOURCE='EA33054', TARGET='EC33054', CODE='FP3054';
const EXPECTED_SOURCE_ROWS=137, EXPECTED_TARGET_ROWS=158, EXPECTED_OVERLAP=137;
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
 const u=new URL(url); if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}}); await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,code:CODE,pre:{},mutations:{duplicate_rows_deleted:0},post:{}};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const products=await db.query(`SELECT sku,codigo_base,filter_type,duty,catalog_active FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) ORDER BY sku FOR UPDATE`,[[SOURCE,TARGET]]);
  if(products.rowCount!==2) throw new Error('SOURCE_OR_TARGET_PRODUCT_MISSING');
  const by=new Map(products.rows.map(r=>[r.sku,r])), s=by.get(SOURCE), t=by.get(TARGET);
  if(s.filter_type!=='air'||s.duty!=='LIGHT_DUTY'||norm(s.codigo_base)!=='3054') throw new Error('SOURCE_IDENTITY_CHANGED');
  if(t.filter_type!=='cabin'||t.duty!=='LIGHT_DUTY'||norm(t.codigo_base)!=='3054'||t.catalog_active!==true) throw new Error('TARGET_IDENTITY_CHANGED');
  const parents=await db.query(`SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=ANY($1::text[])`,[[SOURCE,TARGET]]);
  const pb=new Map(parents.rows.map(r=>[r.elimfilters_sku,r.source_sku]));
  if(norm(pb.get(SOURCE))!=='C3054') throw new Error('SOURCE_PARENT_CHANGED');
  if(norm(pb.get(TARGET))!=='CU3054') throw new Error('TARGET_PARENT_CHANGED');
  const src=await db.query(`SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)`,[SOURCE,CODE]);
  if(src.rowCount!==EXPECTED_SOURCE_ROWS) throw new Error(`FP3054 rows ${src.rowCount} != ${EXPECTED_SOURCE_ROWS}`);
  const tgt=await db.query(`SELECT count(*)::int n,count(*) FILTER (WHERE ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('CU3054'))::int cu3054,count(*) FILTER (WHERE ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('CUK3054'))::int cuk3054 FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1`,[TARGET]);
  const tc=tgt.rows[0]; if(tc.n!==EXPECTED_TARGET_ROWS||tc.cu3054!==156||tc.cuk3054!==2) throw new Error(`TARGET_APPLICATION_BASELINE_CHANGED ${JSON.stringify(tc)}`);
  const ov=await db.query(`
    SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications s
    WHERE s.elimfilters_sku=$1 AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part($2)
      AND EXISTS (SELECT 1 FROM ld_catalog.ld_vehicle_applications t
        WHERE t.elimfilters_sku=$3
          AND upper(coalesce(t.make,''))=upper(coalesce(s.make,''))
          AND upper(coalesce(t.model_family,''))=upper(coalesce(s.model_family,''))
          AND upper(coalesce(t.model_type,''))=upper(coalesce(s.model_type,''))
          AND coalesce(t.year,'')=coalesce(s.year,'')
          AND upper(coalesce(t.engine_code,''))=upper(coalesce(s.engine_code,'')))
  `,[SOURCE,CODE,TARGET]);
  if(ov.rows[0].n!==EXPECTED_OVERLAP) throw new Error(`FP3054 overlap ${ov.rows[0].n} != ${EXPECTED_OVERLAP}`);
  report.pre={source_rows:src.rowCount,target_rows:tc.n,target_cu3054:tc.cu3054,target_cuk3054:tc.cuk3054,exact_overlap:ov.rows[0].n,unique_rows:EXPECTED_SOURCE_ROWS-ov.rows[0].n};
  if(report.pre.unique_rows!==0) throw new Error('FP3054_UNEXPECTED_UNIQUE_ROWS');
  if(EXECUTE){
    const del=await db.query(`
      DELETE FROM ld_catalog.ld_vehicle_applications s
      WHERE s.elimfilters_sku=$1 AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part($2)
        AND EXISTS (SELECT 1 FROM ld_catalog.ld_vehicle_applications t
          WHERE t.elimfilters_sku=$3
            AND upper(coalesce(t.make,''))=upper(coalesce(s.make,''))
            AND upper(coalesce(t.model_family,''))=upper(coalesce(s.model_family,''))
            AND upper(coalesce(t.model_type,''))=upper(coalesce(s.model_type,''))
            AND coalesce(t.year,'')=coalesce(s.year,'')
            AND upper(coalesce(t.engine_code,''))=upper(coalesce(s.engine_code,'')))
    `,[SOURCE,CODE,TARGET]);
    if(del.rowCount!==EXPECTED_SOURCE_ROWS) throw new Error(`FP3054 dedupe ${del.rowCount} != ${EXPECTED_SOURCE_ROWS}`);
    report.mutations.duplicate_rows_deleted=del.rowCount;
  }
  const post=await db.query(`SELECT
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) source_fp3054,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2) target_total,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications) global_total
  `,[SOURCE,TARGET,CODE]); report.post=post.rows[0];
  if(EXECUTE){
    if(report.post.source_fp3054!==0||report.post.target_total!==EXPECTED_TARGET_ROWS) throw new Error(`POSTCHECK_FAILED ${JSON.stringify(report.post)}`);
    await db.query('COMMIT'); report.transaction='COMMIT';
  }else{await db.query('ROLLBACK'); report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{};console.error(e.stack||e);process.exitCode=1}
 finally{await db.end()}
}
if(require.main===module) main();
