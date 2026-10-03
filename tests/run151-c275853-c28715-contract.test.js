'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const f=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_151_reown_c275853_c28715_to_donaldson.js'),'utf8');
test('two exact cases',()=>{assert.match(f,/EA35853.*EA16386.*C27585\/3.*P776386.*rows:42/s);assert.match(f,/EA38715.*EA11510.*C28715.*P771510.*rows:65/s)});
test('requires HD verified Donaldson targets',()=>{assert.match(f,/t\.duty!=='HEAVY_DUTY'/);assert.match(f,/canonical_source_brand/);assert.match(f,/canonical_source_status/)});
test('only relational writes and exact reown',()=>{assert.match(f,/INSERT INTO ld_catalog\.ld_product_catalog/);assert.match(f,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);assert.match(f,/UPDATE ld_catalog\.ld_vehicle_applications/);assert.doesNotMatch(f,/UPDATE public\.elimfilters_catalog/)});
test('guarded',()=>{assert.match(f,/BEGIN ISOLATION LEVEL SERIALIZABLE/);assert.match(f,/GLOBAL_APPLICATION_TOTAL_CHANGED/);assert.match(f,/ROLLBACK/);assert.match(f,/u\.port!=='5441'/)});
