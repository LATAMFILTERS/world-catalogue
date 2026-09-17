import { chromium } from 'patchright';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage();
const bodies = [];
page.on('response', async r => {
  const u = r.url();
  if (u.includes('fram_ymm.apacatapult.com') && u.includes('.js')) {
    try { bodies.push({url:u, text:await r.text()}); } catch {}
  }
});
await page.goto('https://www.fram.com/', {waitUntil:'networkidle', timeout:60000});
for (const b of bodies) {
  console.log('\nSOURCE', b.url);
  const urls=[...new Set(b.text.match(/https?:[^"'`\s)]+|\/[A-Za-z0-9_?&=.%\/-]*(?:api|ymm|year|make|model|engine|search|part)[A-Za-z0-9_?&=.%\/-]*/gi)||[])];
  console.log(urls.slice(0,200).join('\n'));
  const terms=['$http','ajax','getJSON','api','year','make','model','engine','part'];
  for(const term of terms){ const i=b.text.toLowerCase().indexOf(term.toLowerCase()); if(i>=0) console.log('CTX',term,b.text.slice(Math.max(0,i-500),i+1500)); }
}
await browser.close();