'use strict';

/**
 * Catalog policy v4.3 — ELIMFILTERS proprietary/OEM product authority.
 *
 * General rule, not SKU-specific:
 * when ELIMFILTERS is the manufacturer/owner of a product, the ELIMFILTERS SKU
 * may be its own canonical codigo_base. The row must explicitly prove internal
 * product identity and canonical source alignment:
 *
 *   identity_type = ELIMFILTERS_OEM_PRODUCT
 *   internal_product_identity_verified = true
 *   primary_manufacturer_verified = true
 *   approved_manufacturer = ELIMFILTERS
 *   approved_codigo_base = sku = codigo_base
 *   approved_source_column = INTERNAL_PRODUCT_IDENTITY
 *   canonical_source_brand = ELIMFILTERS
 *   canonical_source_code = sku
 *   canonical_source_status = VERIFIED
 *
 * This route is evaluated before external manufacturer authority chains, so a
 * proprietary ELIMFILTERS product does not need Donaldson/Fleetguard/Parker/
 * MANN/FRAM absence evidence.
 *
 * Dry-run by default. Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const MARKER = 'ELIMFILTERS_OEM_PRODUCT_AUTHORITY_V43';

function patchFunction(definition) {
  if (definition.includes(MARKER)) return definition;

  const anchor = "  IF duty_text = 'HEAVY_DUTY' THEN";
  const count = definition.split(anchor).length - 1;
  if (count !== 1) throw new Error(`HD_POLICY_ANCHOR_COUNT_${count}`);

  const block = `  -- ${MARKER}
  IF upper(coalesce(gov->>'identity_type', '')) = 'ELIMFILTERS_OEM_PRODUCT' THEN
    IF coalesce((gov->>'internal_product_identity_verified')::boolean, false) IS NOT TRUE
       OR coalesce((gov->>'primary_manufacturer_verified')::boolean, false) IS NOT TRUE
       OR approved_manufacturer <> 'ELIMFILTERS'
       OR approved_code_norm = ''
       OR approved_code_norm <> base_norm
       OR approved_source <> 'INTERNAL_PRODUCT_IDENTITY'
       OR upper(regexp_replace(coalesce(NEW.canonical_source_brand, ''), '[^A-Z0-9]', '', 'g')) <> 'ELIMFILTERS'
       OR upper(regexp_replace(coalesce(NEW.canonical_source_code, ''), '[^A-Z0-9]', '', 'g'))
          <> upper(regexp_replace(coalesce(NEW.sku, ''), '[^A-Z0-9]', '', 'g'))
       OR base_norm <> upper(regexp_replace(coalesce(NEW.sku, ''), '[^A-Z0-9]', '', 'g'))
    THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V43: invalid ELIMFILTERS OEM identity for SKU %', NEW.sku;
    END IF;

    RETURN NEW;
  END IF;

`;

  return definition.replace(anchor, block + anchor);
}

async function main() {
  const url =
    process.env.CATALOG_DATABASE_URL ||
    process.env.ELIMFILTERS_DATABASE_URL ||
    process.env.SEARCH_DB_URL ||
    process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');

  const local = /@(127\\.0\\.0\\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();

  const report = { mode: APPLY ? 'execute' : 'dry-run', marker: MARKER };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    await db.query("SET LOCAL lock_timeout = '5s'");
    await db.query("SET LOCAL statement_timeout = '30s'");

    const before = (
      await db.query(
        "SELECT pg_get_functiondef('public.enforce_elimfilters_codigo_base_policy()'::regprocedure) AS definition"
      )
    ).rows[0]?.definition;
    if (!before) throw new Error('CATALOG_POLICY_FUNCTION_MISSING');

    report.already_installed = before.includes(MARKER);
    const patched = patchFunction(before);
    await db.query(patched);

    const after = (
      await db.query(
        "SELECT pg_get_functiondef('public.enforce_elimfilters_codigo_base_policy()'::regprocedure) AS definition"
      )
    ).rows[0]?.definition || '';

    if (!after.includes(MARKER)) throw new Error('ELIMFILTERS_OEM_AUTHORITY_NOT_INSTALLED');
    if (!after.includes("approved_source <> 'INTERNAL_PRODUCT_IDENTITY'")) {
      throw new Error('INTERNAL_PRODUCT_IDENTITY_GUARD_MISSING');
    }
    if (!after.includes("approved_manufacturer <> 'ELIMFILTERS'")) {
      throw new Error('ELIMFILTERS_MANUFACTURER_GUARD_MISSING');
    }

    report.function_changed = before !== after;
    report.trigger_count = Number((
      await db.query(
        "SELECT count(*)::int AS n FROM pg_trigger WHERE tgrelid='public.elimfilters_catalog'::regclass AND tgname='trg_elimfilters_codigo_base_policy' AND NOT tgisinternal"
      )
    ).rows[0]?.n || 0);
    if (report.trigger_count !== 1) throw new Error(`EXPECTED_ONE_POLICY_TRIGGER_FOUND_${report.trigger_count}`);

    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    try { await db.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.stack || error);
    process.exit(1);
  });
}

module.exports = { MARKER, patchFunction, main };
