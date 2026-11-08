'use strict';

/**
 * Persists image_url (new R2 prefix-folder key on cdn.elimfilters.com) for catalogue SKUs that the temporary
 * edge worker (edge/et90010-tunnel-image-worker.js) used to supply, so the worker can be retired.
 * Only SKUs with an empty image_url are touched, and only image_url changes (asserted).
 * Dry-run by default (ROLLBACK). --execute commits. --snapshot <file> writes the before values.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const si = process.argv.indexOf('--snapshot');
const SNAPSHOT = si > 0 ? process.argv[si + 1] : null;
const MAP = require('./run_297_image_url_map.json'); // { SKU: "EA2/EA22580.png" }
const CDN = 'https://cdn.elimfilters.com/';

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', changed: [], skipped_already_has_url: [] };
  try {
    await db.query('BEGIN');
    const others = () => db.query(`SELECT md5(string_agg(md5((to_jsonb(e) - 'image_url')::text), '|' ORDER BY e.sku)) h FROM public.elimfilters_catalog e`).then((r) => r.rows[0].h);
    const h0 = await others();
    const snap = [];
    for (const [sku, key] of Object.entries(MAP)) {
      const row = (await db.query('SELECT sku,duty,catalog_active,image_url FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku])).rows[0];
      if (!row) continue;
      if (row.image_url) { report.skipped_already_has_url.push(sku); continue; }
      snap.push(row);
      await db.query('UPDATE public.elimfilters_catalog SET image_url=$2 WHERE sku=$1', [sku, CDN + encodeURI(key)]);
      report.changed.push({ sku, duty: row.duty, active: row.catalog_active, image_url: CDN + encodeURI(key) });
    }
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 1));
    if (await others() !== h0) throw new Error('OTHER_COLUMNS_CHANGED');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
