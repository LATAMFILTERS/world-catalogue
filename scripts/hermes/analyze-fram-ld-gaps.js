'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');

const ROOT = path.resolve(__dirname, '../..');
const PRODUCTS = path.join(ROOT, 'elimfilters-vault/91-private-evidence/fram-usa-ld-catalog/fram-usa-ld-full-20260911/products');
const REPORT_DIR = path.join(ROOT, 'elimfilters-vault/91-private-evidence/fram-ld-gap-analysis');
const PREFIX = { AIR:'EA3', CABIN:'EC3', FUEL:'EF3', LUBE:'EL3' };
const TYPE = { AIR:'air', CABIN:'cabin', FUEL:'fuel', LUBE:'oil' };
const CORE_KEYS = ['outer_diameter_mm','height_mm','thread_size','gasket_od_mm','gasket_id_mm','anti_drainback_valve','bypass_setting_psi','burst_pressure_psi'];
const norm = (v='') => String(v).toUpperCase().replace(/[^A-Z0-9]/g, '');
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const add = (map,key,value) => { if(!key) return; if(!map.has(key)) map.set(key,new Set()); map.get(key).add(value); };

function proposedSku(family, authority) {
  const digits = String(authority || '').replace(/[^0-9]/g, '');
  return digits.length ? `${PREFIX[family]}${digits.slice(-4).padStart(4,'0')}` : null;
}
function appHash(apps=[]) {
  const rows = apps.map(a => [norm(a.make),norm(a.model),String(a.year||'').trim(),norm(a.engine)].join('|'));
  return hash([...new Set(rows)].sort());
}
function loadHarvest() {
  return fs.readdirSync(PRODUCTS).filter(f => f.endsWith('.json')).map(f => {
    const file = path.join(PRODUCTS, f);
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    const p = j.public_catalog_proposal || {};
    const authority = j.authority?.part_number || path.basename(f,'.json');
    const specs = p.technical_specifications || {};
    return {
      family:j.family, authority, authorityKey:norm(authority), file,
      proposedSku:proposedSku(j.family, authority),
      alternatives:(p.alternatives||[]).map(norm),
      competitor:p.competitor_cross_reference_candidates||[],
      oem:p.oem_cross_reference_candidates||[],
      appCount:(p.vehicle_application_candidates||[]).length,
      coreHash:hash(CORE_KEYS.map(k => specs[k] ?? null)),
      appHash:appHash(p.vehicle_application_candidates||[])
    };
  });
}
function variantEquivalent(a,b) {
  if (!a || !b || a.family !== b.family || a.proposedSku !== b.proposedSku) return false;
  const linked = a.alternatives.includes(b.authorityKey) || b.alternatives.includes(a.authorityKey);
  return linked && a.coreHash === b.coreHash && a.appHash === b.appHash && a.appCount > 0 && b.appCount > 0;
}
function chooseCanonical(group) {
  return [...group].sort((a,b) => a.authority.length-b.authority.length || a.authority.localeCompare(b.authority))[0];
}
async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL missing');
  const harvest = loadHarvest();
  if (harvest.length !== 1755) throw new Error(`Expected 1755 FRAM authorities, got ${harvest.length}`);
  const client = new Client({ connectionString:url, ssl:{rejectUnauthorized:false} });
  await client.connect();

  const catalog = (await client.query(`SELECT sku,duty,filter_type,codigo_base,enrichment_data FROM public.elimfilters_catalog`)).rows;
  const comp = (await client.query(`SELECT x.elimfilters_sku,x.competitor_brand,x.competitor_part_number,COALESCE(c.duty,CASE WHEN p.elimfilters_sku IS NOT NULL THEN 'LIGHT_DUTY' END) duty,COALESCE(c.filter_type,CASE p.segment WHEN 'Air Filter' THEN 'air' WHEN 'Cabin Filter' THEN 'cabin' WHEN 'Fuel Filter' THEN 'fuel' WHEN 'Oil Filter' THEN 'oil' END) filter_type FROM ld_catalog.ld_competitor_cross_references x LEFT JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku LEFT JOIN ld_catalog.ld_product_catalog p ON p.elimfilters_sku=x.elimfilters_sku WHERE c.sku IS NOT NULL OR p.elimfilters_sku IS NOT NULL`)).rows;
  const oem = (await client.query(`SELECT x.elimfilters_sku,x.oem_brand,x.oem_part_number,COALESCE(c.duty,CASE WHEN p.elimfilters_sku IS NOT NULL THEN 'LIGHT_DUTY' END) duty,COALESCE(c.filter_type,CASE p.segment WHEN 'Air Filter' THEN 'air' WHEN 'Cabin Filter' THEN 'cabin' WHEN 'Fuel Filter' THEN 'fuel' WHEN 'Oil Filter' THEN 'oil' END) filter_type FROM ld_catalog.ld_oem_cross_references x LEFT JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku LEFT JOIN ld_catalog.ld_product_catalog p ON p.elimfilters_sku=x.elimfilters_sku WHERE c.sku IS NOT NULL OR p.elimfilters_sku IS NOT NULL`)).rows;
  const identities = (await client.query(`SELECT i.elimfilters_sku,i.canonical_brand,i.canonical_part_number,c.duty,c.filter_type FROM ld_catalog.ld_canonical_product_identity i JOIN public.elimfilters_catalog c ON c.sku=i.elimfilters_sku WHERE i.status='ACTIVE'`)).rows;
  const catalogBySku = new Map(catalog.map(r => [r.sku,r]));
  const directLd = new Map(), directHd = new Map(), refLd = new Map();

  for (const r of comp) {
    const key = `${norm(r.competitor_brand)}|${norm(r.competitor_part_number)}`;
    if (r.duty === 'LIGHT_DUTY') add(refLd,key,`${r.elimfilters_sku}|${r.filter_type}`);
    if (norm(r.competitor_brand) === 'FRAM') add(r.duty === 'LIGHT_DUTY' ? directLd : directHd, norm(r.competitor_part_number), `${r.elimfilters_sku}|${r.filter_type}`);
  }
  for (const r of oem) {
    if (r.duty === 'LIGHT_DUTY') add(refLd,`${norm(r.oem_brand)}|${norm(r.oem_part_number)}`,`${r.elimfilters_sku}|${r.filter_type}`);
  }
  for (const r of identities) {
    if (norm(r.canonical_brand) !== 'FRAM') continue;
    add(r.duty === 'LIGHT_DUTY' ? directLd : directHd, norm(r.canonical_part_number), `${r.elimfilters_sku}|${r.filter_type}`);
  }
  for (const r of catalog) {
    const gov = r.enrichment_data?.codigo_base_governance || {};
    if (norm(gov.approved_manufacturer) !== 'FRAM' || !gov.primary_manufacturer_verified) continue;
    add(r.duty === 'LIGHT_DUTY' ? directLd : directHd, norm(r.codigo_base), `${r.sku}|${r.filter_type}`);
  }

  const results=[];
  for (const h of harvest) {
    const expected = TYPE[h.family];
    const allLdDirect = [...(directLd.get(h.authorityKey)||[])];
    const ldOwners = allLdDirect.filter(v => v.endsWith(`|${expected}`)).map(v => v.split('|')[0]);
    const crossFamilyLdOwners = allLdDirect.filter(v => !v.endsWith(`|${expected}`)).map(v => v.split('|')[0]);
    const hdOwners = [...(directHd.get(h.authorityKey)||[])].map(v => v.split('|')[0]);
    if (ldOwners.length === 1) { results.push({...h,status:'EXISTING_DIRECT',resolvedSku:ldOwners[0],hdOwners}); continue; }
    if (ldOwners.length === 0 && crossFamilyLdOwners.length) { results.push({...h,status:'CROSS_FAMILY_DIRECT_CONFLICT',owners:crossFamilyLdOwners,hdOwners}); continue; }
    if (ldOwners.length > 1) { results.push({...h,status:'AMBIGUOUS_DIRECT',owners:ldOwners,hdOwners}); continue; }
    if (hdOwners.length) { results.push({...h,status:'HD_REFERENCE_CONFLICT',hdOwners}); continue; }

    const hits = new Map();
    for (const r of [...h.competitor,...h.oem]) {
      const key = `${norm(r.manufacturer)}|${norm(r.part_number)}`;
      for (const v of (refLd.get(key)||[])) {
        const [sku,type] = v.split('|'); if (type !== expected) continue;
        if (!hits.has(sku)) hits.set(sku,new Set()); hits.get(sku).add(key);
      }
    }
    const strong = [...hits.entries()].filter(([,e]) => e.size >= 2).sort((a,b) => b[1].size-a[1].size);
    if (strong.length === 1) {
      results.push({...h,status:'EXISTING_MULTI_CROSS',resolvedSku:strong[0][0],evidenceCount:strong[0][1].size});
      continue;
    }
    if (strong.length > 1) {
      results.push({...h,status:'AMBIGUOUS_EXISTING',candidates:strong.map(([sku,e])=>({sku,evidenceCount:e.size}))});
      continue;
    }
    if (hits.size) {
      results.push({...h,status:'INSUFFICIENT_EXISTING',candidates:[...hits.entries()].map(([sku,e])=>({sku,evidenceCount:e.size}))});
      continue;
    }
    if (!h.proposedSku) { results.push({...h,status:'INVALID_SKU_SUFFIX'}); continue; }
    const occupied = catalogBySku.get(h.proposedSku);
    if (occupied) {
      results.push({...h,status:'SKU_COLLISION_EXISTING',collision:{sku:occupied.sku,duty:occupied.duty,filter_type:occupied.filter_type,codigo_base:occupied.codigo_base}});
      continue;
    }
    results.push({...h,status:'GAP_PROVISIONAL'});
  }

  const provisional = results.filter(r => r.status === 'GAP_PROVISIONAL');
  const groups = new Map();
  for (const r of provisional) { if(!groups.has(r.proposedSku)) groups.set(r.proposedSku,[]); groups.get(r.proposedSku).push(r); }
  for (const group of groups.values()) {
    if (group.length === 1) { group[0].status='REAL_GAP_CREATE_SAFE'; continue; }
    const allEquivalent = group.every((a,i) => group.every((b,j) => i===j || variantEquivalent(a,b)));
    if (allEquivalent) {
      const canonical = chooseCanonical(group);
      for (const r of group) r.status = r === canonical ? 'REAL_GAP_CREATE_SAFE' : 'VARIANT_OF_AUTHORITY';
      for (const r of group) if (r !== canonical) r.variantOf = canonical.authority;
      canonical.variants = group.filter(r=>r!==canonical).map(r=>r.authority);
    } else {
      for (const r of group) { r.status='FRAM_SKU_COLLISION'; r.collidingAuthorities=group.map(x=>x.authority); }
    }
  }
  const counts={}, byFamily={};
  for (const r of results) {
    counts[r.status]=(counts[r.status]||0)+1;
    byFamily[r.family] ||= {};
    byFamily[r.family][r.status]=(byFamily[r.family][r.status]||0)+1;
  }
  const safe = results.filter(r => r.status === 'REAL_GAP_CREATE_SAFE');
  const report = {
    generated_at:new Date().toISOString(), harvested:harvest.length,
    counts, by_family:byFamily,
    existing_covered:results.filter(r=>r.status.startsWith('EXISTING_')).length,
    variants:results.filter(r=>r.status==='VARIANT_OF_AUTHORITY').length,
    create_safe:safe.length,
    quarantine:results.filter(r=>!['EXISTING_DIRECT','EXISTING_MULTI_CROSS','VARIANT_OF_AUTHORITY','REAL_GAP_CREATE_SAFE'].includes(r.status)).length,
    safe_candidates:safe.map(r=>({family:r.family,authority:r.authority,sku:r.proposedSku,variants:r.variants||[],file:r.file})),
    results:results.map(({coreHash,appHash,competitor,oem,alternatives,...r})=>r)
  };
  fs.mkdirSync(REPORT_DIR,{recursive:true});
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const out=path.join(REPORT_DIR,`fram-ld-gap-${stamp}.json`);
  fs.writeFileSync(out,JSON.stringify(report,null,2));
  console.log(JSON.stringify({report:out,harvested:report.harvested,counts:report.counts,by_family:report.by_family,existing_covered:report.existing_covered,variants:report.variants,create_safe:report.create_safe,quarantine:report.quarantine},null,2));
  await client.end();
}
main().catch(e=>{console.error(e.stack||e.message);process.exit(1);});
