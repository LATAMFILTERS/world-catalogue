'use strict';
const fs=require('fs'),path=require('path'),test=require('node:test'),assert=require('node:assert/strict');
const f=fs.readFileSync(path.join(__dirname,'..','scripts','migrations','run_145_reown_w9207_family_to_el80318.js'),'utf8');
test('scope',()=>{assert.match(f,/SOURCE='EL39207'/);assert.match(f,/TARGET='EL80318'/);assert.match(f,/DONALDSON='P550318'/);assert.match(f,/W920\/7Y/);assert.match(f,/WD9207_HOLD_CHANGED/)});
test('moves only 190 compatible rows',()=>{assert.match(f,/m\.rowCount!==190/);assert.match(f,/applications_reowned/);assert.doesNotMatch(f,/UPDATE public\.elimfilters_catalog/)});
test('dry run guarded',()=>{assert.match(f,/BEGIN ISOLATION LEVEL SERIALIZABLE/);assert.match(f,/ROLLBACK/);assert.match(f,/u\.port!=='5441'/)});
