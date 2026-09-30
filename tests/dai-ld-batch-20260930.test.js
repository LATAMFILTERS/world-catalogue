'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const { PRODUCTS, buildRow }=require('../scripts/migrations/run_120_create_dai_ld_batch_20260930');
const { validateCanonicalWrite }=require('../lib/catalog-write-gateway');

const expected=new Map([
  ['EL31955','CH11955'],
  ['EL32478','CH12478'],
  ['EL31934','CH11934'],
  ['EL32824','CH12824ECO'],
  ['EC39882','CF9882'],
  ['EA33603','OK6B0-23-603'],
]);

test('Dai LD batch contains exactly the six approved canonical identities',()=>{
  assert.equal(PRODUCTS.length,6);
  assert.deepEqual(new Map(PRODUCTS.map(p=>[p.sku,p.base])),expected);
});

test('all Dai LD rows pass the governed canonical write gateway',()=>{
  for(const product of PRODUCTS){
    const result=validateCanonicalWrite(buildRow(product).row);
    assert.equal(result.valid,true,`${product.sku}: ${result.reasons.join(',')}`);
  }
});

test('EA33603 uses verified OEM fallback only after FRAM absence',()=>{
  const p=PRODUCTS.find(x=>x.sku==='EA33603');
  const gov=buildRow(p).row.enrichment_data.codigo_base_governance;
  assert.equal(gov.origin_group,'NON_EUROPEAN');
  assert.equal(gov.fram_absence_verified,true);
  assert.equal(gov.approved_source_column,'OEM_CODES');
  assert.equal(gov.approved_codigo_base,'OK6B0-23-603');
});

test('EL32824 carries only the resolved diesel application family',()=>{
  const p=PRODUCTS.find(x=>x.sku==='EL32824');
  const text=JSON.stringify(p.applications).toUpperCase();
  assert.match(text,/SANTA FE/);
  assert.match(text,/SORENTO/);
  assert.match(text,/D4H/);
  assert.doesNotMatch(text,/ELANTRA|SONATA|FORTE|SOUL|OPTIMA/);
});
