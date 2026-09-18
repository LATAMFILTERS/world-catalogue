import test from 'node:test';
import assert from 'node:assert/strict';
import { PUBLISHABLE_CATALOGUE_FIELDS, buildCataloguePublicationPlan } from '../scripts/hermes/catalogue-publication-plan.mjs';
import { COLUMN_GROUPS, compileUpdate } from '../scripts/hermes/publish-catalogue-plan.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('source identity is a governed publishable field',()=>{
  assert.equal(PUBLISHABLE_CATALOGUE_FIELDS.has('source_identity'),true);
  assert.deepEqual(COLUMN_GROUPS.source_identity,[
    'canonical_source_brand','canonical_source_code','canonical_source_url',
    'canonical_source_status','canonical_verified_at','canonical_evidence'
  ]);
});

test('approved source identity compiles through controlled publisher',()=>{
  const approvedAt='2026-09-18T07:00:00.000Z';
  const source={canonical_source_brand:'DONALDSON',canonical_source_code:'P123456',canonical_source_url:'https://www.donaldson.com/example',canonical_source_status:'VERIFIED',canonical_verified_at:approvedAt,canonical_evidence:{evidence_id:'CQE_TEST'}};
  const bundle={
    research_bundle_id:'RB_TEST_SOURCE',
    knowledge_candidate:{research_bundle_id:'RB_TEST_SOURCE',workflow_status:'APPROVED',approval_required:true,approved_by:'Victor Abreu',approved_at:approvedAt},
    catalogue_candidate:{research_bundle_id:'RB_TEST_SOURCE',status:'APPROVED_FOR_PUBLICATION',change_type:'catalogue_correction',approval:{approved_by:'Victor Abreu',approved_at:approvedAt,approved_fields:['source_identity']},publication:{target_sku:'EH60001',approved_fields:['source_identity'],proposed_values:{source_identity:source}},evidence:[],source_urls:[source.canonical_source_url]}
  };
  const plan=buildCataloguePublicationPlan({bundle,catalog:[{sku:'EH60001',source_identity:{}}],generatedAt:approvedAt});
  assert.equal(plan.operations.length,1);
  assert.equal(plan.operations[0].field,'source_identity');
  const update=compileUpdate(plan);
  assert.match(update.sql,/canonical_source_brand/);
  assert.match(update.sql,/canonical_evidence/);
  assert.equal(update.values.at(-1),'EH60001');
});

test('catalogue snapshot carries canonical source identity',()=>{
  const here=path.dirname(fileURLToPath(import.meta.url));
  const source=fs.readFileSync(path.join(here,'../scripts/hermes/export-catalogue-snapshot.mjs'),'utf8');
  assert.match(source,/source_identity:/);
  assert.match(source,/canonical_source_brand/);
  assert.match(source,/canonical_source_evidence|canonical_evidence/);
});
