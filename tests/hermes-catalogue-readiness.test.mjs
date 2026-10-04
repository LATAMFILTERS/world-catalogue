import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSku, buildBacklog, buildOrganizationIndex } from '../scripts/hermes/catalogue-readiness-core.mjs';

const base = {
  sku:'EH60001', codigo_base:'P000001', duty:'HEAVY_DUTY', technology:'NANOFORCE™', filter_type:'hydraulic',
  canonical_source_brand:'DONALDSON', canonical_source_code:'P000001', canonical_source_url:'https://shop.donaldson.com/x',
  canonical_source_status:'VERIFIED', canonical_evidence:{source:'official'},
  vehicle_applications:[], equipment_applications:[{make:'CAT',model:'X'}],
  oem_codes:[{brand:'CAT',code:'1'}], competitor_codes:[], brand_crossrefs:[],
  height_mm:100, product_length_mm:null, outer_diameter_mm:80, inner_diameter_mm:40, gasket_od_mm:null, gasket_id_mm:null,
  product_dimensions_validation_status:'VERIFIED', image_url:'https://example.com/x.jpg',
  enrichment_data:{image_evidence:{verified:true},codigo_base_governance:{approved_manufacturer:'DONALDSON',state:'CANONICAL_VERIFIED'}},
  units_per_case:1, packaging_type:'BOX', packaging_validation_status:'VERIFIED'
};

test('fully verified requires all evidence axes', () => {
  const state=assessSku(base,{appVerifiedCount:1,exactRefs:[{brand:'DONALDSON',source:'official'}]});
  assert.equal(state.source_verified,true);
  assert.equal(state.technical_ready,true);
  assert.equal(state.fully_verified,true);
  assert.deepEqual(state.gaps,[]);
});

test('source gap is P0 and is never inferred', () => {
  const row={...base,canonical_source_brand:null,canonical_source_code:null,canonical_source_url:null,canonical_source_status:'UNVERIFIED'};
  const state=assessSku(row,{appVerifiedCount:1,exactRefs:[]});
  assert.equal(state.readiness_state,'SOURCE_PENDING');
  const idx=buildOrganizationIndex([{id:'donaldson',name:'Donaldson',category:'filtration_competitor',official_domain:'https://donaldson.com'}]);
  const item=buildBacklog(row,state,[],idx).find(x=>x.gap_type==='SOURCE');
  assert.equal(item.priority,0);
  assert.match(item.recommended_action,/official/i);
});

test('presence does not equal verification', () => {
  const state=assessSku({...base,product_dimensions_validation_status:null,packaging_validation_status:'CALCULATED_PENDING_FACTORY_CONFIRMATION',enrichment_data:{codigo_base_governance:{}}},{appVerifiedCount:0,exactRefs:[]});
  assert.equal(state.applications_present,true);
  assert.equal(state.applications_verified,false);
  assert.equal(state.crossrefs_present,true);
  assert.equal(state.crossrefs_verified,false);
  assert.equal(state.dimensions_present,true);
  assert.equal(state.dimensions_verified,false);
  assert.equal(state.packaging_present,true);
  assert.equal(state.packaging_verified,false);
});

test('documented Fleetguard identity stays separate from manufacturer priority and other approvals', () => {
  const row={...base,canonical_source_brand:null,canonical_source_code:null,canonical_source_url:null,canonical_source_status:'UNVERIFIED',vehicle_applications:[],equipment_applications:[],enrichment_data:{codigo_base_governance:{state:'PRIMARY_ABSENCE_AWAITING_EXPLICIT_AUTHORITY',donaldson_absence_verified:false}}};
  const state=assessSku(row,{
    appVerifiedCount:0,
    exactRefs:[],
    manufacturerIdentity:{verification_status:'VERIFIED',payload:{status:'VERIFIED',manufacturer:'FLEETGUARD',equivalence_approved:false,applications_approved:false,publication_approved:false}},
    manufacturerPriority:{status:'AWAITING_EXPLICIT_AUTHORITY',required_authority:'EXPLICIT_DONALDSON_MANUFACTURING_ABSENCE'},
  });
  assert.equal(state.manufacturer_identity_verified,true);
  assert.equal(state.manufacturer_identity_manufacturer,'FLEETGUARD');
  assert.equal(state.manufacturer_priority_status,'AWAITING_EXPLICIT_AUTHORITY');
  assert.equal(state.manufacturer_priority_required_authority,'EXPLICIT_DONALDSON_MANUFACTURING_ABSENCE');
  assert.equal(state.source_verified,false);
  assert.equal(state.applications_verified,false);
  assert.equal(state.crossrefs_verified,false);
  assert.equal(state.technical_ready,false);
  assert.equal(state.fully_verified,false);
});
