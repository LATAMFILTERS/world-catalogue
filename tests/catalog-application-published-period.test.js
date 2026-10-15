'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {publishedApplicationPeriod,applyVerifiedRelationalVehicleApplications}=require('../lib/catalog-application-write-service');
const period=()=>({date_from:'2019-07-01',date_to:null,open_ended:true,year_label:'07/19 →'});
const app=()=>({make:'AUDI',model:'A4 (8W, B9)',model_type:'30 TDI Mild Hybrid',engine:'DEZB',type:'VEHICLE',published_period:period()});
function client(){const writes=[],evidence=[],payloads=[];return {writes,evidence,payloads,async query(sql,p=[]){if(sql.includes('SELECT sku,duty,codigo_base'))return{rowCount:1,rows:[{sku:'EA37011',duty:'LIGHT_DUTY',codigo_base:'C17011'}]};if(sql.startsWith('SELECT md5(')){payloads.push(JSON.parse(p[0]));return{rows:[{hash:'hash'}]};}if(sql.includes('INSERT INTO ld_catalog.ld_vehicle_applications')){writes.push(p);return{rows:[{id:1}]};}if(sql.includes('INSERT INTO catalog_application_evidence')){evidence.push(p);return{rowCount:1,rows:[]};}throw Error('Unexpected SQL');}};}
const input=a=>({sku:'EA37011',source_sku:'C17011',applications:[a],evidence:{authority:'OFFICIAL_MANUFACTURER_PUBLISHED_PERIOD',source_url:'https://www.mann-filter.com/product',evidence_hash:'a'.repeat(64)}});
test('explicit open manufacturer period keeps its end unknown',()=>{
 const raw={published_period:period()};const before=JSON.stringify(raw);const checked=publishedApplicationPeriod(raw);assert.equal(checked.year_from,2019);assert.equal(checked.year_to,null);assert.equal(checked.date_to,null);assert.equal(JSON.stringify(raw),before);
});
test('closed manufacturer dates and month label remain exact',()=>{
 const checked=publishedApplicationPeriod({published_period:{date_from:'2010-05-01',date_to:'2014-04-30',year_label:'05/10 → 04/14'}});assert.equal(checked.date_from,'2010-05-01');assert.equal(checked.date_to,'2014-04-30');assert.equal(checked.year_label,'05/10 → 04/14');assert.equal(checked.year_to,2014);
});
test('an unknown end cannot be replaced by a sentinel or omitted silently',()=>{
 for(const p of [{...period(),date_to:'9999-12-31'},{...period(),open_ended:false},{...period(),date_to:undefined}])assert.throws(()=>publishedApplicationPeriod({published_period:p}));
});
test('invalid or incomplete calendar dates and reversed periods fail',()=>{
 for(const date_from of ['2019','2019-02-29','2019-13-01','2019-07-00','9999-01-01'])assert.throws(()=>publishedApplicationPeriod({published_period:{...period(),date_from}}));assert.throws(()=>publishedApplicationPeriod({published_period:{date_from:'2020-01-01',date_to:'2019-12-31',year_label:'2020-2019'}}));
});
test('conflicting legacy bounds or labels cannot override source period',()=>{
 for(const patch of [{year_from:2018},{year_to:9999},{year:'2018'}])assert.throws(()=>publishedApplicationPeriod({...patch,published_period:period()}));assert.throws(()=>publishedApplicationPeriod({published_period:{...period(),year_label:''}}));
});
test('open period relational writer stores NULL end and exact source label and engine',async()=>{
 const c=client();const result=await applyVerifiedRelationalVehicleApplications(c,input(app()));assert.equal(c.writes.length,1);assert.equal(c.writes[0][5],'07/19 →');assert.equal(c.writes[0][6],'DEZB');assert.equal(c.writes[0][13],2019);assert.equal(c.writes[0][14],null);assert.equal(c.payloads[0][0].year_to,'');assert.equal(result.applications[0].published_period.date_to,null);assert.equal(c.evidence.length,2);for(const e of c.evidence)assert.equal(JSON.parse(e[6]).published_period.date_from,'2019-07-01');
});
test('new published periods require a source SHA256 before any write',async()=>{
 const c=client(),params=input(app());params.evidence.evidence_hash='not-a-source-hash';await assert.rejects(applyVerifiedRelationalVehicleApplications(c,params),/SHA256/);assert.equal(c.writes.length,0);assert.equal(c.evidence.length,0);
});
test('legacy year-only payload and evidence shape are unchanged',async()=>{
 const c=client();await applyVerifiedRelationalVehicleApplications(c,input({make:'AUDI',model:'A4',year:'2019',engine:'DEZB',type:'VEHICLE'}));assert.equal(c.writes[0][5],'2019');assert.equal(c.writes[0][13],2019);assert.equal(c.writes[0][14],2019);assert.deepEqual(c.payloads[0],[{make:'AUDI',model:'A4',equipment:'AUDI A4',type:'VEHICLE',engine:'DEZB',year:'2019',year_from:'2019',year_to:'2019'}]);assert.ok(c.evidence.every(e=>!JSON.parse(e[6]).published_period));
});
test('published periods do not infer an absent engine',async()=>{
 const c=client(),a=app();delete a.engine;await applyVerifiedRelationalVehicleApplications(c,input(a));assert.equal(c.writes[0][6],'');assert.equal(c.evidence.length,1);
});
test('published periods keep the machinery domain protection',async()=>{
 const c=client();await assert.rejects(applyVerifiedRelationalVehicleApplications(c,input({...app(),type:'EXCAVATOR'})),/LD_DECLARED_MACHINE_TYPE_CONFLICT/);assert.equal(c.writes.length,0);
});

test('source label must agree with exact dates and open status',()=>{
 for(const patch of [{year_label:'08/19 →'},{year_label:'07/19 → 12/25'},{year_label:'2019 → 2025'},{year_label:'Unknown period'}])assert.throws(()=>publishedApplicationPeriod({published_period:{...period(),...patch}}));
 assert.equal(publishedApplicationPeriod({published_period:{...period(),year_label:'2019 →'}}).year_to,null);
});
