'use strict';

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');

const CANONICAL = {
  M131802: { sku: 'EA15551', codigo_base: 'AF25551', source_sku: 'EA121575', source_base: 'P821575' },
  M131803: { sku: 'EA12858', codigo_base: 'P822858' },
  AM107423: { sku: 'EL82015', codigo_base: 'P502015' },
  AM125424: { sku: 'EL82024', codigo_base: 'P502024' },
  AM116304: { sku: 'EF90094', codigo_base: 'P550094' },
};

function norm(v) { return String(v || '').replace(/[^A-Z0-9]/gi, '').toUpperCase(); }

function removeCode(arr, code) {
  const n = norm(code);
  return (Array.isArray(arr) ? arr : []).filter((x) => norm(x && x.code) !== n);
}

function ensureRef(arr, manufacturer, code) {
  const out = Array.isArray(arr) ? [...arr] : [];
  const n = norm(code);
  if (!out.some((x) => norm(x && x.code) === n)) out.push({ manufacturer, code });
  return out;
}

async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const db = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await db.connect();

  const report = { mode: APPLY ? 'execute' : 'dry-run', remap: null, cleaned: {}, verified: {} };

  try {
    await db.query('BEGIN');

    // 1) M131802: existing legacy P821575 identity must move to Fleetguard collision fallback SKU.
    const src = (await db.query("SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE", [CANONICAL.M131802.source_sku])).rows[0];
    if (!src || src.codigo_base !== CANONICAL.M131802.source_base) throw new Error('M131802_SOURCE_IDENTITY_MISMATCH');
    const target = (await db.query("SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1", [CANONICAL.M131802.sku])).rows[0];
    if (target) throw new Error('M131802_TARGET_SKU_OCCUPIED:' + target.codigo_base);
    const naturalDonaldson = (await db.query("SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku='EA11575'")).rows[0];
    if (!naturalDonaldson || norm(naturalDonaldson.codigo_base) === norm('P821575')) throw new Error('M131802_DONALDSON_COLLISION_NOT_PROVEN');

    // AF25551 becomes codigo_base, so it must not also remain in alternates.
    // The verified Fleetguard authority is retained in codigo_base_governance metadata.
    const competitor = removeCode(src.competitor_codes, 'AF25551');
    const oem = ensureRef(removeCode(src.oem_codes, 'M131802'), 'JOHN-DEERE', 'M131802');
    const competitorNoJohnDeere = removeCode(competitor, 'M131802');
    const enrichment = { ...(src.enrichment_data || {}) };
    enrichment.codigo_base_governance = {
      ...(enrichment.codigo_base_governance || {}),
      policy_version: '2026-10-06-v4.2',
      primary_manufacturer_verified: true,
      donaldson_sku_collision_verified: true,
      collision_donaldson_code: 'P821575',
      fallback_manufacturer_verified: true,
      fallback_commercial_code_verified: true,
      approved_manufacturer: 'FLEETGUARD',
      approved_codigo_base: 'AF25551',
      approved_source_column: 'COMPETITOR_CODES',
    };

    await db.query(
      "UPDATE public.elimfilters_catalog SET sku=$1,codigo_base=$2,oem_codes=$3::jsonb,competitor_codes=$4::jsonb,enrichment_data=$5::jsonb WHERE sku=$6",
      [CANONICAL.M131802.sku, CANONICAL.M131802.codigo_base, JSON.stringify(oem), JSON.stringify(competitorNoJohnDeere), JSON.stringify(enrichment), CANONICAL.M131802.source_sku]
    );
    report.remap = { from: CANONICAL.M131802.source_sku, to: CANONICAL.M131802.sku, codigo_base: CANONICAL.M131802.codigo_base };

    // 2) Normalize exact John Deere references so Part Search resolves to one canonical row.
    for (const [code, wanted] of Object.entries(CANONICAL)) {
      const rows = (await db.query(
        "SELECT sku,oem_codes,competitor_codes FROM public.elimfilters_catalog WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb) || COALESCE(competitor_codes,'[]'::jsonb)) x WHERE upper(regexp_replace(coalesce(x->>'code',''),'[^A-Z0-9]','','g'))=$1) FOR UPDATE",
        [norm(code)]
      )).rows;

      let touched = 0;
      for (const row of rows) {
        if (row.sku === wanted.sku) continue;
        const nextOem = removeCode(row.oem_codes, code);
        const nextComp = removeCode(row.competitor_codes, code);
        if (JSON.stringify(nextOem) !== JSON.stringify(row.oem_codes || []) || JSON.stringify(nextComp) !== JSON.stringify(row.competitor_codes || [])) {
          await db.query("UPDATE public.elimfilters_catalog SET oem_codes=$1::jsonb,competitor_codes=$2::jsonb WHERE sku=$3", [JSON.stringify(nextOem), JSON.stringify(nextComp), row.sku]);
          touched++;
        }
      }

      const canonicalRow = (await db.query("SELECT sku,codigo_base,oem_codes,competitor_codes,canonical_source_brand,canonical_source_code FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE", [wanted.sku])).rows[0];
      if (!canonicalRow || norm(canonicalRow.codigo_base) !== norm(wanted.codigo_base)) throw new Error(code + '_CANONICAL_ROW_MISMATCH');

      const nextOem = ensureRef(removeCode(canonicalRow.oem_codes, code), 'JOHN-DEERE', code);
      const nextComp = removeCode(canonicalRow.competitor_codes, code);
      await db.query("UPDATE public.elimfilters_catalog SET oem_codes=$1::jsonb,competitor_codes=$2::jsonb WHERE sku=$3", [JSON.stringify(nextOem), JSON.stringify(nextComp), wanted.sku]);
      report.cleaned[code] = touched;
    }

    // 3) Verify unique exact resolution for the canonical John Deere references.
    for (const [code, wanted] of Object.entries(CANONICAL)) {
      const rows = (await db.query(
        "SELECT DISTINCT c.sku,c.codigo_base FROM public.elimfilters_catalog c CROSS JOIN LATERAL jsonb_array_elements(COALESCE(c.oem_codes,'[]'::jsonb) || COALESCE(c.competitor_codes,'[]'::jsonb)) x WHERE upper(regexp_replace(coalesce(x->>'code',''),'[^A-Z0-9]','','g'))=$1 ORDER BY c.sku",
        [norm(code)]
      )).rows;
      report.verified[code] = rows;
      if (rows.length !== 1 || rows[0].sku !== wanted.sku) throw new Error(code + '_NOT_UNIQUE_AFTER_CLEANUP');
    }

    if (APPLY) {
      await db.query('COMMIT');
      report.transaction = 'COMMIT';
    } else {
      await db.query('ROLLBACK');
      report.transaction = 'ROLLBACK';
    }

    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
}

main().catch((e) => { console.error(e.stack || e); process.exit(1); });
