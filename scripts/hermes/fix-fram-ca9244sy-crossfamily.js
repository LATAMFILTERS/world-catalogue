'use strict';
const {Client}=require('pg');
const fs=require('fs'),path=require('path');
const EXECUTE=process.argv.includes('--execute');
(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('CATALOG_DATABASE_URL missing');
  const c=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});await c.connect();
  const report={mode:EXECUTE?'execute':'dry-run',authority:'CA9244SY',wrong_sku:'EC34005'};
  try{
    await c.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const before=(await c.query("SELECT x.elimfilters_sku,x.competitor_brand,x.competitor_part_number,c.filter_type,c.duty FROM ld_catalog.ld_competitor_cross_references x JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku WHERE x.elimfilters_sku='EC34005' AND upper(regexp_replace(coalesce(x.competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(x.competitor_part_number)=ld_catalog.norm_part('CA9244SY')")).rows;
    report.before=before;if(before.length!==1)throw new Error(`Expected 1 wrong row, got ${before.length}`);
    const del=await c.query("DELETE FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku='EC34005' AND upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part('CA9244SY') RETURNING *");
    report.deleted=del.rowCount;
    const after=(await c.query("SELECT count(*)::int n FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku='EC34005' AND upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part('CA9244SY')")).rows[0].n;
    report.after=after;if(after!==0)throw new Error('Delete audit failed');
    if(EXECUTE)await c.query('COMMIT');else await c.query('ROLLBACK');report.transaction=EXECUTE?'COMMIT':'ROLLBACK';
  }finally{await c.end();const dir='C:/Users/ELIMSERVER/world-catalogue/elimfilters-vault/91-private-evidence/fram-ld-final-disposition';fs.mkdirSync(dir,{recursive:true});const out=path.join(dir,`fram-ca9244sy-fix-${EXECUTE?'execute':'dryrun'}-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);fs.writeFileSync(out,JSON.stringify(report,null,2));console.log(JSON.stringify({report:out,...report},null,2));}
})().catch(e=>{console.error(e.stack||e.message);process.exit(1)});