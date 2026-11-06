'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const sql=fs.readFileSync(path.resolve(__dirname,'../scripts/migrations/run_286_authorized_hd_application_inheritance.sql'),'utf8');

test('governed inheritance does not disable triggers or fake verified OEM evidence',()=>{
 assert.match(sql,/CREATE TABLE IF NOT EXISTS public\.catalog_authorized_application_inheritance/);
 assert.match(sql,/authorized_by text NOT NULL/);
 assert.doesNotMatch(sql,/\bauthorization text NOT NULL/);
 assert.match(sql,/individual_fitment_verified boolean NOT NULL DEFAULT false/);
 assert.match(sql,/individual_fitment_verified',false/);
 assert.match(sql,/'equipment_verified',false/);
 assert.match(sql,/'engine_verified',false/);
 assert.match(sql,/APPLICATION_INHERITANCE_NOT_AUTHORIZED/);
 assert.doesNotMatch(sql,/DISABLE TRIGGER|session_replication_role|verified\s*=\s*true/i);
});
test('authorization validates live source applications and official relation',()=>{
 assert.match(sql,/md5\(src\.equipment_applications::text\)=a\.source_payload_hash/);
 assert.match(sql,/NEW\.equipment_applications=src\.equipment_applications/);
 assert.match(sql,/INSTALLATION_COMPATIBLE_MEDIA_VARIANT/);
 assert.match(sql,/a\.authorized_by='ELIMFILTERS_CEO'/);
 assert.match(sql,/src\.catalog_active IS TRUE/);
});
test('transaction is fail closed and verifies 161 exact matches',()=>{
 assert.match(sql,/^BEGIN;/m);
 assert.match(sql,/TRIGGER_DEFINITION_DRIFT/);
 assert.match(sql,/PAIR_VALIDATION_FAILED/);
 assert.match(sql,/TARGET_HAS_DIFFERENT_APPLICATIONS/);
 assert.match(sql,/INHERITANCE_POSTCHECK_FAILED/);
 assert.match(sql,/jsonb_array_length\(src\.equipment_applications\)<>161/);
 assert.match(sql,/\\if :\\{\\?execute\\}/);
 assert.match(sql,/DRY_RUN_ROLLBACK_NO_DATA_MODIFIED/);
 assert.match(sql,/^ROLLBACK;/m);
 assert.match(sql,/^COMMIT;/m);
});
