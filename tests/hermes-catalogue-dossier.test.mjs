import test from 'node:test';
import assert from 'node:assert/strict';
import { assessDossier, canPromoteCanonicalIdentity, canonicalRoleForDossier } from '../scripts/hermes/catalogue-dossier-core.mjs';
import { PUBLISHABLE_CATALOGUE_FIELDS } from '../scripts/hermes/catalogue-publication-plan.mjs';
import { COLUMN_GROUPS } from '../scripts/hermes/publish-catalogue-plan.mjs';

const verifiedAxis = records => ({
  status:'VERIFIED',
  records,
  source_urls:['https://www.mann-filter.com/example'],
  checked_sources:['https://www.mann-filter.com/example'],
  note:'official'
});

const complete = {
  identity:{
    status:'VERIFIED', manufacturer:'MANN-FILTER', source_code:'C40001',
    product_name:'Air Filter', product_type:'air filter', market_segment:'LIGHT_DUTY',
    records:[{name:'Air Filter'}],
    source_urls:['https://www.mann-filter.com/example'],
    checked_sources:['https://www.mann-filter.com/example']
  },
  technical_specs:verifiedAxis([{filter_media:'cellulose'}]),
  dimensions:verifiedAxis([{height_mm:50,outer_diameter_mm:200}]),
  oem_codes:verifiedAxis([{brand:'OEM',part_number:'123'}]),
  cross_references:verifiedAxis([{brand:'FRAM',part_number:'CA123'}]),
  applications:verifiedAxis([{make:'Toyota',model:'Corolla',year_from:2020,year_to:2022,engine:'2.0L'}]),
  provenance:{sources:[{url:'https://www.mann-filter.com/example',authority:'MANN-FILTER',source_type:'official_product_page',supports:['identity','technical_specs','dimensions','oem_codes','cross_references','applications']}]},
  consistency:{status:'VERIFIED',conflicts:[],notes:['all axes consistent']}
};

test('complete dossier is the only promotable source state',()=>{
  const result=assessDossier(complete);
  assert.equal(result.status,'DOSSIER_COMPLETE');
  assert.deepEqual(result.unresolved_axes,[]);
  assert.equal(canPromoteCanonicalIdentity(complete),true);
});

test('missing applications blocks canonical identity promotion',()=>{
  const dossier=structuredClone(complete);
  dossier.applications={status:'UNRESOLVED',records:[],source_urls:[],checked_sources:[]};
  const result=assessDossier(dossier);
  assert.equal(result.status,'DOSSIER_INCOMPLETE');
  assert.ok(result.unresolved_axes.includes('applications'));
  assert.equal(canPromoteCanonicalIdentity(dossier),false);
});
test('officially unpublished axis can be resolved only with checked official source',()=>{
  const dossier=structuredClone(complete);
  dossier.cross_references={
    status:'NOT_PUBLISHED_BY_SOURCE',
    records:[],
    source_urls:['https://www.mann-filter.com/example'],
    checked_sources:['https://www.mann-filter.com/example'],
    note:'manufacturer catalogue checked'
  };
  assert.equal(assessDossier(dossier).status,'DOSSIER_COMPLETE');
  dossier.cross_references.checked_sources=[];
  assert.equal(assessDossier(dossier).status,'DOSSIER_INCOMPLETE');
});

test('complete dossier fields are governed publishable catalogue fields',()=>{
  for(const field of ['codigo_base','source_identity','dimensions','technical_specs','oem_codes','competitor_codes','vehicle_applications']){
    assert.equal(PUBLISHABLE_CATALOGUE_FIELDS.has(field),true,field);
  }
  assert.deepEqual(COLUMN_GROUPS.codigo_base,['codigo_base']);
  assert.deepEqual(COLUMN_GROUPS.vehicle_applications,['vehicle_applications']);
});

test('MANN/FRAM are canonical only in LD',()=>{
  const ld=canonicalRoleForDossier({duty:'LIGHT_DUTY'},complete);
  assert.equal(ld.role,'CANONICAL_BASE');
  const hdDossier=structuredClone(complete);
  hdDossier.identity.market_segment='HEAVY_DUTY';
  const hd=canonicalRoleForDossier({duty:'HEAVY_DUTY'},hdDossier);
  assert.equal(hd.role,'COMPETITOR_CODE');
  const mismatch=canonicalRoleForDossier({duty:'LIGHT_DUTY'},hdDossier);
  assert.equal(mismatch.role,'COMPETITOR_CODE');
  assert.equal(mismatch.duty_review_required,true);
});

test('HD non-MANN/FRAM canonical source remains eligible',()=>{
  const d=structuredClone(complete);
  d.identity.manufacturer='DONALDSON';
  d.identity.source_code='P123456';
  d.identity.market_segment='HEAVY_DUTY';
  const role=canonicalRoleForDossier({duty:'HEAVY_DUTY'},d);
  assert.equal(role.role,'CANONICAL_BASE');
});

test('Industrial Process duty matches HERMES INDUSTRIAL dossier segment without collapsing into HD',()=>{
  const d=structuredClone(complete);
  d.identity.manufacturer='PALL';
  d.identity.source_code='CC3LGA7H13';
  d.identity.product_name='SepraSol Liquid/Gas Coalescer';
  d.identity.product_type='liquid/gas coalescer';
  d.identity.market_segment='INDUSTRIAL';
  const role=canonicalRoleForDossier({duty:'INDUSTRIAL_PROCESS'},d);
  assert.equal(role.role,'CANONICAL_BASE');
  assert.equal(role.reason,'canonical-source-authority');

  d.identity.market_segment='INDUSTRIAL_PROCESS';
  const aliasRole=canonicalRoleForDossier({duty:'INDUSTRIAL_PROCESS'},d);
  assert.equal(aliasRole.role,'CANONICAL_BASE');
});
