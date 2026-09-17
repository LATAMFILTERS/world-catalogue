'use strict';
const fs=require('fs');
const path=require('path');
const {Client}=require('pg');
const ROOT=path.resolve(__dirname,'../..');
const EXECUTE=process.argv.includes('--execute');
const MAP_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-extended-namespace');
const REPORT_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-final-disposition');
function latestMap(){
  const files=fs.readdirSync(MAP_DIR).filter(f=>/^fram-ld-extended-map-.*\.json$/.test(f));
  if(!files.length)throw new Error('No extended map found');
  return files.map(f=>path.join(MAP_DIR,f)).sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs)[0];
}
async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url)throw new Error('CATALOG_DATABASE_URL missing');
  const mapFile=latestMap();
  const map=JSON.parse(fs.readFileSync(mapFile,'utf8'));
  const skus=[...new Set([...(map.rows||[]).map(r=>r.sku),'EA3318474','EL3276139'])];
  if(skus.length!==526)throw new Error(`Expected 526 extended SKUs, got ${skus.length}`);
  const client=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await client.connect();
  const report={mode:EXECUTE?'execute':'dry-run',map:mapFile,targets:skus.length,preflight:{},deleted:{},audit:{}};
  try{
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const pub=await client.query(`SELECT sku,canonical_source_brand,canonical_source_code,duty,filter_type FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])`,[skus]);
    report.preflight.public_rows=pub.rowCount;
    if(pub.rowCount!==526)throw new Error(`PUBLIC_TARGET_MISMATCH ${pub.rowCount}/526`);
    const bad=pub.rows.filter(r=>r.canonical_source_brand!=='FRAM'||r.duty!=='LIGHT_DUTY');
    if(bad.length)throw new Error(`TARGET_GUARD_FAILED ${bad.length}`);
    const pe=await client.query(`SELECT count(*)::int n FROM public.product_element WHERE elimfilters_sku=ANY($1::text[])`,[skus]);
    const pm=await client.query(`SELECT count(*)::int n FROM public.product_model WHERE elimfilters_sku=ANY($1::text[])`,[skus]);
    report.preflight.product_element=pe.rows[0].n;
    report.preflight.product_model=pm.rows[0].n;
    if(pe.rows[0].n||pm.rows[0].n)throw new Error('EXTERNAL_DEPENDENCIES_PRESENT');
    const tables=[
      ['ld_catalog.ld_competitor_cross_references','elimfilters_sku'],
      ['ld_catalog.ld_oem_cross_references','elimfilters_sku'],
      ['ld_catalog.ld_vehicle_applications','elimfilters_sku'],
      ['ld_catalog.ld_product_specifications','elimfilters_sku'],
      ['ld_catalog.ld_production_readiness','elimfilters_sku'],
      ['ld_catalog.ld_canonical_product_identity','elimfilters_sku'],
      ['ld_catalog.ld_product_catalog','elimfilters_sku']
    ];
    for(const [table,col] of tables){
      const q=await client.query(`DELETE FROM ${table} WHERE ${col}=ANY($1::text[])`,[skus]);
      report.deleted[table]=q.rowCount;
    }
    const delPub=await client.query(`DELETE FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])`,[skus]);
    report.deleted.public_catalog=delPub.rowCount;
    if(delPub.rowCount!==526)throw new Error(`PUBLIC_DELETE_COUNT ${delPub.rowCount}/526`);
    const left=await client.query(`SELECT count(*)::int n FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])`,[skus]);
    report.audit.remaining_public=left.rows[0].n;
    if(left.rows[0].n!==0)throw new Error(`ROLLBACK_LEFTOVERS ${left.rows[0].n}`);
    if(EXECUTE){await client.query('COMMIT');report.transaction='COMMIT';}
    else{await client.query('ROLLBACK');report.transaction='ROLLBACK';}
  }catch(e){
    try{await client.query('ROLLBACK')}catch{}
    report.error=e.message; report.transaction='ROLLBACK';
  }finally{await client.end();}
  fs.mkdirSync(REPORT_DIR,{recursive:true});
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const out=path.join(REPORT_DIR,`fram-extended-rollback-${EXECUTE?'execute':'dryrun'}-${stamp}.json`);
  fs.writeFileSync(out,JSON.stringify(report,null,2));
  console.log(JSON.stringify({report:out,...report},null,2));
  if(report.error)process.exitCode=1;
}
main().catch(e=>{console.error(e.stack||e.message);process.exit(1)});
