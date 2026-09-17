'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{Client}=require('pg');
const ROOT=path.resolve(__dirname,'../..');
const GAP_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-gap-analysis');
const OUT_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-final-matrix');
const RECLASS=path.join(ROOT,'tmp_fram_collision_reclassify.json');
const PREFIX={AIR:'EA3',CABIN:'EC3',FUEL:'EF3',LUBE:'EL3'};
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const body=a=>{const d=String(a||'').replace(/\D/g,'');return d.slice(-4).padStart(4,'0')};
const latest=()=>fs.readdirSync(GAP_DIR).filter(f=>/^fram-ld-gap-.*\.json$/.test(f)).map(f=>path.join(GAP_DIR,f)).sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs)[0];
const chooseCanonical=auths=>[...auths].sort((a,b)=>a.length-b.length||a.localeCompare(b))[0];
const seed=authority=>parseInt(crypto.createHash('sha256').update(norm(authority)).digest('hex').slice(0,8),16)%9999+1;
const csv=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
async function main(){
 const gapFile=latest(),gap=JSON.parse(fs.readFileSync(gapFile,'utf8'));
 const reclass=JSON.parse(fs.readFileSync(RECLASS,'utf8')).all;
 const stateBySku=new Map(reclass.map(g=>[g.sku,g]));
 const pending=gap.results.filter(r=>!['EXISTING_DIRECT','EXISTING_MULTI_CROSS','VARIANT_OF_AUTHORITY','REAL_GAP_CREATE_SAFE'].includes(r.status));
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('DB missing');
 const c=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});await c.connect();
 const catalog=(await c.query(`SELECT sku,codigo_base,canonical_source_status FROM public.elimfilters_catalog WHERE duty='LIGHT_DUTY'`)).rows;
 const ids=(await c.query(`SELECT elimfilters_sku FROM ld_catalog.ld_canonical_product_identity WHERE status='ACTIVE'`)).rows;
 const idSet=new Set(ids.map(x=>x.elimfilters_sku)),pub=new Map(catalog.map(x=>[x.sku,x]));
 const allUsed=new Set(catalog.map(x=>x.sku)); const proposed=[...new Set(pending.map(r=>r.proposedSku).filter(Boolean))];
 const rel=(await c.query(`SELECT s.sku,
  (SELECT count(*) FROM ld_catalog.ld_competitor_cross_references x WHERE x.elimfilters_sku=s.sku)::int cross_count,
  (SELECT count(*) FROM ld_catalog.ld_oem_cross_references x WHERE x.elimfilters_sku=s.sku)::int oem_count,
  (SELECT count(*) FROM ld_catalog.ld_vehicle_applications x WHERE x.elimfilters_sku=s.sku)::int app_count,
  (SELECT count(*) FROM ld_catalog.ld_product_specifications x WHERE x.elimfilters_sku=s.sku)::int spec_count
  FROM unnest($1::text[]) s(sku)`,[proposed])).rows;
 const relMap=new Map(rel.map(x=>[x.sku,x]));
 const byProposed=new Map();for(const r of pending){if(!r.proposedSku)continue;if(!byProposed.has(r.proposedSku))byProposed.set(r.proposedSku,[]);byProposed.get(r.proposedSku).push(r);}
 const rows=[];
 for(const r of pending){let disposition='FINAL_QUARANTINE',finalSku='',reason=r.status;
  if(r.status==='SKU_COLLISION_EXISTING'){
   const p=pub.get(r.proposedSku)||{},k=relMap.get(r.proposedSku)||{};
   const group=byProposed.get(r.proposedSku)||[];
   const placeholder=norm(p.codigo_base)===body(r.authority)&&!idSet.has(r.proposedSku)&&p.canonical_source_status!=='VERIFIED';
   const empty=(k.cross_count||0)+(k.oem_count||0)+(k.app_count||0)+(k.spec_count||0)===0;
   if(placeholder&&empty&&group.length===1){disposition='REPLACE_EMPTY_PLACEHOLDER';finalSku=r.proposedSku;reason='SAFE_LEGACY_EMPTY_SLOT';}
   else {disposition='CREATE_OVERFLOW';reason=placeholder?'LEGACY_SLOT_PRESERVED_OVERFLOW':'OCCUPIED_SLOT_OVERFLOW';}
  } else if(r.status==='FRAM_SKU_COLLISION'){
   const g=stateBySku.get(r.proposedSku);
   if(g?.state==='distinct'){
    const canonical=chooseCanonical(g.authorities);
    if(r.authority===canonical){disposition='CREATE_STANDARD';finalSku=r.proposedSku;reason='DISTINCT_GROUP_CANONICAL_STANDARD_SLOT';}
    else {disposition='CREATE_OVERFLOW';reason='DISTINCT_GROUP_OVERFLOW';}
   } else {disposition='FINAL_QUARANTINE';reason='FRAM_COLLISION_NOT_PROVEN_DISTINCT';}
  } else if(r.status==='INSUFFICIENT_EXISTING'){reason='INSUFFICIENT_EXISTING_EVIDENCE';}
  else if(r.status==='AMBIGUOUS_EXISTING'){reason='AMBIGUOUS_EXISTING_EVIDENCE';}
  else if(r.status==='CROSS_FAMILY_DIRECT_CONFLICT'){reason='CROSS_FAMILY_DIRECT_CONFLICT';}
  rows.push({...r,disposition,finalSku,reason});
 }
 // reserve all standard/replacement slots first
 const reserved=new Set(allUsed);for(const r of rows)if(r.finalSku)reserved.add(r.finalSku); const overflow=rows.filter(r=>r.disposition==='CREATE_OVERFLOW').sort((a,b)=>a.family.localeCompare(b.family)||a.authority.localeCompare(b.authority));
 for(const r of overflow){const pref=PREFIX[r.family];let n=seed(r.authority),found=null;
  for(let i=0;i<9999;i++){const bodyNum=((n-1+i)%9999)+1;const sku=pref+String(bodyNum).padStart(4,'0');if(!reserved.has(sku)){found=sku;reserved.add(sku);break;}}
  if(!found)throw new Error(`No overflow slot for ${r.authority}`);r.finalSku=found;
 }
 const createRows=rows.filter(r=>['CREATE_STANDARD','CREATE_OVERFLOW','REPLACE_EMPTY_PLACEHOLDER'].includes(r.disposition));
 const quarantineRows=rows.filter(r=>r.disposition==='FINAL_QUARANTINE');
 const dupFinal=createRows.map(r=>r.finalSku).filter((x,i,a)=>a.indexOf(x)!==i);if(dupFinal.length)throw new Error(`Duplicate final SKU ${dupFinal[0]}`);
 const summary={};for(const r of rows)summary[r.disposition]=(summary[r.disposition]||0)+1;
 const byStatus={};for(const r of rows){byStatus[r.status]=(byStatus[r.status]||0)+1;}
 fs.mkdirSync(OUT_DIR,{recursive:true});const stamp=new Date().toISOString().replace(/[:.]/g,'-');
 const jsonFile=path.join(OUT_DIR,`fram-final-resolution-${stamp}.json`),csvFile=path.join(OUT_DIR,`fram-final-resolution-${stamp}.csv`);
 const slim=rows.map(r=>({authority:r.authority,family:r.family,status:r.status,proposedSku:r.proposedSku,finalSku:r.finalSku,disposition:r.disposition,reason:r.reason,file:r.file}));
 fs.writeFileSync(jsonFile,JSON.stringify({generated_at:new Date().toISOString(),gap_report:gapFile,total:rows.length,create_count:createRows.length,quarantine_count:quarantineRows.length,summary,by_status:byStatus,rows:slim},null,2));
 const cols=['authority','family','status','proposedSku','finalSku','disposition','reason','file'];fs.writeFileSync(csvFile,[cols.join(','),...slim.map(r=>cols.map(k=>csv(r[k])).join(','))].join('\n'));
 console.log(JSON.stringify({gap_report:gapFile,total:rows.length,create_count:createRows.length,quarantine_count:quarantineRows.length,summary,jsonFile,csvFile},null,2));
 await c.end();
}
main().catch(e=>{console.error(e.stack||e.message);process.exit(1)});