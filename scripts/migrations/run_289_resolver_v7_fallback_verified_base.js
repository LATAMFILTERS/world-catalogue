'use strict';

/**
 * v_api_resolver_v7 returns a codigo_base only when its governance is
 * CANONICAL_VERIFIED and primary_manufacturer_verified is true. A base verified
 * through VERIFIED_AFTERMARKET_FALLBACK (Fleetguard, Racor, Parker when Donaldson
 * does not make the part) has primary_manufacturer_verified=false by design, so
 * the resolver never returns it and the HD certification ledger blocks the
 * product with BASE_CODE_NOT_UNIQUELY_RESOLVED (120 active HD products on
 * 2026-11-06, all with no other blocker).
 *
 * Change: in catalog_base_raw, an ACTIVE product whose governance authority is
 * VERIFIED_AFTERMARKET_FALLBACK counts as manufacturer-verified for the base
 * branch. The base must still be CANONICAL_VERIFIED and unique, the canonical LD
 * identities still win, and nothing else in the view changes.
 *
 * The view text is read from the database and patched in place; each anchor must
 * match exactly once. Dry-run by default (TEMP view + ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const VIEW = 'public.v_api_resolver_v7';

const ANCHOR_RAW = `COALESCE(((c.enrichment_data -> 'codigo_base_governance'::text) ->> 'primary_manufacturer_verified'::text)::boolean, false) AS manufacturer_verified`;
const NEW_RAW = `(COALESCE(((c.enrichment_data -> 'codigo_base_governance'::text) ->> 'primary_manufacturer_verified'::text)::boolean, false) OR (c.catalog_active AND ((c.enrichment_data -> 'codigo_base_governance'::text) ->> 'required_authority'::text) = 'VERIFIED_AFTERMARKET_FALLBACK'::text)) AS manufacturer_verified`;

function patch(def) {
  if (def.split(ANCHOR_RAW).length !== 2) throw new Error('ANCHOR_NOT_UNIQUE');
  return def.replace(ANCHOR_RAW, NEW_RAW);
}

if (process.argv.includes('--self-check')) {
  const out = patch(`x ${ANCHOR_RAW} y`);
  if (!out.includes('VERIFIED_AFTERMARKET_FALLBACK') || out.includes(` ${ANCHOR_RAW} y`)) throw new Error('SELF_CHECK_FAILED');
  let threw = false;
  try { patch('nothing'); } catch (_) { threw = true; }
  if (!threw) throw new Error('SELF_CHECK_FAILED_NO_ANCHOR');
  console.log('self-check ok');
  return;
}

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  // Dry-run builds the patched view as a TEMP view so the production view is never locked or replaced.
  const target = APPLY ? VIEW : 'pg_temp.v7_patched';
  const snapshot = (v) => db.query(`
    SELECT ld_catalog.norm_part(code) AS k, count(DISTINCT sku)::int AS n, min(sku)::text AS only_sku
    FROM ${v} GROUP BY 1`).then((r) => new Map(r.rows.map((x) => [x.k, x])));
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const def = (await db.query(`SELECT pg_get_viewdef('${VIEW}'::regclass, true) AS d`)).rows[0].d;
    const before = await snapshot(VIEW);
    await db.query(`${APPLY ? 'CREATE OR REPLACE VIEW' : 'CREATE TEMP VIEW'} ${target} AS ${patch(def).replace(/;\s*$/, '')}`);
    const after = await snapshot(target);
    const changed = [];
    for (const [k, v] of after) {
      const b = before.get(k);
      if (!b || b.n !== v.n || b.only_sku !== v.only_sku) changed.push({ code: k, sku: v.only_sku, n: v.n, was: b ? b.n : 0 });
    }
    for (const k of before.keys()) if (!after.has(k)) changed.push({ code: k, removed: true });
    report.codes_changed = changed.length;
    report.codes_removed = changed.filter((c) => c.removed).length;
    report.new_unique_codes = changed.filter((c) => !c.removed && c.n === 1 && c.was === 0).length;
    report.became_ambiguous = changed.filter((c) => !c.removed && c.n > 1).length;
    const own = await db.query(`
      SELECT count(*)::int AS n FROM public.elimfilters_catalog e
      JOIN (SELECT ld_catalog.norm_part(code) AS k, count(DISTINCT sku) AS n, min(sku) AS s FROM ${target} GROUP BY 1) r
        ON r.k = ld_catalog.norm_part(e.codigo_base) AND r.n = 1 AND r.s = e.sku
      WHERE e.duty = 'HEAVY_DUTY' AND e.catalog_active
        AND e.enrichment_data->'codigo_base_governance'->>'required_authority' = 'VERIFIED_AFTERMARKET_FALLBACK'`);
    report.fallback_products_resolving_to_themselves = own.rows[0].n;
    report.retargeted = changed.filter((c) => !c.removed && c.was > 0).map((c) => ({ code: c.code, now: c.sku, was_n: c.was, was_sku: before.get(c.code).only_sku }));
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
