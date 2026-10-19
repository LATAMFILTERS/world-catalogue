#!/usr/bin/env node
// DBL/DBF/DBH/DBA catalogue sweep using the same governed publisher as EA10005.
// By default: discovery only. --apply requires both explicit authorizations.
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { buildDonaldsonDbScraperCandidates } from './catalogue-intelligence.mjs';
import { buildCataloguePublicationPlan } from './catalogue-publication-plan.mjs';
import { executeCataloguePublicationPlan } from './publish-catalogue-plan.mjs';

const [snapshotFile, evidenceFile, ...options] = process.argv.slice(2);
if (!snapshotFile || !evidenceFile) throw new Error('Usage: node scripts/hermes/publish-donaldson-db-batch.mjs <catalogue-snapshot.json> <official.jsonl> [--apply --approve-knowledge --approve-catalogue]');
const snapshot = JSON.parse(fs.readFileSync(snapshotFile,'utf8'));
const products = Array.isArray(snapshot) ? snapshot : snapshot.products;
if (!Array.isArray(products)) throw new Error('Snapshot products missing');
const raw = fs.readFileSync(evidenceFile,'utf8').replace(/^\uFEFF/,'').split(/\r?\n/).map(line=>line.replace(/^\uFEFF/,'').trim()).filter(Boolean).map(JSON.parse);
const normalize = x => String(x || '').replace(/[^A-Z0-9]/ig,'').toUpperCase();
const isDb = x => /^(DBL|DBF|DBH|DBA)[A-Z0-9]+$/.test(normalize(x));
const targets = products.filter(p => isDb(p.codigo_base) || isDb(p.source_identity?.canonical_source_code));
const official = new Map();
for (const row of raw) {
  const code = normalize(row.codigo_base || row.official?.part_number);
  if (!isDb(code)) continue;
  if (row.status !== 'OK' || !row.audit?.expansion_complete ||
      normalize(row.official?.part_number) !== code) continue;
  let trusted = false;
  try { trusted = new URL(row.source_url).hostname === 'shop.donaldson.com'; } catch {}
  if (!trusted) continue;
  if (!official.has(code) || String(row.scraped_at || '') > String(official.get(code).scraped_at || '')) official.set(code,row);
}
const candidates = buildDonaldsonDbScraperCandidates({rows:[...official.values()],catalog:products});
const bySku = new Map(candidates.filter(c => c.existing_sku).map(c => [c.existing_sku,c]));
const apply = options.includes('--apply');
if (apply && (!options.includes('--approve-knowledge') || !options.includes('--approve-catalogue'))) {
  throw new Error('Both explicit approvals required for live publication');
}
if (apply && process.env.HERMES_CATALOGUE_PUBLISH_LIVE !== 'true') throw new Error('Live publisher switch required');
const conn = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
if (apply && !conn) throw new Error('Writable catalogue connection missing');
const { Pool } = apply ? await import('pg') : { Pool:null };
const host = apply ? new URL(conn).hostname : null;
const pool = apply ? new Pool({connectionString:conn,ssl:['127.0.0.1','localhost','::1'].includes(host)?false:{rejectUnauthorized:false},max:1,application_name:'hermes-donaldson-db-batch'}) : null;
const outcome={scanned_skus:targets.length,official_db_evidence:official.size,ready:0,published:0,unchanged:0,missing_evidence:0,blocked:0,errors:[],items:[],database_write:false};
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
try {
  for (const product of targets) {
    const sku=product.sku;
    const base=normalize(product.source_identity?.canonical_source_code || product.codigo_base);
    const candidate=bySku.get(sku);
    if (!candidate) {
      outcome.missing_evidence++;
      outcome.items.push({sku,base,status:'MISSING_OFFICIAL_EVIDENCE'});
      continue;
    }
    const proposals=candidate.proposed_additive_updates || {};
    const updates={};
    if (proposals.dimensions && !candidate.dimension_conflicts?.length) updates.dimensions=proposals.dimensions.after;
    const audited=candidate.inherited_equipment_audit?.summary;
    if (proposals.equipment_applications && audited?.provenance_blocked === 0 &&
       audited?.identity_blocked === 0 && audited?.semantic_duplicates === 0 &&
       audited?.ready_for_human_review > 0) updates.equipment_applications=proposals.equipment_applications.after;
    const fields=Object.keys(updates);
    if (!fields.length) {
      outcome.unchanged++;
      outcome.items.push({sku,base,status:'NO_ELIGIBLE_CHANGE'});
      continue;
    }
    if (!['VERIFIED'].includes(product.source_identity?.canonical_source_status) ||
       String(product.source_identity?.canonical_source_brand||'').toUpperCase() !== 'DONALDSON') {
      outcome.blocked++;
      outcome.items.push({sku,base,status:'UNVERIFIED_IDENTITY'});
      continue;
    }
    const source=official.get(base);
    if (!source) {
      outcome.blocked++;
      outcome.items.push({sku,base,status:'SOURCE_RECORD_NOT_FOUND'});
      continue;
    }
    const now=new Date().toISOString();
    const id='DONALDSON-DB-'+hash([sku,base,updates,source.source_url]).slice(0,16);
    const evidence={
      authority:'DONALDSON_OFFICIAL_ALTERNATE',source_url:source.source_url,
      evidence_hash:hash({source_url:source.source_url,alternates:source.official?.alternatives||[],updates:updates.equipment_applications||[]}),
      metadata:{source_code:base,official_alternates:source.official?.alternatives||[],donor_skus:[...new Set((updates.equipment_applications||[]).map(a=>a.inherited_from_sku).filter(Boolean))]}
    };
    const bundle={research_bundle_id:id,
      knowledge_candidate:{research_bundle_id:id,workflow_status:'APPROVED',approval_required:true,approved_by:'Victor Abreu',approved_at:now},
      catalogue_candidate:{research_bundle_id:id,status:'APPROVED_FOR_PUBLICATION',change_type:'technical_change',
        approval:{approved_by:'Victor Abreu',approved_at:now,approved_fields:fields},
        source_urls:[source.source_url],
        evidence:[{source_url:source.source_url,source_code:base,evidence_type:'official_donaldson_db'}],
        ...(fields.includes('equipment_applications')?{application_evidence:evidence}:{}),
        publication:{target_sku:sku,approved_fields:fields,proposed_values:updates}}};
    try {
      const plan=buildCataloguePublicationPlan({bundle,catalog:snapshot});
      const item={sku,base,fields,status:'READY',applications_added:fields.includes('equipment_applications')?updates.equipment_applications.length-(product.equipment_applications||[]).length:0};
      outcome.ready++;
      if (apply) {
        const result=await executeCataloguePublicationPlan({plan,pool,apply:true});
        item.status=result.outcome;
        item.backup_path=result.backup_path;
        outcome.published++;
        outcome.database_write=true;
      }
      outcome.items.push(item);
    } catch(e) {
      outcome.blocked++;
      outcome.errors.push({sku,base,error:e.message});
      outcome.items.push({sku,base,status:'BLOCKED'});
    }
  }
} finally { if (pool) await pool.end(); }
const output='hermes/catalogue-candidates/donaldson-db-batch-last-run.json';
fs.mkdirSync('hermes/catalogue-candidates',{recursive:true});
fs.writeFileSync(output,JSON.stringify(outcome,null,2)+'\n');
console.log(JSON.stringify({...outcome,items:undefined,output},null,2));
if (outcome.errors.length) process.exitCode=1;
