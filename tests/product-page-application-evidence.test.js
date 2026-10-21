'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{buildRecord}=require('../lib/product-page-data');
const {APPLICATION_POLICY_VERSION,applicationPayloadHash}=require('../lib/catalog-application-governance');
function row(){return {sku:'EF91234',codigo_base:'P551234',filter_type:'fuel',duty:'HEAVY_DUTY',technology:'SYNTAPORE™',height_mm:100,outer_diameter_mm:80,gasket_od_mm:60,thread_size:'M20 x 1.5',canonical_source_brand:'DONALDSON',canonical_source_code:'P551234',canonical_source_status:'VERIFIED',catalog_active:true,oem_codes:[],competitor_codes:[],equipment_applications:[{equipment:'TEST EQUIPMENT MODEL',engine:'TEST ENGINE'}],vehicle_applications:[],enrichment_data:{},certification_state:'CERTIFIED'};}
function approve(r){r.enrichment_data.application_governance={policy_version:APPLICATION_POLICY_VERSION,evidence_recorded:true,evidence_authority:'DONALDSON_OFFICIAL_CATALOG',evidence_url:'https://www.donaldson.com/test-fixture-evidence.pdf',evidence_hash:'a'.repeat(64),verified_at:'2026-10-15T06:00:00Z',equipment_verified:true,equipment_payload_hash:applicationPayloadHash(r.equipment_applications),engine_verified:true,engine_payload_hash:applicationPayloadHash(r.equipment_applications)};return r;}
const render=r=>buildRecord(r,{sku:r.sku,family:'secondary-fuel'},{kind:'test-fixture'});
test('identity VERIFIED and registry CERTIFIED alone never publish engines or applications',()=>{const p=render(row());assert.deepEqual(p.applications,[]);assert.equal(p.governance.applicationEvidencePublicationReady,false);});
test('independently evidenced unchanged application payload may publish its explicit engine',()=>{const p=render(approve(row()));assert.deepEqual(p.applications,['TEST EQUIPMENT MODEL · TEST ENGINE']);assert.equal(p.governance.applicationEvidencePublicationReady,true);});
test('equipment evidence cannot authorize an unverified engine',()=>{const r=approve(row());r.enrichment_data.application_governance.engine_verified=false;assert.deepEqual(render(r).applications,[]);});
test('changing the engine after approval invalidates publication',()=>{const r=approve(row());r.equipment_applications[0].engine='DIFFERENT ENGINE';assert.deepEqual(render(r).applications,[]);});
test('missing documentary hash, source URL or date suppresses application claims',()=>{for(const field of ['evidence_hash','evidence_url','verified_at']){const r=approve(row());delete r.enrichment_data.application_governance[field];assert.deepEqual(render(r).applications,[],field);}const r=approve(row());r.enrichment_data.application_governance.evidence_url='http://example.com';assert.deepEqual(render(r).applications,[]);});
test('legacy engine-family list is not inherited into approved applications',()=>{const r=approve(row());r.enrichment_data.compatible_engine_families=['UNREVIEWED ENGINE FAMILY'];assert.deepEqual(render(r).applications,['TEST EQUIPMENT MODEL · TEST ENGINE']);});
test('mixed duty domains remain blocked despite verification flags',()=>{const r=approve(row());r.vehicle_applications=[{make:'TEST',model:'MODEL'}];assert.deepEqual(render(r).applications,[]);});
test('existing snapshots without independent evidence do not publish application lines',()=>{const {publicApplicationLines}=require('../frontend/src/lib/product-application-publication');const lines=['UNVERIFIED ENGINE'];assert.deepEqual(publicApplicationLines({applications:lines}),[]);assert.deepEqual(publicApplicationLines({applications:lines,governance:{applicationEvidencePublicationReady:false}}),[]);assert.deepEqual(publicApplicationLines({applications:lines,governance:{applicationEvidencePublicationReady:true}}),lines);assert.deepEqual(publicApplicationLines({governance:{applicationEvidencePublicationReady:true}}),[]);assert.deepEqual(lines,['UNVERIFIED ENGINE']);});

test('documented body inner diameter renders separately from gasket inner diameter',()=>{const r=row();r.inner_diameter_mm='42.5';r.gasket_id_mm=50;const p=render(r);assert.deepEqual(p.specs.find(s=>s.name==='Inner diameter'),{name:'Inner diameter',value:'42.5 mm'});assert.equal(p.specs.find(s=>s.name==='Gasket inner diameter').value,'50 mm');assert.deepEqual(p.applications,[]);});
test('missing body inner diameter is omitted without inferring it from the gasket',()=>{const r=row();r.gasket_id_mm=50;assert.equal(render(r).specs.some(s=>s.name==='Inner diameter'),false);});
test('impossible body inner diameters block publication',()=>{for(const value of [0,-5,80,81]){const r=row();r.inner_diameter_mm=value;assert.throws(()=>render(r),/physically impossible dimensions/,String(value));}});
test('negative displayed dimensions cannot evade physical validation',()=>{for(const field of ['height_mm','outer_diameter_mm','gasket_od_mm','gasket_id_mm']){const r=row();r[field]=-5;assert.throws(()=>render(r),/physically impossible dimensions/,field);}});

test('explicit fitment conditions remain visible and distinct after approval',()=>{
  const r=row();r.equipment_applications=[
    {equipment:'TEST MODEL',engine:'TEST ENGINE',year:'2019',equipment_options:'Stage V',engine_option:'Option A'},
    {equipment:'TEST MODEL',engine:'TEST ENGINE',year:'2020',equipment_options:'Tier 4 Final',engine_option:'Option B'}
  ];
  assert.deepEqual(render(approve(r)).applications,[
    'TEST MODEL · TEST ENGINE · Year: 2019 · Equipment option: Stage V · Engine option: Option A',
    'TEST MODEL · TEST ENGINE · Year: 2020 · Equipment option: Tier 4 Final · Engine option: Option B'
  ]);
});
test('changing or removing an approved option invalidates application publication',()=>{
  for(const field of ['equipment_options','engine_option']){
    for(const replacement of ['CHANGED',undefined]){
      const r=row();r.equipment_applications[0][field]='ORIGINAL';approve(r);
      if(replacement===undefined)delete r.equipment_applications[0][field];else r.equipment_applications[0][field]=replacement;
      assert.deepEqual(render(r).applications,[],field);
    }
  }
});
test('unqualified legacy hashes and display remain unchanged for unknown options',()=>{
  const r=row(),before=applicationPayloadHash(r.equipment_applications);
  assert.equal(before,'47ee1b3f31d483115a8336b6bf496688');
  r.equipment_applications[0].equipment_options=' - ';r.equipment_applications[0].engine_option='';
  assert.equal(applicationPayloadHash(r.equipment_applications),before);
  assert.deepEqual(render(approve(r)).applications,['TEST EQUIPMENT MODEL · TEST ENGINE']);
});
test('one-sided documented years never imply an invented range',()=>{
  for(const [field,label] of [['year_from','From year'],['year_to','Through year']]){
    const r=row();r.equipment_applications[0][field]='2019';
    assert.deepEqual(render(approve(r)).applications,['TEST EQUIPMENT MODEL · TEST ENGINE · '+label+': 2019']);
  }
});

test('options alone distinguish equipment variants with the same year and engine',()=>{
  const r=row();r.equipment_applications=['Stage V','Tier 4 Final'].map(option=>({equipment:'TEST MODEL',engine:'TEST ENGINE',year:'2019',equipment_options:option}));
  assert.equal(render(approve(r)).applications.length,2);
});
test('verified vehicle applications retain exact years and options',()=>{
  const r=row();r.duty='LIGHT_DUTY';r.equipment_applications=[];
  r.vehicle_applications=[{make:'TEST',model:'MODEL',engine:'ENGINE',year_from:'2018',year_to:'2020',equipment_options:'Option A',engine_option:'Option B'}];
  approve(r);const gov=r.enrichment_data.application_governance;
  gov.vehicle_verified=true;gov.vehicle_payload_hash=applicationPayloadHash(r.vehicle_applications);gov.engine_payload_hash=applicationPayloadHash(r.vehicle_applications);
  assert.deepEqual(render(r).applications,['Test MODEL · ENGINE · Years: 2018–2020 · Equipment option: Option A · Engine option: Option B']);
  r.vehicle_applications[0].engine_option='Option C';assert.deepEqual(render(r).applications,[]);
});
