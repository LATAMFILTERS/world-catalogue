'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const f=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_153_reown_hu12015x_to_el80938.js'),'utf8');
test('scope',()=>{assert.match(f,/SOURCE='EL32015'/);assert.match(f,/TARGET='EL80938'/);assert.match(f,/MANN='HU12015X'/);assert.match(f,/DONALDSON='P550938'/);assert.match(f,/EXPECTED_ROWS=258/)});
test('preserves W92015',()=>{assert.match(f,/W92015_BASELINE_CHANGED/);assert.match(f,/source_w!==7/)});
test('relational only',()=>{assert.match(f,/INSERT INTO ld_catalog\.ld_product_catalog/);assert.match(f,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);assert.match(f,/UPDATE ld_catalog\.ld_vehicle_applications/);assert.doesNotMatch(f,/UPDATE public\.elimfilters_catalog/)});
test('guarded',()=>{assert.match(f,/BEGIN ISOLATION LEVEL SERIALIZABLE/);assert.match(f,/ROLLBACK/);assert.match(f,/u\.port!=='5441'/)});
