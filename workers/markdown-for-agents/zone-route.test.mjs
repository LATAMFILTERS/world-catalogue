import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from './index.mjs';
const sample = '<!DOCTYPE html><html><head><title>Prueba ELIMFILTERS</title></head><body><main><h1>Técnica</h1><a href="/es/industries/">Industrias</a><p>Filtración industrial segura</p></main></body></html>';
test('zone route avoids recursion and keeps canonical public links', async () => {
  const old=globalThis.fetch; let upstream='';
  globalThis.fetch=async req=>{upstream=req.url;return new Response(sample,{headers:{'Content-Type':'text/html','Content-Security-Policy':"default-src 'self'"}});};
  try {
    const r=await worker.fetch(new Request('https://elimfilters.com/es/knowledge-center/',{headers:{Accept:'text/markdown'}}));
    assert.equal(upstream,'https://elimfilters-frontend.onrender.com/es/knowledge-center/');
    assert.match(r.headers.get('content-type'),/text\/markdown/);
    assert.match(r.headers.get('vary'),/Accept/);
    assert.equal(r.headers.get('content-security-policy'),"default-src 'self'");
    const md=await r.text();
    assert.match(md,/Source: https:\/\/elimfilters\.com\/es\/knowledge-center\//);
    assert.match(md,/\[Industrias\]\(https:\/\/elimfilters\.com\/es\/industries\/\)/);
    assert.doesNotMatch(md,/onrender\.com/);
  } finally {globalThis.fetch=old;}
});
test('HTML traffic remains HTML while routed to independent origin',async()=>{
  const old=globalThis.fetch; let upstream='';
  globalThis.fetch=async req=>{upstream=req.url;return new Response(sample,{headers:{'Content-Type':'text/html'}});};
  try {
    const r=await worker.fetch(new Request('https://elimfilters.com/es/knowledge-center/',{headers:{Accept:'text/html'}}));
    assert.equal(upstream,'https://elimfilters-frontend.onrender.com/es/knowledge-center/');
    assert.match(r.headers.get('content-type'),/text\/html/);
    assert.match(await r.text(),/<main>/);
  } finally {globalThis.fetch=old;}
});
