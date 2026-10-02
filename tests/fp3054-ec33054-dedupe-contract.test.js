'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const file=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_140_dedupe_fp3054_to_ec33054.js'),'utf8');
test('run_140 is scoped to FP3054 EA33054 -> EC33054',()=>{assert.match(file,/SOURCE='EA33054'/);assert.match(file,/TARGET='EC33054'/);assert.match(file,/CODE='FP3054'/);assert.match(file,/EXPECTED_SOURCE_ROWS=137/);assert.match(file,/EXPECTED_OVERLAP=137/)});
test('run_140 requires CU3054 cabin target and zero unique rows',()=>{assert.match(file,/TARGET_PARENT_CHANGED/);assert.match(file,/CU3054/);assert.match(file,/FP3054_UNEXPECTED_UNIQUE_ROWS/)});
test('run_140 only deletes exact duplicate applications',()=>{assert.match(file,/DELETE FROM ld_catalog\.ld_vehicle_applications s/);assert.doesNotMatch(file,/UPDATE ld_catalog\.ld_vehicle_applications/);assert.doesNotMatch(file,/UPDATE public\.elimfilters_catalog/)});
test('run_140 is serializable dry-run and canonical-db only',()=>{assert.match(file,/BEGIN ISOLATION LEVEL SERIALIZABLE/);assert.match(file,/process\.argv\.includes\('--execute'\)/);assert.match(file,/u\.port!=='5441'/);assert.match(file,/ROLLBACK/)});
