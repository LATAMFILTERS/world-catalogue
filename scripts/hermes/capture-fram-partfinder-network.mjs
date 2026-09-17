#!/usr/bin/env node
import fs from 'node:fs';
import { chromium } from 'patchright';

const target = process.argv[2] || 'https://www.fram.com/partFinder/search/index/?car-type=car-truck&category=Oil_Filter&engine=V8~6.2L~376~&make=0009&model=0161&type=Any+Type&year=2014';
const out = process.argv[3] || 'hermes/fram-partfinder-network.json';
const browser = await chromium.launch({ headless:true });
const context = await browser.newContext({ userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36' });
const page = await context.newPage();
const events = [];
page.on('response', async (res) => {
  const req = res.request();
  const type = req.resourceType();
  const url = res.url();
  if (!/fram\.com/i.test(url)) return;
  const headers = await res.allHeaders().catch(()=>({}));
  let body = null;
  if (['xhr','fetch','document'].includes(type)) body = await res.text().catch(()=>null);
  events.push({type,status:res.status(),url,method:req.method(),content_type:headers['content-type']||null,body:body?.slice(0,200000)||null});
});
try { await page.goto(target,{waitUntil:'domcontentloaded',timeout:60000}); } catch (e) { console.error('GOTO',e.message); }
await page.waitForTimeout(12000);
fs.mkdirSync('hermes',{recursive:true});
fs.writeFileSync(out,JSON.stringify({target,captured_at:new Date().toISOString(),title:await page.title(),url:page.url(),events},null,2));
console.log(`CAPTURED=${events.length}`);
for (const e of events.filter(x=>['xhr','fetch','document'].includes(x.type))) console.log(`${e.type} ${e.status} ${e.method} ${e.url}`);
await browser.close();
