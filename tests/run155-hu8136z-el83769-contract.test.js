'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const f=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_155_reown_hu8136z_to_el83769.js'),'utf8');
test('scope',()=>{assert.match(f,/SOURCE='EL38136'/);assert.match(f,/TARGET='EL83769'/);assert.match(f,/MANN='HU8136Z'/);assert.match(f,/FLEETGUARD='LF3769'/);assert.match(f,/EXPECTED_ROWS=172/)});
test('fleetguard fallback gates',()=>{assert.match(f,/DONALDSON_OEM_MATCH_NOW_EXISTS/);assert.match(f,/CANONICAL_VERIFIED_FALLBACK/);assert.match(f,/donal.*absence_verified/i)});
test('creates exact HD target and reowns only applications',()=>{assert.match(f,/INSERT INTO public\.elimfilters_catalog/);assert.match(f,/INSERT INTO ld_catalog\.ld_product_catalog/);assert.match(f,/INSERT INTO ld_catalog\.ld_competitor_cross_references/);assert.match(f,/UPDATE ld_catalog\.ld_vehicle_applications/)});
test('guarded dry run',()=>{assert.match(f,/BEGIN ISOLATION LEVEL SERIALIZABLE/);assert.match(f,/ROLLBACK/);assert.match(f,/u\.port!=='5441'/);assert.match(f,/SKU_RULE_MISMATCH/)});
