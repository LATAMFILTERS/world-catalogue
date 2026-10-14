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

  const hdMatches = [...definition.matchAll(/^(\s*)IF duty_text = 'HEAVY_DUTY' THEN$/gm)];
  if (hdMatches.length !== 1) throw new Error(`HD_POLICY_ANCHOR_COUNT_${hdMatches.length}`);

  const indent = hdMatches[0][1];
  const anchor = hdMatches[0][0];
  const i = indent;
  const block = [
    `${i}-- ${MARKER}`,
    `${i}IF upper(coalesce(gov->>'identity_type', '')) = 'ELIMFILTERS_OEM_PRODUCT' THEN`,
    `${i}  IF coalesce((gov->>'internal_product_identity_verified')::boolean, false) IS NOT TRUE`,
    `${i}     OR coalesce((gov->>'primary_manufacturer_verified')::boolean, false) IS NOT TRUE`,
    `${i}     OR approved_manufacturer <> 'ELIMFILTERS'`,
    `${i}     OR approved_code_norm = ''`,
    `${i}     OR approved_code_norm <> base_norm`,
    `${i}     OR approved_source <> 'INTERNAL_PRODUCT_IDENTITY'`,
    `${i}     OR upper(regexp_replace(coalesce(NEW.canonical_source_brand, ''), '[^A-Z0-9]', '', 'g')) <> 'ELIMFILTERS'`,
    `${i}     OR upper(regexp_replace(coalesce(NEW.canonical_source_code, ''), '[^A-Z0-9]', '', 'g'))`,
    `${i}        <> upper(regexp_replace(coalesce(NEW.sku, ''), '[^A-Z0-9]', '', 'g'))`,
    `${i}     OR base_norm <> upper(regexp_replace(coalesce(NEW.sku, ''), '[^A-Z0-9]', '', 'g'))`,
    `${i}  THEN`,
    `${i}    RAISE EXCEPTION 'CATALOG_POLICY_V43: invalid ELIMFILTERS OEM identity for SKU %', NEW.sku;`,
    `${i}  END IF;`,
    '',
    `${i}  RETURN NEW;`,
    `${i}END IF;`,
    '',
  ].join('\n');

  let patched = definition.replace(anchor, block + anchor);

  // Later policy revisions use strict_validation to avoid rechecking unrelated
  // updates. Ensure ELIMFILTERS OEM governance can never bypass the canonical gate.
  if (patched.includes('strict_validation') && !patched.includes('ELIMFILTERS_OEM_PRODUCT_STRICT_V43')) {
    const earlyMatches = [...patched.matchAll(/^(\s*)IF NOT strict_validation THEN$/gm)];
    if (earlyMatches.length !== 1) throw new Error(`STRICT_POLICY_ANCHOR_COUNT_${earlyMatches.length}`);
    const earlyIndent = earlyMatches[0][1];
    const earlyAnchor = earlyMatches[0][0];
    const strictLine =
      `${earlyIndent}-- ELIMFILTERS_OEM_PRODUCT_STRICT_V43\n` +
      `${earlyIndent}strict_validation := strict_validation OR upper(coalesce(gov->>'identity_type','')) = 'ELIMFILTERS_OEM_PRODUCT';\n`;
    patched = patched.replace(earlyAnchor, strictLine + earlyAnchor);
  }

  return patched;
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
