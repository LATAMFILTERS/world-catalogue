import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {acquireOfficialHtml} from '../scripts/hermes/acquire-official-html.mjs';

test('curated official HTML yields source text and its SHA-256', async () => {
  const dir=await mkdtemp(path.join(os.tmpdir(),'hermes-official-'));
  const text='<html><body>MANN-FILTER HU816X oil filter</body></html>';
  try {
    const result=await acquireOfficialHtml({sku:'EL30816',urls:['https://www.mann-filter.com/p'],directory:dir,
      allowedHosts:'mann-filter.com',
      fetcher:async url=>({ok:true,status:200,redirected:false,url,headers:new Headers({'content-type':'text/html'}),text:async()=>text})});
    assert.equal(result.source_count,1);
    const record=JSON.parse(await readFile(result.file,'utf8'));
    assert.match(record.sources[0].content,/HU816X/);
    assert.equal(record.sources[0].sha256,crypto.createHash('sha256').update(record.sources[0].content).digest('hex'));
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('rejects unapproved hosts before making a request', async () => {
  let called=false;
  await assert.rejects(acquireOfficialHtml({sku:'EL30816',urls:['https://untrusted.example/p'],directory:os.tmpdir(),
    allowedHosts:'mann-filter.com',fetcher:async()=>{called=true;throw Error('UNEXPECTED');}}),/UNAPPROVED_EVIDENCE_URL/);
  assert.equal(called,false);
});

test('rejects PDF content and does not create evidence', async () => {
  const dir=await mkdtemp(path.join(os.tmpdir(),'hermes-official-'));
  try {
    await assert.rejects(acquireOfficialHtml({sku:'EL30816',urls:['https://www.mann-filter.com/p'],directory:dir,
      allowedHosts:'mann-filter.com',fetcher:async url=>({ok:true,status:200,redirected:false,url,
        headers:new Headers({'content-type':'application/pdf'}),text:async()=>'%PDF'})}),/EVIDENCE_NOT_TEXT_HTML/);
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('accepts large official HTML when extracted product text stays within budget', async () => {
  const dir=await mkdtemp(path.join(os.tmpdir(),'hermes-official-'));
  const html='<html><head><script>'+('x'.repeat(300000))+'</script></head><body>MANN-FILTER HU816X oil filter</body></html>';
  try {
    const result=await acquireOfficialHtml({sku:'EL30816',urls:['https://www.mann-filter.com/p'],directory:dir,
      allowedHosts:'mann-filter.com',fetcher:async url=>({ok:true,status:200,redirected:false,url,
        headers:new Headers({'content-type':'text/html','content-length':String(Buffer.byteLength(html))}),text:async()=>html})});
    const record=JSON.parse(await readFile(result.file,'utf8'));
    assert.match(record.sources[0].content,/HU816X/);
    assert.ok(!record.sources[0].content.includes('xxxxx'));
  } finally {await rm(dir,{recursive:true,force:true});}
});

test('rejects an oversized response before reading body', async () => {
  const dir=await mkdtemp(path.join(os.tmpdir(),'hermes-official-'));
  try {
    await assert.rejects(acquireOfficialHtml({sku:'EL30816',urls:['https://www.mann-filter.com/p'],directory:dir,
      allowedHosts:'mann-filter.com',fetcher:async url=>({ok:true,status:200,redirected:false,url,
        headers:new Headers({'content-type':'text/html','content-length':'5000000'}),text:async()=>{throw Error('SHOULD_NOT_READ');}})}),/EVIDENCE_TOO_LARGE/);
  } finally {await rm(dir,{recursive:true,force:true});}
});
