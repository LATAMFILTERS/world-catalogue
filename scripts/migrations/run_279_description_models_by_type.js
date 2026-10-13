'use strict';

/**
 * Operator rule 2026-10-13: one description model per Type (and form), given
 * by the operator; no SKU without description; add the technology name where
 * the model omitted it.
 *
 * Replaces every description whose Type has a model, which also removes the
 * 4,980 Light Duty descriptions that were manufacturer marketing copy
 * ("About this item" / "Über dieses Produkt") and fills the 1,499 empty ones.
 *
 * Departures from the operator's wording, all to satisfy the operator's own
 * rules of the same day (no third-party names / technologies / brands; the
 * only media wording is GENUINE FILTER MEDIA) and the repository hard rules
 * (no invented legal facts):
 *   - removed third-party trade names and part numbers: OptiAir, DCA4,
 *     ES Compleat, HF35296
 *   - removed "patented" (3 places) and the "control valve" feature it
 *     qualified: no patent or per-product evidence is on record
 *   - removed "is the first aftermarket replacement available on the market today"
 *   - "Genuine media" / "proven media technology" / "SYNTEPORE high-performance
 *     filtration media" -> GENUINE FILTER MEDIA; fuel/water separators carry
 *     HYDROCORE™, never SYNTAPORE™ (scope guardrail)
 *   - air dryer prefix is ED4 (the model said EW7); brand written ELIMFILTERS®
 *
 * Turbine (ET9 TURBOCORE) and Transmission have no model: left unchanged.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 * --self-check runs the builder assertions only.
 */

const { publicFilterType } = require('../../lib/public-filter-type');

const MEDIA = 'GENUINE FILTER MEDIA';
const B = 'ELIMFILTERS®';

function describe(row) {
  const type = publicFilterType(row);
  const sub = String(row.sub_type || '');
  const role = (sub.match(/^(Primary|Secondary)/) || [''])[0];
  const form = sub.replace(/^(Primary|Secondary)\s*/, '');
  const low = (s) => s.toLowerCase().replace('spin on', 'spin-on').replace('in line', 'in-line');
  const s = `${B} ${row.sku}`;
  switch (type) {
    case 'Air': {
      const what = [low(form), low(role)].filter(Boolean).join(' ');
      return `${s} MACROCORE™${what ? `, ${what}` : ''} air element is designed to meet the rugged demands of equipment operating in the harshest environments. The MACROCORE™ offers unique features that provide significant benefits for longer service life and optimum performance when the job demands it.`;
    }
    case 'Cabin':
      return `${s} MICROKAPPA™ ${form ? `${low(form)} ` : ''}cabin air filter provides clean air in the cab which means a clean work environment. Breathing cleaner air can lead to longer and more productive working hours.`;
    case 'Lube':
      return form === 'Cartridge'
        ? `${s} SYNTRAX™ premium cartridge oil filter is environmentally friendly and features technology advances to achieve the high flow rates required by today’s modern engine designs.`
        : `${s} SYNTRAX™ high-performance lube filter is designed to protect engines from harmful contaminants while supporting efficient oil flow and reliable engine performance.`;
    case 'Hydraulic': {
      const what = form === 'Spin On' ? `premium spin-on filter with ${MEDIA}` : form === 'Cartridge' ? 'cartridge filter' : 'filter';
      return `${s} NANOFORCE™ hydraulic ${what} is designed to help keep your precision hydraulic systems running as intended, providing a solution for various applications. This filter meets or exceeds the equipment OEM quality and performance, bringing your operation top-quality performance and an overall unbeatable total cost of ownership.`;
    }
    case 'Coolant':
      return `${s} THERMACORE™ chemical water filters are designed to provide supplemental coolant additives (SCAs) to keep the cooling system fully protected, while also providing cooling system filtration.`;
    case 'Fuel':
      return form === 'Cartridge'
        ? `${s} SYNTAPORE™ fuel filter cartridge reduces contamination, trapping dirt particles and preventing them from reaching the moving parts in your engine supporting longer service intervals.`
        : `${s} SYNTAPORE™ ${form === 'Spin On' ? 'spin-on ' : ''}fuel filter delivers superior performance using ${MEDIA}, removing harmful contaminants. ${B} fuel filters ensure optimal fuel system protection to meet or exceed OEM specifications.`;
    case 'Fuel Separator':
      return form === 'Cartridge'
        ? `${s} HYDROCORE™ fuel/water separator cartridge safeguards vital fuel system components with advanced filtration technology for maximum filter utilization. Advanced multi-layer filtration removes harmful contaminants to protect fuel systems. Helps improve engine performance and reduce wear by delivering cleaner fuel. High-capacity design supports longer maintenance cycles and helps reduce downtime. Designed to meet OE manufacturer specifications.`
        : `${s} HYDROCORE™ premium ${form === 'Spin On' ? 'spin-on ' : ''}fuel/water separator uses ${MEDIA} to capture harmful particles, protect fuel injectors and support cleaner fuel system performance.`;
    case 'Air Dryer':
      return `${s} DRYCORE™ air dryer delivers on protection to filter out water vapor, oil vapor, and other contaminants before they can reach the air tanks and valves ensuring optimal uptime. Trust your compressed air systems with superior guarded protection.`;
    case 'Intake':
      return `${s} has revolutionized air filtration design with the introduction of its ${B} INTEKCORE™ technology. To fit shrinking engine compartments, it has a reduced system size. The two-stage air housing design extends filter life and lowers restriction to deliver maximum engine performance. Higher dust holding capacity allows for longer service intervals and lower maintenance costs.`;
    default:
      return null; // Turbine, Transmission, unknown prefix: no operator model
  }
}

function selfCheck() {
  const assert = require('node:assert/strict');
  const d = (sku, filter_type, sub_type, technology) => describe({ sku, filter_type, sub_type, technology });
  assert.match(d('EA10043', 'air', 'Primary Radial Seal'), /^ELIMFILTERS® EA10043 MACROCORE™, radial seal primary air element is designed/);
  assert.match(d('EA30001', 'air', null), /^ELIMFILTERS® EA30001 MACROCORE™ air element is designed/);
  assert.match(d('EC10001', 'cabin', 'Panel'), /MICROKAPPA™ panel cabin air filter provides/);
  assert.match(d('EL80001', 'oil', 'Cartridge'), /premium cartridge oil filter/);
  assert.match(d('EL80001', 'oil', 'Spin On'), /high-performance lube filter/);
  assert.match(d('EH60416', 'hydraulic', 'Spin On'), /NANOFORCE™ hydraulic premium spin-on filter with GENUINE FILTER MEDIA is designed/);
  assert.match(d('ES91855', 'water', 'Spin On', 'HYDROCORE™'), /HYDROCORE™ premium spin-on fuel\/water separator uses GENUINE FILTER MEDIA/);
  assert.match(d('ED40001', 'air', null), /DRYCORE™ air dryer/);
  assert.equal(d('ET91000', 'fuel', null, 'TURBOCORE™'), null);
  assert.equal(d('EH68277', 'transmission', 'Cartridge'), null);
  for (const t of [['EA10043', 'air', 'Primary Radial Seal'], ['EA20001', 'air', 'Housing'], ['EW70001', 'other', null],
    ['ES90001', 'water', 'Cartridge'], ['EF90001', 'fuel', 'Spin On'], ['EF90001', 'fuel', 'Cartridge'], ['EH60001', 'hydraulic', 'Cartridge']]) {
    assert.doesNotMatch(d(...t), /patent|OptiAir|DCA4|Compleat|HF35296|first aftermarket|SYNTEPORE|undefined|null| {2}/i);
  }
  console.log('self-check ok');
}

if (process.argv.includes('--self-check')) { selfCheck(); process.exit(0); }

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const BANNED = 'synthetic|cellulose|fleetguard|donaldson|mann|fram\\M|patent|optiair|dca4|compleat|^About this item|ber dieses Produkt';

(async () => {
  selfCheck();
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', by_type: {}, no_model: {} };

  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT sku, filter_type, sub_type, technology FROM public.elimfilters_catalog')).rows;
    const skus = [], texts = [];
    for (const r of rows) {
      const t = publicFilterType(r) || '(unknown)';
      const text = describe(r);
      if (text) { skus.push(r.sku); texts.push(text); report.by_type[t] = (report.by_type[t] || 0) + 1; }
      else report.no_model[t] = (report.no_model[t] || 0) + 1;
    }
    report.updated = (await db.query(
      `UPDATE public.elimfilters_catalog c SET description = d.text
       FROM unnest($1::text[], $2::text[]) AS d(sku, text)
       WHERE c.sku = d.sku AND c.description IS DISTINCT FROM d.text`, [skus, texts])).rowCount;
    const one = async (sql, p) => (await db.query(sql, p)).rows[0].n;
    report.active_without_description = await one(
      `SELECT count(*)::int AS n FROM public.elimfilters_catalog WHERE catalog_active AND coalesce(description, '') = ''`);
    report.banned_words_left = await one(
      `SELECT count(*)::int AS n FROM public.elimfilters_catalog WHERE description ~* $1`, [BANNED]);
    report.banned_sample = (await db.query(
      `SELECT sku, left(description, 140) AS description FROM public.elimfilters_catalog WHERE description ~* $1 ORDER BY sku LIMIT 10`, [BANNED])).rows;
    report.sample = (await db.query(
      `SELECT sku, description FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku`,
      [['EA10043', 'EA200003', 'EC19446', 'EL82016', 'EH60416', 'EW70712', 'EF95507', 'ES91855', 'ED47815', 'EA36144']])).rows;
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
