'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const f=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_154_reown_w9069_to_el82008.js'),'utf8');
test('scope',()=>{assert.match(f,/SOURCE='EL39069'/);assert.match(f,/TARGET='EL82008'/);assert.match(f,/MANN='W9069'/);assert.match(f,/DONALDSON='P502008'/);assert.match(f,/EXPECTED_ROWS=128/)});
test('requires verified HD Donaldson target',()=>{assert.match(f,/t\.duty!=='HEAVY_DUTY'/);assert.match(f,/TARGET_GEOMETRY_CHANGED/)});
test('relational only',()=>{assert.match(f,/INSERT INTO ld_catalog\.ld_product_catalog/);assert.match(f,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);assert.match(f,/UPDATE ld_catalog\.ld_vehicle_applications/);assert.doesNotMatch(f,/UPDATE public\.elimfilters_catalog/)});
test('guarded',()=>{assert.match(f,/BEGIN ISOLATION LEVEL SERIALIZABLE/);assert.match(f,/ROLLBACK/);assert.match(f,/u\.port!=='5441'/)});
