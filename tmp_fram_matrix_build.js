'use strict';
const fs=require('fs'),path=require('path'),{Client}=require('pg');
const ROOT='C:/Users/ELIMSERVER/world-catalogue';
const DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-gap-analysis');
const files=fs.readdirSync(DIR).filter(f=>/^fram-ld-gap-.*\.json$/.test(f)).map(f=>path.join(DIR,f)).sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs);
const report=JSON.parse(fs.readFileSync(files[0],'utf8'));
const pending=report.results.filter(r=>!['EXISTING_DIRECT','EXISTING_MULTI_CROSS','VARIANT_OF_AUTHORITY','REAL_GAP_CREATE_SAFE'].includes(r.status));
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const body=a=>{const d=String(a||'').replace(/\D/g,'');return d.slice(-4).padStart(4,'0')};
const csv=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
(async()=>{const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();
const skus=[...new Set(pending.map(r=>r.proposedSku).filter(Boolean))];
const pub=(await c.query(`SELECT sku,codigo_base,canonical_source_brand,canonical_source_code,canonical_source_status,duty,filter_type FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])`,[skus])).rows;
const ids=(await c.query(`SELECT elimfilters_sku,canonical_brand,canonical_part_number,status FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=ANY($1::text[]) AND status='ACTIVE'`,[skus])).rows;
const counts=(await c.query(`SELECT s.sku,
 (SELECT count(*) FROM ld_catalog.ld_competitor_cross_references x WHERE x.elimfilters_sku=s.sku)::int cross_count,
 (SELECT count(*) FROM ld_catalog.ld_oem_cross_references x WHERE x.elimfilters_sku=s.sku)::int oem_count,
 (SELECT count(*) FROM ld_catalog.ld_vehicle_applications x WHERE x.elimfilters_sku=s.sku)::int app_count,
 (SELECT count(*) FROM ld_catalog.ld_product_specifications x WHERE x.elimfilters_sku=s.sku)::int spec_count
 FROM unnest($1::text[]) s(sku)`,[skus])).rows;
const pm=new Map(pub.map(x=>[x.sku,x])), im=new Map(ids.map(x=>[x.elimfilters_sku,x])), cm=new Map(counts.map(x=>[x.sku,x]));const rows=pending.map(r=>{const p=pm.get(r.proposedSku)||{},i=im.get(r.proposedSku)||null,k=cm.get(r.proposedSku)||{};let action='TRUE_QUARANTINE',reason=r.status;
if(r.status==='SKU_COLLISION_EXISTING'){
 const placeholder=norm(p.codigo_base)===body(r.authority)&&!i&&p.canonical_source_status!=='VERIFIED';
 const empty=(k.cross_count||0)+(k.oem_count||0)+(k.app_count||0)+(k.spec_count||0)===0;
 if(placeholder&&empty){action='REPLACE_EMPTY_PLACEHOLDER';reason='LEGACY_EMPTY_UNVERIFIED_SLOT';}
 else if(placeholder){action='REVIEW_LEGACY_PLACEHOLDER';reason='LEGACY_UNVERIFIED_SLOT_WITH_DATA';}
 else if(i||p.canonical_source_status==='VERIFIED'){action='DISTINCT_COLLISION';reason='CANONICAL_SLOT_OCCUPIED';}
 else {action='TRUE_QUARANTINE';reason='OCCUPIED_UNPROVEN';}
} else if(r.status==='FRAM_SKU_COLLISION'){action='DISTINCT_COLLISION';reason='MULTIPLE_FRAM_AUTHORITIES_SAME_LAST4';}
else if(r.status==='INSUFFICIENT_EXISTING'){action='TRUE_QUARANTINE';reason='SINGLE_WEAK_EXISTING_MATCH';}
else if(r.status==='AMBIGUOUS_EXISTING'){action='TRUE_QUARANTINE';reason='MULTIPLE_EXISTING_MATCHES';}
else if(r.status==='CROSS_FAMILY_DIRECT_CONFLICT'){action='TRUE_QUARANTINE';reason='CROSS_FAMILY_DIRECT_CONFLICT';}
return {authority:r.authority,family:r.family,status:r.status,proposedSku:r.proposedSku||'',action,reason,target_codigo_base:p.codigo_base||'',target_canonical_status:p.canonical_source_status||'',target_identity:i?`${i.canonical_brand}:${i.canonical_part_number}`:'',cross_count:k.cross_count||0,oem_count:k.oem_count||0,app_count:k.app_count||0,spec_count:k.spec_count||0,file:r.file};});
const summary={};for(const r of rows)summary[r.action]=(summary[r.action]||0)+1;
const outDir=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-final-matrix');fs.mkdirSync(outDir,{recursive:true});
const stamp=new Date().toISOString().replace(/[:.]/g,'-');const jsonFile=path.join(outDir,`fram-final-matrix-${stamp}.json`),csvFile=path.join(outDir,`fram-final-matrix-${stamp}.csv`);
fs.writeFileSync(jsonFile,JSON.stringify({generated_at:new Date().toISOString(),gap_report:files[0],total:rows.length,summary,rows},null,2));
const cols=['authority','family','status','proposedSku','action','reason','target_codigo_base','target_canonical_status','target_identity','cross_count','oem_count','app_count','spec_count','file'];
fs.writeFileSync(csvFile,[cols.join(','),...rows.map(r=>cols.map(c=>csv(r[c])).join(','))].join('\n'));
console.log(JSON.stringify({gap_report:files[0],total:rows.length,summary,jsonFile,csvFile},null,2));
await c.end();})().catch(e=>{console.error(e.stack||e.message);process.exit(1)});