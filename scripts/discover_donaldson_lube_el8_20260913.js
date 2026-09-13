'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('patchright');
const ROOT = __dirname;
const OUT = path.join(ROOT,'donaldson_lube_el8_discovery_20260913.json');
const PAGES = path.join(ROOT,'donaldson_lube_el8_pages_20260913.jsonl');
const BASE='https://shop.donaldson.com/store/en-us/search?N=2864510247&Nr=product.language%3AEnglish&catNav=true&st=parts';
const norm=s=>String(s||'').trim().toUpperCase();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function classify(desc){const d=norm(desc); if(/HYDRAULIC FILTER/.test(d)) return 'EH6'; if(/LUBE FILTER/.test(d)&&/(SPIN-ON|CARTRIDGE)/.test(d)) return 'EL8'; if(/SENSOR|FILTER MINDER|HEAD ASSEMBLY|SAMPLING PUMP|GAUGE|INDICATOR|SWITCH|ADAPTER|VALVE|HOUSING|BRACKET|COVER|CLAMP|KIT/.test(d)) return 'EXCLUDE'; return 'REVIEW';}
function uniqByCode(rows){const m=new Map(); for(const r of rows){if(!r.code)continue; const old=m.get(r.code); if(!old||old.status!=='ACTIVE')m.set(r.code,r);} return [...m.values()];}
(async()=>{
 fs.writeFileSync(PAGES,'');
 const browser=await chromium.launch({headless:true}); const page=await browser.newPage({locale:'en-US'});
 const all=[];
 for(let no=0,pageNo=1;no<560;no+=20,pageNo++){
   const url=BASE+'&No='+no; console.log(`[page ${pageNo}/28] ${url}`);
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000}); await sleep(2500);
   const title=await page.title(); const body=await page.locator('body').innerText();
   if(/Access Denied/i.test(title+' '+body.slice(0,500))) throw new Error('AKAMAI_ACCESS_DENIED');
   const active=await page.locator('a[href*="/product/"]').evaluateAll(as=>as.map(a=>({code:(a.textContent||'').replace(/^\s*#?/,'').trim().split(/\s+/)[0],url:a.href,container:(a.closest('li,article,tr,div[class*=product],div[class*=search]')?.innerText||'')})));
   const rows=[]; for(const a of active){const c=norm(a.code); if(!/^[A-Z0-9-]+$/.test(c))continue; const lines=a.container.split(/\r?\n/).map(x=>x.trim()).filter(Boolean); const desc=lines.find(x=>x!==c&&x!=='#'+c&&!/^availability$/i.test(x)&&!/^in stock$/i.test(x)&&!/^contact us$/i.test(x))||''; rows.push({code:c,status:'ACTIVE',description:desc,url:a.url,class_hint:classify(desc),page:pageNo});}
   for(const m of body.matchAll(/\b([A-Z][A-Z0-9-]{4,})\s+This part has been discontinued and is no longer available\./g)) rows.push({code:norm(m[1]),status:'DISCONTINUED',description:null,url:null,class_hint:'REVIEW',page:pageNo});
   for(const m of body.matchAll(/\b([A-Z][A-Z0-9-]{4,})\s+This part number is recognized but not yet available in our catalog online\./g)) rows.push({code:norm(m[1]),status:'RECOGNIZED_NO_ONLINE',description:null,url:null,class_hint:'REVIEW',page:pageNo});
   const clean=uniqByCode(rows); clean.forEach(r=>all.push(r)); fs.appendFileSync(PAGES,JSON.stringify({page:pageNo,no,url,title,count:clean.length,rows:clean})+'\n'); console.log(`[page ${pageNo}] entries=${clean.length} cumulative=${uniqByCode(all).length}`);
 }
 const items=uniqByCode(all); const summary={total:items.length,active:items.filter(x=>x.status==='ACTIVE').length,discontinued:items.filter(x=>x.status==='DISCONTINUED').length,recognized_no_online:items.filter(x=>x.status==='RECOGNIZED_NO_ONLINE').length,EL8:items.filter(x=>x.class_hint==='EL8').length,EH6:items.filter(x=>x.class_hint==='EH6').length,EXCLUDE:items.filter(x=>x.class_hint==='EXCLUDE').length,REVIEW:items.filter(x=>x.class_hint==='REVIEW').length};
 fs.writeFileSync(OUT,JSON.stringify({source:BASE,expected_raw:553,summary,items},null,2)); console.log('SUMMARY',JSON.stringify(summary)); if(items.length!==553) process.exitCode=2; await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});