const { chromium } = require('patchright');
(async()=>{
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage();
  const seen=[];
  page.on('request', r=>{ if(r.url().includes('showmeconnect.exe')) { seen.push(r.url()); console.log('REQ', r.method(), r.url()); }});
  page.on('response', async r=>{ if(r.url().includes('showmeconnect.exe')) { console.log('RESP', r.status(), r.url()); try { const t=await r.text(); console.log('BODY', t.slice(0,1200).replace(/\s+/g,' ')); } catch{} }});
  await page.goto('https://showmethefilters.com/', {waitUntil:'domcontentloaded', timeout:60000});
  await page.waitForTimeout(15000);
  console.log('TITLE', await page.title());
  console.log('CONNECT_REQUESTS', seen.length);
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});