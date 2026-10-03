'use strict';
const {Client}=require('pg');
const EXECUTE=process.argv.includes('--execute');
const SOURCE='EL39207', TARGET='EL80318', DONALDSON='P550318';
const CODES=['W920/7','W920/7Y'];
const EXPECTED={W9207:182,W9207Y:8};
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
 const u=new URL(url); if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}}); await db.connect();
 const report={mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,codes:CODES,pre:{},mutations:{parent_inserted:0,crossrefs_inserted:0,applications_reowned:0},post:{}};
 try{
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  const products=await db.query(`SELECT sku,codigo_base,filter_type,duty,canonical_source_brand,canonical_source_code,canonical_source_status,catalog_active FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) ORDER BY sku FOR UPDATE`,[[SOURCE,TARGET]]);
  if(products.rowCount!==2) throw new Error('SOURCE_OR_TARGET_PRODUCT_MISSING');
  const by=new Map(products.rows.map(r=>[r.sku,r])), t=by.get(TARGET);
  if(t.filter_type!=='oil'||t.duty!=='HEAVY_DUTY'||norm(t.codigo_base)!==norm(DONALDSON)||String(t.canonical_source_brand||'').toUpperCase()!=='DONALDSON'||String(t.canonical_source_status||'').toUpperCase()!=='VERIFIED'||t.catalog_active!==true) throw new Error('TARGET_IDENTITY_CHANGED');
  const parent=await db.query(`SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)`,[TARGET,DONALDSON]);
  if(parent.rowCount!==0) throw new Error('TARGET_PARENT_OR_P550318_ALREADY_OWNED');
  const counts={};
  for(const c of CODES){
    const q=await db.query(`SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id`,[SOURCE,c]);
    counts[norm(c)]={n:q.rowCount,ids:q.rows.map(r=>r.id)};
  }
  if(counts.W9207.n!==182||counts.W9207Y.n!==8) throw new Error(`SOURCE_COUNTS_CHANGED ${JSON.stringify(counts)}`);
  const hold=await db.query(`SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('WD920/7')`,[SOURCE]);
  if(hold.rows[0].n!==1) throw new Error('WD9207_HOLD_CHANGED');
  const targetApps=await db.query(`SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1`,[TARGET]);
  if(targetApps.rows[0].n!==0) throw new Error('TARGET_APPLICATIONS_CHANGED');
  for(const c of CODES){
    const q=await db.query(`SELECT elimfilters_sku FROM ld_catalog.ld_competitor_cross_references WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($1)`,[c]);
    if(q.rowCount) throw new Error(`${c}_ALREADY_CLAIMED`);
  }
  report.pre={w9207:182,w9207y:8,wd9207_hold:1,target_apps:0};
  if(EXECUTE){
    const p=await db.query(`INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1::varchar,$2::varchar,'Oil Filter',now(),now()) RETURNING elimfilters_sku`,[TARGET,DONALDSON]);
    if(p.rowCount!==1) throw new Error('TARGET_PARENT_INSERT_FAILED'); report.mutations.parent_inserted=1;
    for(const c of CODES){
      const x=await db.query(`INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at) VALUES($1::varchar,$2::varchar,'MANN-FILTER',$3::varchar,now()) RETURNING id`,[TARGET,DONALDSON,c]);
      if(x.rowCount!==1) throw new Error(`${c}_XREF_INSERT_FAILED`); report.mutations.crossrefs_inserted+=1;
    }
    const ids=[...counts.W9207.ids,...counts.W9207Y.ids];
    const m=await db.query(`UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ANY($4::text[])`,[TARGET,SOURCE,ids,CODES.map(norm)]);
    if(m.rowCount!==190) throw new Error(`MOVED_${m.rowCount}_NE_190`); report.mutations.applications_reowned=m.rowCount;
  }
  const post=await db.query(`SELECT
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)='W9207') w9207,
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)='W9207Y') w9207y,
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)='WD9207') wd9207_hold,
   (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications) global_total`,[TARGET,SOURCE]);
  report.post=post.rows[0];
  if(EXECUTE){
    if(report.post.w9207!==182||report.post.w9207y!==8||report.post.wd9207_hold!==1) throw new Error('POSTCHECK_FAILED');
    await db.query('COMMIT'); report.transaction='COMMIT';
  }else{await db.query('ROLLBACK'); report.transaction='ROLLBACK';}
  console.log(JSON.stringify(report,null,2));
 }catch(e){try{await db.query('ROLLBACK')}catch{};console.error(e.stack||e);process.exitCode=1}finally{await db.end()}
}
if(require.main===module) main();