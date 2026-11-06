'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { planPair, register } = require('../scripts/migrations/run_285_register_dba5231_alternative');

const fixtures = () => [
  { sku:'EA11767', codigo_base:'P601767', duty:'HEAVY_DUTY', catalog_active:true,
    alternatives:['EA99999'], enrichment_data:{ existing:'keep' },
    equipment_applications:[{equipment:'HISTORICAL_UNVERIFIED'}] },
  { sku:'EA15231', codigo_base:'DBA5231', duty:'HEAVY_DUTY', catalog_active:true,
    alternatives:[], enrichment_data:{ application_governance:{equipment_verified:true} },
    equipment_applications:[] }
];

test('registers reciprocal media-variant alternatives without copying equipment', () => {
  const plan=planPair(fixtures());
  assert.deepEqual(plan[0].alternatives,['EA99999','EA15231']);
  assert.deepEqual(plan[1].alternatives,['EA11767']);
  assert.equal(plan[0].equipment_before.length,1);
  assert.equal(plan[1].equipment_before.length,0);
  assert.equal(plan[0].enrichment_data.existing,'keep');
  assert.equal(plan[1].enrichment_data.application_governance.equipment_verified,true);
  assert.equal(plan[1].enrichment_data.documented_alternative_relations.EA11767.air_cleaner_family,'FRG12');
  assert.equal(plan[1].enrichment_data.documented_alternative_relations.EA11767.fitment_certification_status,'NOT_ASSERTED');
});

test('preserves existing relationship instead of inserting duplicate', () => {
  const rows=fixtures();rows[1].alternatives=['EA11767'];
  assert.deepEqual(planPair(rows)[1].alternatives,['EA11767']);
});

test('rejects wrong base, inactive record, or missing SKU', () => {
  const rows=fixtures();
  rows[0].codigo_base='P000000';
  assert.throws(()=>planPair(rows),/STALE_OR_INVALID/);
  assert.throws(()=>planPair(fixtures().slice(0,1)),/EXACT_PAIR_REQUIRED/);
  const inactive=fixtures();inactive[1].catalog_active=false;
  assert.throws(()=>planPair(inactive),/STALE_OR_INVALID/);
});

test('dry-run rolls back and issues no UPDATE', async () => {
  const seen=[];
  const db={async query(sql) {
    seen.push(sql);
    if (sql.includes('SELECT sku, codigo_base')) return {rows:fixtures()};
    return {rowCount:1,rows:[]};
  }};
  const result=await register(db,false);
  assert.equal(result.mode,'DRY_RUN');
  assert.equal(result.equipment_applications_changed,0);
  assert.ok(seen.some(x=>x==='ROLLBACK'));
  assert.ok(!seen.some(x=>x.includes('UPDATE public.elimfilters_catalog')));
});
