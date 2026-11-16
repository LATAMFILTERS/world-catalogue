'use strict';

/**
 * WG9725190102 (Sinotruk) resolved to two products with equal priority (EA10894 and EA15977). Operator ruling 2026-11-16: the correct one is
 * EA15977. EA10894 loses the SINOTRUK WG9725190102 OEM entry. Operator ruling 2026-11-16 ("fleetguard no lo fabrica"): Fleetguard absence is recorded in the
 * governance of EA10894 (it was missing and blocked every patch of the row); nothing else changes. Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const FROM = 'EA10894';
const CODE = 'WG9725190102';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [FROM])).rows[0];
    if (!row) throw new Error('SKU_NOT_FOUND');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row, row_sha256: sha(row) }, null, 2));
    const oem = (row.oem_codes || []).filter((x) => norm(x.code) !== norm(CODE));
    const comp = (row.competitor_codes || []).filter((x) => norm(x.code) !== norm(CODE));
    report.removed = (row.oem_codes || []).length - oem.length + (row.competitor_codes || []).length - comp.length;
    if (!report.removed) throw new Error('CODE_NOT_ON_ROW');
    const enrichment = { ...(row.enrichment_data || {}) };
    enrichment.codigo_base_governance = { ...enrichment.codigo_base_governance, fleetguard_absence_verified: true,
      fleetguard_absence_note: 'ELIMFILTERS operator ruling 2026-11-16: Fleetguard does not make this element (not independently checked).' };
    assertGovernedCatalogPatch(row, { oem_codes: oem, competitor_codes: comp, enrichment_data: enrichment }, { validateApplications: false });
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb, enrichment_data=$4::jsonb WHERE sku=$1', [FROM, JSON.stringify(oem), JSON.stringify(comp), JSON.stringify(enrichment)]);
    await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=$2`, [FROM, norm(CODE)]);
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [FROM]);
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)`, [CODE])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
