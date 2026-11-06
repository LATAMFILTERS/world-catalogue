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

test('R2 inventory maps 135 distinct SKU-prefixed images without inventing product records', () => {
  assert.equal(Object.keys(IMAGE_URL_BY_SKU).length, 135);
  for (const [sku, url] of Object.entries(IMAGE_URL_BY_SKU)) {
    assert.match(sku, /^[A-Z]{2}\d{4,7}[A-Z]?$/);
    assert.equal(new URL(url).origin, 'https://cdn.elimfilters.com');
    const filename = decodeURIComponent(new URL(url).pathname.split('/').pop());
    assert.ok(filename.startsWith(sku), sku + ': ' + filename);
    assert.match(filename.slice(sku.length), /^(?:\.(?:png|jpe?g|webp)|-[A-Za-z0-9-]+\.(?:png|jpe?g|webp)| (?:Microkappa|Syntrax|\([12]\))\.png)$/i);
  }
  for (const sku of ['ET90010', 'ES90674', 'EL83191', 'EL84004', 'EL87483', 'EA17682', 'EL81807']) {
    assert.equal(IMAGE_URL_BY_SKU[sku], 'https://cdn.elimfilters.com/fleetguard/page-1/01-20/' + sku + '.png');
  }
  assert.equal(IMAGE_URL_BY_SKU.EC30025.endsWith('EC30025%20Microkappa.png'), true);
  assert.equal(IMAGE_URL_BY_SKU.EF90440.includes('EF90440%20(2).png'), true);
  assert.equal(IMAGE_URL_BY_SKU.EL31665.endsWith('EL31665%20Syntrax.png'), true);
  assert.equal(IMAGE_URL_BY_SKU.P502042, undefined);
  assert.equal(IMAGE_URL_BY_SKU.ET97784, undefined);
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
    {sku:'EL82101',image_url:null},{sku:'EA17484',image_url:' '}]};
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

test('ES90674 assembly note is restricted to its own results page and links to ET90010', async () => {
  let injected = null;
  class FakeRewriter {
    on(selector, handler) {
      assert.equal(selector, 'body');
      handler.element({append: (html, options) => {injected = html; assert.equal(options.html, true);}});
      return this;
    }
    transform(response) { return response; }
  }
  const ctx = {addEventListener() {}, URL, Headers, Response, HTMLRewriter: FakeRewriter};
  vm.runInNewContext(source + '\n globalThis.__assembly = {handleResultsPage};', ctx);
  const src = new Response('<html><body></body></html>', {status:200,headers:{'content-type':'text/html'}});
  const returned = await ctx.__assembly.handleResultsPage({method:'GET'},src,
    new URL('https://part-search.elimfilters.com/results.html?q=ES90674&mode=part'));
  assert.equal(returned.headers.get('x-elimfilters-assembly-link'), 'ES90674-ET90010');
  assert.match(injected, /ET90010/);
  assert.match(injected, /COMPATIBILIDAD CON CONJUNTOS/);
  assert.match(injected, /\/results\.html\?q=ET90010&mode=part/);
  assert.match(injected, /No se afirma compatibilidad exclusiva/);
  injected = null;
  const other = new Response('<html><body></body></html>', {status:200,headers:{'content-type':'text/html'}});
  const unchanged = await ctx.__assembly.handleResultsPage({method:'GET'},other,
    new URL('https://part-search.elimfilters.com/results.html?q=ES90944&mode=part'));
  assert.equal(unchanged,other);
  assert.equal(injected,null);
});

test('ET90010 legacy Tunnel page receives only its ES90674 clickable service-element link', async () => {
  let injected = null;
  class FakeRewriter {
    on(selector, handler) {
      assert.equal(selector, 'body');
      handler.element({ append(html, opts) { injected = html; assert.equal(opts.html, true); } });
      return this;
    }
    transform(response) { return response; }
  }
  const ctx = {addEventListener() {}, URL, Headers, Response, HTMLRewriter: FakeRewriter};
  vm.runInNewContext(source + '\n globalThis.__replacement = {handleResultsPage};', ctx);
  const makeHtml = () => new Response('<html><body></body></html>',
    {status:200,headers:{'content-type':'text/html'}});
  const supplied = makeHtml();
  const result = await ctx.__replacement.handleResultsPage({method:'GET'},supplied,
    new URL('https://part-search.elimfilters.com/results.html?q=ET90010&mode=part'));
  assert.equal(result.headers.get('x-elimfilters-assembly-link'), 'ET90010-ES90674');
  assert.match(injected, /REPLACEABLE FILTER ELEMENT/);
  assert.match(injected, /ELEMENTO FILTRANTE REEMPLAZABLE/);
  assert.match(injected, /ELIMFILTERS ES90674/);
  assert.ok(injected.includes('/results.html?q=ES90674&mode=part'));
  assert.match(injected, /data-replacement-element/);
  injected = null;
  const other = makeHtml();
  const passed = await ctx.__replacement.handleResultsPage({method:'GET'},other,
    new URL('https://part-search.elimfilters.com/results.html?q=EL82100'));
  assert.equal(passed, other);
  assert.equal(injected, null);
});

test('B76 result presentation labels primary P553191 separately from P554004 and DBL7483', async () => {
  let injected = null;
  class FakeRewriter {
    on(selector, handler) {
      assert.equal(selector, 'body');
      handler.element({ append(html, options) { injected = html; assert.equal(options.html, true); } });
      return this;
    }
    transform(response) { return response; }
  }
  const ctx = { addEventListener() {}, URL, Headers, Response, HTMLRewriter: FakeRewriter };
  vm.runInNewContext(source + '\n globalThis.__b76 = {handleResultsPage};', ctx);
  const page = () => new Response('<html><body></body></html>', {status:200,headers:{'content-type':'text/html'}});
  const output = await ctx.__b76.handleResultsPage({method:'GET'},page(),
    new URL('https://part-search.elimfilters.com/results.html?q=b76&mode=part'));
  assert.equal(output.headers.get('x-elimfilters-reference-presentation'), 'B76_CANONICAL_AND_ALTERNATE');
  assert.match(injected, /P553191/);
  assert.match(injected, /EL83191/);
  assert.match(injected, /P554004/);
  assert.match(injected, /DBL7483/);
  assert.match(injected, /P551807/);
  assert.match(injected, /data-b76-reference-guide/);
  injected = null;
  const other = page();
  assert.equal(await ctx.__b76.handleResultsPage({method:'GET'},other,
    new URL('https://part-search.elimfilters.com/results.html?q=B7600')), other);
  assert.equal(injected, null);
});

test('retired SKU identifiers in exact current-SKU descriptions are corrected without touching image or audit state', () => {
  const sandbox = { addEventListener() {} };
  vm.runInNewContext(source + '\n globalThis.__identity = { patchRetiredSkuDescription };', sandbox);
  const patch = sandbox.__identity.patchRetiredSkuDescription;
  const records = [
    {elimfilters_sku:'EA15967',description:'ELIMFILTERS® EA135396 MACROCORE™, radial seal secondary air element',
      image_url:'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EA135396-MACROCORE-approved-opt.png',
      catalog_validation:{state:'BLOCKED'},application_validation:{equipment_applications:{state:'EVIDENCE_VERIFIED'}}},
    {elimfilters_sku:'EL82352',description:'ELIMFILTERS® EL80352 SYNTRAX™ high-performance lube filter',
      image_url:'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EL80352-SYNTRAX-approved-opt.png',
      catalog_validation:{state:'CERTIFIED'},application_validation:{equipment_applications:{state:'EVIDENCE_REQUIRED'}}},
    {elimfilters_sku:'EL30246',description:'ELIMFILTERS® EL36122 SYNTRAX™ different product',
      image_url:'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EL36122.png'}
  ];
  const initial = structuredClone(records);
  assert.equal(patch({results:records}),true);
  assert.equal(records[0].description,'ELIMFILTERS® EA15967 MACROCORE™, radial seal secondary air element');
  assert.equal(records[1].description,'ELIMFILTERS® EL82352 SYNTRAX™ high-performance lube filter');
  assert.equal(records[2].description,initial[2].description);
  for(let i=0;i<records.length;i++){
    assert.equal(records[i].image_url,initial[i].image_url);
    assert.deepEqual(records[i].catalog_validation,initial[i].catalog_validation);
    assert.deepEqual(records[i].application_validation,initial[i].application_validation);
  }
  assert.equal(patch({results:records}),false);
  assert.equal(patch({results:[{elimfilters_sku:'EA15967',description:'Product with EA135396 in the middle'}]}),false);
  assert.equal(patch(null),false);
});

test('EL30013 retired FRAM PH13 SKU cannot resolve to an unrelated hydraulic EH64348', () => {
  const sandbox = {addEventListener(){},URL};
  vm.runInNewContext(source+'\n globalThis.__guard = guardConflictedSkuResponse;',sandbox);
  const guard = sandbox.__guard;
  const body={source:'exact_part_reference',results:[{elimfilters_sku:'EH64348',filter_type:'Hydraulic',
    image_url:null,competitor_codes:[{code:'HF6002'}]}],reference_safety_status:'SEARCH_RESULT_ONLY'};
  const result=guard(body,new URLSearchParams('q=EL30013&lang=en'));
  assert.equal(result.changed,true);
  assert.equal(result.held,'EL30013_WRONG_FAMILY_REFERENCE');
  assert.equal(body.results.length,0);
  assert.equal(body.source,'no_match');
  assert.equal(body.reference_safety_status,'IDENTITY_REVIEW_REQUIRED');
  const real={source:'exact_sku',results:[{elimfilters_sku:'EH64348'}]};
  assert.equal(guard(real,new URLSearchParams('q=EH64348')).changed,false);
  assert.equal(real.results[0].elimfilters_sku,'EH64348');
  const mixed={source:'exact_part_reference',results:[{elimfilters_sku:'EH64348'},{elimfilters_sku:'EL30013'}]};
  assert.equal(guard(mixed,new URLSearchParams('q=EL30013')).changed,false);
  assert.equal(mixed.results.length,2);
});

test('EL30246 holds EL36122-branded photo without replacing SKU or references', () => {
  const sandbox={addEventListener(){},URL};
  vm.runInNewContext(source+'\n globalThis.__guard = guardConflictedSkuResponse;',sandbox);
  const guard=sandbox.__guard;
  const p={elimfilters_sku:'EL30246',image_url:'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EL36122.png',
    description:'ELIMFILTERS® EL30246',competitor_codes:[{code:'PF2264G'}],catalog_validation:{state:'CERTIFIED'}};
  const body={source:'exact_sku',results:[p]};
  const result=guard(body,new URLSearchParams('q=EL30246'));
  assert.equal(result.changed,true);
  assert.equal(result.held,'EL30246_IMAGE_IDENTITY_UNVERIFIED');
  assert.equal(p.image_url,null);
  assert.equal(p.elimfilters_sku,'EL30246');
  assert.deepEqual(p.competitor_codes,[{code:'PF2264G'}]);
  assert.deepEqual(p.catalog_validation,{state:'CERTIFIED'});
  assert.equal(guard(body,new URLSearchParams('q=EL36122')).changed,false);
  const correct={source:'exact_sku',results:[{elimfilters_sku:'EL30246',
    image_url:'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EL30246.png'}]};
  assert.equal(guard(correct,new URLSearchParams('q=EL30246')).changed,false);
  assert.match(correct.results[0].image_url,/EL30246.png/);
  const other={source:'exact_sku',results:[{elimfilters_sku:'EL36122',
    image_url:'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EL36122.png'}]};
  assert.equal(guard(other,new URLSearchParams('q=EL36122')).changed,false);
  assert.ok(other.results[0].image_url);
});

test('EL30246 uses the newly published exact-SKU R2 image after the mismatched old photo is held', () => {
  const scope={addEventListener(){},URL};
  vm.runInNewContext(source + '\n globalThis.__el30246 = {guardConflictedSkuResponse,patchApprovedEL30246Image,EL30246_APPROVED_URL};',scope);
  const {guardConflictedSkuResponse,patchApprovedEL30246Image,EL30246_APPROVED_URL}=scope.__el30246;
  assert.equal(EL30246_APPROVED_URL,'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EL30246.webp');
  const products=[
    {elimfilters_sku:'EL30246',image_url:'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EL36122.png',
     catalog_validation:{state:'CERTIFIED'},competitor_codes:[{manufacturer:'FRAM',code:'CH10246'}]},
    {elimfilters_sku:'EL30013',image_url:null},
    {elimfilters_sku:'EL82352',image_url:'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EL80352-SYNTRAX-approved-opt.png'}
  ];
  const refs=JSON.stringify(products.map(p=>({sku:p.elimfilters_sku,refs:p.competitor_codes,validation:p.catalog_validation})));
  const body={source:'exact_sku',results:products};
  const held=guardConflictedSkuResponse(body,new URLSearchParams('q=EL30246'));
  assert.equal(held.held,'EL30246_IMAGE_IDENTITY_UNVERIFIED');
  assert.equal(products[0].image_url,null);
  assert.equal(patchApprovedEL30246Image(body),true);
  assert.equal(products[0].image_url,EL30246_APPROVED_URL);
  assert.equal(patchApprovedEL30246Image(body),false);
  assert.equal(products[1].image_url,null);
  assert.equal(products[2].image_url,'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EL80352-SYNTRAX-approved-opt.png');
  assert.equal(JSON.stringify(products.map(p=>({sku:p.elimfilters_sku,refs:p.competitor_codes,validation:p.catalog_validation}))),refs);
  const external={results:[{elimfilters_sku:'EL30246',image_url:'https://cdn.elimfilters.com/fleetguard/page-1/01-20/EL30246-other-approved.png'}]};
  assert.equal(patchApprovedEL30246Image(external),false);
  assert.match(external.results[0].image_url,/EL30246-other-approved/);
});
