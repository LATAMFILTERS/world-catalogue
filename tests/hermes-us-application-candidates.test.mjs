import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {extractUsApplicationCandidates} from '../scripts/hermes/us-application-candidates.mjs';

const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
test('US BMW applications retain exact year/model/engine associations without certifying',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'hermes-us-fit-'));
 const text='MANN-FILTER HU 816 x BMW (USA) 2014 Model Type Filter Type Engine Code ccm kW HP Year of Manufacture '+
  '128i (L6 3.0L FI Turbo) Oil Filter N51B30A, N52B30A 2996 169 230 '+
  '135i (L6 3.0L FI Turbo) Oil Filter N55B30A 2979 221 300 '+
  '2013 Model Type Filter Type Engine Code ccm kW HP Year of Manufacture '+
  '335i (L6 3.0L FI Turbo) Oil Filter N55B30A 2979 221 300';
 const split=text.indexOf('2013 Model');
 const parts=[text.slice(0,split-1),text.slice(split)];
 const fullHash=hash(parts.join(' '));
 try{
  const sources=parts.map((content,i)=>({url:'https://www.mann-filter.com/us-en/p',content,sha256:hash(content),
   full_text_sha256:fullHash,part_index:i+1,part_count:2}));
  await writeFile(path.join(dir,'EL30816.json'),JSON.stringify({sku:'EL30816',sources}));
  const output=await extractUsApplicationCandidates({sku:'EL30816',directory:dir});
  assert.equal(output.year_sections,2);
  assert.deepEqual(output.candidates.map(c=>[c.year,c.model,c.engine_code]),[
   [2014,'128i','N51B30A'],[2014,'128i','N52B30A'],[2014,'135i','N55B30A'],
   [2013,'335i','N55B30A']
  ]);
  assert.ok(output.candidates.every(c=>c.status==='REVIEW_REQUIRED'&&c.evidence_sha256===fullHash));
  sources[1].sha256='0'.repeat(64);
  await writeFile(path.join(dir,'EL30816.json'),JSON.stringify({sku:'EL30816',sources}));
  await assert.rejects(extractUsApplicationCandidates({sku:'EL30816',directory:dir}),/INVALID_EVIDENCE_PART/);
 }finally{await rm(dir,{recursive:true,force:true});}
});

test('rejects a model polluted by trailing values of preceding row',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'hermes-us-polluted-'));
 const text='MANN-FILTER HU 816 x BMW (USA) 2012 Model Type Filter Type Engine Code ccm kW HP Year of Manufacture '+
 '128i (L6 3.0L FI Turbo) Oil Filter N52 2996 169 230 335i (L6 3.0L FI Turbo) Oil Filter N55B30A 2979 221 300';
 try {
  await writeFile(path.join(dir,'EL30816.json'),JSON.stringify({sku:'EL30816',sources:[{
   url:'https://www.mann-filter.com/us-en/p',content:text,sha256:hash(text),full_text_sha256:hash(text),
   part_index:1,part_count:1
  }]}));
  const result=await extractUsApplicationCandidates({sku:'EL30816',directory:dir});
  assert.ok(!result.candidates.some(c=>c.model.includes('Oil Filter')));
  assert.ok(result.skipped.some(c=>c.reason==='AMBIGUOUS_MODEL_OR_ENGINE'));
  assert.equal(result.status,'REVIEW_REQUIRED');
 }finally{await rm(dir,{recursive:true,force:true});}
});
