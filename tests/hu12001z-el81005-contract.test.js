'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const f=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_149_reown_hu12001z_to_el81005.js'),'utf8');
test('scope',()=>{assert.match(f,/SOURCE='EL32001'/);assert.match(f,/TARGET='EL81005'/);assert.match(f,/MANN='HU12001Z'/);assert.match(f,/DONALDSON='P551005'/);assert.match(f,/EXPECTED_ROWS=204/)});
test('preserves WP12001',()=>{assert.match(f,/WP12001_BASELINE_CHANGED/);assert.match(f,/source_wp!==56/)});
test('only relational writes and reown',()=>{assert.match(f,/INSERT INTO ld_catalog\.ld_product_catalog/);assert.match(f,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);assert.match(f,/UPDATE ld_catalog\.ld_vehicle_applications/);assert.doesNotMatch(f,/UPDATE public\.elimfilters_catalog/)});
test('guarded dry run',()=>{assert.match(f,/BEGIN ISOLATION LEVEL SERIALIZABLE/);assert.match(f,/ROLLBACK/);assert.match(f,/u\.port!=='5441'/)});
