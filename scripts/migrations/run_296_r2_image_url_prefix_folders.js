'use strict';

/**
 * R2 bucket elimfilters-renders was reorganised into prefix folders (EA1/EA11038.png).
 * Rewrites the catalog URLs that still point to the old keys (fleetguard/page-1/01-20/...)
 * to the new clean key. Only image_url and the URL strings inside enrichment_data change (asserted).
 * Dry-run by default (ROLLBACK). --execute commits. --snapshot <file> writes the before values.
 */
require('dotenv').config();
const { Client } = require('pg');
const MAP = require('./run_296_r2_image_url_remap.json');

const APPLY = process.argv.includes('--execute');
const si = process.argv.indexOf('--snapshot');
const SNAPSHOT = si > 0 ? process.argv[si + 1] : null;
const forms = (k) => [k, encodeURI(k), k.split('/').map(encodeURIComponent).join('/')];
const BASES = ['https://cdn.elimfilters.com/', 'https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/'];
// Plain split/join (no regex): every old key is a full file name, so a hit is never a prefix of another key.
const rewrite = (text, stats) => {
  let out = text;
  for (const [oldKey, newKey] of Object.entries(MAP)) {
    if (!newKey) continue;
    for (const base of BASES) {
      for (const f of new Set(forms(oldKey))) {
        const parts = out.split(base + f);
        if (parts.length > 1) { stats.n += parts.length - 1; out = parts.join(base + encodeURI(newKey)); }
      }
    }
  }
  return out;
};

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', rows_changed: 0, urls_rewritten: 0, by_duty: {}, unmapped_left: [] };
  const snap = [];
  try {
    await db.query('BEGIN');
    const others = () => db.query(`SELECT md5(string_agg(md5(c::text), '|' ORDER BY c.sku)) h FROM (SELECT sku, (to_jsonb(e) - 'image_url' - 'enrichment_data') AS c FROM public.elimfilters_catalog e) c`).then((r) => r.rows[0].h);
    const h0 = await others();
    const rows = (await db.query(`SELECT sku,duty,image_url,enrichment_data FROM public.elimfilters_catalog
      WHERE image_url ~* 'r2[.]dev|cdn[.]elimfilters[.]com' OR enrichment_data::text ~* 'r2[.]dev|cdn[.]elimfilters[.]com' ORDER BY sku FOR UPDATE`)).rows;
    for (const r of rows) {
      const st = { n: 0 };
      const img = r.image_url ? rewrite(r.image_url, st) : r.image_url;
      const ed = rewrite(JSON.stringify(r.enrichment_data || {}), st);
      if (!st.n) continue;
      JSON.parse(ed);
      snap.push({ sku: r.sku, image_url: r.image_url, enrichment_data: r.enrichment_data });
      await db.query('UPDATE public.elimfilters_catalog SET image_url=$2, enrichment_data=$3::jsonb WHERE sku=$1', [r.sku, img, ed]);
      report.rows_changed += 1; report.urls_rewritten += st.n;
      report.by_duty[r.duty] = (report.by_duty[r.duty] || 0) + 1;
    }
    const left = (await db.query(`SELECT sku,image_url FROM public.elimfilters_catalog WHERE image_url ~* '(r2[.]dev|cdn[.]elimfilters[.]com)/fleetguard/'`)).rows;
    report.unmapped_left = left.map((x) => x.sku + ' ' + x.image_url);
    if (SNAPSHOT) require('fs').writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 1));
    if (await others() !== h0) throw new Error('OTHER_COLUMNS_CHANGED');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
