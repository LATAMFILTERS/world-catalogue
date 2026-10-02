'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const file=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_138_create_el30358_ch10358.js'),'utf8');
test('run_138 creates only EL30358 as FRAM CH10358 canonical oil cartridge',()=>{
 assert.match(file,/SKU='EL30358', AUTH='CH10358'/);
 assert.match(file,/'NON_EUROPEAN','FRAM',\$2,'oil','ACTIVE'/);
 assert.match(file,/'SYNTRAX™'/);
 assert.match(file,/'LIGHT_DUTY','Cartridge','Cartridge','FRAM'/);
});
test('run_138 uses exact governed dimensions and twelve FRAM applications',()=>{
 for(const s of ['56.54','60.706','28.143','73.558','70.053','3.505']) assert.match(file,new RegExp(s.replace('.','\\.')));
 assert.match(file,/if\(Number\(r\.post\.apps\)!==12/);
 assert.match(file,/'FRAM_LD_MULTI_REGION'/);
});
test('run_138 reowns CH10358 from EL36006 and requires unique canonical resolver',()=>{
 assert.match(file,/DELETE FROM ld_catalog\.ld_competitor_cross_references[\s\S]*elimfilters_sku='EL36006'/);
 assert.match(file,/old_ld\)!==0/);
 assert.match(file,/canonical_resolver\)!==1\|\|Number\(r\.post\.other_resolvers\)!==0/);
 assert.match(file,/old_apps\)!==0/);
});
test('run_138 is serializable, dry-run by default, and refuses non-5441 DB',()=>{
 assert.match(file,/process\.argv\.includes\('--execute'\)/);
 assert.match(file,/BEGIN ISOLATION LEVEL SERIALIZABLE/);
 assert.match(file,/u\.port!=='5441'/);
 assert.match(file,/ROLLBACK/);
});
