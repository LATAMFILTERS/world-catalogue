'use strict';

require('dotenv').config();
const { Client } = require('pg');

const EXECUTE = process.argv.includes('--execute');

function patchPolicyFunction(definition) {
  if (definition.includes('donldson_sku_collision_verified_v42_marker')) return definition;

  const marker = "    IF coalesce((gov->>'donaldson_absence_verified')::boolean, false) IS NOT TRUE THEN";
  const at = definition.indexOf(marker);
  if (at < 0) throw new Error('HD_COLLISION_POLICY_MARKER_NOT_FOUND');

  const block = [
    "    -- donldson_sku_collision_verified_v42_marker",
    "    IF coalesce((gov->>'donaldson_sku_collision_verified')::boolean, false) IS TRUE THEN",
    "      IF coalesce((gov->>'primary_manufacturer_verified')::boolean, false) IS NOT TRUE THEN",
    "        RAISE EXCEPTION 'CATALOG_POLICY_V42: HD collision fallback requires verified Donaldson identity';",
    "      END IF;",
    "      IF upper(regexp_replace(coalesce(NEW.canonical_source_brand,''), '[^A-Z0-9]', '', 'g')) <> 'DONALDSON' THEN",
    "        RAISE EXCEPTION 'CATALOG_POLICY_V42: HD collision fallback must retain Donaldson canonical source';",
    "      END IF;",
    "      IF upper(regexp_replace(coalesce(NEW.canonical_source_code,''), '[^A-Z0-9]', '', 'g'))",
    "         <> upper(regexp_replace(coalesce(gov->>'collision_donaldson_code',''), '[^A-Z0-9]', '', 'g')) THEN",
    "        RAISE EXCEPTION 'CATALOG_POLICY_V42: HD collision Donaldson code mismatch';",
    "      END IF;",
    "      IF coalesce((gov->>'fallback_manufacturer_verified')::boolean, false) IS NOT TRUE",
    "         OR coalesce((gov->>'fallback_commercial_code_verified')::boolean, false) IS NOT TRUE THEN",
    "        RAISE EXCEPTION 'CATALOG_POLICY_V42: HD collision fallback manufacturer/code must be verified';",
    "      END IF;",
    "      IF approved_code_norm = '' OR approved_code_norm <> base_norm THEN",
    "        RAISE EXCEPTION 'CATALOG_POLICY_V42: HD collision codigo_base must equal approved_codigo_base';",
    "      END IF;",
    "      code_digits := regexp_replace(approved_code, '[^0-9]', '', 'g');",
    "      sku_digits := regexp_replace(coalesce(NEW.sku,''), '[^0-9]', '', 'g');",
    "      IF length(code_digits) < 4 OR right(sku_digits,4) <> right(code_digits,4) THEN",
    "        RAISE EXCEPTION 'CATALOG_POLICY_V42: HD collision SKU suffix must follow selected fallback code';",
    "      END IF;",
    "      IF approved_manufacturer = 'FLEETGUARD' AND approved_source = 'COMPETITOR_CODES' THEN",
    "        RETURN NEW;",
    "      END IF;",
    "      IF coalesce((gov->>'fleetguard_sku_collision_verified')::boolean, false) IS TRUE",
    "         AND coalesce((gov->>'oem_base_verified')::boolean, false) IS TRUE",
    "         AND approved_manufacturer NOT IN ('', 'DONALDSON', 'FLEETGUARD')",
    "         AND approved_source = 'OEM_CODES' THEN",
    "        RETURN NEW;",
    "      END IF;",
    "      RAISE EXCEPTION 'CATALOG_POLICY_V42: HD collision fallback must resolve Donaldson -> Fleetguard -> OEM';",
    "    END IF;",
    ""
  ].join('\n');

  return definition.slice(0, at) + block + definition.slice(at);
}

async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const db = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await db.connect();
  try {
    await db.query('BEGIN');
    const row = (await db.query("SELECT pg_get_functiondef('public.enforce_elimfilters_codigo_base_policy()'::regprocedure) AS def")).rows[0];
    if (!row?.def) throw new Error('CATALOG_POLICY_FUNCTION_MISSING');
    const patched = patchPolicyFunction(row.def);
    await db.query(patched);

    const check = (await db.query("SELECT pg_get_functiondef('public.enforce_elimfilters_codigo_base_policy()'::regprocedure) AS def")).rows[0]?.def || '';
    if (!check.includes('donldson_sku_collision_verified_v42_marker')) throw new Error('POLICY_PATCH_NOT_INSTALLED');

    if (EXECUTE) {
      await db.query('COMMIT');
      console.log(JSON.stringify({ mode: 'execute', policy: 'HD_SKU_COLLISION_AUTHORITY_V42', transaction: 'COMMIT' }, null, 2));
    } else {
      await db.query('ROLLBACK');
      console.log(JSON.stringify({ mode: 'dry-run', policy: 'HD_SKU_COLLISION_AUTHORITY_V42', transaction: 'ROLLBACK' }, null, 2));
    }
  } catch (error) {
    try { await db.query('ROLLBACK'); } catch (_) {}
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

module.exports = { patchPolicyFunction };
