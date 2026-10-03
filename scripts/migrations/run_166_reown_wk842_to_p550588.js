'use strict';
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const TARGET='ES90588';
const SOURCE='EF30842';
const BASE='P550588';
const MANN='WK842';
const EXPECTED=645;
const DONALDSON_URL='https://shop.donaldson.com/store/en-na/product/P550588/20456';
const MANN_URL='https://www.mann-filter.com/us-en/catalog/search-results/product.html/wk842_mann-filter.html';

async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('DB URL missing');
 const u=new URL(url);
 if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
 await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',target:TARGET,source:SOURCE,base:BASE,mann:MANN,pre:{},mutations:{},post:{}};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const products=await db.query(
   "SELECT sku,codigo_base,duty,filter_type,technology,canonical_source_brand,canonical_source_code,canonical_source_status,catalog_active,enrichment_data FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) ORDER BY sku FOR UPDATE",
   [[TARGET,SOURCE]]
  );
  const by=new Map(products.rows.map(r=>[r.sku,r]));
  const t=by.get(TARGET),s=by.get(SOURCE);
  if(!t||!s) throw new Error('PRODUCT_BASELINE_MISSING');
  if(t.codigo_base!==BASE||t.duty!=='HEAVY_DUTY'||t.filter_type!=='fuel'||t.technology!=='HYDROCORE™'||t.canonical_source_brand!=='DONALDSON'||t.canonical_source_code!==BASE||t.canonical_source_status!=='VERIFIED') throw new Error('TARGET_IDENTITY_CHANGED');
  if(s.codigo_base!=='0842'||s.duty!=='LIGHT_DUTY'||s.filter_type!=='fuel'||s.catalog_active!==true) throw new Error('SOURCE_PLACEHOLDER_CHANGED');
  const rows=await db.query(
   "SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",
   [SOURCE,MANN]
  );
  if(rows.rowCount!==EXPECTED) throw new Error('WK842_ROW_COUNT_CHANGED '+rows.rowCount);

  const sourceParent=await db.query(
   "SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 FOR UPDATE",
   [SOURCE]
  );
  if(sourceParent.rowCount!==1||ldnorm(sourceParent.rows[0].source_sku)!==ldnorm(MANN)) throw new Error('SOURCE_PARENT_CHANGED');

  const targetParent=await db.query(
   "SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1",
   [TARGET]
  );
  if(targetParent.rowCount>0 && !(targetParent.rowCount===1&&targetParent.rows[0].source_sku===BASE)) throw new Error('TARGET_PARENT_CONFLICT');

  const xref=await db.query(
   "SELECT elimfilters_sku,competitor_part_number FROM ld_catalog.ld_competitor_cross_references WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($1)",
   [MANN]
  );
  if(xref.rowCount>0 && !(xref.rowCount===1&&xref.rows[0].elimfilters_sku===TARGET)) throw new Error('WK842_XREF_CONFLICT '+JSON.stringify(xref.rows));

  const legacy=await db.query(
   "SELECT count(*)::int n FROM public.elimfilters_catalog c CROSS JOIN LATERAL jsonb_array_elements(coalesce(c.competitor_codes,'[]'::jsonb)) x WHERE c.sku=$1 AND ld_catalog.norm_part(x->>'code')=ld_catalog.norm_part($2)",
   [TARGET,MANN]
  );
  if(legacy.rows[0].n<1) throw new Error('TARGET_LEGACY_WK842_EVIDENCE_MISSING');

  report.pre={source_rows:rows.rowCount,source_parent:sourceParent.rows[0].source_sku,target_parent:targetParent.rowCount,existing_xref:xref.rowCount,target_legacy_wk842_refs:legacy.rows[0].n,duty_source:s.duty,duty_target:t.duty,evidence:{donaldson:DONALDSON_URL,mann:MANN_URL}};
  if(EXECUTE){
   if(targetParent.rowCount===0){
    const p=await db.query(
     "INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1,$2,'Fuel Filter',now(),now()) RETURNING elimfilters_sku",
     [TARGET,BASE]
    );
    if(p.rowCount!==1) throw new Error('TARGET_PARENT_INSERT_FAILED');
    report.mutations.target_parent_inserted=1;
   }else report.mutations.target_parent_inserted=0;

   if(xref.rowCount===0){
    const x=await db.query(
     "INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at) VALUES($1,$2,'MANN-FILTER',$3,now()) RETURNING id",
     [TARGET,BASE,MANN]
    );
    if(x.rowCount!==1) throw new Error('WK842_XREF_INSERT_FAILED');
    report.mutations.xref_inserted=1;
   }else report.mutations.xref_inserted=0;

   const moved=await db.query(
    "UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)",
    [TARGET,SOURCE,rows.rows.map(r=>r.id),MANN]
   );
   if(moved.rowCount!==EXPECTED) throw new Error('APPLICATION_MOVE_FAILED '+moved.rowCount);
   report.mutations.applications_reowned=moved.rowCount;

   const pdel=await db.query(
    "DELETE FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)",
    [SOURCE,MANN]
   );
   if(pdel.rowCount!==1) throw new Error('SOURCE_PARENT_DELETE_FAILED');
   report.mutations.source_parent_deleted=1;

   const retired=await db.query(
    "UPDATE public.elimfilters_catalog SET catalog_active=false WHERE sku=$1 AND catalog_active=true RETURNING sku",
    [SOURCE]
   );
   if(retired.rowCount!==1) throw new Error('SOURCE_RETIRE_FAILED');
   report.mutations.source_retired=1;

   await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])',[[TARGET,SOURCE]]);
   await db.query('SELECT public.refresh_crossref_cache_sku($1)',[TARGET]);
   report.mutations.cache_refreshed=1;
  }
  const post=await db.query(`
   SELECT
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_rows,
    (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) source_rows,
    (SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$2) source_parent_rows,
    (SELECT catalog_active FROM public.elimfilters_catalog WHERE sku=$2) source_active,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) mann_resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($4) AND sku=$1) base_resolves,
    (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku<>$1) mann_other,
    (SELECT duty FROM public.elimfilters_catalog WHERE sku=$1) target_duty
  `,[TARGET,SOURCE,MANN,BASE]);
  report.post=post.rows[0];

  if(EXECUTE){
   if(report.post.target_rows!==EXPECTED||report.post.source_rows!==0||report.post.source_parent_rows!==0||
      report.post.source_active!==false||report.post.mann_resolves!==1||report.post.base_resolves!==1||
      report.post.mann_other!==0||report.post.target_duty!=='HEAVY_DUTY'){
    throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
   }
   await db.query('COMMIT');report.transaction='COMMIT';
  }else{
   await db.query('ROLLBACK');report.transaction='ROLLBACK';
  }
  console.log(JSON.stringify(report,null,2));
 }catch(e){
  try{await db.query('ROLLBACK')}catch{}
  console.error(e.stack||e);process.exitCode=1;
 }finally{await db.end();}
}
function ldnorm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
if(require.main===module) main();
