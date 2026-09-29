'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9333;
const TARGET = 'https://www.fleetguard.com/es/category/productos/filtraci%C3%B3n-de-combustible/procesadores-de-combustible/0ZGPL0000000FSi4AM';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(url, opts) { const r = await fetch(url, opts); if (!r.ok) throw new Error(`${r.status} ${url}`); return r.json(); }
async function waitJson(url, tries=80) { let e; for(let i=0;i<tries;i++){ try{return await json(url);}catch(x){e=x; await sleep(250);} } throw e; }
async function main(){
  const profile = path.join(process.env.TEMP || '.', 'fleetguard-cdp-probe');
  fs.rmSync(profile,{recursive:true,force:true});
  const child=spawn(EDGE,[`--remote-debugging-port=${PORT}`,'--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
  try {
    await waitJson(`http://127.0.0.1:${PORT}/json/version`);
    const target=await json(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent('about:blank')}`,{method:'PUT'});
    const ws=new WebSocket(target.webSocketDebuggerUrl); await new Promise((ok,fail)=>{ws.onopen=ok;ws.onerror=fail;});
    let id=0; const pending=new Map(); const requests=[];
    ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&pending.has(m.id)){const {ok,fail}=pending.get(m.id);pending.delete(m.id);m.error?fail(new Error(m.error.message)):ok(m.result);} if(m.method==='Network.requestWillBeSent') requests.push(m.params.request.url);};
    const send=(method,params={})=>new Promise((ok,fail)=>{const n=++id;pending.set(n,{ok,fail});ws.send(JSON.stringify({id:n,method,params}));});
    await send('Network.enable'); await send('Page.enable'); await send('Runtime.enable');
    await send('Page.navigate',{url:TARGET});
    await sleep(18000);
    const body=await send('Runtime.evaluate',{expression:'document.body.innerText',returnByValue:true});
    console.log('BODY_HEAD'); console.log(String(body.result.value||'').slice(0,5000)); console.log('BODY_END');
    const filtered=[...new Set(requests)].filter(u=>/api|commerce|product|category|search|webruntime/i.test(u));
    console.log('REQUESTS_BEGIN'); filtered.forEach(u=>console.log(u)); console.log('REQUESTS_END');
    const links=await send('Runtime.evaluate',{expression:"JSON.stringify([...document.querySelectorAll('a[href*=\\\"/product/\\\"]')].map(a=>a.href))",returnByValue:true});
    console.log('PRODUCT_LINKS',links.result.value);
    ws.close();
  } finally { child.kill(); }
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
