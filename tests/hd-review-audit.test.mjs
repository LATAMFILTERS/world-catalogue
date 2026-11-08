import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {auditHdReviews,reviewHdEvidence} from '../scripts/hermes/hd-local-evidence-review.mjs';

test('audit preserves accepted files, checks verbatim hashed evidence, and splits queues',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'hd-audit-'));
 const bundles=path.join(root,'bundles'), reviews=path.join(root,'reviews');
 await fs.mkdir(bundles);await fs.mkdir(reviews);
 try{
  const source='Donaldson filter ABC123. Height 90 mm. Diameter 70 mm.';
  await fs.writeFile(path.join(bundles,'EA10006.json'),JSON.stringify({sku:'EA10006',sources:[{url:'https://shop.donaldson.com/ABC123',content:source,sha256:crypto.createHash('sha256').update(source).digest('hex')}]}));
  const accepted={sku:'EA10006',status:'REVIEW_REQUIRED',reason:'HUMAN_REVIEW',provider:'HERMES_LOCAL_OLLAMA',dossier:{technical_specs:{records:['Height 90 mm.','Unsupported fact']}}};
  const file=path.join(reviews,'EA10006.review.json');
  await fs.writeFile(file,JSON.stringify(accepted));
  await fs.writeFile(path.join(reviews,'EA10012.review.json'),JSON.stringify({sku:'EA10012',status:'REVIEW_ERROR',reason:'OLLAMA_TIMEOUT_65000MS'}));
  await fs.writeFile(path.join(reviews,'EA10014.review.json'),JSON.stringify({sku:'EA10014',status:'REVIEW_ERROR',reason:'OLLAMA_JSON_INVALID_OR_INCOMPLETE'}));
  const result=await auditHdReviews({bundleDir:bundles,outDir:reviews});
  assert.equal(result.accepted,1);
  assert.equal(result.accepted_with_grounded_facts,1);
  assert.equal(result.grounded_fact_count,1);
  assert.equal(result.unverified_fact_count,1);
  assert.equal(result.timeout_queue,1);
  assert.equal(result.other_error_queue,1);
  const timeouts=await fs.readFile(path.join(reviews,'hd-timeout-queue.csv'),'utf8');
  assert.match(timeouts,/EA10012/);
  assert.doesNotMatch(timeouts,/EA10014/);
  let calls=0;
  const next=await reviewHdEvidence({skus:['EA10006'],bundleDir:bundles,outDir:reviews,allowedHosts:'donaldson.com',limit:1,interpret:async()=>{calls++;throw Error('SHOULD_NOT_RUN');}});
  assert.equal(calls,0);
  assert.equal(next.results[0].status,'REVIEW_REQUIRED');
  assert.deepEqual(JSON.parse(await fs.readFile(file,'utf8')),accepted);
 }finally{await fs.rm(root,{recursive:true,force:true});}
});
