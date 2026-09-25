'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const m=JSON.parse(fs.readFileSync(path.join(__dirname,'../scripts/candidates/premium_guard_oil_pg99817ex_blocked_20260924.json'),'utf8'));

test('PG99817EX is terminally blocked from incompatible EL36014 target',()=>{
  assert.equal(m.premium_guard_code,'PG99817EX');
  assert.equal(m.proposed_authority.code,'W6014');
  assert.equal(m.terminal_state,'BLOCKED_WITH_REASON');
  assert.match(m.blocked_reason,/NO_SAFE_ELIMFILTERS_SKU/);
  assert.equal(m.queue_target_sku,'EL36014');
  assert.equal(m.queue_target_identity.codigo_base,'HU6014Z');
  assert.equal(m.source_family.geometry.thread_size,'M20x1.5');
  assert.equal(m.interchanges.length,15);
  assert.equal(m.source_family.applications.length,2);
});

test('W6014 family geometry is incompatible with HU6014Z cartridge geometry',()=>{
  assert.equal(m.source_family.geometry.height_mm,105);
  assert.equal(m.source_family.geometry.outer_diameter_mm,66);
  assert.equal(m.queue_target_identity.geometry.height_mm,134);
  assert.equal(m.queue_target_identity.geometry.outer_diameter_mm,53);
  assert.notEqual(m.source_family.geometry.thread_size,m.queue_target_identity.thread_size);
});
