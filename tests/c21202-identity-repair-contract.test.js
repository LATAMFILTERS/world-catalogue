'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const f=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_148_repair_c21202_identity.js'),'utf8');
test('scope',()=>{assert.match(f,/SKU='EA31202'/);assert.match(f,/MANN='C2120\/2'/);assert.match(f,/OLD_PARENT='C15120\/2'/);assert.match(f,/EXPECTED_APPS=35/)});
test('repairs LD MANN identity without moving applications',()=>{assert.match(f,/canonical_source_brand='MANN-FILTER'/);assert.match(f,/codigo_base=\$2/);assert.match(f,/'origin_group','EUROPEAN'/);assert.match(f,/2026-08-29-v3\.2-regional/);assert.match(f,/INSERT INTO ld_catalog\.ld_canonical_product_identity/);assert.doesNotMatch(f,/UPDATE ld_catalog\.ld_vehicle_applications/)});
test('requires exact geometry and no competing owner',()=>{assert.match(f,/MANN_GEOMETRY_CHANGED/);assert.match(f,/C21202_CONFLICTS/);assert.match(f,/SKU_ALREADY_HAS_CANONICAL_IDENTITY/)});
test('guarded dry run',()=>{assert.match(f,/BEGIN ISOLATION LEVEL SERIALIZABLE/);assert.match(f,/ROLLBACK/);assert.match(f,/u\.port!=='5441'/)});
