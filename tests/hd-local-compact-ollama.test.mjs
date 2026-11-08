import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {interpretLocalEvidence} from '../scripts/hermes/local-evidence-ollama.mjs';

test('compact HD Ollama request uses shorter source prompt, bounded output and preserves source',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'hd-compact-'));
 const url='https://shop.donaldson.com/product/EA10006';
 const sourceText='DONALDSON PRODUCT EA10006 Oil filter 80 mm height and 30 mm diameter. '.repeat(150);
 const originalFetch=globalThis.fetch;
 try{
  await writeFile(path.join(dir,'EA10006.json'),JSON.stringify({sku:'EA10006',sources:[{url,content:sourceText,sha256:crypto.createHash('sha256').update(sourceText).digest('hex')}]}));
  let request;
  globalThis.fetch=async(_url,opts)=>{
    request=JSON.parse(opts.body);
    const axis={status:'UNRESOLVED',records:[],source_urls:[]};
    const dossier={identity:axis,technical_specs:axis,dimensions:axis,oem_codes:axis,cross_references:axis,applications:axis,consistency:{status:'CONFLICTING',conflicts:[]},provenance:{sources:[]}};
    return {ok:true,json:async()=>({message:{content:JSON.stringify(dossier)}})};
  };
  const result=await interpretLocalEvidence({sku:'EA10006'}, {}, {directory:dir,allowedHosts:'donaldson.com',compactMode:true,timeoutMs:1500});
  assert.equal(result.model,'qwen3:1.7b');
  assert.equal(request.options.num_predict,650);
  assert.equal(request.options.num_ctx,3072);
  assert.ok(request.messages[1].content.length < sourceText.length);
 }finally{globalThis.fetch=originalFetch;await rm(dir,{recursive:true,force:true});}
});

test('compact HD Ollama timeout produces an explicit failure, never certification',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'hd-compact-'));
 const originalFetch=globalThis.fetch;
 const source='Donaldson P12345 oil filter specifications and dimensions are published here.';
 try{
  await writeFile(path.join(dir,'EH61234.json'),JSON.stringify({sku:'EH61234',sources:[{url:'https://shop.donaldson.com/P12345',content:source,sha256:crypto.createHash('sha256').update(source).digest('hex')}]}));
  globalThis.fetch=async(_url,opts)=>new Promise((_resolve,reject)=>opts.signal.addEventListener('abort',()=>reject(Object.assign(new Error('aborted'),{name:'AbortError'}))));
  await assert.rejects(interpretLocalEvidence({sku:'EH61234'},{},{directory:dir,allowedHosts:'donaldson.com',compactMode:true,timeoutMs:30}),/OLLAMA_TIMEOUT_30MS/);
 }finally{globalThis.fetch=originalFetch;await rm(dir,{recursive:true,force:true});}
});
