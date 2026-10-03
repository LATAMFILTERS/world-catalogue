'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const migration=fs.readFileSync(
  path.join(__dirname,'..','scripts','migrations','run_163_close_verified_mann_collision_exceptions.js'),
  'utf8'
);

test('run_163 is limited to eleven exact MANN identities',()=>{
  const pairs=[
    ['EA34002','C24002X'],['EL30066','W66'],['EF30731','PU731X'],
    ['EA33240','C13240'],['EA37004','C17004'],['EA31141','C12114/1'],
    ['EA31338','C1338'],['EL30692','HU69/2'],['EF34213','WK42/13'],
    ['EF38303','WK830/3'],['EF38533','WK853/3']
  ];
  for(const [sku,source] of pairs){
    const escaped=source.replace(/[.*+?^$()|[\]{}]/g,'\\$&');
    assert.match(migration,new RegExp("sku:'"+sku+"'.*source:'"+escaped+"'",'s'));
  }
  assert.doesNotMatch(migration,/PU1060X/);
  assert.doesNotMatch(migration,/FP6724/);
  assert.doesNotMatch(migration,/W1428/);
  assert.doesNotMatch(migration,/C118/);
  assert.doesNotMatch(migration,/C15105\/1/);
  assert.doesNotMatch(migration,/C18146\/1/);
});

test('run_163 remains fail-closed through gateway resolver and canonical DB guard',()=>{
  assert.match(migration,/assertGovernedCatalogPatch/);
  assert.match(migration,/v_api_resolver_v7/);
  assert.match(migration,/ld_canonical_product_identity/);
  assert.match(migration,/MIGRATION_163_VERIFIED_MANN_EXCEPTION/);
  assert.match(migration,/t\.sku==='EF30731'/);
  assert.match(migration,/REFUSE_NON_CANONICAL_DB/);
  assert.match(migration,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
  assert.match(migration,/canonical_source_brand!=='MANN-FILTER'/);
  assert.ok(migration.includes("replace(/[^A-Z0-9]/g,'')"));
  assert.match(migration,/ld_catalog\.norm_part\(canonical_source_code\)=ld_catalog\.norm_part\(\$10\)/);
  assert.match(migration,/report\.transaction='COMMIT'/);
  assert.match(migration,/report\.transaction='ROLLBACK'/);
});

test('run_163 stores semantic specs instead of collapsing inlet outlet or secondary diameters',()=>{
  assert.match(migration,/\['Thread size entry','M12x1\.5'\]/);
  assert.match(migration,/\['Thread size exit','M14x1\.5'\]/);
  assert.match(migration,/\['Inlet','8 mm'\]/);
  assert.match(migration,/\['Outlet','8 mm'\]/);
  assert.match(migration,/\['Outer diameter 1','88 mm'\]/);
  assert.match(migration,/\['Inner diameter 1','9\.8 mm'\]/);
});
