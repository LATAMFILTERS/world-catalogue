'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {validateApplicationWrite,applicationPayloadHash}=require('../lib/catalog-application-governance');
const row=app=>({duty:'LIGHT_DUTY',equipment_applications:[],vehicle_applications:[app]});
test('explicit machinery stored as a vehicle is rejected in Light Duty',()=>{
  for(const type of ['EXCAVATOR TRACKED','COMBINE HARVESTER','WHEEL LOADER','TRACK LOADER','CRAWLER CRANE','TELEHANDLER','AGRICULTURAL TRACTOR','INDUSTRIAL COMPRESSOR','DRILLING RIG','BULLDOZER']){
    const result=validateApplicationWrite(row({make:'Maker',model:'Model',type}));
    assert.equal(result.valid,false,type);
    assert.ok(result.reasons.includes('LD_DECLARED_MACHINE_TYPE_CONFLICT'),type);
  }
});
test('explicit equipment type aliases receive the same domain check',()=>{
  for(const key of ['equipment_type','vehicle_type'])assert.ok(validateApplicationWrite(row({make:'Maker',model:'Model',[key]:'EXCAVATOR'})).reasons.includes('LD_DECLARED_MACHINE_TYPE_CONFLICT'));
});
test('a generic truck or pickup is not assumed to be Heavy Duty',()=>{
  for(const type of ['TRUCK','PICKUP','VAN','SUV',''])assert.equal(validateApplicationWrite(row({make:'Ford',model:'F-150',type})).valid,true,type);
});
test('manufacturer and model words do not supply a missing machine type',()=>{
  assert.equal(validateApplicationWrite(row({make:'AGRICULTURAL TRACTOR',model:'EXCAVATOR'})).valid,true);
});
test('declared machinery remains valid in the Heavy Duty equipment array',()=>{
  const app={make:'Maker',model:'Model',type:'EXCAVATOR'};
  assert.equal(validateApplicationWrite({duty:'HEAVY_DUTY',equipment_applications:[app],vehicle_applications:[]}).valid,true);
});
test('domain rejection does not rewrite payloads or their hashes',()=>{
  const app={make:'Maker',model:'Model',type:'EXCAVATOR'};const before=JSON.stringify(app),hash=applicationPayloadHash([app]);validateApplicationWrite(row(app));
  assert.equal(JSON.stringify(app),before);assert.equal(applicationPayloadHash([app]),hash);
});
