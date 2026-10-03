'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const f=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_147_reown_wa9232_to_ew74073.js'),'utf8');
test('scope',()=>{assert.match(f,/SOURCE='EL39232'/);assert.match(f,/TARGET='EW74073'/);assert.match(f,/MANN='WA923\/2'/);assert.match(f,/DONALDSON='P554073'/);assert.match(f,/EXPECTED_ROWS=103/)});
test('requires verified HD coolant target',()=>{assert.match(f,/target\.filter_type!=='coolant'/);assert.match(f,/target\.duty!=='HEAVY_DUTY'/);assert.match(f,/TARGET_GEOMETRY_CHANGED/)});
test('only relational writes plus reown',()=>{assert.match(f,/INSERT INTO ld_catalog\.ld_product_catalog/);assert.match(f,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);assert.match(f,/UPDATE ld_catalog\.ld_vehicle_applications/);assert.doesNotMatch(f,/UPDATE public\.elimfilters_catalog/)});
test('guarded dry run',()=>{assert.match(f,/BEGIN ISOLATION LEVEL SERIALIZABLE/);assert.match(f,/ROLLBACK/);assert.match(f,/u\.port!=='5441'/)});
