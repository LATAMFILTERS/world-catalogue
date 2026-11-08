import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {reviewHdEvidence} from '../scripts/hermes/hd-local-evidence-review.mjs';

test('reviews one SKU with existing Ollama interpreter, never certifies',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'hd-local-'));
  try{
    const bundle=path.join(root,'bundles'),out=path.join(root,'out');
    await (await import('node:fs/promises')).mkdir(bundle);
    await writeFile(path.join(bundle,'EH60085.json'),'{}');
    let seen=0;
    const report=await reviewHdEvidence({
      skus:['EH60085','EH60085'],bundleDir:bundle,outDir:out,allowedHosts:'donaldson.com',
      interpret:async(item,shape,opts)=>{
        seen++;
        assert.equal(item.duty,'HEAVY_DUTY');
        assert.equal(opts.allowedHosts,'donaldson.com');
        return {dossier:{identity:{status:'UNRESOLVED'},technical_specs:{status:'UNRESOLVED'},dimensions:{status:'UNRESOLVED'},oem_codes:{status:'UNRESOLVED'},cross_references:{status:'UNRESOLVED'},applications:{status:'UNRESOLVED'}}};
      }
    });
    assert.equal(seen,1);
    assert.equal(report.counts.REVIEW_REQUIRED,1);
    const result=JSON.parse(await readFile(path.join(out,'EH60085.review.json'),'utf8'));
    assert.equal(result.publication_allowed,false);
    assert.equal(result.certification_allowed,false);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('missing official evidence is recorded without calling Ollama',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'hd-local-'));
  try{
    const report=await reviewHdEvidence({skus:['EH60085'],bundleDir:root,outDir:path.join(root,'out'),allowedHosts:'donaldson.com',interpret:async()=>{throw Error('MUST_NOT_BE_CALLED');}});
    assert.equal(report.counts.NEEDS_EVIDENCE,1);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('errors and malformed inputs fail closed',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'hd-local-'));
  try{
    const bundle=path.join(root,'bundles'),out=path.join(root,'out');
    await (await import('node:fs/promises')).mkdir(bundle);
    await writeFile(path.join(bundle,'EH60085.json'),'{}');
    const report=await reviewHdEvidence({skus:['EH60085'],bundleDir:bundle,outDir:out,allowedHosts:'donaldson.com',interpret:async()=>{throw Error('INVALID_EVIDENCE_SOURCE');}});
    assert.equal(report.counts.REVIEW_ERROR,1);
    await assert.rejects(reviewHdEvidence({skus:['../../etc'],bundleDir:bundle,outDir:out,allowedHosts:'donaldson.com'}),/INVALID_SKU_LIST/);
  }finally{await rm(root,{recursive:true,force:true});}
});
