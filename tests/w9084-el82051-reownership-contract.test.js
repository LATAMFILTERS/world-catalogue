'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const f=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_146_reown_w9084_to_el82051.js'),'utf8');
test('scope',()=>{assert.match(f,/SOURCE='EL39084'/);assert.match(f,/TARGET='EL82051'/);assert.match(f,/MANN='W9084'/);assert.match(f,/DONALDSON='P502051'/);assert.match(f,/EXPECTED_ROWS=164/)});
test('requires HD Donaldson target',()=>{assert.match(f,/t\.duty!=='HEAVY_DUTY'/);assert.match(f,/canonical_source_brand/);assert.match(f,/TARGET_GEOMETRY_CHANGED/)});
test('only relational writes plus reown',()=>{assert.match(f,/INSERT INTO ld_catalog\.ld_product_catalog/);assert.match(f,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);assert.match(f,/UPDATE ld_catalog\.ld_vehicle_applications/);assert.doesNotMatch(f,/UPDATE public\.elimfilters_catalog/)});
test('guarded dry run',()=>{assert.match(f,/BEGIN ISOLATION LEVEL SERIALIZABLE/);assert.match(f,/ROLLBACK/);assert.match(f,/u\.port!=='5441'/)});
