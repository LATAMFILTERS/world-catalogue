import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker,{htmlToMarkdown} from './index.mjs';
const html='<title>Ficha técnica</title><main><h1>Filtración</h1><p>Agua &amp; aceite</p><table><tr><th>Parámetro</th><th>Valor</th></tr><tr><td>Caudal</td><td>12 L/min</td></tr></table><img src="/filter.png" alt="Filtro"><a href="/es/">Ver ficha</a></main>';
test('table, image, link and technical content',()=>{
 const md=htmlToMarkdown(html,'https://elimfilters.com/es/');
 assert.match(md,/\| Parámetro \| Valor \|/);
 assert.match(md,/\| Caudal \| 12 L\/min \|/);
 assert.match(md,/!\[Filtro\]\(https:\/\/elimfilters.com\/filter.png\)/);
 assert.match(md,/\[Ver ficha\]\(https:\/\/elimfilters.com\/es\/\)/);
 assert.match(md,/Agua & aceite/);
});
test('Spanish English Portuguese',()=>{
 for(const phrase of ['Separación de agua','Water separation','Separação de água'])
  assert.ok(htmlToMarkdown('<main><p>'+phrase+'</p></main>','https://elimfilters.com/').includes(phrase));
});
test('Content-Type, Vary, CSP and browser fallback',async()=>{
 const saved=globalThis.fetch;
 globalThis.fetch=async()=>new Response(html,{headers:{'Content-Type':'text/html','Content-Security-Policy':"default-src 'self'"}});
 try {
  const md=await worker.fetch(new Request('https://elimfilters.com/es/',{headers:{Accept:'text/markdown'}}));
  assert.match(md.headers.get('Content-Type'),/text\/markdown/);
  assert.match(md.headers.get('Vary'),/Accept/);
  assert.equal(md.headers.get('Content-Security-Policy'),"default-src 'self'");
  const browser=await worker.fetch(new Request('https://elimfilters.com/es/',{headers:{Accept:'text/html'}}));
  assert.match(browser.headers.get('Content-Type'),/text\/html/);
  const api=await worker.fetch(new Request('https://elimfilters.com/api/parts',{headers:{Accept:'text/markdown'}}));
  assert.match(api.headers.get('Content-Type'),/text\/html/);
 } finally {globalThis.fetch=saved;}
});
