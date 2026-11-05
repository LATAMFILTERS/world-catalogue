'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'edge', 'et90010-tunnel-image-worker.js'), 'utf8');
const sandbox = { addEventListener() {} };
vm.runInNewContext(source + '\n globalThis.__r2Audit = { patchImage, IMAGE_URL_BY_SKU };', sandbox);
const { patchImage, IMAGE_URL_BY_SKU } = sandbox.__r2Audit;
const missing = ['EA17484','EL30358','ES90352','ES90674','ES90944','ES91840',
  'ET90900','ET91000','ET92020P','ET92020S','ET92020T'];

test('verified R2 map covers 11 missing public SKUs plus existing ET90010', () => {
  assert.deepEqual(Object.keys(IMAGE_URL_BY_SKU).sort(), ['ET90010', ...missing].sort());
  for (const sku of Object.keys(IMAGE_URL_BY_SKU)) {
    assert.equal(IMAGE_URL_BY_SKU[sku],
      'https://cdn.elimfilters.com/fleetguard/page-1/01-20/' + sku + '.png');
  }
});
test('fills missing image without altering the existing product identity, references or applications', () => {
  const original = missing.map(sku=>({elimfilters_sku:sku,image_url:null,
    competitor_codes:[{code:'TEST'}],equipment_applications:[]}));
  const body={results:original.map(p=>({...p}))};
  assert.equal(patchImage(body), true);
  assert.equal(body.results.length,11);
  for (const p of body.results){
    assert.equal(p.image_url,IMAGE_URL_BY_SKU[p.elimfilters_sku]);
    assert.deepEqual(p.competitor_codes,[{code:'TEST'}]);
    assert.deepEqual(p.equipment_applications,[]);
  }
  assert.equal(patchImage(body), false);
  assert.equal(original.every(p=>p.image_url==null),true);
});
test('does not overwrite an existing source image or affect unrelated SKU', () => {
  const body={results:[{sku:'ES90674',image_url:'https://cdn.elimfilters.com/products/ES90674/approved/sha.png'},
    {sku:'EL82100',image_url:null},{sku:'EA17484',image_url:' '}]};
  assert.equal(patchImage(body),true);
  assert.equal(body.results[0].image_url,'https://cdn.elimfilters.com/products/ES90674/approved/sha.png');
  assert.equal(body.results[1].image_url,null);
  assert.equal(body.results[2].image_url,IMAGE_URL_BY_SKU.EA17484);
});
test('does not fabricate missing records or reinterpret a search response', () => {
  const bad={results:[]};
  assert.equal(patchImage(bad),false);
  assert.deepEqual(bad.results,[]);
  assert.equal(patchImage({results:null}),false);
  assert.equal(patchImage(null),false);
});
