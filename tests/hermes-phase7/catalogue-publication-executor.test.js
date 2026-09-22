import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { compileUpdate, executeCataloguePublicationPlan, validateCataloguePublicationPlan } from '../../scripts/hermes/publish-catalogue-plan.mjs';

const canonical = (v) => Array.isArray(v) ? v.map(canonical) : (v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])])) : v);
const hash = (v) => crypto.createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
function plan() {
  const core = { schema_version:'1.0.0', research_bundle_id:'HERMES_BUNDLE_X', target_sku:'EA10001', change_type:'technology_update', approval:{ approved_by:'Victor Abreu', approved_at:new Date().toISOString(), approved_fields:['technology'] }, knowledge_approval:{ approved_by:'Victor Abreu', approved_at:new Date().toISOString() }, snapshot_sha256:'a'.repeat(64), operations:[{ field:'technology', before:'HYDROCORE', after:'TURBOCORE' }], evidence:[], source_urls:[] };
  return { ...core, generated_at:new Date().toISOString(), plan_sha256:hash(core), dry_run:true, database_write:false };
}

function applicationPlan({ withEvidence = true } = {}) {
  const applicationEvidence = {
    authority: 'ISUZU COMMERCIAL TRUCK OF AMERICA',
    source_url: 'https://www.isuzucv.com/official-application',
    evidence_hash: 'c'.repeat(64),
    metadata: { evidence_id: 'APP-1' }
  };
  const core = {
    schema_version:'1.0.0',
    research_bundle_id:'HERMES_BUNDLE_APP',
    target_sku:'EA20002',
    change_type:'application_update',
    approval:{ approved_by:'Victor Abreu', approved_at:new Date().toISOString(), approved_fields:['vehicle_applications'] },
    knowledge_approval:{ approved_by:'Victor Abreu', approved_at:new Date().toISOString() },
    snapshot_sha256:'d'.repeat(64),
    operations:[{
      field:'vehicle_applications',
      before:[],
      after:[{ make:'ISUZU', model:'NPR-HD', year:'2022' }]
    }],
    evidence:[{ evidence_id:'APP-1' }],
    source_urls:['https://www.isuzucv.com/official-application']
  };
  if (withEvidence) core.application_evidence = applicationEvidence;
  return { ...core, generated_at:new Date().toISOString(), plan_sha256:hash(core), dry_run:true, database_write:false };
}

test('validates intact, fresh plans and rejects tampering', () => {
  const value=plan(); assert.equal(validateCataloguePublicationPlan(value), true);
  value.operations[0].after='UNAPPROVED_TECH';
  assert.throws(() => validateCataloguePublicationPlan(value), /hash mismatch/);
});
test('compiles only allowlisted parameterized assignments', () => {
  const out=compileUpdate(plan());
  assert.equal(out.sql, 'UPDATE elimfilters_catalog SET technology = $1 WHERE sku = $2');
  assert.deepEqual(out.values, ['TURBOCORE','EA10001']);
});
test('is dry-run by default and never requests a pool', async () => {
  const out=await executeCataloguePublicationPlan({ plan:plan(), apply:false });
  assert.deepEqual(out, { outcome:'DRY_RUN', database_write:false, target_sku:'EA10001', operations:1 });
});
test('application plans fail closed without explicit evidence', () => {
  const value = applicationPlan({ withEvidence:false });
  assert.throws(() => validateCataloguePublicationPlan(value), /application_evidence/);
});

test('requires a second live activation gate', async () => {
  delete process.env.HERMES_CATALOGUE_PUBLISH_LIVE;
  await assert.rejects(() => executeCataloguePublicationPlan({ plan:plan(), apply:true, pool:{} }), /PUBLISH_LIVE=true/);
});

function fakePool({ stale = false } = {}) {
  const queries=[];
  const before={ sku:'EA10001', technology:stale ? 'STALE_TECH' : 'HYDROCORE' };
  const after={ sku:'EA10001', technology:'TURBOCORE' };
  const client={
    async query(sql) {
      queries.push(sql);
      if (sql.startsWith('SELECT') && sql.includes('FOR UPDATE')) return { rowCount:1, rows:[before] };
      if (sql.startsWith('UPDATE')) return { rowCount:1, rows:[] };
      if (sql.startsWith('SELECT')) return { rowCount:1, rows:[after] };
      return { rowCount:null, rows:[] };
    },
    release() { queries.push('RELEASE'); }
  };
  return { queries, pool:{ async connect(){ return client; } } };
}

test('backs up, verifies and commits one controlled update', async () => {
  process.env.HERMES_CATALOGUE_PUBLISH_LIVE='true';
  const fake=fakePool();
  const tempRoot=os.tmpdir();
  fs.mkdirSync(tempRoot,{ recursive:true });
  const dir=fs.mkdtempSync(path.join(tempRoot,'hermes-publish-'));
  try {
    const out=await executeCataloguePublicationPlan({ plan:plan(), pool:fake.pool, backupDir:dir, apply:true });
    assert.equal(out.outcome,'PUBLISHED');
    assert.ok(fs.existsSync(out.backup_path));
    const savedBackup=JSON.parse(fs.readFileSync(out.backup_path,'utf8'));
    assert.match(savedBackup.backup_sha256,/^[a-f0-9]{64}$/);
    assert.equal(savedBackup.before.sku,'EA10001');
    assert.ok(fake.queries.includes('COMMIT'));
    assert.ok(!fake.queries.includes('ROLLBACK'));
  } finally { fs.rmSync(dir,{ recursive:true, force:true }); delete process.env.HERMES_CATALOGUE_PUBLISH_LIVE; }
});

test('rolls back without updating when the locked row is stale', async () => {
  process.env.HERMES_CATALOGUE_PUBLISH_LIVE='true';
  const fake=fakePool({ stale:true });
  await assert.rejects(() => executeCataloguePublicationPlan({ plan:plan(), pool:fake.pool, apply:true }), /Stale snapshot/);
  assert.ok(fake.queries.includes('ROLLBACK'));
  assert.ok(!fake.queries.some((sql) => sql.startsWith('UPDATE')));
  delete process.env.HERMES_CATALOGUE_PUBLISH_LIVE;
});


function fakeApplicationPool() {
  const queries=[];
  const evidenceRows=[];
  const state={
    sku:'EA20002',
    duty:'LIGHT_DUTY',
    codigo_base:'CA9856',
    equipment_applications:[],
    vehicle_applications:[],
    oem_codes:[],
    competitor_codes:[],
    enrichment_data:{}
  };
  const client={
    async query(sql, params=[]) {
      const text=String(sql);
      queries.push(text);
      if (text==='BEGIN' || text==='COMMIT' || text==='ROLLBACK' || text.startsWith('SET LOCAL')) return { rowCount:null, rows:[] };
      if (text.includes('SELECT * FROM elimfilters_catalog') && text.includes('FOR UPDATE')) return { rowCount:1, rows:[{...state}] };
      if (text.includes('SELECT sku,duty,codigo_base,equipment_applications,vehicle_applications') && text.includes('FOR UPDATE')) {
        return { rowCount:1, rows:[{...state}] };
      }
      if (text.startsWith('SELECT md5(')) return { rowCount:1, rows:[{ hash:'dbhash123' }] };
      if (text.includes('INSERT INTO catalog_application_evidence')) {
        evidenceRows.push({ params });
        return { rowCount:1, rows:[] };
      }
      if (text.includes('UPDATE elimfilters_catalog') && text.includes('equipment_applications=$1::jsonb')) {
        state.equipment_applications=JSON.parse(params[0]);
        state.vehicle_applications=JSON.parse(params[1]);
        state.enrichment_data=JSON.parse(params[2]);
        return { rowCount:1, rows:[] };
      }
      if (text.startsWith('SELECT vehicle_applications FROM elimfilters_catalog')) {
        return { rowCount:1, rows:[{ vehicle_applications:state.vehicle_applications }] };
      }
      if (text.startsWith('SELECT') && text.includes('FROM elimfilters_catalog WHERE sku = $1')) {
        return { rowCount:1, rows:[{...state}] };
      }
      throw new Error('Unexpected application publisher query: '+text);
    },
    release(){ queries.push('RELEASE'); }
  };
  return { queries, evidenceRows, state, pool:{ async connect(){ return client; } } };
}

test('application publication reuses the dedicated evidence writer and records verified governance', async () => {
  process.env.HERMES_CATALOGUE_PUBLISH_LIVE='true';
  const fake=fakeApplicationPool();
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hermes-app-publish-'));
  try {
    const out=await executeCataloguePublicationPlan({ plan:applicationPlan(), pool:fake.pool, backupDir:dir, apply:true });
    assert.equal(out.outcome,'PUBLISHED');
    assert.equal(fake.state.vehicle_applications[0].model,'NPR-HD');
    assert.equal(fake.state.enrichment_data.application_governance.vehicle_verified,true);
    assert.equal(fake.state.enrichment_data.application_governance.evidence_authority,'ISUZU COMMERCIAL TRUCK OF AMERICA');
    assert.equal(fake.evidenceRows.length,1);
    assert.match(fake.queries.find((q)=>q.includes('INSERT INTO catalog_application_evidence'))||'',/catalog_application_evidence/);
    assert.ok(fake.queries.includes('COMMIT'));
  } finally {
    fs.rmSync(dir,{ recursive:true, force:true });
    delete process.env.HERMES_CATALOGUE_PUBLISH_LIVE;
  }
});
