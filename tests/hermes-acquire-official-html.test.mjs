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

test('segments long US application evidence losslessly with source integrity',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'hermes-us-'));
 const content='BMW 128i N51B30A '.repeat(4500).trim();
 const html='<html><body>'+content+'</body></html>';
 try {
  const fetcher=async url=>({ok:true,status:200,redirected:false,url,headers:new Headers({'content-type':'text/html'}),text:async()=>html});
  await assert.rejects(acquireOfficialHtml({sku:'EL30816',urls:['https://www.mann-filter.com/us-en/'],directory:dir,allowedHosts:'mann-filter.com',fetcher}),/EVIDENCE_CONTENT_INVALID/);
  const result=await acquireOfficialHtml({sku:'EL30816',urls:['https://www.mann-filter.com/us-en/'],directory:dir,allowedHosts:'mann-filter.com',splitOversizedText:true,fetcher});
  const bundle=JSON.parse(await readFile(result.file,'utf8'));
  assert.ok(bundle.sources.length>1);
  assert.ok(bundle.sources.every(x=>x.content.length<=50000 && x.part_count===bundle.sources.length));
  assert.ok(bundle.sources.every(x=>x.sha256===crypto.createHash('sha256').update(x.content).digest('hex')));
  assert.equal(bundle.sources.map(x=>x.content).join(' '),content);
  assert.ok(bundle.sources.every(x=>x.full_text_sha256===crypto.createHash('sha256').update(content).digest('hex')));
 } finally {await rm(dir,{recursive:true,force:true});}
});

test('preserves raw table markup with verified hash without overwriting old capture',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'hermes-raw-tables-'));
 const html='<html><body><table><tr><th>Year</th><th>Model</th><th>Engine Code</th></tr><tr><td>2011</td><td>128i</td><td>N51B30A</td></tr></table></body></html>';
 const args={sku:'EL30816',urls:['https://www.mann-filter.com/us-en/p'],directory:dir,
  allowedHosts:'mann-filter.com',preserveHtml:true,
  fetcher:async url=>({ok:true,status:200,redirected:false,url,
    headers:new Headers({'content-type':'text/html'}),text:async()=>html})};
 try {
  const result=await acquireOfficialHtml(args);
  const record=JSON.parse(await readFile(result.file,'utf8'));
  assert.equal(record.raw_html_sources.length,1);
  const raw=await readFile(path.join(dir,record.raw_html_sources[0].file),'utf8');
  assert.equal(raw,html);
  assert.equal(record.raw_html_sources[0].sha256,crypto.createHash('sha256').update(html).digest('hex'));
  await assert.rejects(acquireOfficialHtml(args),/EEXIST/);
  assert.equal(await readFile(path.join(dir,record.raw_html_sources[0].file),'utf8'),html);
 }finally {await rm(dir,{recursive:true,force:true});}
});
