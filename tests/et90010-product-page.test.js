'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildRecord } = require('../lib/product-page-data.js');

const row = {
  sku:'ET90010',codigo_base:'ET90010',catalog_active:true,
  name:'ELIMFILTERS ET90010 Fuel / Water Separator Assembly',description:'Fuel storage filter and water separator',
  filter_type:'fuel',sub_type:'Assembly',technology:'TURBOCORE™',duty:'HEAVY_DUTY',
  thread_size:'1 NPT',height_mm:248.4,outer_diameter_mm:105.6,
  canonical_source_brand:'ELIMFILTERS',canonical_source_code:'ET90010',canonical_source_status:'VERIFIED',
  oem_codes:[{manufacturer:'BALDWIN',code:'B10AL',classification:'OEM'}],
  competitor_codes:[
    {manufacturer:'WIX',code:'24380',classification:'COMPETITOR',product_scope:'COMPLETE_ASSEMBLY',evidence_status:'REVIEW'},
    {manufacturer:'WIX',code:'24389',classification:'COMPETITOR',product_scope:'COMPLETE_ASSEMBLY',evidence_status:'PHYSICAL_VERIFICATION_REQUIRED'},
  ],
  specs:{service_element_sku:'ES90674'},equipment_applications:[],vehicle_applications:[],
  enrichment_data:{codigo_base_governance:{identity_type:'ELIMFILTERS_OEM_PRODUCT',internal_product_identity_verified:true,approved_codigo_base:'ET90010'}}
};
const entry={sku:'ET90010',family:'fuel-turbine'};
const source={kind:'catalogue-db',table:'elimfilters_catalog'};

test('ET90010 published record uses R2 URL and separates reference scope',()=>{
  const p=buildRecord(row,entry,source);
  assert.equal(p.sku,'ET90010');
  assert.equal(p.imageUrl,'https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/fleetguard/page-1/01-20/ET90010.png');
  assert.ok(p.specs.some(x=>x.name==='OEM CODE'&&x.value==='B10AL'));
  assert.ok(p.specs.some(x=>x.name==='Replacement element'&&x.value==='ES90674'));
  assert.ok(p.crossRefs.some(x=>x.code==='24380'));
  assert.ok(!p.crossRefs.some(x=>x.code==='24389'));
  assert.ok(!p.crossRefs.some(x=>x.code==='FF246'));
});
test('inactive ET90010 cannot be emitted',()=>{
  assert.throws(()=>buildRecord({...row,catalog_active:false},entry,source),/not active/);
});
test('ET90010 cannot claim incorrect element or missing identity',()=>{
  assert.throws(()=>buildRecord({...row,specs:{service_element_sku:'OTHER'}},entry,source),/service element not ES90674/);
  assert.throws(()=>buildRecord({...row,oem_codes:[]},entry,source),/OEM CODE B10AL missing/);
});
