'use strict';
const fs=require('fs'),{Client}=require('pg');
const R=JSON.parse(fs.readFileSync('C:/Users/ELIMSERVER/world-catalogue/elimfilters-vault/91-private-evidence/fram-ld-gap-analysis/fram-ld-gap-2026-09-13T06-38-00-337Z.json','utf8'));
const rows=R.results.filter(r=>r.status==='SKU_COLLISION_EXISTING');
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const body=a=>{const d=String(a||'').replace(/\D/g,'');return d.slice(-4).padStart(4,'0')};
(async()=>{const c=new Client({connectionString:process.env.CATALOG_DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();const skus=[...new Set(rows.map(r=>r.proposedSku))];
const pub=(await c.query(`SELECT sku,codigo_base,canonical_source_status FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])`,[skus])).rows;const ids=(await c.query(`SELECT elimfilters_sku FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=ANY($1::text[]) AND status='ACTIVE'`,[skus])).rows;
const p=new Map(pub.map(x=>[x.sku,x])), id=new Set(ids.map(x=>x.elimfilters_sku));const safe=rows.filter(r=>norm(p.get(r.proposedSku)?.codigo_base)===body(r.authority)&&!id.has(r.proposedSku)&&p.get(r.proposedSku)?.canonical_source_status!=='VERIFIED');
const g=new Map();for(const r of safe){if(!g.has(r.proposedSku))g.set(r.proposedSku,[]);g.get(r.proposedSku).push(r.authority)}
const singles=[...g].filter(([,v])=>v.length===1),multi=[...g].filter(([,v])=>v.length>1);console.log(JSON.stringify({safe_rows:safe.length,safe_unique_targets:g.size,single_targets:singles.length,multi_targets:multi.length,multi_rows:multi.reduce((n,[,v])=>n+v.length,0),multi:multi.slice(0,50).map(([sku,a])=>({sku,authorities:a}))},null,2));await c.end()})().catch(e=>{console.error(e);process.exit(1)});
