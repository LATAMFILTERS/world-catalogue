#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pg from 'file:///C:/ELIMSERVER/repos/world-catalogue/node_modules/pg/lib/index.js';

const { Client } = pg;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const url=process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
const batchSize=Math.max(1,Math.min(100,Number(process.env.HERMES_CATALOGUE_WORK_ORDER_BATCH_SIZE||25)));
const targetSkus=new Set(String(process.env.HERMES_CATALOGUE_TARGET_SKUS||'').split(',').map(v=>v.trim().toUpperCase()).filter(Boolean));
if(!url) throw new Error('DATABASE_URL/CATALOG_DATABASE_URL is required');

const norm=v=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();
const stableId=v=>crypto.createHash('sha256').update(String(v)).digest('hex').slice(0,20);
const safe=v=>String(v||'NONE').replace(/[^A-Za-z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,64)||'NONE';

const SOURCE_FAMILY_ORDER=[
  ['LIGHT_DUTY','MACROCORE'],
  ['LIGHT_DUTY','SYNTRAX'],
  ['LIGHT_DUTY','SYNTAPORE'],
  ['HEAVY_DUTY','SYNTAPORE'],
  ['HEAVY_DUTY','NANOFORCE'],
  ['LIGHT_DUTY','MICROKAPPA'],
  ['HEAVY_DUTY','MACROCORE']
];
function familyRank(item){
  if(item.gap_type!=='SOURCE') return 100;
  const tech=norm(item.technology);
  const i=SOURCE_FAMILY_ORDER.findIndex(([d,t])=>item.duty===d && tech.includes(t));
  return i<0?90:i;
}
function hdCompetitorOnlyBrand(value){ const n=norm(value); return n==='MANN FILTER' || n==='FRAM'; }
function officialHost(value){
  try{return new URL(value).hostname.toLowerCase().replace(/^www\./,'');}catch{return null;}
}
function selectOrg(row){
  const hint=row.discovery_hints?.source_candidate_brand || row.discovery_hints?.approved_manufacturer_candidate || row.discovery_hints?.canonical_source_brand || null;
  if(!hint) return {mode:'IDENTITY_DISCOVERY',authority_hint:null,organization:null};
  const n=norm(hint);
  const org=(row.organization_candidates||[]).find(x=>norm(x.name)===n || norm(x.organization_id?.replace(/_/g,' '))===n) || null;
  return {mode:org?'AUTHORITATIVE_TARGET':'IDENTITY_DISCOVERY',authority_hint:hint,organization:org};
}
const db=new Client({connectionString:url});
await db.connect();
try{
  const rows=(await db.query(`
    SELECT b.backlog_id,b.sku,b.gap_type,b.priority,b.manufacturer_candidates,b.organization_candidates,
           b.discovery_hints,b.recommended_action,b.research_attempts,b.next_attempt_at,
           r.duty,r.technology,r.filter_type,
           d.canonical_role AS dossier_canonical_role,d.canonical_role_reason AS dossier_role_reason,d.source_code AS dossier_source_code
    FROM hermes_catalogue_backlog b
    JOIN hermes_catalogue_readiness r USING(sku)
    LEFT JOIN hermes_catalogue_dossier d ON d.sku=b.sku
    WHERE b.status IN ('OPEN','BLOCKED')
      AND (b.next_attempt_at IS NULL OR b.next_attempt_at<=now())
    ORDER BY b.priority,b.gap_type,r.duty,r.technology,b.sku
  `)).rows;

  const endpointsDoc=JSON.parse(fs.readFileSync(path.join(root,'hermes/config/source-endpoints.json'),'utf8'));
  const endpointsByOrg=new Map();
  for(const e of endpointsDoc.endpoints||[]){
    if(e.status!=='ACTIVE' || e.enabled!==true) continue;
    if(!endpointsByOrg.has(e.organization_id)) endpointsByOrg.set(e.organization_id,[]);
    endpointsByOrg.get(e.organization_id).push({endpoint_id:e.id,url:e.url,endpoint_type:e.endpoint_type,source_type:e.source_type});
  }

  const eligibleRows=targetSkus.size ? rows.filter(row=>targetSkus.has(String(row.sku||'').toUpperCase())) : rows;
  const items=eligibleRows.map(row=>{
    const rawHints=row.discovery_hints||{};
    const rejectedCandidate=Boolean(
      row.dossier_canonical_role &&
      ['COMPETITOR_CODE','REVIEW_REQUIRED'].includes(row.dossier_canonical_role) &&
      row.dossier_source_code && rawHints.source_candidate_code &&
      norm(row.dossier_source_code)===norm(rawHints.source_candidate_code)
    );
    const discoveryHints=rejectedCandidate?{...rawHints,
      rejected_source_candidate_brand:rawHints.source_candidate_brand||null,
      rejected_source_candidate_code:rawHints.source_candidate_code||null,
      rejected_source_candidate_reason:row.dossier_role_reason||row.dossier_canonical_role,
      source_candidate_brand:null,source_candidate_code:null,source_candidate_state:'REJECTED_BY_DOSSIER'
    }:rawHints;
    const workRow={...row,discovery_hints:discoveryHints};
    const target=selectOrg(workRow);
    const endpoints=target.organization ? (endpointsByOrg.get(target.organization.organization_id)||[]) : [];
    const source=endpoints[0] || (target.organization?.official_domain ? {endpoint_id:null,url:target.organization.official_domain,endpoint_type:'official_domain',source_type:'html'} : null);
    return {
      backlog_id:row.backlog_id,sku:row.sku,gap_type:row.gap_type,priority:row.priority,
      duty:row.duty,technology:row.technology,filter_type:row.filter_type,
      mode:target.mode,authority_hint:target.authority_hint,organization:target.organization,
      source,source_host:source?officialHost(source.url):null,
      manufacturer_candidates:row.manufacturer_candidates||[],
      organization_candidates:row.organization_candidates||[],
      discovery_hints:discoveryHints,
      competitor_hint:target.competitor_hint||discoveryHints.rejected_source_candidate_brand||null,
      recommended_action:row.recommended_action,
      research_attempts:row.research_attempts||0
    };
  });
  items.sort((a,b)=>
    familyRank(a)-familyRank(b) ||
    (a.mode==='AUTHORITATIVE_TARGET'?0:1)-(b.mode==='AUTHORITATIVE_TARGET'?0:1) ||
    a.priority-b.priority ||
    String(a.gap_type).localeCompare(String(b.gap_type)) ||
    String(a.sku).localeCompare(String(b.sku))
  );
  const groups=new Map();
  for(const item of items){
    const orgId=item.organization?.organization_id||'NONE';
    const key=[item.gap_type,item.mode,orgId,item.duty,item.technology,item.filter_type].join('|');
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(item);
  }

  const outDir=path.join(root,'hermes/catalogue-quality/work-orders/current');
  fs.rmSync(outDir,{recursive:true,force:true});
  fs.mkdirSync(outDir,{recursive:true});
  const batchesOut=[];
  for(const [key,group] of groups){
    for(let i=0;i<group.length;i+=batchSize){
      const slice=group.slice(i,i+batchSize);
      const first=slice[0];
      const orderId='CQ_'+stableId(key+'|'+i);
      const doc={
        schema_version:'1.0.0',
        work_order_id:orderId,
        generated_at:new Date().toISOString(),
        gap_type:first.gap_type,
        priority:first.priority,
        mode:first.mode,
        duty:first.duty,
        technology:first.technology,
        filter_type:first.filter_type,
        organization:first.organization||null,
        source:first.source||null,
        authority_hint:first.authority_hint||null,
        item_count:slice.length,
        canonical_catalogue_write:false,
        approval_required:true,
        items:slice
      };
      const file=path.join(outDir,`${safe(first.gap_type)}-${safe(first.mode)}-${safe(first.organization?.organization_id)}-${safe(first.duty)}-${safe(first.technology)}-${String(i/batchSize).padStart(4,'0')}.json`);
      fs.writeFileSync(file,JSON.stringify(doc,null,2)+'\n');
      batchesOut.push({work_order_id:orderId,file:path.relative(root,file),gap_type:first.gap_type,mode:first.mode,organization_id:first.organization?.organization_id||null,item_count:slice.length,priority:first.priority,duty:first.duty,technology:first.technology,filter_type:first.filter_type});
    }
  }
  const summary={
    generated_at:new Date().toISOString(),
    eligible_items:items.length,
    batch_size:batchSize,
    work_orders:batchesOut.length,
    by_gap:Object.fromEntries([...new Set(items.map(x=>x.gap_type))].map(g=>[g,items.filter(x=>x.gap_type===g).length])),
    by_mode:Object.fromEntries([...new Set(items.map(x=>x.mode))].map(m=>[m,items.filter(x=>x.mode===m).length])),
    authoritative_source_items:items.filter(x=>x.mode==='AUTHORITATIVE_TARGET').length,
    identity_discovery_items:items.filter(x=>x.mode==='IDENTITY_DISCOVERY').length
  };
  fs.writeFileSync(path.join(root,'hermes/catalogue-quality/work-orders/index.json'),JSON.stringify({schema_version:'1.0.0',...summary,batches:batchesOut},null,2)+'\n');
  console.log(JSON.stringify(summary,null,2));
} finally {
  await db.end();
}
