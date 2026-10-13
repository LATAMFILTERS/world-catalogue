'use strict';

/**
 * Operator rule 2026-10-13: no Cellulose, Synthetic, Donaldson or Fleetguard
 * in customer text; the only media wording is GENUINE FILTER MEDIA.
 *
 * 3,077 descriptions still carry those words:
 *   - 2,361 hydraulic template: "NANOFORCE™ electrostatic synthetic media captures ..."
 *   -   621 lube template:      "SYNTRAX™ synthetic media traps ..."
 *   -    86 ET9 housings:       "... Canonical source: Fleetguard FH23904."
 *   -     8 individually worded descriptions (EDITS below)
 * The Fleetguard / Donaldson codes stay in codigo_base and the reference
 * lists; only the public sentence goes. Nothing else in a text changes.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const MEDIA = 'GENUINE FILTER MEDIA';
const BANNED = 'synthetic|cellulose|fleetguard|donaldson';

// [sku, text to find, replacement] applied in order; a miss is reported, not forced.
const EDITS = [
  ['EF33802', 'multi-layered synthetic micro-glass filtration media', MEDIA],
  ['EF91316', ' Cellulose media.', ''],
  ['EH64378', ' Donaldson P164378 equivalent; P164378 supersedes discontinued Donaldson P170950.', ''],
  ['EH66235', ' hydraulic DT cartridge filter. Canonical Donaldson reference P566235. Synthetic media, Beta', ' hydraulic cartridge filter. Beta'],
  ['EH66502', ' hydraulic DT cartridge filter. Canonical Donaldson reference P566502. Synthetic media, Beta', ' hydraulic cartridge filter. Beta'],
  ['EH68277', ' Canonical Donaldson reference P166254 with official Fleetguard HF8277 cross-reference. Synthetic media, Beta', ' Beta'],
  ['EL33614', 'synthetic-reinforced media', MEDIA],
  ['ES91026', ' spin-on with Twist&Drain drain. Donaldson P551026 equivalent.', ' spin-on with drain.'],
];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', edits_missed: [] };
  const count = async (re) => (await db.query(
    `SELECT count(*)::int AS n FROM public.elimfilters_catalog WHERE description ~* $1`, [re])).rows[0].n;

  try {
    await db.query('BEGIN');
    report.before = await count(BANNED);
    report.hydraulic_template = (await db.query(
      `UPDATE public.elimfilters_catalog
       SET description = replace(description, 'electrostatic synthetic media', $1)
       WHERE description LIKE '%NANOFORCE% electrostatic synthetic media %'`, [MEDIA])).rowCount;
    report.lube_template = (await db.query(
      `UPDATE public.elimfilters_catalog
       SET description = regexp_replace(description, '(SYNTRAX\\S*) synthetic media traps', '\\1 ' || $1 || ' traps')
       WHERE description ~ 'SYNTRAX\\S* synthetic media traps'`, [MEDIA])).rowCount;
    report.fleetguard_source_sentence = (await db.query(
      `UPDATE public.elimfilters_catalog
       SET description = regexp_replace(description, ' Canonical source: Fleetguard [0-9A-Z]+\\.', '')
       WHERE description ~ ' Canonical source: Fleetguard [0-9A-Z]+\\.'`)).rowCount;
    report.single_edits = 0;
    for (const [sku, from, to] of EDITS) {
      const u = await db.query(
        `UPDATE public.elimfilters_catalog SET description = replace(description, $2, $3)
         WHERE sku = $1 AND position($2 in description) > 0`, [sku, from, to]);
      if (u.rowCount === 1) report.single_edits += 1; else report.edits_missed.push(sku);
    }
    report.after = await count(BANNED);
    report.remaining = (await db.query(
      `SELECT sku, left(description, 160) AS description FROM public.elimfilters_catalog WHERE description ~* $1 ORDER BY sku LIMIT 20`,
      [BANNED])).rows;
    report.sample = (await db.query(
      `SELECT sku, description FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku`,
      [['EH60416', 'EL82016', 'ET93904', ...EDITS.map((e) => e[0])]])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
