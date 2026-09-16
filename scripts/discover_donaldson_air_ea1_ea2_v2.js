'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/ELIMSERVER/repos/world-catalogue/node_modules/patchright');
const ROOT = __dirname;
const BASE = 'https://shop.donaldson.com/store/en-us/search';
const OUT = path.join(ROOT, 'donaldson_air_ea1_ea2_v2_discovery.json');
const PAGE_EVIDENCE = path.join(ROOT, 'donaldson_air_ea1_ea2_v2_pages.jsonl');
const SUBCATS = [
  { key:'EA1', technology:'MACROCORE™', label:'Filters', N:'2975800598' },
  { key:'EA2', technology:'INTEKCORE™', label:'Air Cleaners', N:'2065132825' },
];
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const clean = s => String(s||'').replace(/\s+/g,' ').trim();
function searchUrl(N, offset=0){
  const u = new URL(BASE);
  u.searchParams.set('N',N);
  if(offset) u.searchParams.set('No',String(offset));
  u.searchParams.set('Nr','product.language:English');
  u.searchParams.set('catNav','true');
  u.searchParams.set('st','parts');
  return u.href;
}
async function parsePage(page, meta, pageNo, offset){
  const body = (await page.locator('body').innerText()).replace(/\r/g,'');
  const count = Number(body.match(/Donaldson Parts \((\d+)\)/)?.[1]||0);
  const start = body.indexOf('Results for');
  const end = body.indexOf('Refine Results');
  const resultText = body.slice(start, end>start?end:undefined);
  const links = await page.locator('a[href*="/product/"]').evaluateAll(as=>as.map(a=>({href:a.href,text:(a.textContent||'').trim()})));
  const byCode = new Map();
  for(const x of links){
    const m = x.href.match(/\/product\/([^/?#]+)/i); if(!m) continue;
    const code = m[1].toUpperCase();
    if(!byCode.has(code)) byCode.set(code,{code,url:x.href,status:'ACTIVE'});
  }
  const unavailable=[];
  for(const line of resultText.split('\n').map(x=>x.trim()).filter(Boolean)){
    let m=line.match(/^([A-Z0-9-]+) This part number is recognized but not yet available in our catalog(?: online)?\.$/i);
    if(m) unavailable.push({code:m[1].toUpperCase(),url:null,status:'RECOGNIZED_NOT_ONLINE'});
    m=line.match(/^([A-Z0-9-]+) This part has been discontinued and is no longer available\.$/i);
    if(m) unavailable.push({code:m[1].toUpperCase(),url:null,status:'DISCONTINUED'});
  }
  for(const x of unavailable) if(!byCode.has(x.code)) byCode.set(x.code,x);
  const rows=[...byCode.values()].map(r=>({...r,family:meta.key,technology:meta.technology,source_category:meta.label,source_page:pageNo,source_offset:offset,source_listing_url:page.url()}));
  fs.appendFileSync(PAGE_EVIDENCE,JSON.stringify({captured_at:new Date().toISOString(),category:meta.label,family:meta.key,page:pageNo,offset,declared_count:count,rows})+'\n');
  return {count,rows};
}
async function main(){
  fs.writeFileSync(PAGE_EVIDENCE,'');
  const browser=await chromium.launch({headless:false,executablePath:'C:/Users/ELIMSERVER/.cache/puppeteer/chrome/win64-148.0.7778.97/chrome-win64/chrome.exe'});
  const context=await browser.newContext({locale:'en-US'}); const page=await context.newPage();
  const all=[]; const summary=[];
  for(const meta of SUBCATS){
    await page.goto(searchUrl(meta.N,0),{waitUntil:'domcontentloaded',timeout:120000}); await sleep(4500);
    const first=await parsePage(page,meta,1,0); const total=first.count; const pages=Math.ceil(total/20); all.push(...first.rows);
    console.log(`[${meta.key}] page=1/${pages} declared=${total} captured=${first.rows.length}`);
    for(let p=2;p<=pages;p++){
      const offset=(p-1)*20; await page.goto(searchUrl(meta.N,offset),{waitUntil:'domcontentloaded',timeout:120000}); await sleep(2400);
      const got=await parsePage(page,meta,p,offset); all.push(...got.rows);
      console.log(`[${meta.key}] page=${p}/${pages} captured=${got.rows.length}`);
    }
    summary.push({family:meta.key,technology:meta.technology,category:meta.label,declared_count:total,pages});
  }
  const uniq=new Map(); for(const r of all){const k=r.family+'|'+r.code;if(!uniq.has(k))uniq.set(k,r);}
  const rows=[...uniq.values()];
  const result={generated_at:new Date().toISOString(),scope:'ONLY AIR FILTERS AND AIR CLEANERS/HOUSEINGS',source:'DONALDSON OFFICIAL SUBCATEGORIES',summary,raw_rows:all.length,unique_rows:rows.length,rows};
  fs.writeFileSync(OUT,JSON.stringify(result,null,2));
  console.log(JSON.stringify({summary,raw_rows:all.length,unique_rows:rows.length,status_counts:rows.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{})},null,2));
  await browser.close();
}
main().catch(e=>{console.error(e.stack||e);process.exit(1)});
