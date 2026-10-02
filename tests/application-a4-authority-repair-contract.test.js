'use strict';

const fs=require('fs');
const path=require('path');
const test=require('node:test');
const assert=require('node:assert/strict');

const ROOT=path.join(__dirname,'..');
const migration=fs.readFileSync(
  path.join(ROOT,'scripts','migrations','run_131_resolve_a4_application_authorities.js'),
  'utf8'
);

test('run_131 is dry-run by default and serializable',()=>{
  assert.match(migration,/const EXECUTE = process\.argv\.includes\('--execute'\)/);
  assert.match(migration,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(migration,/ROLLBACK \(dry-run\)/);
  assert.match(migration,/console\.log\('COMMIT'\)/);
});

test('run_131 locks the six governed ownership moves and exact row counts',()=>{
  for(const [source,target,code,count] of [
    ['EA32141','EC30554','FP2141',168],
    ['EC36001','EA32521','CF6001',106],
    ['EA37125','EA30994','C27125',25],
    ['EC32862','EC38644','CUK2862',125],
    ['EL30922','EL36657','WP922',7],
    ['EL39409','EW72096','WA940/9',151]
  ]){
    assert.match(migration,new RegExp(source));
    assert.match(migration,new RegExp(target));
    assert.match(migration,new RegExp(code.replace('/','\\/')));
    assert.match(migration,new RegExp('expected:'+count));
  }
});

test('run_131 refuses target application collisions',()=>{
  assert.match(migration,/target key collisions/);
  assert.match(migration,/upper\(coalesce\(t\.make,''\)\)=upper\(coalesce\(s\.make,''\)\)/);
  assert.match(migration,/coalesce\(t\.year,''\)=coalesce\(s\.year,''\)/);
});

test('run_131 reconciles public JSON only in authorized cases',()=>{
  assert.match(migration,/EA37125[\s\S]*json:'TRANSFER'/);
  assert.match(migration,/EC32862[\s\S]*json:'CLEAR_SOURCE_JUNK'/);
  assert.match(migration,/EL30922[\s\S]*json:'TRANSFER'/);
  assert.match(migration,/EL39409[\s\S]*json:'TRANSFER'/);
  assert.match(migration,/3880cc 237 CID/);
  assert.match(migration,/target JSON not empty/);
});

test('run_131 deletes C901 only when the application identity is completely blank',()=>{
  assert.match(migration,/EA30901/);
  assert.match(migration,/C901/);
  assert.match(migration,/nullif\(trim\(coalesce\(make,''\)\),''\) IS NULL/);
  assert.match(migration,/blank row count/);
});

test('run_131 moves WA9409 cross-reference from the wrong target to EW72096',()=>{
  assert.match(migration,/EA31104/);
  assert.match(migration,/EW72096/);
  assert.match(migration,/P552096/);
  assert.match(migration,/MANN-FILTER/);
  assert.match(migration,/WA940\/9/);
  assert.match(migration,/ld_competitor_cross_references/);
});

test('run_131 never rewrites source_sku or product identity',()=>{
  assert.doesNotMatch(migration,/SET\s+source_sku=/i);
  assert.doesNotMatch(migration,/UPDATE\s+ld_catalog\.ld_product_catalog/i);
  assert.doesNotMatch(migration,/UPDATE\s+ld_catalog\.ld_canonical_product_identity/i);
});

test('run_131 routes public application JSON through the governed gateway',()=>{
  assert.match(migration,/catalog-application-write-service/);
  assert.match(migration,/applyVerifiedApplications/);
  assert.doesNotMatch(migration,/SET\s+vehicle_applications=/i);
  assert.doesNotMatch(migration,/SET\s+equipment_applications=/i);
});

test('run_131 stores WA9409 payload as heavy-duty equipment evidence',()=>{
  assert.match(migration,/source:'EL39409'[\s\S]*target:'EW72096'[\s\S]*targetKind:'EQUIPMENT'/);
  assert.match(migration,/equipment_applications:\[\.\.\.existing,\.\.\.payload\]/);
  assert.match(migration,/MANN-FILTER \+ DONALDSON/);
});

test('run_131 merges WA9409 into existing governed EW72096 equipment evidence',()=>{
  assert.match(migration,/function applicationKey/);
  assert.match(migration,/existingTargetJson/);
  assert.match(migration,/mergedTargetJson/);
  assert.match(migration,/equipment JSON overlap/);
  assert.match(migration,/prior_verified_authority:'DONALDSON_OFFICIAL_CATALOG'/);
  assert.match(migration,/equipment_applications:\[\.\.\.existing,\.\.\.payload\]/);
});

test('run_131 normalizes legacy model_type and engine_code before governed writes',()=>{
  assert.match(migration,/function governancePayload/);
  assert.match(migration,/model: entry\.model \|\| \[entry\.model_family, entry\.model_type\]/);
  assert.match(migration,/engine: entry\.engine \|\| entry\.engine_code/);
  assert.match(migration,/governancePayload\(sourcePayloadResult\.rows\[0\]\?\.vehicle_applications/);
});

test('run_131 creates EW72096 relational parent only after identity validation',()=>{
  assert.match(migration,/EW72096 catalog identity missing/);
  assert.match(migration,/norm\(ew\.codigo_base\)!=='P552096'/);
  assert.match(migration,/ew\.filter_type!=='coolant'/);
  assert.match(migration,/ew\.duty!=='HEAVY_DUTY'/);
  assert.match(migration,/INSERT INTO ld_catalog\.ld_product_catalog/);
  assert.match(migration,/VALUES \('EW72096','P552096','Coolant Filter'\)/);
  assert.match(migration,/P552096 parent already owned/);
});
