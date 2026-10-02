'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');

const ROOT=path.join(__dirname,'..');
const FILE=path.join(ROOT,'scripts','migrations','run_137_backfill_master_application_ccm.js');
const AUDIT=path.join(ROOT,'scripts','audits','audit_master_ccm_backfill_candidates.js');
const migration=fs.readFileSync(FILE,'utf8');
const audit=fs.readFileSync(AUDIT,'utf8');
const mod=require(FILE);

test('run_137 is pinned to the audited classification counts',()=>{
  assert.deepEqual(mod.EXPECTED,{
    MATCH_UNIQUE:157599,
    AMBIGUOUS:3110,
    NO_ENGINE_SIZE_IN_SOURCE:103110,
    NO_SOURCE_MATCH:0
  });
  assert.equal(mod.EXPECTED_MASTER_NULL_CCM,263819);
  assert.match(migration,/AUDIT_CLASS_COUNT_CHANGED/);
  assert.match(migration,/MASTER_NULL_CCM_COUNT_CHANGED/);
});

test('run_137 reuses the auditor classification rather than duplicating it',()=>{
  assert.match(migration,/classifyMatches/);
  assert.match(migration,/loadCsv/);
  assert.match(audit,/module\.exports=\{key,csvLine,loadCsv,classifyMatches,assertDatabase\}/);
});

test('only MATCH_UNIQUE rows can enter the staging table',()=>{
  assert.match(migration,/if\(result\.cls==='MATCH_UNIQUE'\)/);
  assert.match(migration,/candidates\.length!==EXPECTED\.MATCH_UNIQUE/);
  assert.match(migration,/STAGING_COUNT_MISMATCH/);
  assert.match(migration,/SOURCE_LINE_EVIDENCE_INVALID/);
});

test('application mutation is compare-and-swap and changes only ccm',()=>{
  assert.match(migration,/UPDATE ld_catalog\.ld_vehicle_applications v[\s\S]*SET ccm=s\.proposed_ccm/);
  assert.match(migration,/v\.id=s\.id/);
  assert.match(migration,/v\.ccm IS NULL/);
  assert.match(migration,/v\.source_sku IS NOT DISTINCT FROM s\.source_sku/);
  assert.match(migration,/v\.make IS NOT DISTINCT FROM s\.make/);
  assert.match(migration,/v\.model_family IS NOT DISTINCT FROM s\.model_family/);
  assert.match(migration,/v\.model_type IS NOT DISTINCT FROM s\.model_type/);
  assert.match(migration,/v\.year IS NOT DISTINCT FROM s\.year/);
  assert.match(migration,/v\.engine_code IS NOT DISTINCT FROM s\.engine_code/);
  assert.doesNotMatch(migration,/SET\s+(?!ccm\s*=)[a-z_]+\s*=/i);
});

test('ambiguous and source-without-engine-size rows remain excluded',()=>{
  assert.match(migration,/remainingNull!==EXPECTED\.AMBIGUOUS\+EXPECTED\.NO_ENGINE_SIZE_IN_SOURCE\+EXPECTED\.NO_SOURCE_MATCH/);
  assert.match(migration,/no_engine_size_in_source:counts\.NO_ENGINE_SIZE_IN_SOURCE/);
  assert.match(migration,/ambiguous:counts\.AMBIGUOUS/);
});

test('CH10358 is explicitly outside run_137',()=>{
  assert.match(migration,/CH10358_MUST_NOT_BE_IN_RUN136/);
  assert.match(migration,/CH10358_UNEXPECTEDLY_CHANGED/);
  assert.doesNotMatch(migration,/SET[^;]*CH10358/i);
});

test('run_137 is serializable, dry-run by default and requires canonical 5441',()=>{
  assert.match(migration,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(migration,/const EXECUTE = process\.argv\.includes\('--execute'\)/);
  assert.match(migration,/await db\.query\('ROLLBACK'\)/);
  assert.match(migration,/assertDatabase\(url\)/);
  assert.match(migration,/Number\(target\.port\)!==5441/);
});
