'use strict';
const {Client}=require('pg');
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const add=(m,k,v)=>{if(!m.has(k))m.set(k,new Set());m.get(k).add(v)};
const dstFor=s=>({EA5:'EA3',EC5:'EC3',EF5:'EF3',EL5:'EL3'}[s.slice(0,3)]+s.slice(3));
(async()=>{const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();
const legacy=(await c.query(`SELECT elimfilters_sku,source_sku,segment FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku ~ '^(EA5|EC5|EF5|EL5)'`)).rows;
const srcSet=new Set(legacy.map(x=>x.elimfilters_sku)), dstSet=new Set(legacy.map(x=>dstFor(x.elimfilters_sku)));
const allSkus=[...srcSet,...dstSet];
const parents=(await c.query(`SELECT elimfilters_sku,source_sku,segment FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=ANY($1::text[])`,[allSkus])).rows;
const publicRows=(await c.query(`SELECT sku,codigo_base,canonical_source_code,competitor_codes,oem_codes FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])`,[[...dstSet]])).rows;
const refs=(await c.query(`SELECT elimfilters_sku,competitor_brand brand,competitor_part_number part FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=ANY($1::text[]) UNION ALL SELECT elimfilters_sku,oem_brand,oem_part_number FROM ld_catalog.ld_oem_cross_references WHERE elimfilters_sku=ANY($1::text[])`,[allSkus])).rows;
const parentBy=new Map(parents.map(x=>[x.elimfilters_sku,x])), pubBy=new Map(publicRows.map(x=>[x.sku,x])), codes=new Map();
for(const r of refs)add(codes,r.elimfilters_sku,norm(r.part));
for(const p of publicRows){for(const x of [...(p.competitor_codes||[]),...(p.oem_codes||[])]) add(codes,p.sku,norm(x.code||x.reference)); add(codes,p.sku,norm(p.codigo_base));add(codes,p.sku,norm(p.canonical_source_code));}
const out=[];for(const s of legacy){const dst=dstFor(s.elimfilters_sku), t=parentBy.get(dst), p=pubBy.get(dst), srcBase=norm(s.source_sku), targetBase=norm(t?.source_sku||p?.canonical_source_code||p?.codigo_base), dstCodes=codes.get(dst)||new Set(), srcCodes=codes.get(s.elimfilters_sku)||new Set();
 let status;if(!t&&!p)status='SAFE_EMPTY_TARGET'; else if(srcBase&&dstCodes.has(srcBase))status='SAFE_TARGET_CROSSES_SOURCE'; else if(targetBase&&srcCodes.has(targetBase))status='SAFE_SOURCE_CROSSES_TARGET'; else if(srcBase&&targetBase&&srcBase===targetBase)status='SAFE_SAME_BASE'; else status='OCCUPIED_UNPROVEN';
 out.push({src:s.elimfilters_sku,dst,source_sku:s.source_sku,target_source:t?.source_sku||null,public_base:p?.canonical_source_code||p?.codigo_base||null,status});}
const counts={};for(const x of out)counts[x.status]=(counts[x.status]||0)+1;console.log(JSON.stringify({counts,sample_unproven:out.filter(x=>x.status==='OCCUPIED_UNPROVEN').slice(0,30)},null,2));
require('fs').writeFileSync('C:/Users/ELIMSERVER/world-catalogue/tmp_ld5_reconcile.json',JSON.stringify(out,null,2));await c.end();})().catch(e=>{console.error(e);process.exit(1)});