'use strict';
// Notify IndexNow (Bing, Yandex, Naver, Seznam; Google does not use it) of recently certified SKU pages.
// Dry-run by default (prints the URLs). Usage: node scripts/indexnow-submit.js [--hours 24 | --all] [--execute]
require('dotenv').config({ quiet: true });
const { Client } = require('pg');
const { INDEXNOW_KEY, MAIN_SITE_SKUS } =require('../lib/install-part-seo-pages');

const HOST = 'part-search.elimfilters.com';
const args = process.argv.slice(2);
const execute = args.includes('--execute');
const all = args.includes('--all');
const hours = Number(args[args.indexOf('--hours') + 1]) || 24;

(async () => {
  const db = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await db.connect();
  try {
    const { rows } = await db.query(
      `SELECT e.sku FROM elimfilters_catalog e
         JOIN catalog_sku_certification c ON c.sku = e.sku AND c.certification_state = 'CERTIFIED'
        WHERE e.catalog_active IS TRUE AND e.canonical_source_status = 'VERIFIED'
          AND ($1::boolean OR c.certified_at >= now() - ($2 || ' hours')::interval)
        ORDER BY e.sku`,
      [all, String(hours)]
    );
    const urlList = rows.filter(({ sku }) => !MAIN_SITE_SKUS.has(String(sku).toUpperCase())).map(({ sku }) => `https://${HOST}/part/${encodeURIComponent(String(sku).toUpperCase())}/`);
    console.log(JSON.stringify({ mode: execute ? 'execute' : 'dry-run', urls: urlList.length, sample: urlList.slice(0, 3) }));
    if (!execute || !urlList.length) return;
    for (let i = 0; i < urlList.length; i += 10000) {
      const res = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`, urlList: urlList.slice(i, i + 10000) }),
      });
      console.log('IndexNow batch', i / 10000 + 1, 'HTTP', res.status);
    }
  } finally {
    await db.end();
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
