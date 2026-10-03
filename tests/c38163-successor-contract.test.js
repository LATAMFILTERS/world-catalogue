'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const migration=fs.readFileSync(
  path.join(__dirname,'..','scripts','migrations','run_159_reown_c38163_family_to_ea33816.js'),
  'utf8'
);

test('run_159 canonicalizes C38163/1 and preserves C38163/2 as predecessor alias',()=>{
  assert.match(migration,/TARGET='EA33816'/);
  assert.match(migration,/CURRENT='C38163\/1'/);
  assert.match(migration,/PREDECESSOR='C38163\/2'/);
  assert.match(migration,/EXPECTED_CURRENT=5/);
  assert.match(migration,/EXPECTED_PREDECESSOR=7/);
});
test('run_159 preserves the occupied collision windows',()=>{
  assert.match(migration,/EA31631/);
  assert.match(migration,/EA38163/);
  assert.match(migration,/C15163\/1 family/);
  assert.match(migration,/predecessor_alias_inserted/);
  assert.match(migration,/old_current_rows/);
  assert.match(migration,/old_predecessor_rows/);
});
