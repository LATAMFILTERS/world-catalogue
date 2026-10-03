'use strict';
const {Client}=require('pg');
const EXECUTE=process.argv.includes('--execute');
const CASES=[
  {source:'EA35853',target:'EA16386',mann:'C27585/3',donaldson:'P776386',rows:42},
  {source:'EA38715',target:'EA11510',mann:'C28715',donaldson:'P771510',rows:65},
];
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
 const u=new URL(url);
 if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}}); await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',cases:[],global_before:null,global_after:null,transaction:null};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  report.global_before=(await db.query('SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications')).rows[0].n;

  for(const c of CASES){
   const products=await db.query(`
    SELECT sku,codigo_base,filter_type,duty,canonical_source_brand,canonical_source_code,canonical_source_status,catalog_active
    FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) ORDER BY sku FOR UPDATE
   `,[[c.source,c.target]]);
   if(products.rowCount!==2) throw new Error('SOURCE_OR_TARGET_PRODUCT_MISSING '+c.source);
   const by=new Map(products.rows.map(r=>[r.sku,r])), s=by.get(c.source), t=by.get(c.target);

   if(s.filter_type!=='air'||s.duty!=='LIGHT_DUTY'||String(s.canonical_source_brand||'').toUpperCase()!=='MANN-FILTER'||norm(s.canonical_source_code)!==norm(c.mann)){
    throw new Error('SOURCE_IDENTITY_CHANGED '+c.source);
   }
   if(t.filter_type!=='air'||t.duty!=='HEAVY_DUTY'||String(t.canonical_source_brand||'').toUpperCase()!=='DONALDSON'||norm(t.canonical_source_code)!==norm(c.donaldson)||String(t.canonical_source_status||'').toUpperCase()!=='VERIFIED'||t.catalog_active!==true){
    throw new Error('TARGET_IDENTITY_CHANGED '+c.target);
   }

   const sp=await db.query('SELECT source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1',[c.source]);
   if(sp.rowCount!==1||norm(sp.rows[0].source_sku)!==norm(c.mann)) throw new Error('SOURCE_PARENT_CHANGED '+c.source);

   const tp=await db.query(`
    SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog
    WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
   `,[c.target,c.donaldson]);
   if(tp.rowCount!==0) throw new Error('TARGET_PARENT_OR_DONALDSON_ALREADY_OWNED '+c.target);

   const rows=await db.query(`
    SELECT id FROM ld_catalog.ld_vehicle_applications
    WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
    ORDER BY id
   `,[c.source,c.mann]);
   if(rows.rowCount!==c.rows) throw new Error(`${c.source} rows ${rows.rowCount} != ${c.rows}`);

   const other=await db.query(`
    SELECT source_sku,count(*)::int n FROM ld_catalog.ld_vehicle_applications
    WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part($2)
    GROUP BY source_sku
   `,[c.source,c.mann]);
   if(other.rowCount!==0) throw new Error('SOURCE_HAS_OTHER_APPLICATIONS '+c.source);

   const ta=await db.query('SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1',[c.target]);
   if(ta.rows[0].n!==0) throw new Error('TARGET_APPLICATIONS_CHANGED '+c.target);

   const claim=await db.query(`
    SELECT elimfilters_sku FROM ld_catalog.ld_competitor_cross_references
    WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($1)
   `,[c.mann]);
   if(claim.rowCount!==0) throw new Error('MANN_ALREADY_CLAIMED '+c.mann);

   const item={...c,pre:{source_rows:rows.rowCount,target_rows:0,claimants:0},mutations:{parent_inserted:0,crossref_inserted:0,applications_reowned:0},post:{}};

   if(EXECUTE){
    const p=await db.query(`
      INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at)
      VALUES($1::varchar,$2::varchar,'Air Filter',now(),now()) RETURNING elimfilters_sku
    `,[c.target,c.donaldson]);
    if(p.rowCount!==1) throw new Error('TARGET_PARENT_INSERT_FAILED '+c.target);
    item.mutations.parent_inserted=1;

    const x=await db.query(`
      INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at)
      VALUES($1::varchar,$2::varchar,'MANN-FILTER',$3::varchar,now()) RETURNING id
    `,[c.target,c.donaldson,c.mann]);
    if(x.rowCount!==1) throw new Error('XREF_INSERT_FAILED '+c.mann);
    item.mutations.crossref_inserted=1;

    const m=await db.query(`
      UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1
      WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[])
        AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)
    `,[c.target,c.source,rows.rows.map(r=>r.id),c.mann]);
    if(m.rowCount!==c.rows) throw new Error('MOVE_COUNT_MISMATCH '+c.mann);
    item.mutations.applications_reowned=m.rowCount;
   }

   const post=await db.query(`
    SELECT
      (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) source_rows,
      (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_rows,
      (SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) target_parent,
      (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($3)) target_xref
   `,[c.source,c.target,c.mann,c.donaldson]);
   item.post=post.rows[0];

   if(EXECUTE && (item.post.source_rows!==0||item.post.target_rows!==c.rows||item.post.target_parent!==1||item.post.target_xref!==1)){
    throw new Error('POSTCHECK_FAILED '+c.mann+' '+JSON.stringify(item.post));
   }
   report.cases.push(item);
  }

  report.global_after=(await db.query('SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications')).rows[0].n;
  if(report.global_before!==report.global_after) throw new Error('GLOBAL_APPLICATION_TOTAL_CHANGED');

  if(EXECUTE){await db.query('COMMIT'); report.transaction='COMMIT';}
  else {await db.query('ROLLBACK'); report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{};console.error(e.stack||e);process.exitCode=1}
 finally{await db.end()}
}
if(require.main===module) main();
