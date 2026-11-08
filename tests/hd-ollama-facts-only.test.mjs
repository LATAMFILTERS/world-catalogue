import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import {interpretLocalEvidence} from '../scripts/hermes/local-evidence-ollama.mjs';

test('facts-only compact inference uses a small request and never marks identity verified',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'hd-facts-only-'));
 const old=globalThis.fetch;
 try{
  const content='Official fuel filter P12345 specifications. Product type Fuel Filter. Height 90 mm. Diameter 80 mm.';
  const url='https://shop.donaldson.com/product/P12345';
  await writeFile(path.join(dir,'EA10006.json'),JSON.stringify({sku:'EA10006',sources:[{url,content,sha256:crypto.createHash('sha256').update(content).digest('hex')}]}));
  let req;
  globalThis.fetch=async(_url,opts)=>{
   req=JSON.parse(opts.body);
   return {ok:true,json:async()=>({message:{content:JSON.stringify({source_code:'P12345',product_type:'Fuel Filter',facts:['Height 90 mm.','Unsupported 42 inch']})}})};
  };
  const r=await interpretLocalEvidence({sku:'EA10006'}, {}, {directory:dir,allowedHosts:'donaldson.com',compactMode:true,factsOnly:true,timeoutMs:800});
  assert.equal(req.options.num_predict,260);
  assert.equal(req.options.num_ctx,1536);
  assert.equal(r.dossier.identity.status,'UNRESOLVED');
  assert.equal(r.dossier.identity.source_code,'P12345');
  assert.equal(r.dossier.dossier_status,'DOSSIER_INCOMPLETE');
  assert.deepEqual(r.dossier.technical_specs.records,['Height 90 mm.']);
 }finally{globalThis.fetch=old;await rm(dir,{recursive:true,force:true});}
});
test('facts-only cannot accept invented part numbers',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'hd-facts-only-'));
 const old=globalThis.fetch;
 try{
  const content='Official fuel filter P12345 details. Dimensions published.';
  const url='https://shop.donaldson.com/product/P12345';
  await writeFile(path.join(dir,'EA10006.json'),JSON.stringify({sku:'EA10006',sources:[{url,content,sha256:crypto.createHash('sha256').update(content).digest('hex')}]}));
  globalThis.fetch=async()=>({ok:true,json:async()=>({message:{content:JSON.stringify({source_code:'FAKE000',product_type:'Fuel Filter',facts:[]})}})});
  const r=await interpretLocalEvidence({sku:'EA10006'}, {}, {directory:dir,allowedHosts:'donaldson.com',compactMode:true,factsOnly:true});
  assert.equal(r.dossier.identity.source_code,null);
 }finally{globalThis.fetch=old;await rm(dir,{recursive:true,force:true});}
});
