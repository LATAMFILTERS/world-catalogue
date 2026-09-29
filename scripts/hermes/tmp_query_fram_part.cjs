const { chromium } = require('patchright');
const https = require('https');
(async()=>{
 const browser=await chromium.launch({headless:true}); const page=await browser.newPage();
 await page.goto('https://showmethefilters.com/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>globalThis.CCi?.UrlEncoder && globalThis.Smtp?.Globals?.CatalogId,{timeout:60000});
 const info=await page.evaluate(()=>({id:globalThis.Smtp.Globals.CatalogId,params:globalThis.Smtp.Globals.UrlIdParams}));
 const plain=`lookup=partlist&partno=FS8A${info.params}`;
 const cargo=await page.evaluate(q=>globalThis.CCi.UrlEncoder.Contort(q),plain);
 const url='https://www.showmethepartsdb.com/bin/showmeconnect.exe?'+cargo+'&start=0&limit=100&callback=cb';
 console.log('CATALOG',info,'PLAIN',plain);
 await new Promise((resolve,reject)=>https.get(url,r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>{console.log('STATUS',r.statusCode,'LEN',d.length);console.log(d.slice(0,5000));resolve()})}).on('error',reject));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});