'use strict';
const { chromium } = require('patchright');
const url = 'https://www.fleetguard.com/es/category/productos/filtraci%C3%B3n-de-combustible/procesadores-de-combustible/0ZGPL0000000FSi4AM';
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ locale: 'es-ES', viewport: { width: 1440, height: 1200 } });
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(18000);
  for (const needle of [/Página 1 de 18/i, /^FH23029$/i]) {
    const loc = p.getByText(needle, { exact: false }).first();
    console.log('MATCH', String(needle), 'count=', await loc.count());
    if (await loc.count()) {
      console.log(await loc.evaluate(el => {
        let out = ''; let n = el;
        for (let i=0; n && i<6; i++, n=n.parentElement) out += `\n---LEVEL ${i}---\n${n.outerHTML.slice(0,8000)}`;
        return out;
      }));
    }
  }
  const all = await p.locator('[aria-label],[title]').evaluateAll(xs => xs.map(x => ({tag:x.tagName, aria:x.getAttribute('aria-label'), title:x.getAttribute('title'), text:(x.innerText||'').trim()})).filter(x => /siguiente|next|pagina|page/i.test(`${x.aria} ${x.title} ${x.text}`)));
  console.log('PAGER CANDIDATES', JSON.stringify(all, null, 2));
  await b.close();
})().catch(e => { console.error(e.stack||e); process.exit(1); });
