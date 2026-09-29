const { chromium } = require('patchright');
(async()=>{
 const browser=await chromium.launch({headless:true}); const page=await browser.newPage();
 page.on('response', async r=>{
   if(!r.url().includes('showmeconnect.exe')) return;
   try { const t=await r.text();
     if(t.includes('ShowMeTheParts_suppliernames')) {
       console.log('SUPPLIER_RESPONSE_LEN',t.length);
       console.log('NAME_COUNT',(t.match(/<name>/g)||[]).length);
       const hits=[...t.matchAll(/<name><data>([^<]*FRAM[^<]*)<\/data><id>([^<]+)<\/id><linecode>([^<]*)<\/linecode><brandid>([^<]*)<\/brandid><\/name>/gi)];
       console.log('FRAM_HITS',hits.map(m=>({name:m[1],id:m[2],linecode:m[3],brandid:m[4]})));
     }
   } catch(e){}
 });
 await page.goto('https://showmethefilters.com/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForTimeout(12000); await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});