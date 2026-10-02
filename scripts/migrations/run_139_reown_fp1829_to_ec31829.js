'use strict';
const { Client } = require('pg');

const EXECUTE=process.argv.includes('--execute');
const SOURCE='EA31829';
const TARGET='EC31829';
const CODE='FP1829';
const EXPECTED_SOURCE_ROWS=160;
const EXPECTED_OVERLAP=154;
const EXPECTED_UNIQUE=6;
const EXPECTED_TARGET_ROWS=178;

const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
  const u=new URL(url);
  if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');

  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,code:CODE,pre:{},mutations:{duplicate_rows_deleted:0,unique_rows_reowned:0},post:{}};

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const products=await db.query(`
      SELECT sku,codigo_base,filter_type,duty,catalog_active
      FROM public.elimfilters_catalog
      WHERE sku=ANY($1::text[])
      ORDER BY sku
      FOR UPDATE
    `,[[SOURCE,TARGET]]);
    if(products.rowCount!==2) throw new Error('SOURCE_OR_TARGET_PRODUCT_MISSING');
    const bySku=new Map(products.rows.map(r=>[r.sku,r]));
    const source=bySku.get(SOURCE),target=bySku.get(TARGET);
    if(source.filter_type!=='air'||source.duty!=='LIGHT_DUTY'||norm(source.codigo_base)!=='1829') throw new Error('SOURCE_IDENTITY_CHANGED');
    if(target.filter_type!=='cabin'||target.duty!=='LIGHT_DUTY'||norm(target.codigo_base)!=='1829'||target.catalog_active!==true) throw new Error('TARGET_IDENTITY_CHANGED');

    const parents=await db.query(`
      SELECT elimfilters_sku,source_sku,segment
      FROM ld_catalog.ld_product_catalog
      WHERE elimfilters_sku=ANY($1::text[])
      ORDER BY elimfilters_sku
    `,[[SOURCE,TARGET]]);
    const parentBySku=new Map(parents.rows.map(r=>[r.elimfilters_sku,r]));
    if(norm(parentBySku.get(SOURCE)?.source_sku)!=='C1829') throw new Error('SOURCE_PARENT_CHANGED');
    if(norm(parentBySku.get(TARGET)?.source_sku)!=='CU1829') throw new Error('TARGET_PARENT_CHANGED');

    const sourceRows=await db.query(`
      SELECT id,source_sku,make,model_family,model_type,year,engine_code,ccm,kw,hp,source_origin
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku=$1
        AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
      ORDER BY id
    `,[SOURCE,CODE]);
    if(sourceRows.rowCount!==EXPECTED_SOURCE_ROWS) throw new Error(`FP1829 rows ${sourceRows.rowCount} != ${EXPECTED_SOURCE_ROWS}`);

    const targetRows=await db.query(`
      SELECT count(*)::int AS n,
             count(*) FILTER (WHERE ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('CU1829'))::int AS cu1829,
             count(*) FILTER (WHERE ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('CUK1829'))::int AS cuk1829
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku=$1
    `,[TARGET]);
    const tc=targetRows.rows[0];
    if(tc.n!==EXPECTED_TARGET_ROWS||tc.cu1829!==171||tc.cuk1829!==7) throw new Error(`TARGET_APPLICATION_BASELINE_CHANGED ${JSON.stringify(tc)}`);

    const overlap=await db.query(`
      SELECT count(*)::int AS n
      FROM ld_catalog.ld_vehicle_applications s
      WHERE s.elimfilters_sku=$1
        AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part($2)
        AND EXISTS (
          SELECT 1
          FROM ld_catalog.ld_vehicle_applications t
          WHERE t.elimfilters_sku=$3
            AND upper(coalesce(t.make,''))=upper(coalesce(s.make,''))
            AND upper(coalesce(t.model_family,''))=upper(coalesce(s.model_family,''))
            AND upper(coalesce(t.model_type,''))=upper(coalesce(s.model_type,''))
            AND coalesce(t.year,'')=coalesce(s.year,'')
            AND upper(coalesce(t.engine_code,''))=upper(coalesce(s.engine_code,''))
        )
    `,[SOURCE,CODE,TARGET]);
    if(overlap.rows[0].n!==EXPECTED_OVERLAP) throw new Error(`FP1829 overlap ${overlap.rows[0].n} != ${EXPECTED_OVERLAP}`);

    const unique=EXPECTED_SOURCE_ROWS-overlap.rows[0].n;
    if(unique!==EXPECTED_UNIQUE) throw new Error(`FP1829 unique ${unique} != ${EXPECTED_UNIQUE}`);
    report.pre={source_rows:sourceRows.rowCount,target_rows:tc.n,target_cu1829:tc.cu1829,target_cuk1829:tc.cuk1829,exact_overlap:overlap.rows[0].n,unique_rows:unique};

    const competingCabin=await db.query(`
      WITH unique_src AS (
        SELECT s.*
        FROM ld_catalog.ld_vehicle_applications s
        WHERE s.elimfilters_sku=$1
          AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part($2)
          AND NOT EXISTS (
            SELECT 1 FROM ld_catalog.ld_vehicle_applications t
            WHERE t.elimfilters_sku=$3
              AND upper(coalesce(t.make,''))=upper(coalesce(s.make,''))
              AND upper(coalesce(t.model_family,''))=upper(coalesce(s.model_family,''))
              AND upper(coalesce(t.model_type,''))=upper(coalesce(s.model_type,''))
              AND coalesce(t.year,'')=coalesce(s.year,'')
              AND upper(coalesce(t.engine_code,''))=upper(coalesce(s.engine_code,''))
          )
      )
      SELECT count(*)::int AS n
      FROM unique_src s
      JOIN ld_catalog.ld_vehicle_applications v
        ON upper(coalesce(v.make,''))=upper(coalesce(s.make,''))
       AND upper(coalesce(v.model_family,''))=upper(coalesce(s.model_family,''))
       AND upper(coalesce(v.model_type,''))=upper(coalesce(s.model_type,''))
       AND coalesce(v.year,'')=coalesce(s.year,'')
       AND upper(coalesce(v.engine_code,''))=upper(coalesce(s.engine_code,''))
      JOIN public.elimfilters_catalog c ON c.sku=v.elimfilters_sku
      WHERE c.filter_type='cabin' AND v.elimfilters_sku<>$3
    `,[SOURCE,CODE,TARGET]);
    if(competingCabin.rows[0].n!==0) throw new Error(`UNIQUE_FP1829_CABIN_COLLISIONS_${competingCabin.rows[0].n}`);

    if(EXECUTE){
      const dedup=await db.query(`
        DELETE FROM ld_catalog.ld_vehicle_applications s
        WHERE s.elimfilters_sku=$1
          AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part($2)
          AND EXISTS (
            SELECT 1 FROM ld_catalog.ld_vehicle_applications t
            WHERE t.elimfilters_sku=$3
              AND upper(coalesce(t.make,''))=upper(coalesce(s.make,''))
              AND upper(coalesce(t.model_family,''))=upper(coalesce(s.model_family,''))
              AND upper(coalesce(t.model_type,''))=upper(coalesce(s.model_type,''))
              AND coalesce(t.year,'')=coalesce(s.year,'')
              AND upper(coalesce(t.engine_code,''))=upper(coalesce(s.engine_code,''))
          )
      `,[SOURCE,CODE,TARGET]);
      if(dedup.rowCount!==EXPECTED_OVERLAP) throw new Error(`FP1829 dedupe ${dedup.rowCount} != ${EXPECTED_OVERLAP}`);
      report.mutations.duplicate_rows_deleted=dedup.rowCount;

      const moved=await db.query(`
        UPDATE ld_catalog.ld_vehicle_applications
        SET elimfilters_sku=$1
        WHERE elimfilters_sku=$2
          AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)
      `,[TARGET,SOURCE,CODE]);
      if(moved.rowCount!==EXPECTED_UNIQUE) throw new Error(`FP1829 reowned ${moved.rowCount} != ${EXPECTED_UNIQUE}`);
      report.mutations.unique_rows_reowned=moved.rowCount;
    }

    const post=await db.query(`
      SELECT
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) AS source_fp1829,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) AS target_fp1829,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2) AS target_total,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications) AS global_total
    `,[SOURCE,TARGET,CODE]);
    report.post=post.rows[0];

    if(EXECUTE){
      if(report.post.source_fp1829!==0||report.post.target_fp1829!==EXPECTED_UNIQUE||report.post.target_total!==EXPECTED_TARGET_ROWS+EXPECTED_UNIQUE) throw new Error(`POSTCHECK_FAILED ${JSON.stringify(report.post)}`);
      await db.query('COMMIT'); report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK'); report.transaction='ROLLBACK';
    }
    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK')}catch{}
    console.error(e.stack||e);
    process.exitCode=1;
  }finally{
    await db.end();
  }
}

if(require.main===module) main();
module.exports={SOURCE,TARGET,CODE,EXPECTED_SOURCE_ROWS,EXPECTED_OVERLAP,EXPECTED_UNIQUE,EXPECTED_TARGET_ROWS};
