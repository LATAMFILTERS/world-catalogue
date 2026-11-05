'use strict';

/**
 * Donaldson recapture 2026-11-05 (shop.donaldson.com, ELIMSERVER Chrome): these codigo_base codes are discontinued or no
 * longer listed by Donaldson, with no replacement. Operator ruling (Victor, 2026-11-04): the SKUs stay ACTIVE in
 * ELIMFILTERS (equipment still uses them; other manufacturers such as Fleetguard may still make them). Only a status
 * flag is recorded in enrichment_data.codigo_base_source_status; nothing else changes.
 * Dry-run by default (ROLLBACK). --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const ROWS = [
  ['EA17283', 'P607283', 'DISCONTINUED'], ['EF92000', 'P552000', 'DISCONTINUED'], ['EH64524', 'P174524', 'DISCONTINUED'],
  ['ES90352', 'P550352', 'DISCONTINUED'], ['EL82352', 'P502352', 'NOT_LISTED'], ['EL84560', 'DBL4560', 'NOT_LISTED'],
  ['ES90990', 'P550990', 'NOT_LISTED'], ['EW71309', 'P551309', 'NOT_LISTED'],
];

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  try {
    await db.query('BEGIN');
    const done = [];
    for (const [sku, base, status] of ROWS) {
      const flag = { manufacturer: 'DONALDSON', code: base, status, checked_at: '2026-11-05', source: 'shop.donaldson.com search (ELIMSERVER Chrome recapture)',
        elimfilters_decision: 'KEEP_ACTIVE (operator 2026-11-04: equipment still uses it)', migration: 'run_297' };
      const u = await db.query(`UPDATE public.elimfilters_catalog SET enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{codigo_base_source_status}',$3::jsonb)
        WHERE sku=$1 AND codigo_base=$2 AND catalog_active RETURNING sku`, [sku, base, JSON.stringify(flag)]);
      if (u.rowCount !== 1) throw new Error('STATE_CHANGED ' + sku);
      done.push(`${sku} ${base} ${status}`);
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode: APPLY ? 'execute' : 'dry-run', flagged: done, transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
