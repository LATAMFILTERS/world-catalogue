'use strict';
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const TARGET='EA36507';
const SOURCE='EA34650';
const CURRENT='C24650/7';
const OLD='C24650';
const EXPECTED_OLD_ROWS=46;
const MANN_URL='https://www.mann-filter.com/us-en/catalog/search-results/product.html/c24650_mann-filter.html';

function key(r){
  return [r.make||'',r.model_family||'',r.model_type||'',r.year||'',r.engine_code||''].join('|');
}

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const u=new URL(url);
  if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',target:TARGET,source:SOURCE,current:CURRENT,old:OLD,pre:{},mutations:{},post:{}};
  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const products=await db.query(
      "SELECT sku,codigo_base,catalog_active,canonical_source_brand,canonical_source_code,canonical_source_status FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) ORDER BY sku FOR UPDATE",
      [[TARGET,SOURCE]]
    );
    const bySku=new Map(products.rows.map(r=>[r.sku,r]));
    const target=bySku.get(TARGET), source=bySku.get(SOURCE);
    if(!target||!source) throw new Error('PRODUCT_BASELINE_MISSING');
    if(target.codigo_base!=='C246507'||target.canonical_source_code!=='C246507'||target.canonical_source_brand!=='MANN-FILTER') throw new Error('TARGET_IDENTITY_CHANGED');
    if(source.codigo_base!=='4650'||source.catalog_active!==true) throw new Error('SOURCE_PLACEHOLDER_CHANGED');
    const parent=await db.query(
      "SELECT elimfilters_sku,source_sku,segment FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 FOR UPDATE",
      [SOURCE]
    );
    if(parent.rowCount!==1||parent.rows[0].source_sku!==OLD) throw new Error('SOURCE_PARENT_CHANGED');

    const oldRows=await db.query(
      "SELECT id,make,model_family,model_type,year,engine_code FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",
      [SOURCE,OLD]
    );
    if(oldRows.rowCount!==EXPECTED_OLD_ROWS) throw new Error('OLD_ROW_COUNT_CHANGED');

    const targetRows=await db.query(
      "SELECT make,model_family,model_type,year,engine_code FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1",
      [TARGET]
    );
    const targetKeys=new Set(targetRows.rows.map(key));
    const missing=oldRows.rows.filter(r=>!targetKeys.has(key(r)));
    if(missing.length) throw new Error('OLD_ROWS_NOT_FULLY_DUPLICATED');
    const xref=await db.query(
      "SELECT elimfilters_sku FROM ld_catalog.ld_competitor_cross_references WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($1)",
      [OLD]
    );
    if(xref.rowCount>0 && !(xref.rowCount===1&&xref.rows[0].elimfilters_sku===TARGET)) throw new Error('OLD_ALIAS_CONFLICT');

    report.pre={
      old_rows:oldRows.rowCount,
      exact_duplicates:oldRows.rowCount-missing.length,
      target_rows:targetRows.rowCount,
      source_parent:parent.rows[0].source_sku,
      source_active:source.catalog_active,
      existing_alias:xref.rowCount,
      mann_evidence:MANN_URL
    };

    if(EXECUTE){
      if(xref.rowCount===0){
        const ins=await db.query(
          `INSERT INTO ld_catalog.ld_competitor_cross_references
           (elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at)
           VALUES($1,$2,'MANN-FILTER',$3,now()) RETURNING id`,
          [TARGET,CURRENT,OLD]
        );
        if(ins.rowCount!==1) throw new Error('ALIAS_INSERT_FAILED');
        report.mutations.alias_inserted=1;
      }else report.mutations.alias_inserted=0;

      const deleted=await db.query(
        "DELETE FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND id=ANY($2::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)",
        [SOURCE,oldRows.rows.map(r=>r.id),OLD]
      );
      if(deleted.rowCount!==EXPECTED_OLD_ROWS) throw new Error('DUPLICATE_DELETE_FAILED');
      report.mutations.duplicate_applications_deleted=deleted.rowCount;

      const parentDel=await db.query(
        "DELETE FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)",
        [SOURCE,OLD]
      );
      if(parentDel.rowCount!==1) throw new Error('PLACEHOLDER_PARENT_DELETE_FAILED');
      report.mutations.parent_deleted=1;

      const retired=await db.query(
        "UPDATE public.elimfilters_catalog SET catalog_active=false WHERE sku=$1 AND catalog_active=true RETURNING sku",
        [SOURCE]
      );
      if(retired.rowCount!==1) throw new Error('PLACEHOLDER_RETIRE_FAILED');
      report.mutations.placeholder_retired=1;
      await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])',[[TARGET,SOURCE]]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)',[TARGET]);
      report.mutations.cache_refreshed=1;
    }

    const post=await db.query(`
      SELECT
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) source_old_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$2) source_parent_rows,
        (SELECT catalog_active FROM public.elimfilters_catalog WHERE sku=$2) source_active,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($4) AND sku=$1) old_resolves_target,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) current_resolves_target,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($4) AND sku<>$1) old_resolves_other
    `,[TARGET,SOURCE,CURRENT,OLD]);
    report.post=post.rows[0];

    if(EXECUTE){
      if(report.post.source_old_rows!==0||report.post.source_parent_rows!==0||report.post.source_active!==false||
         report.post.old_resolves_target!==1||report.post.current_resolves_target!==1||report.post.old_resolves_other!==0){
        throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
      }
      await db.query('COMMIT');report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK');report.transaction='ROLLBACK';
    }
    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK')}catch{}
    console.error(e.stack||e);
    process.exitCode=1;
  }finally{await db.end();}
}
if(require.main===module) main();
