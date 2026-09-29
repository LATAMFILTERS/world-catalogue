'use strict';
const { spawn } = require('child_process'); const fs=require('fs'); const path=require('path');
const EDGE='C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', PORT=9334;
const TARGET=process.argv[2]||'https://www.fleetguard.com/es/product/FH23029'; const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function j(url,o){const r=await fetch(url,o);if(!r.ok)throw Error(`${r.status} ${url}`);return r.json()}
async function wait(url){let e;for(let i=0;i<80;i++){try{return await j(url)}catch(x){e=x;await sleep(250)}}throw e}
(async()=>{const profile=path.join(process.env.TEMP||'.','fleetguard-detail-probe');fs.rmSync(profile,{recursive:true,force:true});
 const child=spawn(EDGE,[`--remote-debugging-port=${PORT}`,'--headless=new','--disable-gpu','--no-first-run',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
 try{await wait(`http://127.0.0.1:${PORT}/json/version`);const t=await j(`http://127.0.0.1:${PORT}/json/new?about:blank`,{method:'PUT'});const ws=new WebSocket(t.webSocketDebuggerUrl);await new Promise((ok,no)=>{ws.onopen=ok;ws.onerror=no});
 let id=0;const pend=new Map(), req=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){const p=pend.get(m.id);pend.delete(m.id);m.error?p.no(Error(m.error.message)):p.ok(m.result)}if(m.method==='Network.requestWillBeSent'){const r=m.params.request;if(/webruntime\/api|product/i.test(r.url))req.push({method:r.method,url:r.url,postData:r.postData||''})}};
 const send=(method,params={})=>new Promise((ok,no)=>{const n=++id;pend.set(n,{ok,no});ws.send(JSON.stringify({id:n,method,params}))});
 await send('Network.enable');await send('Page.enable');await send('Runtime.enable');await send('Page.navigate',{url:TARGET});await sleep(18000);
 const body=await send('Runtime.evaluate',{expression:'document.body.innerText',returnByValue:true}); console.log('BODY_BEGIN');console.log(String(body.result.value||'').slice(0,14000));console.log('BODY_END');
 console.log('REQUESTS_BEGIN');for(const r of req){console.log(r.method,r.url);if(r.postData)console.log('POST',r.postData.slice(0,5000))}console.log('REQUESTS_END'); ws.close();
 }finally{child.kill()}})().catch(e=>{console.error(e.stack||e);process.exitCode=1});