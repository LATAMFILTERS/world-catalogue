#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  ALLOWED_FAMILIES,
  MARKET_POLICY,
  classifyFramLdFamily,
  isAllowedFramLdFamily,
  isEuropeMarket,
  classifyCrossReference
} = require('../../lib/knowledge-governance/fram-ld-catalog-scope');
const { extractFramLdLogisticsEvidence } = require('../../lib/knowledge-governance/fram-ld-logistics-evidence');

const root = path.resolve(process.argv[2] || 'elimfilters-vault/91-private-evidence/fram-ld-product-pages');
const TARGET_MARKETS = ['USA','CANADA','LATAM','JAPAN','ASIA_PACIFIC','AUSTRALIA_NZ'];

function latestRunDir() {
  if (!fs.existsSync(root)) throw new Error(`Evidence root not found: ${root}`);
  const dirs = fs.readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory() && d.name.startsWith('fram-ld-')).map(d=>d.name).sort();
  if (!dirs.length) throw new Error('No FRAM LD product evidence run found');
  return path.join(root,dirs.at(-1));
}

function cleanHtml(html='') {
  return String(html).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
}

function extractMannRefs(text='') {
  const refs = new Set();
  const patterns = [
    /MANN(?:-FILTER)?\s*(?:Part\s*(?:Number|No\.?|#)?\s*[:\-]?)?([A-Z0-9][A-Z0-9 .\/-]{2,24}\d[A-Z0-9 .\/-]*)/gi,
    /(?:Cross\s*Reference|Interchange)[^\n]{0,180}?MANN(?:-FILTER)?[^A-Z0-9]{0,12}([A-Z0-9][A-Z0-9 .\/-]{2,24}\d[A-Z0-9 .\/-]*)/gi
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(text))) {
      const code = String(m[1]).trim().replace(/\s{2,}.*/,'').replace(/[;,|].*$/,'');
      if (code && /\d/.test(code) && code.length <= 28) refs.add(code);
    }
  }
  return [...refs];
}

function resolveSnapshot(runDir,payload) {
  const rel = payload.source_snapshot_path;
  if (rel) {
    const absolute = path.resolve(rel);
    if (fs.existsSync(absolute)) return absolute;
  }
  const prefix = `${payload.source_id}-`;
  const candidate = fs.readdirSync(runDir).find(name=>name.startsWith(prefix) && name.endsWith('.html'));
  return candidate ? path.join(runDir,candidate) : null;
}

const runDir = latestRunDir();
const evidenceFiles = fs.readdirSync(runDir).filter(name=>/^fram_ld_product_\d+\.json$/.test(name));
const summary = { run_dir:runDir, processed:0, rejected_family:0, family_counts:{LUBE:0,AIR:0,CABIN:0,FUEL:0}, mann_cross_candidates:0, logistics_records:0 };

for (const name of evidenceFiles) {
  const file = path.join(runDir,name);
  const payload = JSON.parse(fs.readFileSync(file,'utf8'));
  const snapshot = resolveSnapshot(runDir,payload);
  const html = snapshot && fs.existsSync(snapshot) ? fs.readFileSync(snapshot,'utf8') : '';
  const text = cleanHtml(html);
  const family = classifyFramLdFamily(`${payload.source_url || ''} ${payload.effective_url || ''} ${text.slice(0,2500)}`);

  if (!isAllowedFramLdFamily(family)) {
    payload.scope_status = 'REJECTED_OUTSIDE_FRAM_LD_FOUR_FAMILY_SCOPE';
    payload.catalog_promotion_allowed = false;
    payload.logistics_promotion_allowed = false;
    payload.allowed_families = ALLOWED_FAMILIES;
    fs.writeFileSync(file,JSON.stringify(payload,null,2)+'\n');
    summary.rejected_family += 1;
    continue;
  }

  const logistics = extractFramLdLogisticsEvidence(text);
  const mannRefs = extractMannRefs(text);
  const sourceMarket = payload.source_market_scope || 'NON_EUROPEAN_TARGET_REQUIRES_VALIDATION';
  const european = isEuropeMarket(sourceMarket);
  const mannCrosses = mannRefs.map(part_number => ({
    ...classifyCrossReference({ manufacturer:'MANN-FILTER', part_number, source_market_scope:sourceMarket }),
    market_validation_required: !european,
    source_market_scope: sourceMarket
  }));

  payload.ld_catalog_scope = {
    family,
    knowledge_domain:'LIGHT_DUTY_KNOWLEDGE_DOMAIN',
    industry:'Automotive',
    target_markets:TARGET_MARKETS,
    europe_promotion_allowed:false,
    europe_nomenclature_authority:'MANN_FILTER',
    fram_nomenclature_role:'NON_EUROPEAN_LD_REFERENCE',
    source_part_number:payload.source_product_number || null,
    ld_prefix_required:true,
    ld_base_number_candidate:payload.source_product_number || null,
    nomenclature_candidate_only:true,
    catalog_auto_write_allowed:false
  };
  payload.logistics_evidence = logistics;
  payload.cross_reference_competitor = [
    ...(Array.isArray(payload.cross_reference_competitor) ? payload.cross_reference_competitor : []),
    ...mannCrosses
  ];
  payload.market_governance = {
    ...MARKET_POLICY,
    target_markets:TARGET_MARKETS,
    source_market_scope:sourceMarket,
    market_validation_required:true,
    european_source_detected:european,
    promotion_allowed:!european
  };
  payload.catalog_promotion_allowed = false;
  payload.logistics_promotion_allowed = false;

  fs.writeFileSync(file,JSON.stringify(payload,null,2)+'\n');
  summary.processed += 1;
  summary.family_counts[family] += 1;
  summary.mann_cross_candidates += mannCrosses.length;
  if (logistics.product_dimensions?.length || logistics.product_dimensions?.width || logistics.product_dimensions?.height || logistics.product_weight?.value) summary.logistics_records += 1;
}

fs.writeFileSync(path.join(runDir,'four-family-enrichment-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(`[FRAM LD four-family] processed=${summary.processed} rejected=${summary.rejected_family} LUBE=${summary.family_counts.LUBE} AIR=${summary.family_counts.AIR} CABIN=${summary.family_counts.CABIN} FUEL=${summary.family_counts.FUEL} MANN_cross_candidates=${summary.mann_cross_candidates} logistics=${summary.logistics_records}`);
