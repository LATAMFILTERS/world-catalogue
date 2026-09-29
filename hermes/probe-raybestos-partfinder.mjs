import { chromium } from 'patchright';
const browser = await chromium.launch({ headless: true });
const urls = [
  'https://www.raybestos.com/',
  'https://www.raybestos.com/partFinder/search/index?year=2021&make=0020&model=49725&product=0060'
];
for (const u of urls) {
  const page = await browser.newPage();
  const req = [];
  page.on('request', r => {
    const x = r.url();
    if (/apa|partfinder|ymm|catalog|vehicle|application/i.test(x)) req.push(x);
  });
  const resp = await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => null);
  await page.waitForTimeout(2500);
  console.log('\nURL', u, 'STATUS', resp?.status(), 'TITLE', await page.title().catch(() => ''));
  const html = await page.content();
  const hits = [...html.matchAll(/https?:[^"'<>\s]+/g)].map(m => m[0]).filter(x => /apa|partfinder|ymm/i.test(x));
  console.log('HTML_HITS', [...new Set(hits)].slice(0, 30));
  console.log('REQ', [...new Set(req)].slice(0, 50));
  await page.close();
}
await browser.close();