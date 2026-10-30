import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {interpretLocalEvidence} from '../scripts/hermes/local-evidence-ollama.mjs';

test('local interpreter refuses missing evidence directory', async () => {
  await assert.rejects(interpretLocalEvidence({sku:'EL12345'}, {}, {directory:''}), /LOCAL_EVIDENCE_DIRECTORY_REQUIRED|ENOENT/);
});

test('local interpreter fails closed on invalid source hash', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(),'hermes-local-'));
  try {
    await writeFile(path.join(dir,'EL12345.json'), JSON.stringify({
      sku:'EL12345',sources:[{url:'https://www.mann-filter.com/example',content:'Sample official document content',sha256:'0'.repeat(64)}]
    }));
    await assert.rejects(
      interpretLocalEvidence({sku:'EL12345'}, {}, {directory:dir,allowedHosts:'mann-filter.com'}),
      /INVALID_EVIDENCE_SOURCE/
    );
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('local interpreter fails closed on unofficial host', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(),'hermes-local-'));
  const content='Sample evidence, not official';
  try {
    await writeFile(path.join(dir,'EL12345.json'), JSON.stringify({
      sku:'EL12345',sources:[{url:'https://untrusted.example/item',content,sha256:crypto.createHash('sha256').update(content).digest('hex')}]
    }));
    await assert.rejects(
      interpretLocalEvidence({sku:'EL12345'}, {}, {directory:dir,allowedHosts:'mann-filter.com'}),
      /INVALID_EVIDENCE_SOURCE/
    );
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('limits input to Ollama while preserving the stored evidence', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(),'hermes-local-'));
  const sourceText='Unrelated corporate navigation. '.repeat(900) + ' Oil filter HU 816 x. Height 79 mm. Diameter 74 mm.';
  const url='https://www.mann-filter.com/example';
  const file=path.join(dir,'EL30816.json');
  const originalFetch=globalThis.fetch;
  let captured;
  try {
    await writeFile(file,JSON.stringify({sku:'EL30816',sources:[{url,content:sourceText,sha256:crypto.createHash('sha256').update(sourceText).digest('hex')}]}));
    globalThis.fetch=async (_endpoint,request) => {
      captured=JSON.parse(request.body);
      const axis={status:'UNRESOLVED',records:[],source_urls:[]};
      const dossier={identity:axis,technical_specs:axis,dimensions:axis,oem_codes:axis,cross_references:axis,applications:axis,consistency:{status:'CONFLICTING',conflicts:[]},provenance:{sources:[]}};
      return {ok:true,json:async()=>({message:{content:JSON.stringify(dossier)}})};
    };
    await interpretLocalEvidence({sku:'EL30816',discovery_hints:{source_candidate_code:'HU 816 x'}},{},{directory:dir,allowedHosts:'mann-filter.com'});
    assert.equal(captured.think,false);
    assert.equal(captured.options.num_predict,1300);
    assert.ok(captured.messages[1].content.length < sourceText.length);
    assert.match(captured.messages[1].content,/Height 79 mm/);
    assert.equal(JSON.parse(await readFile(file,'utf8')).sources[0].content,sourceText);
  } finally {globalThis.fetch=originalFetch;await rm(dir,{recursive:true,force:true});}
});
