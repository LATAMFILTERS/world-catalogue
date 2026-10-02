'use strict';

const fs=require('fs');
const path=require('path');
const test=require('node:test');
const assert=require('node:assert/strict');

const ROOT=path.join(__dirname,'..');
const migration=fs.readFileSync(
  path.join(ROOT,'scripts','migrations','run_135_reconstruct_b31_cross_type_authorities.js'),
  'utf8'
);

test('run_135 is dry-run by default and serializable',()=>{
  assert.match(migration,/const EXECUTE = process\.argv\.includes\('--execute'\)/);
  assert.match(migration,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(migration,/ROLLBACK \(dry-run\)/);
});

test('run_135 locks exact B3.1 authorities and row counts',()=>{
  for(const [code,target,count] of [
    ['WH12001','EH61207',52],
    ['WH12005','EH61949',155],
    ['WDK925','EF90810',10]
  ]){
    assert.match(migration,new RegExp(code));
    assert.match(migration,new RegExp(target));
    assert.match(migration,new RegExp('expected_rows:'+count));
  }
});

test('run_135 creates only minimal governed EF90810 identity',()=>{
  assert.match(migration,/EF90810/);
  assert.match(migration,/P550810/);
  assert.match(migration,/SYNTAPORE™/);
  assert.match(migration,/filter_type:'fuel'/);
  assert.match(migration,/duty:'HEAVY_DUTY'/);
  assert.doesNotMatch(migration,/height_mm|outer_diameter_mm|thread_size|micron_rating/);
});

test('run_135 refuses duplicate P550810 ownership',()=>{
  assert.match(migration,/already owned by/);
  assert.match(migration,/codigo_base/);
  assert.match(migration,/canonical_source_code/);
});

test('run_135 requires zero target application collisions',()=>{
  assert.match(migration,/target collisions/);
  assert.match(migration,/upper\(coalesce\(t\.make,''\)\)=upper\(coalesce\(s\.make,''\)\)/);
  assert.match(migration,/upper\(coalesce\(t\.engine_code,''\)\)=upper\(coalesce\(s\.engine_code,''\)\)/);
});

test('run_135 creates HD relational parents without violating LD canonical policy',()=>{
  assert.match(migration,/INSERT INTO ld_catalog\.ld_product_catalog/);
  assert.doesNotMatch(migration,/INSERT INTO ld_catalog\.ld_canonical_product_identity/);
  assert.match(migration,/UPDATE ld_catalog\.ld_vehicle_applications/);
});

test('run_135 normalizes MANN crossrefs and DAF OEM for P550810',()=>{
  assert.match(migration,/MANN-FILTER/);
  assert.match(migration,/ld_competitor_cross_references/);
  assert.match(migration,/ld_oem_cross_references/);
  assert.match(migration,/'DAF'::text,'1345335'::text/);
});

test('run_135 never mutates cabin holds',()=>{
  assert.doesNotMatch(migration,/FP1829/);
  assert.doesNotMatch(migration,/FP3054/);
});
