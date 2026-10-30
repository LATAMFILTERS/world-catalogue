import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {extractTechnicalIdentity} from '../scripts/hermes/lightweight-identity-pilot.mjs';

test('lightweight pilot uses 1.7b, checks exact code and never certifies',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'hermes-pilot-'));
 const content='MANN-FILTER HU 816 x Oil Filter. Diameter 74 mm. Height 79 mm.';
 try {
  await writeFile(path.join(dir,'EL30816.json'),JSON.stringify({sku:'EL30816',sources:[{
   url:'https://www.mann-filter.com/official',content,sha256:crypto.createHash('sha256').update(content).digest('hex')
  }]}));
  let body;
  const fetcher=async(_url,req)=>{
   body=JSON.parse(req.body);
   return {ok:true,json:async()=>({message:{content:JSON.stringify({
    source_code:'MANN-FILTER HU 816 x Oil Filter Catalog',product_type:'Oil Filter',
    outer_diameter_mm:74,inner_diameter_mm:41,height_mm:79
   })}})};
  };
  const result=await extractTechnicalIdentity({sku:'EL30816',sourceCode:'HU 816 x',directory:dir,fetcher});
  assert.equal(body.model,'qwen3:1.7b');
  assert.equal(body.think,false);
  assert.equal(result.code_exact,false);
  assert.equal(result.status,'REVIEW_REQUIRED');
  assert.equal(result.dimensions.outer_diameter_mm.status,'REVIEW_REQUIRED');
 } finally {await rm(dir,{recursive:true,force:true});}
});

test('matches dimension labels and refuses unsupported model values', async () => {
 const dir=await mkdtemp(path.join(os.tmpdir(),'hermes-technical-'));
 const content='MANN-FILTER HU 816 x Oil Filter. Navigation '.repeat(5)+' Outer diameter (A) = 74 mm; Inner diameter (B) = 41 mm; Inner diameter 1 (C) = 41 mm; Height (H) = 79 mm.';
 try {
  await writeFile(path.join(dir,'EL30816.json'),JSON.stringify({sku:'EL30816',sources:[{
   url:'https://www.mann-filter.com/official',content,sha256:crypto.createHash('sha256').update(content).digest('hex')
  }]}));
  const fetcher=async(_url,req)=>{
   assert.match(JSON.parse(req.body).messages[1].content,/Outer diameter \(A\) = 74 mm/);
   return {ok:true,json:async()=>({message:{content:JSON.stringify({
    source_code:'HU 816 x',product_type:'Oil Filter',
    outer_diameter_mm:74,inner_diameter_mm:999,height_mm:79
   })}})};
  };
  const result=await extractTechnicalIdentity({sku:'EL30816',sourceCode:'HU 816 x',directory:dir,fetcher});
  assert.equal(result.code_exact,true);
  assert.equal(result.identity_source_confirmed,true);
  assert.equal(result.dimensions.outer_diameter_mm.status,'DOCUMENT_MATCH_REVIEW_REQUIRED');
  assert.equal(result.dimensions.inner_diameter_mm.value,41);
  assert.equal(result.dimensions.height_mm.value,79);
  assert.equal(result.status,'REVIEW_REQUIRED');
 } finally {await rm(dir,{recursive:true,force:true});}
});

test('BMW OE candidates come only from explicit OE section and remain review only', async () => {
 const dir=await mkdtemp(path.join(os.tmpdir(),'hermes-oe-'));
 const content='MANN-FILTER HU 816 x Oil Filter. Main application: BMW 1 (E81). with gasket. '+
   'Outer diameter (A) = 74 mm; Inner diameter (B) = 41 mm; Inner diameter 1 (C) = 41 mm; Height (H) = 79 mm. '+
   'An unrelated 11 42 1 111 111. OE Numbers BMW 11 42 7 541 827 11 42 7 953 129 '+
   '11 42 7 523 201 11 42 7 566 327 11 42 8 683 196 Legal Information.';
 try {
  await writeFile(path.join(dir,'EL30816.json'),JSON.stringify({sku:'EL30816',sources:[{
   url:'https://www.mann-filter.com/official',content,sha256:crypto.createHash('sha256').update(content).digest('hex')
  }]}));
  const fetcher=async()=>({ok:true,json:async()=>({message:{content:JSON.stringify({source_code:'HU 816 x',product_type:'Oil Filter'})}})});
  const result=await extractTechnicalIdentity({sku:'EL30816',sourceCode:'HU 816 x',directory:dir,fetcher});
  assert.deepEqual(result.oe_candidates.map(x=>x.code),[
   '11 42 7 541 827','11 42 7 953 129','11 42 7 523 201',
   '11 42 7 566 327','11 42 8 683 196'
  ]);
  assert.ok(result.oe_candidates.every(x=>x.status==='REVIEW_REQUIRED' && x.evidence_sha256));
  assert.match(result.main_application_summary_candidate,/BMW 1/);
  assert.equal(result.status,'REVIEW_REQUIRED');
 } finally {await rm(dir,{recursive:true,force:true});}
});
