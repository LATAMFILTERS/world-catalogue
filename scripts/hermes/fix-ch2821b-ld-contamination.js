'use strict';
const fs=require('fs');
const path=require('path');
const {Client}=require('pg');
const ROOT=path.resolve(__dirname,'../..');
const EXECUTE=process.argv.includes('--execute');
const REPORT_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-final-disposition');
const SKU='EL32821', AUTH='CH2821B';
async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url)throw new Error('CATALOG_DATABASE_URL missing');
  const c=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await c.connect();
  const report={mode:EXECUTE?'execute':'dry-run',sku:SKU,authority:AUTH,deleted:{},audit:{}};
  try{
    await c.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const row=(await c.query(`SELECT sku,codigo_base,canonical_source_brand,canonical_source_code,duty,filter_type FROM public.elimfilters_catalog WHERE sku=$1`,[SKU])).rows[0];
    report.before=row||null;
    if(!row||row.canonical_source_brand!=='FRAM'||row.canonical_source_code!==AUTH||row.duty!=='LIGHT_DUTY'||row.filter_type!=='oil')throw new Error('TARGET_GUARD_FAILED');
    const dep=(await c.query(`SELECT (SELECT count(*) FROM public.product_element WHERE elimfilters_sku=$1)::int pe,(SELECT count(*) FROM public.product_model WHERE elimfilters_sku=$1)::int pm`,[SKU])).rows[0];
    if(dep.pe||dep.pm)throw new Error('EXTERNAL_DEPENDENCY_PRESENT');
    await c.query(`INSERT INTO ld_catalog.ld_fram_final_quarantine
      (authority_normalized,authority,family,proposed_sku,analyzer_status,final_reason,candidates,source_file,policy_version)
      VALUES($1,$2,'LUBE',$3,'HD_SCOPE_CONFLICT',$4,'[]'::jsonb,$5,$6)
      ON CONFLICT(authority_normalized) DO UPDATE SET family=excluded.family,proposed_sku=excluded.proposed_sku,
      analyzer_status=excluded.analyzer_status,final_reason=excluded.final_reason,candidates=excluded.candidates,
      source_file=excluded.source_file,policy_version=excluded.policy_version,updated_at=now()`,
      ['CH2821B',AUTH,SKU,'FRAM source applications include Leyland heavy-duty, Cummins V378/V504, Chevrolet C70 and GMC C7000; removed from LD namespace pending HD classification.',
       'C:\\Users\\ELIMSERVER\\world-catalogue\\elimfilters-vault\\91-private-evidence\\fram-usa-ld-catalog\\fram-usa-ld-full-20260911\\products\\CH2821B.json','FRAM_LD_NAMESPACE_CORRECTION_2026_09_14']);
    const tables=[
      ['ld_catalog.ld_competitor_cross_references','elimfilters_sku'],['ld_catalog.ld_oem_cross_references','elimfilters_sku'],
      ['ld_catalog.ld_vehicle_applications','elimfilters_sku'],['ld_catalog.ld_product_specifications','elimfilters_sku'],
      ['ld_catalog.ld_production_readiness','elimfilters_sku'],['ld_catalog.ld_canonical_product_identity','elimfilters_sku'],
      ['ld_catalog.ld_product_catalog','elimfilters_sku']
    ];
    for(const [t,col] of tables){report.deleted[t]=(await c.query(`DELETE FROM ${t} WHERE ${col}=$1`,[SKU])).rowCount;}
    report.deleted.public_catalog=(await c.query(`DELETE FROM public.elimfilters_catalog WHERE sku=$1`,[SKU])).rowCount;
    const left=(await c.query(`SELECT count(*)::int n FROM public.elimfilters_catalog WHERE sku=$1`,[SKU])).rows[0].n;
    report.audit.remaining_public=left;
    if(left!==0||report.deleted.public_catalog!==1)throw new Error('DELETE_AUDIT_FAILED');
    if(EXECUTE){await c.query('COMMIT');report.transaction='COMMIT';}
    else{await c.query('ROLLBACK');report.transaction='ROLLBACK';}
  }catch(e){try{await c.query('ROLLBACK')}catch{} report.error=e.message; report.transaction='ROLLBACK';}
  finally{await c.end();}
  fs.mkdirSync(REPORT_DIR,{recursive:true});
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const out=path.join(REPORT_DIR,`fram-ch2821b-ld-fix-${EXECUTE?'execute':'dryrun'}-${stamp}.json`);
  fs.writeFileSync(out,JSON.stringify(report,null,2));
  console.log(JSON.stringify({report:out,...report},null,2));
  if(report.error)process.exitCode=1;
}
main().catch(e=>{console.error(e.stack||e.message);process.exit(1)});
