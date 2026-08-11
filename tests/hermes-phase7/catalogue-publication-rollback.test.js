import test from 'node:test';
import assert from 'node:assert/strict';
import { rollbackCataloguePublication } from '../../scripts/hermes/rollback-catalogue-publication.mjs';

function backup(){return {schema_version:'1.0.0',plan_sha256:'a'.repeat(64),target_sku:'EA10001',operations:[{field:'duty',before:'HEAVY_DUTY',after:'LIGHT_DUTY'}],before:{sku:'EA10001',duty:'HEAVY_DUTY',description:'preserved'}};}
function fakePool(current='LIGHT_DUTY'){
  const queries=[]; const client={async query(sql){queries.push(sql);if(sql.includes('FOR UPDATE'))return{rowCount:1,rows:[{sku:'EA10001',duty:current}]};if(sql.startsWith('UPDATE'))return{rowCount:1,rows:[]};if(sql.startsWith('SELECT'))return{rowCount:1,rows:[{sku:'EA10001',duty:'HEAVY_DUTY'}]};return{rowCount:null,rows:[]};},release(){queries.push('RELEASE');}};return{queries,pool:{async connect(){return client;}}};
}
test('rollback is dry-run by default',async()=>{assert.equal((await rollbackCataloguePublication({backup:backup()})).outcome,'DRY_RUN');});
test('controlled rollback restores and commits',async()=>{process.env.HERMES_CATALOGUE_ROLLBACK_LIVE='true';const fake=fakePool();try{const out=await rollbackCataloguePublication({backup:backup(),pool:fake.pool,apply:true});assert.equal(out.outcome,'ROLLED_BACK');assert.ok(fake.queries.includes('COMMIT'));}finally{delete process.env.HERMES_CATALOGUE_ROLLBACK_LIVE;}});
test('rollback refuses to overwrite later changes',async()=>{process.env.HERMES_CATALOGUE_ROLLBACK_LIVE='true';const fake=fakePool('MIXED_DUTY');try{await assert.rejects(()=>rollbackCataloguePublication({backup:backup(),pool:fake.pool,apply:true}),/no longer matches/);assert.ok(fake.queries.includes('ROLLBACK'));assert.ok(!fake.queries.some((q)=>q.startsWith('UPDATE')));}finally{delete process.env.HERMES_CATALOGUE_ROLLBACK_LIVE;}});
