'use strict';
const { chromium } = require('patchright');
const url = 'https://www.fleetguard.com/es/category/productos/filtraci%C3%B3n-de-combustible/procesadores-de-combustible/0ZGPL0000000FSi4AM';
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ locale: 'es-ES', viewport: { width: 1440, height: 1200 } });
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(18000);
  console.log('URL', p.url());
  console.log('BODY', (await p.locator('body').innerText()).slice(0, 5000));
  const anchors = await p.locator('a').evaluateAll(xs => xs.map(a => ({text:(a.innerText||'').trim().slice(0,120), href:a.getAttribute('href'), aria:a.getAttribute('aria-label')})).filter(x=>x.text||x.href));
  console.log('ANCHORS', JSON.stringify(anchors.slice(0,150), null, 2));
  const buttons = await p.locator('button').evaluateAll(xs => xs.map(a => ({text:(a.innerText||'').trim().slice(0,120), aria:a.getAttribute('aria-label'), title:a.getAttribute('title'), disabled:a.disabled})).filter(x=>x.text||x.aria||x.title));
  console.log('BUTTONS', JSON.stringify(buttons.slice(0,150), null, 2));
  await b.close();
})().catch(e => { console.error(e.stack || e); process.exit(1); });
