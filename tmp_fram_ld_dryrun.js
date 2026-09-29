'use strict';
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const ROOT = __dirname;
const PRODUCTS = path.join(ROOT, 'elimfilters-vault/91-private-evidence/fram-usa-ld-catalog/fram-usa-ld-full-20260911/products');
const OUT = path.join(ROOT, 'tmp_fram_ld_dryrun_report.json');
const MAP = path.join(ROOT, 'tmp_fram_ld_match_map.json');
const norm = (v='') => String(v).toUpperCase().replace(/[^A-Z0-9]/g, '');
const expectedType = { AIR:'air', CABIN:'cabin', FUEL:'fuel', LUBE:'oil' };
const key = (brand, code) => `${norm(brand)}|${norm(code)}`;

function loadHarvest() {
  return fs.readdirSync(PRODUCTS).filter(f => f.endsWith('.json')).map(f => {
    const p = path.join(PRODUCTS, f);
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    const authority = j.authority?.part_number;
    const proposal = j.public_catalog_proposal || {};
    return { file:p, family:j.family, authority, aliases:[authority, ...(proposal.alternatives||[])].filter(Boolean).map(norm), data:j };
  });
}
function add(index, k, rec) {
  if (!k || k.endsWith('|')) return;
  if (!index.has(k)) index.set(k, []);
  index.get(k).push(rec);
}async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL missing');
  const harvest = loadHarvest();
  const client = new Client({ connectionString:url, ssl:{ rejectUnauthorized:false } });
  await client.connect();

  const publicRows = (await client.query(`
    SELECT sku,duty,filter_type,codigo_base,competitor_codes,oem_codes,enrichment_data
    FROM public.elimfilters_catalog
    WHERE duty IN ('LIGHT_DUTY','HEAVY_DUTY')
  `)).rows;
  const compRows = (await client.query(`
    SELECT x.elimfilters_sku,x.competitor_brand,x.competitor_part_number,c.duty,c.filter_type
    FROM ld_catalog.ld_competitor_cross_references x
    LEFT JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku
  `)).rows;
  const oemRows = (await client.query(`
    SELECT x.elimfilters_sku,x.oem_brand,x.oem_part_number,c.duty,c.filter_type
    FROM ld_catalog.ld_oem_cross_references x
    LEFT JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku
  `)).rows;
  const identities = (await client.query(`
    SELECT i.elimfilters_sku,i.canonical_part_number,c.duty,c.filter_type
    FROM ld_catalog.ld_canonical_product_identity i
    LEFT JOIN public.elimfilters_catalog c ON c.sku=i.elimfilters_sku
    WHERE i.status='ACTIVE' AND upper(regexp_replace(i.canonical_brand,'[^A-Z0-9]','','g'))='FRAM'
  `)).rows;  const direct = new Map(), comp = new Map(), oem = new Map();
  for (const r of identities) add(direct, norm(r.canonical_part_number), { sku:r.elimfilters_sku,duty:r.duty,filter_type:r.filter_type,source:'canonical_identity' });
  for (const r of compRows) {
    const rec = { sku:r.elimfilters_sku,duty:r.duty,filter_type:r.filter_type,source:'ld_competitor_cross' };
    add(comp, key(r.competitor_brand,r.competitor_part_number), rec);
    if (norm(r.competitor_brand)==='FRAM') add(direct, norm(r.competitor_part_number), { ...rec, source:'ld_fram_cross' });
  }
  for (const r of oemRows) add(oem, key(r.oem_brand,r.oem_part_number), { sku:r.elimfilters_sku,duty:r.duty,filter_type:r.filter_type,source:'ld_oem_cross' });
  for (const r of publicRows) {
    let cc=r.competitor_codes, oc=r.oem_codes;
    if(typeof cc==='string'){try{cc=JSON.parse(cc)}catch{cc=[]}}
    if(typeof oc==='string'){try{oc=JSON.parse(oc)}catch{oc=[]}}
    if(Array.isArray(cc)) for(const x of cc){
      const rec={sku:r.sku,duty:r.duty,filter_type:r.filter_type,source:'public_competitor_cross'};
      add(comp,key(x?.manufacturer,x?.code),rec);
      if(norm(x?.manufacturer)==='FRAM') add(direct,norm(x?.code),{...rec,source:'public_fram_cross'});
    }
    if(Array.isArray(oc)) for(const x of oc) add(oem,key(x?.manufacturer,x?.code),{sku:r.sku,duty:r.duty,filter_type:r.filter_type,source:'public_oem_cross'});
    const gov=r.enrichment_data?.codigo_base_governance||{};
    if(norm(gov.approved_manufacturer)==='FRAM'&&norm(gov.approved_codigo_base)===norm(r.codigo_base)) add(direct,norm(r.codigo_base),{sku:r.sku,duty:r.duty,filter_type:r.filter_type,source:'governed_codigo_base'});
  }  const matches=[];
  const stats={harvested:harvest.length,direct_unique:0,cross_unique:0,ambiguous:0,insufficient:0,unmatched:0,hd_hits:0,by_family:{}};
  for(const h of harvest){
    const expect=expectedType[h.family];
    const dset=new Map(), cset=new Map();
    const hd=new Set();
    const addCandidate=(bucket,r,evidence)=>{
      if(r.duty==='HEAVY_DUTY'){hd.add(r.sku);return;}
      if(r.duty!=='LIGHT_DUTY'||r.filter_type!==expect)return;
      if(!bucket.has(r.sku))bucket.set(r.sku,new Set());
      bucket.get(r.sku).add(evidence);
    };
    for(const alias of h.aliases) for(const r of (direct.get(alias)||[])) addCandidate(dset,r,`DIRECT:${alias}:${r.source}`);
    const p=h.data.public_catalog_proposal||{};
    for(const x of (p.oem_cross_reference_candidates||[])) for(const r of (oem.get(key(x.manufacturer,x.part_number))||[])) addCandidate(cset,r,`OEM:${key(x.manufacturer,x.part_number)}`);
    for(const x of (p.competitor_cross_reference_candidates||[])) for(const r of (comp.get(key(x.manufacturer,x.part_number))||[])) addCandidate(cset,r,`COMP:${key(x.manufacturer,x.part_number)}`);
    const fam=stats.by_family[h.family] ||= {harvested:0,direct_unique:0,cross_unique:0,ambiguous:0,insufficient:0,unmatched:0};
    fam.harvested++; stats.hd_hits+=hd.size;
    let rec={family:h.family,authority:h.authority,file:h.file,aliases:h.aliases};    if(dset.size===1){
      const [sku,evidence]=[...dset.entries()][0]; rec={...rec,sku,rule:'DIRECT_FRAM_UNIQUE',evidence:[...evidence]}; stats.direct_unique++; fam.direct_unique++;
    }else if(dset.size>1){
      rec={...rec,ambiguous:[...dset.keys()],rule:'DIRECT_FRAM_AMBIGUOUS'}; stats.ambiguous++; fam.ambiguous++;
    }else if(cset.size===1){
      const [sku,evidence]=[...cset.entries()][0];
      if(evidence.size>=2){rec={...rec,sku,rule:'EXACT_MULTI_CROSS_UNIQUE',evidence:[...evidence]};stats.cross_unique++;fam.cross_unique++;}
      else {rec={...rec,insufficient:[...cset.keys()],rule:'ONE_EXACT_CROSS_ONLY',evidence:[...evidence]};stats.insufficient++;fam.insufficient++;}
    }else if(cset.size>1){
      rec={...rec,ambiguous:[...cset.keys()],rule:'EXACT_CROSS_AMBIGUOUS'};stats.ambiguous++;fam.ambiguous++;
    }else {rec={...rec,unmatched:true,rule:'NO_EXACT_MATCH'};stats.unmatched++;fam.unmatched++;}
    matches.push(rec);
  }
  const accepted=matches.filter(x=>x.sku), bySku={};
  for(const m of accepted)(bySku[m.sku] ||= []).push(m.authority);
  stats.accepted=accepted.length; stats.unique_skus=Object.keys(bySku).length; stats.multi_authority_skus=Object.values(bySku).filter(x=>x.length>1).length;
  stats.identity_rows=identities.length; stats.existing_fram_cross_rows=compRows.filter(x=>norm(x.competitor_brand)==='FRAM').length;
  fs.writeFileSync(MAP,JSON.stringify(matches,null,2));
  fs.writeFileSync(OUT,JSON.stringify({stats,multiAuthoritySkus:Object.entries(bySku).filter(([,v])=>v.length>1),generated_at:new Date().toISOString()},null,2));
  console.log(JSON.stringify(stats,null,2));
  await client.end();
}
main().catch(e=>{console.error(e.stack||e.message);process.exit(1);});