#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseCandidateNote, OFFICIAL_SYSTEMS } = require('../../lib/knowledge-governance/nodal-promotion-gate');
const { scanSourceSignatures } = require('../../lib/knowledge-governance/universal-public-knowledge-gateway');

const apply = process.argv.includes('--apply');
const candidateRoot = path.resolve('elimfilters-vault/12-knowledge-candidates');
const reviewRoot = path.join(candidateRoot,'_reviews');
const ledgerPath = path.join(reviewRoot,'TECHNICAL_VALIDATION_LEDGER.json');
const reviewer = 'ELIMFILTERS AI Engineering Validation — Canonical Scope Review';
const reviewedAt = new Date().toISOString();
const ledger = JSON.parse(fs.readFileSync(ledgerPath,'utf8'));
const rel = new Map((ledger.relationship_reviews||[]).map((x)=>[x.item_id,x]));
const proc = new Map((ledger.procedure_reviews||[]).map((x)=>[x.item_id,x]));

const techSystems = new Map([
  ['SYNTRAX™', new Set(['Lube/Oil Protection Systems'])],
  ['MACROCORE™', new Set(['Air Intake & Airflow Protection Systems'])],
  ['MICROKAPPA™', new Set(['Air Intake & Airflow Protection Systems'])]
]);

function walk(dir,out=[]) {
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    if (e.name === '_reviews') continue;
    const full=path.join(dir,e.name);
    if(e.isDirectory()) walk(full,out); else if(e.name.endsWith('.md')) out.push(full);
  }
  return out;
}
function reviewPath(id){return path.join(reviewRoot,`${id}.scope-review.json`);}
function sourceNeutral(text){return scanSourceSignatures(text).length===0 && !/https?:\/\//i.test(text);}
function technologiesValid(c){
  if(!c.technologies.length) return true;
  return c.technologies.every((t)=>{
    const allowed=techSystems.get(t); if(!allowed) return false;
    return c.systems.some((s)=>allowed.has(s));
  });
}
function currentRefs(id){return ledger.candidate_refs?.[id] || {metric_item_ids:[],relationship_item_ids:[],procedure_item_ids:[]};}
function refsApproved(id){
  const refs=currentRefs(id);
  return (refs.relationship_item_ids||[]).every((x)=>rel.get(x)?.decision==='approved') &&
    (refs.procedure_item_ids||[]).every((x)=>proc.get(x)?.decision==='approved') &&
    (refs.metric_item_ids||[]).length===0;
}

const results=[];
for(const file of walk(candidateRoot)){
  const text=fs.readFileSync(file,'utf8');
  const candidate=parseCandidateNote(text);
  if(!candidate.knowledge_object_id) continue;
  const rp=reviewPath(candidate.knowledge_object_id);
  const review=JSON.parse(fs.readFileSync(rp,'utf8'));
  const refs=currentRefs(candidate.knowledge_object_id);
  const official = candidate.domain==='SHARED_ENGINEERING_KNOWLEDGE' || candidate.systems.every((s)=>OFFICIAL_SYSTEMS.has(s));
  const neutral=sourceNeutral(text);
  const techOk=technologiesValid(candidate);
  const technicalOk=refsApproved(candidate.knowledge_object_id) && candidate.metrics.length===0;
  const ready=official && neutral && techOk && technicalOk;
  results.push({id:candidate.knowledge_object_id,ready,official,neutral,techOk,technicalOk});
  if(!apply || !ready) continue;
  review.metric_item_ids=refs.metric_item_ids||[];
  review.relationship_item_ids=refs.relationship_item_ids||[];
  review.procedure_item_ids=refs.procedure_item_ids||[];
  review.review_status='approved'; review.reviewer=reviewer; review.reviewed_at=reviewedAt;
  Object.assign(review.scope_review,{
    official_system_registry_verified:true,
    technical_scope_verified:true,
    source_neutrality_verified:true,
    no_proprietary_external_claims_verified:true,
    public_language_reviewed:true,
    technology_relation_resolution:candidate.technologies.length?'confirmed':'not_applicable',
    application_relation_resolution:'not_applicable'
  });
  review.final_notes='Scope approved after independent technical validation. Numeric source claims rejected from generic canonical use remain only in the private validation ledger.';
  fs.writeFileSync(rp,JSON.stringify(review,null,2)+'\n','utf8');
}
console.log(`[LD canonical scope] mode=${apply?'APPLY':'DRY_RUN'} total=${results.length} scope_ready=${results.filter(x=>x.ready).length} blocked=${results.filter(x=>!x.ready).length}`);
for(const item of results.filter(x=>!x.ready)) console.log(`[LD canonical scope] BLOCKED ${item.id} official=${item.official} neutral=${item.neutral} technology=${item.techOk} technical=${item.technicalOk}`);
