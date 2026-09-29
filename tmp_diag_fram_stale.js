'use strict';
const fs=require('fs'),path=require('path'),{Client}=require('pg');
(async()=>{
 const dir='C:/Users/ELIMSERVER/world-catalogue/elimfilters-vault/91-private-evidence/fram-ld-gap-analysis';
 const f=fs.readdirSync(dir).filter(x=>x.startsWith('fram-ld-gap-')).map(x=>path.join(dir,x)).sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs)[0];
 const safe=JSON.parse(fs.readFileSync(f,'utf8')).safe_candidates;
 const auth=safe.map(x=>String(x.authority).toUpperCase().replace(/[^A-Z0-9]/g,''));
 const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();
 const q=await c.query(`SELECT upper(regexp_replace(competitor_part_number,'[^A-Z0-9]','','g')) authority,elimfilters_sku,competitor_part_number FROM ld_catalog.ld_competitor_cross_references WHERE upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND upper(regexp_replace(competitor_part_number,'[^A-Z0-9]','','g'))=ANY($1::text[]) ORDER BY authority,elimfilters_sku`,[auth]);
 console.log(JSON.stringify({count:q.rowCount,sample:q.rows.slice(0,30)},null,2));await c.end();
})().catch(e=>{console.error(e.stack||e.message);process.exit(1)});
